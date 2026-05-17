"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAdminAction } from "../../../../lib/audit";
import { requireAdmin } from "../../../../lib/auth/session";
import { setFlashMessage } from "../../../../lib/flash";
import { markRaffle27NumberSold, saveRaffle27Settings } from "../../../../lib/raffle27";
import { createClient } from "../../../../lib/supabase/server";

const FLASH_COOKIE = "admin-raffle27-flash";
const ADMIN_PATH = "/admin/rifas/27-mayo-2026";

function redirectWithMessage(type: "success" | "error", message: string): never {
  setFlashMessage(FLASH_COOKIE, { type, message });
  redirect(ADMIN_PATH);
}

export async function saveRaffle27SettingsAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const title = String(formData.get("title") ?? "").trim();
  const whatsappNumber = String(formData.get("whatsappNumber") ?? "").trim();
  const ticketPrice = Number(String(formData.get("ticketPrice") ?? "0").trim() || 0);
  const transferInstructions = String(formData.get("transferInstructions") ?? "").trim();
  const countdownEndsAt = String(formData.get("countdownEndsAt") ?? "").trim();

  if (!title || !whatsappNumber || !ticketPrice || !transferInstructions || !countdownEndsAt) {
    redirectWithMessage("error", "Completa todos los campos de configuracion.");
  }

  try {
    await saveRaffle27Settings({
      title,
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
      summary: "Actualizacion de configuracion de la rifa 27 mayo 2026",
      payload: {
        title,
        whatsappNumber,
        ticketPrice,
        countdownEndsAt
      }
    });
  } catch (error) {
    redirectWithMessage("error", error instanceof Error ? error.message : "No pudimos guardar la configuracion.");
  }

  revalidatePath(ADMIN_PATH);
  revalidatePath("/listado27mayo2026");
  revalidatePath("/listado27mayo2026/boletos-vendidos");
  redirectWithMessage("success", "Configuracion de la rifa actualizada.");
}

export async function sellRaffle27NumberAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const numberValue = Number(String(formData.get("numberValue") ?? "0").trim() || 0);
  const buyerName = String(formData.get("buyerName") ?? "").trim();
  const buyerPhone = String(formData.get("buyerPhone") ?? "").trim();
  const amount = numberValue;
  const paymentDate = String(formData.get("paymentDate") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!numberValue || !buyerName || !buyerPhone) {
    redirectWithMessage("error", "Debes indicar numero, comprador y telefono.");
  }

  try {
    await markRaffle27NumberSold({
      numberValue,
      buyerName,
      buyerPhone,
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
      summary: "Venta manual en la landing de la rifa 27 mayo 2026",
      payload: {
        numberValue,
        buyerName,
        buyerPhone,
        amount,
        paymentDate: paymentDate || null
      }
    });
  } catch (error) {
    redirectWithMessage("error", error instanceof Error ? error.message : "No pudimos marcar ese numero como vendido.");
  }

  revalidatePath(ADMIN_PATH);
  revalidatePath("/admin/finanzas");
  revalidatePath("/listado27mayo2026");
  revalidatePath("/listado27mayo2026/boletos-vendidos");
  redirectWithMessage("success", "Numero vendido y reflejado en finanzas correctamente.");
}
