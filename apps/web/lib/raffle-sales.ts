import { randomInt, randomUUID } from "crypto";

type MinimalSupabaseClient = {
  from: (table: string) => any;
};

export type RaffleSaleContext = {
  id: string;
  title: string;
  entry_price: number;
  currency: string;
  status: string;
  total_numbers: number | null;
  numbers_start: number;
  numbers_end: number | null;
  number_digits: number;
  allow_manual_pick: boolean;
  price_mode: string;
  entries_sold: number | null;
};

export type RaffleReservationSummary = {
  raffleId: string;
  quantityGroup: string;
  numbers: number[];
  expiresAt: string;
  selectionMode: string;
};

function nowIso() {
  return new Date().toISOString();
}

function plusMinutes(minutes: number) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

export async function cleanupExpiredRaffleReservations(supabase: MinimalSupabaseClient, raffleId?: string) {
  let query = supabase.from("raffle_number_reservations").delete().lt("expires_at", nowIso()).eq("status", "reserved");

  if (raffleId) {
    query = query.eq("raffle_id", raffleId);
  }

  await query;
}

export async function getRaffleSaleContext(supabase: MinimalSupabaseClient, raffleId: string) {
  const { data, error } = await supabase
    .from("raffles")
    .select(
      "id, title, entry_price, currency, status, total_numbers, numbers_start, numbers_end, number_digits, allow_manual_pick, price_mode, entries_sold"
    )
    .eq("id", raffleId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as RaffleSaleContext;
}

export async function getActiveRaffleReservationForUser(
  supabase: MinimalSupabaseClient,
  raffleId: string,
  userId: string
) {
  await cleanupExpiredRaffleReservations(supabase, raffleId);

  const { data } = await supabase
    .from("raffle_number_reservations")
    .select("raffle_id, quantity_group, number_value, expires_at, selection_mode")
    .eq("raffle_id", raffleId)
    .eq("reserved_for_user_id", userId)
    .eq("status", "reserved")
    .order("number_value", { ascending: true });

  if (!data?.length) {
    return null;
  }

  return {
    raffleId,
    quantityGroup: data[0].quantity_group,
    numbers: data.map((row: { number_value: number }) => row.number_value),
    expiresAt: data[0].expires_at,
    selectionMode: data[0].selection_mode
  } satisfies RaffleReservationSummary;
}

export async function getReservedAndSoldNumbers(supabase: MinimalSupabaseClient, raffleId: string) {
  await cleanupExpiredRaffleReservations(supabase, raffleId);

  const [{ data: soldRows }, { data: reservedRows }] = await Promise.all([
    supabase.from("raffle_entry_numbers").select("number_value").eq("raffle_id", raffleId),
    supabase
      .from("raffle_number_reservations")
      .select("number_value, reserved_for_user_id, quantity_group")
      .eq("raffle_id", raffleId)
      .eq("status", "reserved")
  ]);

  return {
    soldNumbers: (soldRows || []).map((row: { number_value: number }) => row.number_value),
    reservedRows:
      (reservedRows || []) as Array<{
        number_value: number;
        reserved_for_user_id: string | null;
        quantity_group: string;
      }>
  };
}

function parseManualNumbers(rawValue: string) {
  return rawValue
    .split(/[,\s]+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value));
}

function pickWeightedRandomNumbers({
  availableNumbers,
  quantity,
  numbersStart,
  numbersEnd
}: {
  availableNumbers: number[];
  quantity: number;
  numbersStart: number;
  numbersEnd: number;
}) {
  const pool = [...availableNumbers];
  const picks: number[] = [];
  const lowerThirdLimit = numbersStart + Math.floor((numbersEnd - numbersStart + 1) / 3);

  while (pool.length && picks.length < quantity) {
    const weightedPool = pool.map((numberValue) => ({
      numberValue,
      weight: numberValue < lowerThirdLimit ? 1 : 2.75
    }));

    const totalWeight = weightedPool.reduce((acc, item) => acc + item.weight, 0);
    let cursor = Math.random() * totalWeight;
    let pickedValue = weightedPool[weightedPool.length - 1]?.numberValue ?? pool[0];

    for (const item of weightedPool) {
      cursor -= item.weight;
      if (cursor <= 0) {
        pickedValue = item.numberValue;
        break;
      }
    }

    const pickedIndex = pool.findIndex((value) => value === pickedValue);
    if (pickedIndex >= 0) {
      pool.splice(pickedIndex, 1);
      picks.push(pickedValue);
    }
  }

  return picks.sort((left, right) => left - right);
}

