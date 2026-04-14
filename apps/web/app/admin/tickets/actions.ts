"use server";

import { createHash, randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAdminAction } from "../../../lib/audit";
import { requireAdmin } from "../../../lib/auth/session";
import { setFlashMessage } from "../../../lib/flash";
import { createClient } from "../../../lib/supabase/server";

const FLASH_COOKIE = "admin-tickets-flash";

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

function generateTicketIdentity(prefix: string, eventId: string, lotId: string, index: number) {
  const id = randomUUID();
  const stamp = Date.now().toString().slice(-8);
  const code = `${prefix || "LL"}-${stamp}-${(index + 1).toString().padStart(2, "0")}-${id.slice(0, 8).toUpperCase()}`;
  const hash = createHash("sha256").update(`${id}:${code}:${eventId}:${lotId}`).digest("hex");
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
  const qrUrl = `${siteUrl}/admin/tickets/${id}?token=${hash}`;

  return {
    id,
    code,
    hash,
    qrPayload: qrUrl
  };
}

function parseTicketScanValue(scanValue: string) {
  const normalized = scanValue.trim();

  if (!normalized) {
    return {
      ticketId: null,
      ticketCode: null,
      hash: null
    };
  }

  if (normalized.startsWith("{")) {
    try {
      const parsed = JSON.parse(normalized) as {
        ticketId?: string;
        ticketCode?: string;
        hash?: string;
      };

      return {
        ticketId: parsed.ticketId || null,
        ticketCode: parsed.ticketCode || null,
        hash: parsed.hash || null
      };
    } catch (_error) {
      return {
        ticketId: null,
        ticketCode: normalized,
        hash: null
      };
    }
  }

  if (/^https?:\/\//i.test(normalized)) {
    try {
      const parsedUrl = new URL(normalized);
      const pathnameParts = parsedUrl.pathname.split("/").filter(Boolean);
      const ticketId = pathnameParts[pathnameParts.length - 1] || null;
      const hash = parsedUrl.searchParams.get("token");

      return {
        ticketId,
        ticketCode: null,
        hash: hash || null
      };
    } catch (_error) {
      return {
        ticketId: null,
        ticketCode: normalized,
        hash: null
      };
    }
  }

  return {
    ticketId: null,
    ticketCode: normalized,
    hash: null
  };
}

function redirectWithError(message: string): never {
  setFlashMessage(FLASH_COOKIE, {
    type: "error",
    message
  });
  redirect("/admin/tickets");
}

function redirectWithSuccess(message: string): never {
  setFlashMessage(FLASH_COOKIE, {
    type: "success",
    message
  });
  redirect("/admin/tickets");
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
    redirectWithError("Debes indicar evento, nombre y precio del tipo de ticket.");
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
    redirectWithError(error.message);
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
  redirectWithSuccess("Tipo de ticket creado correctamente.");
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
    redirectWithError("Debes indicar tipo de ticket, nombre del lote y stock.");
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
    redirectWithError(error.message);
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
  redirectWithSuccess("Lote de tickets creado correctamente.");
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
    redirectWithError(error.message);
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
  redirectWithSuccess("Configuracion de Mercado Pago guardada correctamente.");
}

