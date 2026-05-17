import { createClient } from "./supabase/server";

const HOLD_MINUTES = 30;
const LOCK_HOURS = 72;

type SupabaseLike = ReturnType<typeof createClient>;

export type Raffle27Settings = {
  id: string;
  slug: string;
  title: string;
  whatsapp_number: string;
  ticket_price: number;
  transfer_instructions: string;
  countdown_ends_at: string;
  created_at: string;
  updated_at: string;
};

export type Raffle27NumberRow = {
  number_value: number;
  status: "available" | "held" | "sold" | "cancelled";
  held_by_device_id: string | null;
  held_at: string | null;
  hold_expires_at: string | null;
  sold_to_device_id: string | null;
  sold_to_name: string | null;
  sold_to_phone: string | null;
  sold_amount: number | null;
  sold_at: string | null;
  payment_date: string | null;
  created_by_user_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type Raffle27VisitorRow = {
  device_id: string;
  lucky_number: number | null;
  locked_until: string;
  last_shifted_from: number | null;
  last_seen_at: string;
  visit_count: number;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
};

type Raffle27LogRow = {
  id: string;
  device_id: string | null;
  lucky_number: number | null;
  action: string;
  message: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type Raffle27VisitorExperience = {
  deviceId: string;
  luckyNumber: number | null;
  holdExpiresAt: string | null;
  lockedUntil: string | null;
  status: "available" | "held" | "sold" | "cancelled" | null;
  message: string;
  wasShifted: boolean;
  soldToMe: boolean;
};

export type Raffle27PublicData = {
  settings: Raffle27Settings;
  stats: {
    sold: number;
    held: number;
    available: number;
    total: number;
  };
  experience: Raffle27VisitorExperience | null;
};

export type Raffle27AdminData = {
  settings: Raffle27Settings;
  stats: {
    sold: number;
    held: number;
    available: number;
    total: number;
    revenue: number;
  };
  soldRows: Raffle27NumberRow[];
  heldRows: Raffle27NumberRow[];
  recentLogs: Raffle27LogRow[];
};

function nowDate() {
  return new Date();
}

function nowIso() {
  return nowDate().toISOString();
}

function plusMinutes(minutes: number) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function plusHours(hours: number) {
  return new Date(Date.now() + hours * 3_600_000).toISOString();
}

function isFuture(dateValue: string | null | undefined) {
  return Boolean(dateValue && new Date(dateValue).getTime() > Date.now());
}

function formatLuckyMessage(numberValue: number) {
  return `No cambies tu suerte. Tu numero de la tombola es ${numberValue} y esa suerte se respeta por 72 horas.`;
}

async function logRaffle27Event({
  supabase,
  deviceId,
  luckyNumber,
  action,
  message,
  userAgent,
  ipAddress
}: {
  supabase: SupabaseLike;
  deviceId: string | null;
  luckyNumber?: number | null;
  action: string;
  message: string;
  userAgent?: string | null;
  ipAddress?: string | null;
}) {
  await supabase.from("raffle27_logs").insert({
    device_id: deviceId,
    lucky_number: luckyNumber ?? null,
    action,
    message,
    user_agent: userAgent || null,
    ip_address: ipAddress || null
  });
}

export async function getRaffle27Settings(supabase = createClient()) {
  const { data } = await supabase
    .from("raffle27_settings")
    .select("id, slug, title, whatsapp_number, ticket_price, transfer_instructions, countdown_ends_at, created_at, updated_at")
    .eq("slug", "listado27mayo2026")
    .maybeSingle();

  return data as Raffle27Settings;
}

export async function cleanupExpiredRaffle27Holds(supabase = createClient()) {
  await supabase
    .from("raffle27_numbers")
    .update({
      status: "available",
      held_by_device_id: null,
      held_at: null,
      hold_expires_at: null,
      updated_at: nowIso()
    })
    .eq("status", "held")
    .lt("hold_expires_at", nowIso());
}

async function fetchRaffle27Number(supabase: SupabaseLike, numberValue: number) {
  const { data } = await supabase
    .from("raffle27_numbers")
    .select(
      "number_value, status, held_by_device_id, held_at, hold_expires_at, sold_to_device_id, sold_to_name, sold_to_phone, sold_amount, sold_at, payment_date, created_by_user_id, notes, created_at, updated_at"
    )
    .eq("number_value", numberValue)
    .maybeSingle();

  return (data || null) as Raffle27NumberRow | null;
}

async function findRandomAvailableNumber(supabase: SupabaseLike) {
  const { data } = await supabase
    .from("raffle27_numbers")
    .select("number_value")
    .eq("status", "available");

  const available = ((data || []) as Array<{ number_value: number }>).map((row) => row.number_value);

  if (!available.length) {
    return null;
  }

  return available[Math.floor(Math.random() * available.length)];
}

async function findNextAvailableNumber(supabase: SupabaseLike, startFrom: number) {
  const { data: ahead } = await supabase
    .from("raffle27_numbers")
    .select("number_value")
    .eq("status", "available")
    .gte("number_value", startFrom)
    .order("number_value", { ascending: true })
    .limit(1);

  if (ahead?.[0]?.number_value) {
    return ahead[0].number_value as number;
  }

  const { data: wrap } = await supabase
    .from("raffle27_numbers")
    .select("number_value")
    .eq("status", "available")
    .order("number_value", { ascending: true })
    .limit(1);

  return (wrap?.[0]?.number_value as number | undefined) ?? null;
}

async function holdAvailableNumber(supabase: SupabaseLike, numberValue: number, deviceId: string) {
  const holdExpiresAt = plusMinutes(HOLD_MINUTES);
  const updatePayload = {
    status: "held",
    held_by_device_id: deviceId,
    held_at: nowIso(),
    hold_expires_at: holdExpiresAt,
    updated_at: nowIso()
  };

  const { data } = await supabase
    .from("raffle27_numbers")
    .update(updatePayload)
    .eq("number_value", numberValue)
    .eq("status", "available")
    .select(
      "number_value, status, held_by_device_id, held_at, hold_expires_at, sold_to_device_id, sold_to_name, sold_to_phone, sold_amount, sold_at, payment_date, created_by_user_id, notes, created_at, updated_at"
    )
    .maybeSingle();

  return (data || null) as Raffle27NumberRow | null;
}

async function assignFreshLuckyNumber({
  supabase,
  deviceId,
  userAgent,
  ipAddress,
  preferredStart,
  shiftedFrom
}: {
  supabase: SupabaseLike;
  deviceId: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  preferredStart?: number | null;
  shiftedFrom?: number | null;
}) {
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const candidate =
      preferredStart && preferredStart > 0
        ? await findNextAvailableNumber(supabase, preferredStart)
        : await findRandomAvailableNumber(supabase);

    if (!candidate) {
      return null;
    }

    const heldRow = await holdAvailableNumber(supabase, candidate, deviceId);
    if (!heldRow) {
      continue;
    }

    const visitorPayload = {
      device_id: deviceId,
      lucky_number: candidate,
      locked_until: plusHours(LOCK_HOURS),
      last_shifted_from: shiftedFrom ?? null,
      last_seen_at: nowIso(),
      visit_count: 1,
      user_agent: userAgent || null,
      updated_at: nowIso()
    };

    const { error } = await supabase.from("raffle27_visitors").upsert(visitorPayload);
    if (error) {
      throw new Error(error.message);
    }

    await logRaffle27Event({
      supabase,
      deviceId,
      luckyNumber: candidate,
      action: shiftedFrom ? "shifted" : "assigned",
      message: shiftedFrom
        ? `La suerte cambio de ${shiftedFrom} a ${candidate} por no concretar el pago a tiempo.`
        : `Nuevo numero de suerte asignado: ${candidate}.`,
      userAgent,
      ipAddress
    });

    return {
      luckyNumber: candidate,
      holdExpiresAt: heldRow.hold_expires_at,
      lockedUntil: visitorPayload.locked_until,
      status: heldRow.status,
      message: formatLuckyMessage(candidate),
      wasShifted: Boolean(shiftedFrom),
      soldToMe: false
    } satisfies Omit<Raffle27VisitorExperience, "deviceId">;
  }

  throw new Error("No pudimos apartar un numero disponible en este momento.");
}

export async function syncRaffle27VisitorExperience({
  deviceId,
  userAgent,
  ipAddress
}: {
  deviceId: string;
  userAgent?: string | null;
  ipAddress?: string | null;
}) {
  const supabase = createClient();
  await cleanupExpiredRaffle27Holds(supabase);

  const { data: visitorRaw } = await supabase
    .from("raffle27_visitors")
    .select("device_id, lucky_number, locked_until, last_shifted_from, last_seen_at, visit_count, user_agent, created_at, updated_at")
    .eq("device_id", deviceId)
    .maybeSingle();

  const visitor = (visitorRaw || null) as Raffle27VisitorRow | null;

  if (!visitor || !visitor.lucky_number) {
    const assigned = await assignFreshLuckyNumber({ supabase, deviceId, userAgent, ipAddress });
    return assigned
      ? ({
          deviceId,
          ...assigned
        } satisfies Raffle27VisitorExperience)
      : ({
          deviceId,
          luckyNumber: null,
          holdExpiresAt: null,
          lockedUntil: null,
          status: null,
          message: "Ya no hay numeros disponibles para esta dinamica.",
          wasShifted: false,
          soldToMe: false
        } satisfies Raffle27VisitorExperience);
  }

  const currentNumber = await fetchRaffle27Number(supabase, visitor.lucky_number);

  if (!currentNumber) {
    const reassigned = await assignFreshLuckyNumber({
      supabase,
      deviceId,
      userAgent,
      ipAddress,
      preferredStart: visitor.lucky_number + 1,
      shiftedFrom: visitor.lucky_number
    });

    if (!reassigned) {
      return {
        deviceId,
        luckyNumber: null,
        holdExpiresAt: null,
        lockedUntil: null,
        status: null,
        message: "Tus numeros se agotaron. Ya no hay boletos disponibles.",
        wasShifted: false,
        soldToMe: false
      };
    }

    return {
      deviceId,
      ...reassigned
    };
  }

  const wasTakenByAnotherPerson =
    (currentNumber.status === "sold" && currentNumber.sold_to_device_id !== deviceId) ||
    (currentNumber.status === "held" &&
      currentNumber.held_by_device_id !== deviceId &&
      isFuture(currentNumber.hold_expires_at));

  if (wasTakenByAnotherPerson) {
    const shifted = await assignFreshLuckyNumber({
      supabase,
      deviceId,
      userAgent,
      ipAddress,
      preferredStart: visitor.lucky_number + 1,
      shiftedFrom: visitor.lucky_number
    });

    if (!shifted) {
      return {
        deviceId,
        luckyNumber: null,
        holdExpiresAt: null,
        lockedUntil: null,
        status: null,
        message: "Tu numero anterior ya no esta disponible y se agotaron las opciones restantes.",
        wasShifted: false,
        soldToMe: false
      };
    }

    return {
      deviceId,
      ...shifted
    };
  }

  await supabase
    .from("raffle27_visitors")
    .update({
      last_seen_at: nowIso(),
      visit_count: visitor.visit_count + 1,
      user_agent: userAgent || visitor.user_agent || null,
      updated_at: nowIso()
    })
    .eq("device_id", deviceId);

  const soldToMe = currentNumber.status === "sold" && currentNumber.sold_to_device_id === deviceId;
  const message = soldToMe
    ? `Tu numero ${visitor.lucky_number} ya quedo vendido a tu nombre. Conserva tu comprobante.`
    : formatLuckyMessage(visitor.lucky_number);

  return {
    deviceId,
    luckyNumber: visitor.lucky_number,
    holdExpiresAt: currentNumber.hold_expires_at,
    lockedUntil: visitor.locked_until,
    status: currentNumber.status,
    message,
    wasShifted: false,
    soldToMe
  } satisfies Raffle27VisitorExperience;
}

export async function getRaffle27PublicData(deviceId?: string | null) {
  const supabase = createClient();
  await cleanupExpiredRaffle27Holds(supabase);

  const [settings, countsResponse, experience] = await Promise.all([
    getRaffle27Settings(supabase),
    supabase.from("raffle27_numbers").select("status"),
    deviceId ? syncRaffle27VisitorExperience({ deviceId }) : Promise.resolve(null)
  ]);

  const counts = ((countsResponse.data || []) as Array<{ status: string }>).reduce(
    (acc, row) => {
      acc.total += 1;
      if (row.status === "sold") {
        acc.sold += 1;
      } else if (row.status === "held") {
        acc.held += 1;
      } else {
        acc.available += 1;
      }
      return acc;
    },
    { sold: 0, held: 0, available: 0, total: 0 }
  );

  return {
    settings,
    stats: counts,
    experience
  } satisfies Raffle27PublicData;
}

export async function getRaffle27NumbersBoard() {
  const supabase = createClient();
  await cleanupExpiredRaffle27Holds(supabase);

  const { data } = await supabase
    .from("raffle27_numbers")
    .select(
      "number_value, status, held_by_device_id, held_at, hold_expires_at, sold_to_device_id, sold_to_name, sold_to_phone, sold_amount, sold_at, payment_date, created_by_user_id, notes, created_at, updated_at"
    )
    .order("number_value", { ascending: true });

  return (data || []) as Raffle27NumberRow[];
}

export async function getRaffle27AdminData() {
  const supabase = createClient();
  await cleanupExpiredRaffle27Holds(supabase);

  const [settings, numbers, logsResponse] = await Promise.all([
    getRaffle27Settings(supabase),
    getRaffle27NumbersBoard(),
    supabase
      .from("raffle27_logs")
      .select("id, device_id, lucky_number, action, message, ip_address, user_agent, created_at")
      .order("created_at", { ascending: false })
      .limit(60)
  ]);

  const soldRows = numbers.filter((row) => row.status === "sold");
  const heldRows = numbers.filter((row) => row.status === "held");
  const available = numbers.filter((row) => row.status === "available").length;
  const revenue = soldRows.reduce((sum, row) => sum + Number(row.sold_amount || 0), 0);

  return {
    settings,
    stats: {
      sold: soldRows.length,
      held: heldRows.length,
      available,
      total: numbers.length,
      revenue
    },
    soldRows: soldRows.sort((left, right) => right.number_value - left.number_value),
    heldRows: heldRows.sort((left, right) => {
      const leftTime = left.hold_expires_at ? new Date(left.hold_expires_at).getTime() : 0;
      const rightTime = right.hold_expires_at ? new Date(right.hold_expires_at).getTime() : 0;
      return leftTime - rightTime;
    }),
    recentLogs: (logsResponse.data || []) as Raffle27LogRow[]
  } satisfies Raffle27AdminData;
}

export async function saveRaffle27Settings({
  title,
  whatsappNumber,
  ticketPrice,
  transferInstructions,
  countdownEndsAt
}: {
  title: string;
  whatsappNumber: string;
  ticketPrice: number;
  transferInstructions: string;
  countdownEndsAt: string;
}) {
  const supabase = createClient();
  const { error } = await supabase
    .from("raffle27_settings")
    .update({
      title,
      whatsapp_number: whatsappNumber,
      ticket_price: ticketPrice,
      transfer_instructions: transferInstructions,
      countdown_ends_at: countdownEndsAt,
      updated_at: nowIso()
    })
    .eq("slug", "listado27mayo2026");

  if (error) {
    throw new Error(error.message);
  }
}

export async function markRaffle27NumberSold({
  numberValue,
  buyerName,
  buyerPhone,
  amount,
  paymentDate,
  notes,
  actorUserId
}: {
  numberValue: number;
  buyerName: string;
  buyerPhone: string;
  amount: number;
  paymentDate?: string | null;
  notes?: string | null;
  actorUserId: string | null;
}) {
  const supabase = createClient();
  await cleanupExpiredRaffle27Holds(supabase);

  const currentNumber = await fetchRaffle27Number(supabase, numberValue);
  if (!currentNumber) {
    throw new Error("No encontramos ese numero en la rifa especial.");
  }

  if (currentNumber.status === "sold") {
    throw new Error("Ese numero ya esta marcado como vendido.");
  }

  const soldAt = paymentDate || nowIso();
  const soldToDeviceId = currentNumber.held_by_device_id || null;
  const { error: updateError } = await supabase
    .from("raffle27_numbers")
    .update({
      status: "sold",
      sold_to_device_id: soldToDeviceId,
      sold_to_name: buyerName,
      sold_to_phone: buyerPhone,
      sold_amount: amount,
      sold_at: soldAt,
      payment_date: soldAt,
      held_by_device_id: null,
      held_at: null,
      hold_expires_at: null,
      created_by_user_id: actorUserId,
      notes: notes || null,
      updated_at: nowIso()
    })
    .eq("number_value", numberValue);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const { error: financeError } = await supabase.from("financial_entries").insert({
    kind: "income",
    amount,
    currency: "MXN",
    reference_label: `Rifa 27 Mayo 2026 #${numberValue.toString().padStart(4, "0")}`,
    note: `Comprador: ${buyerName}. Telefono: ${buyerPhone}.${notes ? ` ${notes}` : ""}`,
    occurred_at: soldAt,
    actor_user_id: actorUserId,
    metadata: {
      specialRaffle: "listado27mayo2026",
      buyerName,
      buyerPhone,
      numberValue
    }
  });

  if (financeError) {
    throw new Error(financeError.message);
  }

  await logRaffle27Event({
    supabase,
    deviceId: soldToDeviceId,
    luckyNumber: numberValue,
    action: "sold",
    message: `Numero ${numberValue} vendido a ${buyerName}.`
  });
}

export async function getRaffle27HeldNumberByDevice(deviceId: string) {
  const supabase = createClient();
  await cleanupExpiredRaffle27Holds(supabase);

  const { data } = await supabase
    .from("raffle27_numbers")
    .select(
      "number_value, status, held_by_device_id, held_at, hold_expires_at, sold_to_device_id, sold_to_name, sold_to_phone, sold_amount, sold_at, payment_date, created_by_user_id, notes, created_at, updated_at"
    )
    .eq("held_by_device_id", deviceId)
    .eq("status", "held")
    .maybeSingle();

  return (data || null) as Raffle27NumberRow | null;
}

export function buildRaffle27WhatsAppHref({
  whatsappNumber,
  luckyNumber,
  prefix
}: {
  whatsappNumber: string;
  luckyNumber: number | null;
  prefix: "pay" | "receipt";
}) {
  const normalizedPhone = whatsappNumber.replace(/[^\d]/g, "");
  const baseText =
    prefix === "receipt"
      ? "Este es mi comprobante de pago para la RIFA 27 MAYO 2026."
      : "Quiero pagar mi boleto de la RIFA 27 MAYO 2026.";
  const luckyLabel = luckyNumber ? ` Mi numero es ${luckyNumber}.` : "";
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(`${baseText}${luckyLabel}`)}`;
}