export async function reserveRaffleNumbers({
  supabase,
  raffleId,
  quantity,
  selectionMode,
  manualNumbersRaw,
  reservedForUserId,
  createdByUserId,
  purchaserName,
  purchaserEmail,
  purchaserPhone
}: {
  supabase: MinimalSupabaseClient;
  raffleId: string;
  quantity: number;
  selectionMode: "manual" | "random";
  manualNumbersRaw?: string;
  reservedForUserId: string;
  createdByUserId: string | null;
  purchaserName?: string | null;
  purchaserEmail?: string | null;
  purchaserPhone?: string | null;
}) {
  const raffle = await getRaffleSaleContext(supabase, raffleId);
  if (!raffle) {
    throw new Error("Rifa invalida.");
  }

  if (!raffle.total_numbers || !raffle.numbers_end) {
    throw new Error("La rifa no tiene configurados sus numeros.");
  }

  const existingReservation = await getActiveRaffleReservationForUser(supabase, raffleId, reservedForUserId);
  if (existingReservation) {
    return {
      raffle,
      reservation: existingReservation,
      reusedExisting: true
    };
  }

  const { soldNumbers, reservedRows } = await getReservedAndSoldNumbers(supabase, raffleId);
  const soldSet = new Set(soldNumbers);
  const reservedSet = new Set(reservedRows.map((row) => row.number_value));
  const availableNumbers = Array.from({ length: raffle.total_numbers }, (_, index) => raffle.numbers_start + index).filter(
    (numberValue) => !soldSet.has(numberValue) && !reservedSet.has(numberValue)
  );

  if (availableNumbers.length < quantity) {
    throw new Error("No hay suficientes numeros disponibles para apartar.");
  }

  const effectiveSelectionMode = raffle.price_mode === "random_number" ? "random" : selectionMode;
  let selectedNumbers: number[] = [];

  if (effectiveSelectionMode === "manual") {
    if (!raffle.allow_manual_pick) {
      throw new Error("Esta rifa no permite elegir numero manualmente.");
    }

    const manualNumbers = parseManualNumbers(String(manualNumbersRaw || ""));
    if (manualNumbers.length !== quantity) {
      throw new Error("La cantidad de numeros capturados no coincide con la cantidad solicitada.");
    }

    const uniqueNumbers = new Set(manualNumbers);
    if (uniqueNumbers.size !== manualNumbers.length) {
      throw new Error("No puedes repetir numeros en la misma compra.");
    }

    const invalidNumber = manualNumbers.find(
      (numberValue) =>
        numberValue < raffle.numbers_start ||
        numberValue > raffle.numbers_end! ||
        soldSet.has(numberValue) ||
        reservedSet.has(numberValue)
    );

    if (invalidNumber) {
      throw new Error(`El numero ${invalidNumber} no esta disponible.`);
    }

    selectedNumbers = [...manualNumbers].sort((left, right) => left - right);
  } else {
    selectedNumbers = pickWeightedRandomNumbers({
      availableNumbers,
      quantity,
      numbersStart: raffle.numbers_start,
      numbersEnd: raffle.numbers_end
    });
  }

  const quantityGroup = randomUUID();
  const expiresAt = plusMinutes(5);

  const { error } = await supabase.from("raffle_number_reservations").insert(
    selectedNumbers.map((numberValue) => ({
      raffle_id: raffleId,
      reserved_for_user_id: reservedForUserId,
      created_by_user_id: createdByUserId,
      purchaser_name: purchaserName || null,
      purchaser_email: purchaserEmail || null,
      purchaser_phone: purchaserPhone || null,
      number_value: numberValue,
      quantity_group: quantityGroup,
      selection_mode: effectiveSelectionMode,
      status: "reserved",
      expires_at: expiresAt
    }))
  );

  if (error) {
    throw new Error(error.message);
  }

  return {
    raffle,
    reservation: {
      raffleId,
      quantityGroup,
      numbers: selectedNumbers,
      expiresAt,
      selectionMode: effectiveSelectionMode
    } satisfies RaffleReservationSummary,
    reusedExisting: false
  };
}