export async function sellTicketsAsAdminAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const ownerUserId = String(formData.get("ownerUserId") ?? "").trim();
  const ticketTypeId = String(formData.get("ticketTypeId") ?? "").trim();
  const ticketLotId = String(formData.get("ticketLotId") ?? "").trim();
  const purchaserName = String(formData.get("purchaserName") ?? "").trim();
  const purchaserEmail = String(formData.get("purchaserEmail") ?? "").trim();
  const purchaserPhone = String(formData.get("purchaserPhone") ?? "").trim();
  const quantity = Number(String(formData.get("quantity") ?? "0").trim() || 0);

  if (!ownerUserId || !ticketTypeId || !ticketLotId || quantity < 1) {
    redirectWithError("Debes indicar cliente, tipo, drop y cantidad para vender.");
  }

  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name")
    .eq("id", ownerUserId)
    .maybeSingle();

  const { data: ticketType, error: ticketTypeError } = await supabase
    .from("ticket_types")
    .select("id, event_id, name, price, currency, quantity_total, quantity_sold")
    .eq("id", ticketTypeId)
    .maybeSingle();

  if (ticketTypeError || !ticketType) {
    redirectWithError(ticketTypeError?.message || "Tipo de ticket invalido.");
  }

  const { data: lot, error: lotError } = await supabase
    .from("ticket_lots")
    .select("id, label, sequence_prefix, inventory_total, sold_count, reserved_count")
    .eq("id", ticketLotId)
    .maybeSingle();

  if (lotError || !lot) {
    redirectWithError(lotError?.message || "Drop invalido.");
  }

  const lotAvailable = Math.max((lot.inventory_total || 0) - (lot.sold_count || 0) - (lot.reserved_count || 0), 0);
  if (lotAvailable < quantity) {
    redirectWithError("El drop no tiene suficiente stock para completar la venta.");
  }

  const typeAvailable =
    ticketType.quantity_total === null
      ? null
      : Math.max((ticketType.quantity_total || 0) - (ticketType.quantity_sold || 0), 0);

  if (typeAvailable !== null && typeAvailable < quantity) {
    redirectWithError("El tipo de ticket ya no tiene capacidad suficiente.");
  }

  const subtotal = Number(ticketType.price) * quantity;
  const orderId = randomUUID();
  const orderItemId = randomUUID();

  const { error: orderError } = await supabase.from("orders").insert({
    id: orderId,
    user_id: ownerUserId,
    status: "paid",
    currency: ticketType.currency,
    subtotal,
    total: subtotal,
    customer_name: purchaserName || null,
    customer_email: purchaserEmail || ownerProfile?.email || null,
    customer_phone: purchaserPhone || null,
    notes: "Venta manual autorizada desde CONTROL",
    metadata: {
      saleOrigin: "admin_manual",
      ticketTypeId,
      ticketLotId,
      quantity
    }
  });

  if (orderError) {
    redirectWithError(orderError.message);
  }

  const { error: orderItemError } = await supabase.from("order_items").insert({
    id: orderItemId,
    order_id: orderId,
    item_type: "ticket",
    reference_id: ticketTypeId,
    title_snapshot: ticketType.name,
    unit_price: ticketType.price,
    quantity,
    line_total: subtotal,
    metadata: {
      ticketLotId
    }
  });

  if (orderItemError) {
    redirectWithError(orderItemError.message);
  }

  const { error: transactionError } = await supabase.from("payment_transactions").insert({
    order_id: orderId,
    provider: "manual_admin",
    provider_reference: `ADMIN-${Date.now()}`,
    amount: subtotal,
    currency: ticketType.currency,
    status: "paid",
    raw_payload: {
      ticketTypeId,
      ticketLotId,
      quantity
    },
    processed_at: new Date().toISOString()
  });

  if (transactionError) {
    redirectWithError(transactionError.message);
  }

  const ticketsToInsert = Array.from({ length: quantity }, (_, index) => {
    const identity = generateTicketIdentity(lot.sequence_prefix || "LLT", ticketType.event_id, ticketLotId, index);

    return {
      id: identity.id,
      ticket_type_id: ticketTypeId,
      ticket_lot_id: ticketLotId,
      order_id: orderId,
      order_item_id: orderItemId,
      owner_user_id: ownerUserId,
      purchaser_name:
        purchaserName ||
        [ownerProfile?.first_name, ownerProfile?.last_name].filter(Boolean).join(" ").trim() ||
        null,
      purchaser_email: purchaserEmail || ownerProfile?.email || null,
      purchaser_phone: purchaserPhone || null,
      ticket_code: identity.code,
      qr_payload: identity.qrPayload,
      status: "issued",
      issued_at: new Date().toISOString(),
      metadata: {
        hash: identity.hash,
        saleOrigin: "admin_manual"
      }
    };
  });

  const { data: issuedTickets, error: issuedTicketsError } = await supabase
    .from("issued_tickets")
    .insert(ticketsToInsert)
    .select("id, ticket_code");

  if (issuedTicketsError) {
    redirectWithError(issuedTicketsError.message);
  }

  await supabase
    .from("ticket_lots")
    .update({
      sold_count: (lot.sold_count || 0) + quantity
    })
    .eq("id", ticketLotId);

  await supabase
    .from("ticket_types")
    .update({
      quantity_sold: (ticketType.quantity_sold || 0) + quantity
    })
    .eq("id", ticketTypeId);

  await supabase.from("ticket_inventory_movements").insert({
    ticket_lot_id: ticketLotId,
    order_item_id: orderItemId,
    reason: "sale",
    quantity_delta: -quantity,
    note: "Venta manual aprobada desde CONTROL",
    actor_user_id: session.profile?.id || null
  });

  await logAdminAction({
    supabase,
    actorUserId: session.profile?.id,
    entityType: "ticket_sale",
    entityId: orderId,
    action: "create",
    summary: "Venta manual de tickets desde control",
    payload: {
      orderId,
      ownerUserId,
      ticketTypeId,
      ticketLotId,
      quantity,
      issuedTicketCodes: (issuedTickets || []).map((ticket) => ticket.ticket_code)
    }
  });

  revalidatePath("/admin/tickets");
  revalidatePath("/perfil");
  revalidatePath("/perfil/compras");
  revalidatePath("/eventos");
  redirectWithSuccess("Venta manual de tickets registrada correctamente.");
}

export async function updateIssuedTicketStatusAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();
  const ticketId = String(formData.get("ticketId") ?? "").trim();
  const nextStatus = String(formData.get("status") ?? "").trim();
  const allowedStatuses = new Set([
    "available",
    "reserved",
    "sold",
    "issued",
    "courtesy",
    "checked_in",
    "cancelled",
    "refunded"
  ]);

  if (!ticketId || !allowedStatuses.has(nextStatus)) {
    redirectWithError("Debes indicar un ticket y un estatus valido.");
  }

  const { data: ticket, error } = await supabase
    .from("issued_tickets")
    .select("id, ticket_code, status")
    .eq("id", ticketId)
    .maybeSingle();

  if (error || !ticket) {
    redirectWithError(error?.message || "No encontramos ese ticket.");
  }

  const checkedInAt = nextStatus === "checked_in" ? new Date().toISOString() : null;
  const { error: updateError } = await supabase
    .from("issued_tickets")
    .update({
      status: nextStatus,
      checked_in_at: checkedInAt
    })
    .eq("id", ticketId);

  if (updateError) {
    redirectWithError(updateError.message);
  }

  await logAdminAction({
    supabase,
    actorUserId: session.profile?.id,
    entityType: "issued_ticket",
    entityId: ticketId,
    action: "update_status",
    summary: "Cambio manual de estatus de ticket desde control",
    payload: {
      ticketCode: ticket.ticket_code,
      previousStatus: ticket.status,
      nextStatus
    }
  });

  revalidatePath("/admin/tickets");
  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath("/perfil/compras");
  redirectWithSuccess(`Estatus del ticket ${ticket.ticket_code} actualizado correctamente.`);
}

export async function validateIssuedTicketAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();
  const scanValue = String(formData.get("scanValue") ?? "").trim();

  if (!scanValue) {
    redirectWithError("Debes escanear o pegar el codigo del ticket.");
  }

  const parsed = parseTicketScanValue(scanValue);
  let query = supabase
    .from("issued_tickets")
    .select("id, ticket_code, status, checked_in_at, metadata, owner_user_id")
    .limit(1);

  if (parsed.ticketId) {
    query = query.eq("id", parsed.ticketId);
  } else if (parsed.ticketCode) {
    query = query.eq("ticket_code", parsed.ticketCode);
  } else {
    redirectWithError("No pudimos interpretar el QR o codigo enviado.");
  }

  const { data: ticket, error } = await query.maybeSingle();

  if (error || !ticket) {
    redirectWithError(error?.message || "Ticket no encontrado.");
  }

  const storedHash =
    ticket.metadata && typeof ticket.metadata === "object" && "hash" in ticket.metadata
      ? String(ticket.metadata.hash || "")
      : "";

  if (parsed.hash && storedHash && parsed.hash !== storedHash) {
    redirectWithError("El hash del ticket no coincide. Verifica el QR.");
  }

  if (ticket.status === "checked_in") {
    redirectWithError("Este ticket ya fue usado y no puede volver a entrar.");
  }

  if (ticket.status === "cancelled" || ticket.status === "refunded") {
    redirectWithError("Este ticket no es valido para acceso.");
  }

  const checkedInAt = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("issued_tickets")
    .update({
      status: "checked_in",
      checked_in_at: checkedInAt
    })
    .eq("id", ticket.id);

  if (updateError) {
    redirectWithError(updateError.message);
  }

  await logAdminAction({
    supabase,
    actorUserId: session.profile?.id,
    entityType: "issued_ticket",
    entityId: ticket.id,
    action: "check_in",
    summary: "Validacion y quema de ticket en acceso",
    payload: {
      ticketCode: ticket.ticket_code,
      checkedInAt
    }
  });

  revalidatePath("/admin/tickets");
  revalidatePath(`/admin/tickets/${ticket.id}`);
  revalidatePath("/perfil/compras");
  redirectWithSuccess(`Ticket ${ticket.ticket_code} validado correctamente.`);
}
