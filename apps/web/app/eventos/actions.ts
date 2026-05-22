"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAdminAction } from "../../lib/audit";
import { isEmailConfirmed, requireUser } from "../../lib/auth/session";
import { setFlashMessage } from "../../lib/flash";
import { createClient } from "../../lib/supabase/server";

const FLASH_COOKIE = "customer-events-flash";

function redirectWithMessage(type: "success" | "error", message: string): never {
  setFlashMessage(FLASH_COOKIE, { type, message });
  redirect("/eventos");
}

export async function buyCustomerTicketAction(formData: FormData) {
  const { user } = await requireUser();
  const supabase = createClient();

  if (!isEmailConfirmed(user)) {
    redirectWithMessage("error", "Confirma tu correo antes de comprar tickets.");
  }

  const ticketTypeId = String(formData.get("ticketTypeId") ?? "").trim();
  const ticketLotId = String(formData.get("ticketLotId") ?? "").trim();
  const quantity = Math.max(1, Math.min(Number(String(formData.get("quantity") ?? "1").trim() || 1), 6));
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

  if (!ticketTypeId || !ticketLotId) {
    redirectWithMessage("error", "Selecciona un ticket y un drop disponible.");
  }

  const { data, error } = await supabase.rpc("purchase_customer_ticket_from_lot", {
    p_ticket_type_id: ticketTypeId,
    p_ticket_lot_id: ticketLotId,
    p_quantity: quantity,
    p_site_url: siteUrl
  });

  if (error) {
    redirectWithMessage("error", error.message);
  }

  const issuedTickets = (data || []) as Array<{ issued_ticket_id: string; ticket_code: string }>;

  await logAdminAction({
    supabase,
    actorUserId: user.id,
    entityType: "ticket_sale",
    entityId: issuedTickets[0]?.issued_ticket_id || null,
    action: "customer_purchase",
    summary: "Compra de ticket desde intranet de cliente",
    payload: {
      ticketTypeId,
      ticketLotId,
      quantity,
      issuedTicketCodes: issuedTickets.map((ticket) => ticket.ticket_code)
    }
  });

  revalidatePath("/eventos");
  revalidatePath("/perfil");
  revalidatePath("/perfil/compras");
  redirect("/perfil/compras?success=Ticket comprado correctamente.");
}
