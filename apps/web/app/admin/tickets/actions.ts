"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAdminAction } from "../../../lib/audit";
import { requireAdmin } from "../../../lib/auth/session";
import { createClient } from "../../../lib/supabase/server";

function toSlugFragment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toNullableNumber(value: FormDataEntryValue | null) {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export async function createTicketTypeAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const eventId = String(formData.get("eventId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const skuInput = String(formData.get("sku") ?? "").trim();
  const price = Number(String(formData.get("price") ?? "0").trim() || 0);
  const currency = String(formData.get("currency") ?? "MXN").trim() || "MXN";
  const quantityTotal = toNullableNumber(formData.get("quantityTotal"));
  const saleStartsAt = String(formData.get("saleStartsAt") ?? "").trim();
  const saleEndsAt = String(formData.get("saleEndsAt") ?? "").trim();
  const isActive = String(formData.get("isActive") ?? "true") === "true";

  if (!eventId || !name || !price) {
    redirect("/admin/tickets?error=Debes indicar evento, nombre y precio del tipo de ticket.");
  }

  const sku = skuInput || `${toSlugFragment(name)}-${Date.now().toString().slice(-6)}`;

  const { data, error } = await supabase
    .from("ticket_types")
    .insert({
      event_id: eventId,
      name,
      description: description || null,
      sku,
      price,
      currency,
      quantity_total: quantityTotal,
      sale_starts_at: saleStartsAt || null,
      sale_ends_at: saleEndsAt || null,
      is_active: isActive
    })
    .select("id")
    .maybeSingle();

  if (error) {
    redirect(`/admin/tickets?error=${encodeURIComponent(error.message)}`);
  }

  await logAdminAction({
    supabase,
    actorUserId: session.profile?.id,
    entityType: "ticket_type",
    entityId: data?.id || null,
    action: "create",
    summary: "Alta de tipo de ticket en control",
    payload: {
      eventId,
      name,
      sku,
      price,
      currency,
      quantityTotal,
      saleStartsAt: saleStartsAt || null,
      saleEndsAt: saleEndsAt || null,
      isActive
    }
  });

  revalidatePath("/admin/tickets");
  revalidatePath("/eventos");
  redirect("/admin/tickets?success=Tipo%20de%20ticket%20creado%20correctamente.");
}

export async function createTicketLotAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const ticketTypeId = String(formData.get("ticketTypeId") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const inventoryTotal = Number(String(formData.get("inventoryTotal") ?? "0").trim() || 0);
  const courtesyTotal = Number(String(formData.get("courtesyTotal") ?? "0").trim() || 0);
  const sequencePrefix = String(formData.get("sequencePrefix") ?? "").trim();
  const saleStartsAt = String(formData.get("saleStartsAt") ?? "").trim();
  const saleEndsAt = String(formData.get("saleEndsAt") ?? "").trim();
  const isActive = String(formData.get("isActive") ?? "true") === "true";

  if (!ticketTypeId || !label || !inventoryTotal) {
    redirect("/admin/tickets?error=Debes indicar tipo de ticket, nombre del lote y stock.");
  }

  const { data, error } = await supabase
    .from("ticket_lots")
    .insert({
      ticket_type_id: ticketTypeId,
      label,
      description: description || null,
      inventory_total: inventoryTotal,
      courtesy_total: courtesyTotal,
      sequence_prefix: sequencePrefix || null,
      sale_starts_at: saleStartsAt || null,
      sale_ends_at: saleEndsAt || null,
      is_active: isActive
    })
    .select("id")
    .maybeSingle();

  if (error) {
    redirect(`/admin/tickets?error=${encodeURIComponent(error.message)}`);
  }

  await logAdminAction({
    supabase,
    actorUserId: session.profile?.id,
    entityType: "ticket_lot",
    entityId: data?.id || null,
    action: "create",
    summary: "Alta de lote o drop de tickets en control",
    payload: {
      ticketTypeId,
      label,
      inventoryTotal,
      courtesyTotal,
      sequencePrefix: sequencePrefix || null,
      saleStartsAt: saleStartsAt || null,
      saleEndsAt: saleEndsAt || null,
      isActive
    }
  });

  revalidatePath("/admin/tickets");
  revalidatePath("/eventos");
  redirect("/admin/tickets?success=Lote%20de%20tickets%20creado%20correctamente.");
}

export async function saveMercadoPagoSettingsAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const publicKey = String(formData.get("publicKey") ?? "").trim();
  const accessToken = String(formData.get("accessToken") ?? "").trim();
  const webhookSecret = String(formData.get("webhookSecret") ?? "").trim();
  const statementDescriptor = String(formData.get("statementDescriptor") ?? "").trim();
  const checkoutMode = String(formData.get("checkoutMode") ?? "redirect").trim() || "redirect";
  const successUrl = String(formData.get("successUrl") ?? "").trim();
  const failureUrl = String(formData.get("failureUrl") ?? "").trim();
  const pendingUrl = String(formData.get("pendingUrl") ?? "").trim();
  const sandboxMode = String(formData.get("sandboxMode") ?? "true") === "true";

  const settingsPayload = [
    {
      setting_key: "mercadopago_public_key",
      label: "Mercado Pago public key",
      kind: "text",
      text_value: publicKey || null,
      updated_by: session.profile?.id || null
    },
    {
      setting_key: "mercadopago_access_token",
      label: "Mercado Pago access token",
      kind: "text",
      text_value: accessToken || null,
      updated_by: session.profile?.id || null
    },
    {
      setting_key: "mercadopago_webhook_secret",
      label: "Mercado Pago webhook secret",
      kind: "text",
      text_value: webhookSecret || null,
      updated_by: session.profile?.id || null
    },
    {
      setting_key: "mercadopago_statement_descriptor",
      label: "Mercado Pago statement descriptor",
      kind: "text",
      text_value: statementDescriptor || null,
      updated_by: session.profile?.id || null
    },
    {
      setting_key: "mercadopago_checkout_mode",
      label: "Mercado Pago checkout mode",
      kind: "text",
      text_value: checkoutMode,
      updated_by: session.profile?.id || null
    },
    {
      setting_key: "mercadopago_success_url",
      label: "Mercado Pago success URL",
      kind: "link",
      text_value: successUrl || null,
      updated_by: session.profile?.id || null
    },
    {
      setting_key: "mercadopago_failure_url",
      label: "Mercado Pago failure URL",
      kind: "link",
      text_value: failureUrl || null,
      updated_by: session.profile?.id || null
    },
    {
      setting_key: "mercadopago_pending_url",
      label: "Mercado Pago pending URL",
      kind: "link",
      text_value: pendingUrl || null,
      updated_by: session.profile?.id || null
    },
    {
      setting_key: "mercadopago_sandbox_mode",
      label: "Mercado Pago sandbox mode",
      kind: "boolean",
      boolean_value: sandboxMode,
      updated_by: session.profile?.id || null
    }
  ];

  const { error } = await supabase
    .from("site_settings")
    .upsert(settingsPayload, { onConflict: "setting_key" });

  if (error) {
    redirect(`/admin/tickets?error=${encodeURIComponent(error.message)}`);
  }

  await logAdminAction({
    supabase,
    actorUserId: session.profile?.id,
    entityType: "payment_settings",
    action: "update",
    summary: "Actualizacion de configuracion Mercado Pago",
    payload: {
      provider: "mercadopago",
      checkoutMode,
      sandboxMode,
      successUrl: successUrl || null,
      failureUrl: failureUrl || null,
      pendingUrl: pendingUrl || null
    }
  });

  revalidatePath("/admin/tickets");
  redirect("/admin/tickets?success=Configuracion%20de%20Mercado%20Pago%20guardada%20correctamente.");
}
