"use server";

import { randomInt, randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAdminAction } from "../../../lib/audit";
import { requireAdmin, requireOperator } from "../../../lib/auth/session";
import { setFlashMessage } from "../../../lib/flash";
import { createClient } from "../../../lib/supabase/server";

const FLASH_COOKIE = "admin-raffles-flash";
const STAFF_FLASH_COOKIE = "staff-raffles-flash";

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function redirectWithError(message: string): never {
  setFlashMessage(FLASH_COOKIE, {
    type: "error",
    message
  });
  redirect("/admin/rifas");
}

function redirectWithSuccess(message: string): never {
  setFlashMessage(FLASH_COOKIE, {
    type: "success",
    message
  });
  redirect("/admin/rifas");
}

function resolveRedirectTarget(formData: FormData, fallbackPath: string) {
  const redirectTo = String(formData.get("redirectTo") ?? "").trim();

  if (
    redirectTo.startsWith("/admin/rifas") ||
    redirectTo.startsWith("/staff/rifas")
  ) {
    return redirectTo;
  }

  return fallbackPath;
}

function redirectWithScopedMessage(type: "success" | "error", message: string, targetPath: string): never {
  setFlashMessage(targetPath.startsWith("/staff/") ? STAFF_FLASH_COOKIE : FLASH_COOKIE, {
    type,
    message
  });
  redirect(targetPath);
}

export async function createRaffleAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const prizeLines = String(formData.get("prizeLines") ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const entryPrice = Number(String(formData.get("entryPrice") ?? "0").trim() || 0);
  const totalNumbers = Number(String(formData.get("totalNumbers") ?? "0").trim() || 0);
  const numbersStart = Number(String(formData.get("numbersStart") ?? "1").trim() || 1);
  const numberDigits = Number(String(formData.get("numberDigits") ?? "4").trim() || 4);
  const priceMode = String(formData.get("priceMode") ?? "fixed_price").trim() || "fixed_price";
  const allowManualPick = String(formData.get("allowManualPick") ?? "true") === "true";
  const startsAt = String(formData.get("startsAt") ?? "").trim();
  const endsAt = String(formData.get("endsAt") ?? "").trim();
  const drawAt = String(formData.get("drawAt") ?? "").trim();
  const status = String(formData.get("status") ?? "draft").trim();
  const slug = toSlug(String(formData.get("slug") ?? "") || title);
  const numbersEnd = totalNumbers > 0 ? numbersStart + totalNumbers - 1 : null;

  if (!title || !slug || !entryPrice || !totalNumbers) {
    redirectWithError("Debes indicar titulo, slug, precio y cantidad total de numeros.");
  }

  const { data, error } = await supabase
    .from("raffles")
    .insert({
      slug,
      title,
      description: description || null,
      prize_description: prizeLines.join(" | ") || null,
      entry_price: entryPrice,
      total_numbers: totalNumbers,
      numbers_start: numbersStart,
      numbers_end: numbersEnd,
      number_digits: numberDigits,
      allow_manual_pick: priceMode === "random_number" ? false : allowManualPick,
      price_mode: priceMode,
      starts_at: startsAt || null,
      ends_at: endsAt || null,
      draw_at: drawAt || null,
      status,
      created_by: session.profile?.id || null,
      updated_by: session.profile?.id || null
    })
    .select("id")
    .maybeSingle();

  if (error) {
    redirectWithError(error.message);
  }

  if (data?.id && prizeLines.length) {
    const prizeRows = prizeLines.map((prizeTitle, index) => ({
      raffle_id: data.id,
      title: prizeTitle,
      sort_order: index
    }));

    const { error: prizeError } = await supabase.from("raffle_prizes").insert(prizeRows);

    if (prizeError) {
      redirectWithError(prizeError.message);
    }
  }

  await logAdminAction({
    supabase,
    actorUserId: session.profile?.id,
    entityType: "raffle",
    entityId: data?.id || null,
    action: "create",
    summary: "Alta de rifa desde control",
    payload: {
      slug,
      title,
      entryPrice,
      totalNumbers,
      numbersStart,
      numbersEnd,
      numberDigits,
      priceMode,
      allowManualPick: priceMode === "random_number" ? false : allowManualPick,
      prizes: prizeLines,
      startsAt: startsAt || null,
      endsAt: endsAt || null,
      drawAt: drawAt || null,
      status
    }
  });

  revalidatePath("/admin/rifas");
  revalidatePath("/rifas");
  redirectWithSuccess("Rifa creada correctamente.");
}

function parseManualNumbers(rawValue: string) {
  return rawValue
    .split(/[,\s]+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value));
}

function pickRandomNumbers({
  availableNumbers,
  quantity
}: {
  availableNumbers: number[];
  quantity: number;
}) {
  const pool = [...availableNumbers];
  const picks: number[] = [];

  while (pool.length && picks.length < quantity) {
    const index = randomInt(0, pool.length);
    const [picked] = pool.splice(index, 1);
    picks.push(picked);
  }

  return picks.sort((left, right) => left - right);
}

