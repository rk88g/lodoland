"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAdminAction } from "../../../lib/audit";
import { requireAdmin, requireOperator } from "../../../lib/auth/session";
import { setFlashMessage } from "../../../lib/flash";
import { confirmRaffleReservationPurchase, reserveRaffleNumbers } from "../../../lib/raffle-sales";
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
  const manualNumbers = String(formData.get("manualNumbers") ?? "").trim();

  if (!ownerUserId || !raffleId || quantity < 1) {
    redirectWithScopedMessage("error", "Debes indicar cliente, rifa y cantidad de numeros.", redirectTarget);
  }

  try {
    const { raffle, reservation } = await reserveRaffleNumbers({
      supabase,
      raffleId,
      quantity,
      selectionMode: selectionMode === "random" ? "random" : "manual",
      manualNumbersRaw: manualNumbers,
      reservedForUserId: ownerUserId,
      createdByUserId: session.profile?.id || null,
      purchaserName: purchaserName || null,
      purchaserEmail: purchaserEmail || null,
      purchaserPhone: purchaserPhone || null
    });

    const sale = await confirmRaffleReservationPurchase({
      supabase,
      raffleId,
      quantityGroup: reservation.quantityGroup,
      ownerUserId,
      createdByUserId: session.profile?.id || null,
      purchaserName: purchaserName || null,
      purchaserEmail: purchaserEmail || null,
      purchaserPhone: purchaserPhone || null,
      saleOrigin: "admin_manual_raffle"
    });

    await logAdminAction({
      supabase,
      actorUserId: session.profile?.id,
      entityType: "raffle_sale",
      entityId: sale.raffleEntryId,
      action: "create",
      summary: "Venta manual de numeros de rifa desde control",
      payload: {
        raffleId,
        orderId: sale.orderId,
        ownerUserId,
        quantity,
        selectionMode: reservation.selectionMode,
        numbers: sale.numbers,
        raffleTitle: raffle.title
      }
    });

    revalidatePath("/admin/rifas");
    revalidatePath("/staff/rifas");
    revalidatePath("/rifas");
    revalidatePath("/perfil");
    revalidatePath("/perfil/compras");
    redirectWithScopedMessage("success", "Venta manual de numeros registrada correctamente.", redirectTarget);
  } catch (error) {
    redirectWithScopedMessage("error", error instanceof Error ? error.message : "No pudimos registrar la venta.", redirectTarget);
  }
}
