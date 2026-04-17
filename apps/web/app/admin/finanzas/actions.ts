"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAdminAction } from "../../../lib/audit";
import { requireAdmin } from "../../../lib/auth/session";
import { setFlashMessage } from "../../../lib/flash";
import { createClient } from "../../../lib/supabase/server";

const FLASH_COOKIE = "admin-finanzas-flash";

function redirectWithMessage(type: "success" | "error", message: string): never {
  setFlashMessage(FLASH_COOKIE, { type, message });
  redirect("/admin/finanzas");
}

export async function createFinancialEntryAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const kind = String(formData.get("kind") ?? "").trim();
  const amount = Number(String(formData.get("amount") ?? "0").trim() || 0);
  const currency = String(formData.get("currency") ?? "MXN").trim() || "MXN";
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const referenceLabel = String(formData.get("referenceLabel") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const occurredAt = String(formData.get("occurredAt") ?? "").trim();
  const eventId = String(formData.get("eventId") ?? "").trim();
  const promotionId = String(formData.get("promotionId") ?? "").trim();

  if (!["income", "expense", "adjustment"].includes(kind) || !amount) {
    redirectWithMessage("error", "Debes indicar tipo y monto para registrar el movimiento.");
  }

  const { data, error } = await supabase
    .from("financial_entries")
    .insert({
      kind,
      category_id: categoryId || null,
      event_id: eventId || null,
      promotion_id: promotionId || null,
      amount,
      currency,
      reference_label: referenceLabel || null,
      note: note || null,
      occurred_at: occurredAt || new Date().toISOString(),
      actor_user_id: session.profile?.id || null
    })
    .select("id")
    .maybeSingle();

  if (error) {
    redirectWithMessage("error", error.message);
  }

  await logAdminAction({
    supabase,
    actorUserId: session.profile?.id,
    entityType: "financial_entry",
    entityId: data?.id || null,
    action: "create",
    summary: kind === "income" ? "Registro de ingreso" : kind === "expense" ? "Registro de gasto" : "Registro de ajuste",
    payload: {
      kind,
      amount,
      currency,
      categoryId: categoryId || null,
      eventId: eventId || null,
      promotionId: promotionId || null,
      referenceLabel: referenceLabel || null
    }
  });

  revalidatePath("/admin/finanzas");
  revalidatePath("/admin/logs/acciones");
  redirectWithMessage("success", "Movimiento financiero guardado correctamente.");
}