export async function confirmRaffleReservationPurchase({
  supabase,
  raffleId,
  quantityGroup,
  ownerUserId,
  createdByUserId,
  purchaserName,
  purchaserEmail,
  purchaserPhone,
  saleOrigin
}: {
  supabase: MinimalSupabaseClient;
  raffleId: string;
  quantityGroup: string;
  ownerUserId: string;
  createdByUserId: string | null;
  purchaserName?: string | null;
  purchaserEmail?: string | null;
  purchaserPhone?: string | null;
  saleOrigin: string;
}) {
  await cleanupExpiredRaffleReservations(supabase, raffleId);

  const raffle = await getRaffleSaleContext(supabase, raffleId);
  if (!raffle) {
    throw new Error("Rifa invalida.");
  }

  const { data: reservations } = await supabase
    .from("raffle_number_reservations")
    .select("id, number_value, expires_at, selection_mode")
    .eq("raffle_id", raffleId)
    .eq("quantity_group", quantityGroup)
    .eq("reserved_for_user_id", ownerUserId)
    .eq("status", "reserved")
    .order("number_value", { ascending: true });

  if (!reservations?.length) {
    throw new Error("El apartado ya no esta disponible. Intenta otra vez.");
  }

  const quantity = reservations.length;
  const numbers = reservations.map((row: { number_value: number }) => row.number_value).sort((left: number, right: number) => left - right);
  const subtotal = Number(raffle.entry_price || 0) * quantity;
  const orderId = randomUUID();
  const orderItemId = randomUUID();
  const raffleEntryId = randomUUID();

  const { error: orderError } = await supabase.from("orders").insert({
    id: orderId,
    user_id: ownerUserId,
    status: "paid",
    currency: raffle.currency,
    subtotal,
    total: subtotal,
    customer_name: purchaserName || null,
    customer_email: purchaserEmail || null,
    customer_phone: purchaserPhone || null,
    notes: saleOrigin === "customer_raffle" ? "Compra de rifa desde cuenta cliente" : "Venta manual de rifa",
    metadata: {
      saleOrigin,
      raffleId,
      quantity,
      numbers,
      sellerUserId: createdByUserId
    }
  });

  if (orderError) {
    throw new Error(orderError.message);
  }

  const { error: orderItemError } = await supabase.from("order_items").insert({
    id: orderItemId,
    order_id: orderId,
    item_type: "raffle_entry",
    reference_id: raffleId,
    title_snapshot: raffle.title,
    unit_price: raffle.entry_price,
    quantity,
    line_total: subtotal,
    metadata: {
      numbers
    }
  });

  if (orderItemError) {
    throw new Error(orderItemError.message);
  }

  const { error: transactionError } = await supabase.from("payment_transactions").insert({
    order_id: orderId,
    provider: saleOrigin === "customer_raffle" ? "mercado_pago_pending" : "manual_admin",
    provider_reference: `${saleOrigin.toUpperCase()}-${Date.now()}`,
    amount: subtotal,
    currency: raffle.currency,
    status: "paid",
    raw_payload: {
      raffleId,
      quantity,
      numbers
    },
    processed_at: nowIso()
  });

  if (transactionError) {
    throw new Error(transactionError.message);
  }

  const { error: raffleEntryError } = await supabase.from("raffle_entries").insert({
    id: raffleEntryId,
    raffle_id: raffleId,
    user_id: ownerUserId,
    order_item_id: orderItemId,
    quantity,
    unit_price: raffle.entry_price,
    status: "paid",
    created_by_user_id: createdByUserId,
    purchaser_name: purchaserName || null,
    purchaser_email: purchaserEmail || null,
    purchaser_phone: purchaserPhone || null
  });

  if (raffleEntryError) {
    throw new Error(raffleEntryError.message);
  }

  const { error: numbersError } = await supabase.from("raffle_entry_numbers").insert(
    numbers.map((numberValue) => ({
      raffle_entry_id: raffleEntryId,
      raffle_id: raffleId,
      number_value: numberValue,
      assigned_mode: reservations[0].selection_mode
    }))
  );

  if (numbersError) {
    throw new Error(numbersError.message);
  }

  const { error: reservationUpdateError } = await supabase
    .from("raffle_number_reservations")
    .update({
      status: "converted",
      converted_at: nowIso(),
      updated_at: nowIso()
    })
    .in(
      "id",
      reservations.map((row: { id: string }) => row.id)
    );

  if (reservationUpdateError) {
    throw new Error(reservationUpdateError.message);
  }

  await supabase
    .from("raffles")
    .update({
      entries_sold: (raffle.entries_sold || 0) + quantity
    })
    .eq("id", raffleId);

  return {
    raffle,
    raffleEntryId,
    orderId,
    numbers,
    quantity
  };
}
