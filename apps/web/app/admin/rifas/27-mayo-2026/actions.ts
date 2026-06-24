"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAdminAction } from "../../../../lib/audit";
import { requireAdmin } from "../../../../lib/auth/session";
import { mexicoLocalDateTimeToIso } from "../../../../lib/date-format";
import { setFlashMessage } from "../../../../lib/flash";
import { markRaffle27NumberSold, saveRaffle27Settings } from "../../../../lib/raffle27";
import { createClient } from "../../../../lib/supabase/server";

const FLASH_COOKIE = "admin-raffle27-flash";
const ADMIN_PATH = "/admin/rifas/27-mayo-2026";
const PUBLIC_RAFFLE_PATHS = ["/rifa2026", "/rifa2026/boletos-vendidos", "/Lodonautas14Junio", "/Lodonautas14Junio/boletos-vendidos", "/listado27mayo2026", "/listado27mayo2026/boletos-vendidos"];

function redirectWithMessage(type: "success" | "error", message: string): never {
  setFlashMessage(FLASH_COOKIE, { type, message });
  redirect(ADMIN_PATH);
}

export async function saveRaffle27SettingsAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const title = String(formData.get("title") ?? "").trim();
  const statusInput = String(formData.get("status") ?? "published").trim();
  const whatsappNumber = String(formData.get("whatsappNumber") ?? "").trim();
  const ticketPrice = Number(String(formData.get("ticketPrice") ?? "0").trim() || 0);
  const transferInstructions = String(formData.get("transferInstructions") ?? "").trim();
  const countdownEndsAt = mexicoLocalDateTimeToIso(String(formData.get("countdownEndsAt") ?? "").trim());
  const status = statusInput === "draft" || statusInput === "archived" ? statusInput : "published";

  if (!title || !whatsappNumber || !ticketPrice || !transferInstructions || !countdownEndsAt) {
    redirectWithMessage("error", "Completa todos los campos de configuracion.");
  }

  try {
    await saveRaffle27Settings({
      title,
      status,
      whatsappNumber,
      ticketPrice,
      transferInstructions,
      countdownEndsAt
    });

    await logAdminAction({
      supabase,
      actorUserId: session.profile?.id,
      entityType: "special_raffle_27_settings",
      action: "update",
      summary: "Actualizacion de configuracion de la rifa 2026",
      payload: {
        title,
        whatsappNumber,
        status,
        ticketPrice,
        countdownEndsAt
      }
    });
  } catch (error) {
    redirectWithMessage("error", error instanceof Error ? error.message : "No pudimos guardar la configuracion.");
  }

  revalidatePath(ADMIN_PATH);
  PUBLIC_RAFFLE_PATHS.forEach((path) => revalidatePath(path));
  revalidatePath("/rifas");
  revalidatePath("/perfil");
  redirectWithMessage("success", "Configuracion de la rifa actualizada.");
}

export async function sellRaffle27NumberAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const numberValue = Number(String(formData.get("numberValue") ?? "0").trim() || 0);
  const buyerName = String(formData.get("buyerName") ?? "").trim();
  const buyerPhone = String(formData.get("buyerPhone") ?? "").trim();
  const buyerEmail = String(formData.get("buyerEmail") ?? "").trim();
  const amount = numberValue;
  const paymentDate = mexicoLocalDateTimeToIso(String(formData.get("paymentDate") ?? "").trim());
  const notes = String(formData.get("notes") ?? "").trim();

  if (!numberValue || !buyerName || !buyerPhone || !buyerEmail) {
    redirectWithMessage("error", "Debes indicar numero, comprador, telefono y correo.");
  }

  try {
    await markRaffle27NumberSold({
      numberValue,
      buyerName,
      buyerPhone,
      buyerEmail,
      amount,
      paymentDate: paymentDate || null,
      notes: notes || null,
      actorUserId: session.profile?.id || null
    });

    await logAdminAction({
      supabase,
      actorUserId: session.profile?.id,
      entityType: "special_raffle_27_sale",
      action: "create",
      summary: "Venta manual en la landing de la rifa 2026",
      payload: {
        numberValue,
        buyerName,
        buyerPhone,
        buyerEmail,
        amount,
        paymentDate: paymentDate || null
      }
    });
  } catch (error) {
    redirectWithMessage("error", error instanceof Error ? error.message : "No pudimos marcar ese numero como vendido.");
  }

  revalidatePath(ADMIN_PATH);
  revalidatePath("/admin/finanzas");
  PUBLIC_RAFFLE_PATHS.forEach((path) => revalidatePath(path));
  redirectWithMessage("success", "Numero vendido y reflejado en finanzas correctamente.");
}

export async function quickPayRaffle27LogNumberAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const numberValue = Number(String(formData.get("numberValue") ?? "0").trim() || 0);
  const deviceId = String(formData.get("deviceId") ?? "").trim();
  const buyerName = String(formData.get("buyerName") ?? "").trim();
  const buyerPhone = String(formData.get("buyerPhone") ?? "").trim();
  const buyerEmail = String(formData.get("buyerEmail") ?? "").trim();
  const amount = numberValue;

  if (!numberValue || !buyerName || !buyerPhone || !buyerEmail) {
    redirectWithMessage("error", "Debes indicar numero, comprador, telefono y correo para marcarlo como pagado.");
  }

  try {
    await markRaffle27NumberSold({
      numberValue,
      buyerName,
      buyerPhone,
      buyerEmail,
      amount,
      paymentDate: null,
      notes: deviceId ? `Pago rapido desde log. Device ID: ${deviceId}` : "Pago rapido desde log.",
      actorUserId: session.profile?.id || null
    });

    await logAdminAction({
      supabase,
      actorUserId: session.profile?.id,
      entityType: "special_raffle_27_sale",
      action: "quick_pay",
      summary: "Pago rapido desde log de la rifa 2026",
      payload: {
        numberValue,
        amount,
        deviceId: deviceId || null,
        buyerName,
        buyerPhone,
        buyerEmail
      }
    });
  } catch (error) {
    redirectWithMessage("error", error instanceof Error ? error.message : "No pudimos marcar ese numero como pagado.");
  }

  revalidatePath(ADMIN_PATH);
  revalidatePath("/admin/finanzas");
  PUBLIC_RAFFLE_PATHS.forEach((path) => revalidatePath(path));
  redirectWithMessage("success", "Numero pagado desde log y reflejado en finanzas.");
}