export async function sellRaffleNumbersAsAdminAction(formData: FormData) {
  const session = await requireOperator();
  const supabase = createClient();
  const redirectTarget = resolveRedirectTarget(formData, "/admin/rifas");

  const ownerUserId = String(formData.get("ownerUserId") ?? "").trim();
  const raffleId = String(formData.get("raffleId") ?? "").trim();
  const purchaserName = String(formData.get("purchaserName") ?? "").trim();
  const purchaserEmail = String(formData.get("purchaserEmail") ?? "").trim();
  const purchaserPhone = String(formData.get("purchaserPhone") ?? "").trim();
  const quantity = Number(String(formData.get("quantity") ?? "0").trim() || 0);
  const selectionMode = String(formData.get("selectionMode") ?? "manual").trim() || "manual";
  const manualNumbers = parseManualNumbers(String(formData.get("manualNumbers") ?? "").trim());

  if (!ownerUserId || !raffleId || quantity < 1) {
    redirectWithScopedMessage("error", "Debes indicar cliente, rifa y cantidad de numeros.", redirectTarget);
  }

  const { data: raffle, error: raffleError } = await supabase
    .from("raffles")
    .select("id, title, entry_price, currency, entries_sold, total_numbers, numbers_start, numbers_end, number_digits, allow_manual_pick, price_mode")
    .eq("id", raffleId)
    .maybeSingle();

  if (raffleError || !raffle) {
    redirectWithScopedMessage("error", raffleError?.message || "Rifa invalida.", redirectTarget);
  }

  if (!raffle.total_numbers || !raffle.numbers_end) {
    redirectWithScopedMessage("error", "La rifa no tiene configurada la cantidad total de numeros.", redirectTarget);
  }

  if (selectionMode === "manual" && (!raffle.allow_manual_pick || raffle.price_mode === "random_number")) {
    redirectWithScopedMessage("error", "Esta rifa solo permite asignacion aleatoria de numeros.", redirectTarget);
  }

  const { data: soldRows } = await supabase
    .from("raffle_entry_numbers")
    .select("number_value")
    .eq("raffle_id", raffleId);

  const soldNumbers = new Set((soldRows || []).map((row) => row.number_value));
  const availableNumbers = Array.from({ length: raffle.total_numbers }, (_, index) => raffle.numbers_start + index).filter(
    (numberValue) => !soldNumbers.has(numberValue)
  );

  if (availableNumbers.length < quantity) {
    redirectWithScopedMessage("error", "No hay suficientes numeros disponibles para completar la venta.", redirectTarget);
  }

  let selectedNumbers: number[] = [];

  if (selectionMode === "manual") {
    if (manualNumbers.length !== quantity) {
      redirectWithScopedMessage("error", "La cantidad de numeros capturados no coincide con la cantidad solicitada.", redirectTarget);
    }

    const uniqueNumbers = new Set(manualNumbers);
    if (uniqueNumbers.size !== manualNumbers.length) {
      redirectWithScopedMessage("error", "No puedes repetir numeros en la misma venta.", redirectTarget);
    }

    const invalidNumber = manualNumbers.find(
      (numberValue) =>
        numberValue < raffle.numbers_start ||
        numberValue > raffle.numbers_end ||
        soldNumbers.has(numberValue)
    );

    if (invalidNumber) {
      redirectWithScopedMessage("error", `El numero ${invalidNumber} no esta disponible.`, redirectTarget);
    }

    selectedNumbers = [...manualNumbers].sort((left, right) => left - right);
  } else {
    selectedNumbers = pickRandomNumbers({
      availableNumbers,
      quantity
    });
  }

  const subtotal = Number(raffle.entry_price) * quantity;
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
    notes: "Venta manual de numeros de rifa desde CONTROL",
    metadata: {
      saleOrigin: "admin_manual_raffle",
      raffleId,
      quantity,
      numbers: selectedNumbers
    }
  });

  if (orderError) {
    redirectWithScopedMessage("error", orderError.message, redirectTarget);
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
      numbers: selectedNumbers,
      selectionMode
    }
  });

  if (orderItemError) {
    redirectWithScopedMessage("error", orderItemError.message, redirectTarget);
  }

  const { error: transactionError } = await supabase.from("payment_transactions").insert({
    order_id: orderId,
    provider: "manual_admin",
    provider_reference: `ADMIN-RAFFLE-${Date.now()}`,
    amount: subtotal,
    currency: raffle.currency,
    status: "paid",
    raw_payload: {
      raffleId,
      quantity,
      numbers: selectedNumbers
    },
    processed_at: new Date().toISOString()
  });

  if (transactionError) {
    redirectWithScopedMessage("error", transactionError.message, redirectTarget);
  }

  const { error: raffleEntryError } = await supabase.from("raffle_entries").insert({
    id: raffleEntryId,
    raffle_id: raffleId,
    user_id: ownerUserId,
    order_item_id: orderItemId,
    quantity,
    unit_price: raffle.entry_price,
    status: "paid"
  });

  if (raffleEntryError) {
    redirectWithScopedMessage("error", raffleEntryError.message, redirectTarget);
  }

  const { error: numbersError } = await supabase.from("raffle_entry_numbers").insert(
    selectedNumbers.map((numberValue) => ({
      raffle_entry_id: raffleEntryId,
      raffle_id: raffleId,
      number_value: numberValue,
      assigned_mode: selectionMode
    }))
  );

  if (numbersError) {
    redirectWithScopedMessage("error", numbersError.message, redirectTarget);
  }

  await supabase
    .from("raffles")
    .update({
      entries_sold: (raffle.entries_sold || 0) + quantity
    })
    .eq("id", raffleId);

  await logAdminAction({
    supabase,
    actorUserId: session.profile?.id,
    entityType: "raffle_sale",
    entityId: raffleEntryId,
    action: "create",
    summary: "Venta manual de numeros de rifa desde control",
    payload: {
      raffleId,
      orderId,
      ownerUserId,
      quantity,
      selectionMode,
      numbers: selectedNumbers
    }
  });

  revalidatePath("/admin/rifas");
  revalidatePath("/staff/rifas");
  revalidatePath("/rifas");
  revalidatePath("/perfil");
  revalidatePath("/perfil/compras");
  redirectWithScopedMessage("success", "Venta manual de numeros registrada correctamente.", redirectTarget);
}
