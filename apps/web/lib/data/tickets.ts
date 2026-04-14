import { isBuildPhase } from "../runtime";
import { createClient } from "../supabase/server";

type EventRef = {
  id: string;
  title: string;
  starts_at: string | null;
  city: string | null;
  status: string;
};

type TicketTypeRow = {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  sku: string | null;
  price: number;
  currency: string;
  quantity_total: number | null;
  quantity_sold: number;
  sale_starts_at: string | null;
  sale_ends_at: string | null;
  is_active: boolean;
};

type TicketLotRow = {
  id: string;
  ticket_type_id: string;
  label: string;
  description: string | null;
  inventory_total: number;
  courtesy_total: number;
  sold_count: number;
  reserved_count: number;
  courtesy_count: number;
  sequence_prefix: string | null;
  sale_starts_at: string | null;
  sale_ends_at: string | null;
  is_active: boolean;
};

type IssuedTicketRow = {
  id: string;
  ticket_type_id: string;
  ticket_lot_id: string | null;
  owner_user_id: string | null;
  purchaser_name: string | null;
  purchaser_email: string | null;
  purchaser_phone: string | null;
  ticket_code: string;
  qr_payload: string | null;
  status: string;
  issued_at: string | null;
  checked_in_at: string | null;
  created_at: string;
};

type SiteSettingRow = {
  setting_key: string;
  text_value: string | null;
  boolean_value: boolean | null;
};

export type AdminTicketTypeSummary = {
  id: string;
  eventId: string;
  eventTitle: string;
  name: string;
  description: string | null;
  sku: string | null;
  price: number;
  currency: string;
  quantityTotal: number | null;
  quantitySold: number;
  saleStartsAt: string | null;
  saleEndsAt: string | null;
  isActive: boolean;
};

export type AdminTicketLotSummary = {
  id: string;
  ticketTypeId: string;
  eventId: string;
  eventTitle: string;
  ticketTypeName: string;
  label: string;
  description: string | null;
  inventoryTotal: number;
  courtesyTotal: number;
  soldCount: number;
  reservedCount: number;
  courtesyCount: number;
  sequencePrefix: string | null;
  saleStartsAt: string | null;
  saleEndsAt: string | null;
  isActive: boolean;
};

export type TicketConfigEventOption = {
  id: string;
  title: string;
  startsAt: string | null;
  city: string | null;
  status: string;
};

export type TicketConfigTypeOption = {
  id: string;
  eventId: string;
  eventTitle: string;
  name: string;
};

export type MercadoPagoSettings = {
  publicKey: string;
  accessToken: string;
  webhookSecret: string;
  statementDescriptor: string;
  checkoutMode: string;
  successUrl: string;
  failureUrl: string;
  pendingUrl: string;
  sandboxMode: boolean;
};

export type CustomerEventTicketOption = {
  id: string;
  eventId: string;
  eventTitle: string;
  eventStartsAt: string | null;
  eventCity: string | null;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  saleStartsAt: string | null;
  saleEndsAt: string | null;
  availableUnits: number | null;
  drops: Array<{
    id: string;
    label: string;
    availableUnits: number;
    courtesyTotal: number;
    sequencePrefix: string | null;
    saleStartsAt: string | null;
    saleEndsAt: string | null;
  }>;
};

export type AdminIssuedTicketSummary = {
  id: string;
  eventTitle: string;
  ticketTypeName: string;
  ticketLotLabel: string | null;
  purchaserName: string | null;
  purchaserEmail: string | null;
  purchaserPhone: string | null;
  ownerLabel: string | null;
  ticketCode: string;
  qrPayload: string | null;
  status: string;
  issuedAt: string | null;
  checkedInAt: string | null;
};

async function getEventMapByIds(eventIds: string[]) {
  if (!eventIds.length) {
    return new Map<string, EventRef>();
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("events")
    .select("id, title, starts_at, city, status")
    .in("id", eventIds);

  return new Map(((data || []) as EventRef[]).map((event) => [event.id, event]));
}

export async function getTicketConfigEvents() {
  if (isBuildPhase()) {
    return [] as TicketConfigEventOption[];
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("events")
    .select("id, title, starts_at, city, status")
    .order("starts_at", { ascending: true });

  return ((data || []) as EventRef[]).map((event) => ({
    id: event.id,
    title: event.title,
    startsAt: event.starts_at,
    city: event.city,
    status: event.status
  }));
}

export async function getAdminTicketTypes(limit = 36) {
  if (isBuildPhase()) {
    return [] as AdminTicketTypeSummary[];
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("ticket_types")
    .select(
      "id, event_id, name, description, sku, price, currency, quantity_total, quantity_sold, sale_starts_at, sale_ends_at, is_active"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!data?.length) {
    return [] as AdminTicketTypeSummary[];
  }

  const eventMap = await getEventMapByIds(Array.from(new Set(data.map((item) => item.event_id))));

  return ((data || []) as TicketTypeRow[]).map((ticketType) => ({
    id: ticketType.id,
    eventId: ticketType.event_id,
    eventTitle: eventMap.get(ticketType.event_id)?.title || "Evento pendiente",
    name: ticketType.name,
    description: ticketType.description,
    sku: ticketType.sku,
    price: ticketType.price,
    currency: ticketType.currency,
    quantityTotal: ticketType.quantity_total,
    quantitySold: ticketType.quantity_sold,
    saleStartsAt: ticketType.sale_starts_at,
    saleEndsAt: ticketType.sale_ends_at,
    isActive: ticketType.is_active
  }));
}

export async function getTicketTypeOptions(limit = 80) {
  const ticketTypes = await getAdminTicketTypes(limit);

  return ticketTypes.map((ticketType) => ({
    id: ticketType.id,
    eventId: ticketType.eventId,
    eventTitle: ticketType.eventTitle,
    name: ticketType.name
  })) satisfies TicketConfigTypeOption[];
}

export async function getAdminTicketLots(limit = 48) {
  if (isBuildPhase()) {
    return [] as AdminTicketLotSummary[];
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("ticket_lots")
    .select(
      "id, ticket_type_id, label, description, inventory_total, courtesy_total, sold_count, reserved_count, courtesy_count, sequence_prefix, sale_starts_at, sale_ends_at, is_active"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!data?.length) {
    return [] as AdminTicketLotSummary[];
  }

  const ticketTypeIds = Array.from(new Set(data.map((lot) => lot.ticket_type_id)));
  const { data: ticketTypeRows } = await supabase
    .from("ticket_types")
    .select("id, event_id, name")
    .in("id", ticketTypeIds);

  const ticketTypeMap = new Map((ticketTypeRows || []).map((ticketType) => [ticketType.id, ticketType]));
  const eventIds = Array.from(new Set((ticketTypeRows || []).map((ticketType) => ticketType.event_id)));
  const eventMap = await getEventMapByIds(eventIds);

  return ((data || []) as TicketLotRow[]).map((lot) => {
    const ticketType = ticketTypeMap.get(lot.ticket_type_id);
    const event = ticketType ? eventMap.get(ticketType.event_id) : null;

    return {
      id: lot.id,
      ticketTypeId: lot.ticket_type_id,
      eventId: ticketType?.event_id || "",
      eventTitle: event?.title || "Evento pendiente",
      ticketTypeName: ticketType?.name || "Tipo pendiente",
      label: lot.label,
      description: lot.description,
      inventoryTotal: lot.inventory_total,
      courtesyTotal: lot.courtesy_total,
      soldCount: lot.sold_count,
      reservedCount: lot.reserved_count,
      courtesyCount: lot.courtesy_count,
      sequencePrefix: lot.sequence_prefix,
      saleStartsAt: lot.sale_starts_at,
      saleEndsAt: lot.sale_ends_at,
      isActive: lot.is_active
    } satisfies AdminTicketLotSummary;
  });
}

export async function getTicketOperationSummary() {
  if (isBuildPhase()) {
    return {
      ticketTypes: 0,
      ticketLots: 0,
      issuedTickets: 0,
      courtesyCapacity: 0
    };
  }

  const supabase = createClient();
  const [{ count: ticketTypes }, { count: ticketLots }, { count: issuedTickets }, { data: lotData }] =
    await Promise.all([
      supabase.from("ticket_types").select("*", { count: "exact", head: true }),
      supabase.from("ticket_lots").select("*", { count: "exact", head: true }),
      supabase.from("issued_tickets").select("*", { count: "exact", head: true }),
      supabase.from("ticket_lots").select("courtesy_total")
    ]);

  const courtesyCapacity = (lotData || []).reduce((total, lot) => total + (lot.courtesy_total || 0), 0);

  return {
    ticketTypes: ticketTypes || 0,
    ticketLots: ticketLots || 0,
    issuedTickets: issuedTickets || 0,
    courtesyCapacity
  };
}

export async function getMercadoPagoSettings() {
  if (isBuildPhase()) {
    return {
      publicKey: "",
      accessToken: "",
      webhookSecret: "",
      statementDescriptor: "",
      checkoutMode: "redirect",
      successUrl: "",
      failureUrl: "",
      pendingUrl: "",
      sandboxMode: true
    } satisfies MercadoPagoSettings;
  }

  const supabase = createClient();
  const keys = [
    "mercadopago_public_key",
    "mercadopago_access_token",
    "mercadopago_webhook_secret",
    "mercadopago_statement_descriptor",
    "mercadopago_checkout_mode",
    "mercadopago_success_url",
    "mercadopago_failure_url",
    "mercadopago_pending_url",
    "mercadopago_sandbox_mode"
  ];

  const { data } = await supabase
    .from("site_settings")
    .select("setting_key, text_value, boolean_value")
    .in("setting_key", keys);

  const settingMap = new Map(((data || []) as SiteSettingRow[]).map((setting) => [setting.setting_key, setting]));

  return {
    publicKey: settingMap.get("mercadopago_public_key")?.text_value || "",
    accessToken: settingMap.get("mercadopago_access_token")?.text_value || "",
    webhookSecret: settingMap.get("mercadopago_webhook_secret")?.text_value || "",
    statementDescriptor: settingMap.get("mercadopago_statement_descriptor")?.text_value || "",
    checkoutMode: settingMap.get("mercadopago_checkout_mode")?.text_value || "redirect",
    successUrl: settingMap.get("mercadopago_success_url")?.text_value || "",
    failureUrl: settingMap.get("mercadopago_failure_url")?.text_value || "",
    pendingUrl: settingMap.get("mercadopago_pending_url")?.text_value || "",
    sandboxMode: settingMap.get("mercadopago_sandbox_mode")?.boolean_value ?? true
  } satisfies MercadoPagoSettings;
}

export async function getCustomerEventTicketOptions() {
  if (isBuildPhase()) {
    return [] as CustomerEventTicketOption[];
  }

  const supabase = createClient();
  const { data: ticketTypeData } = await supabase
    .from("ticket_types")
    .select(
      "id, event_id, name, description, price, currency, quantity_total, quantity_sold, sale_starts_at, sale_ends_at, is_active"
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (!ticketTypeData?.length) {
    return [] as CustomerEventTicketOption[];
  }

  const activeTicketTypes = (ticketTypeData || []) as TicketTypeRow[];
  const eventMap = await getEventMapByIds(Array.from(new Set(activeTicketTypes.map((item) => item.event_id))));
  const availableEventIds = Array.from(
    new Set(
      activeTicketTypes
        .filter((ticketType) => {
          const event = eventMap.get(ticketType.event_id);
          return event?.status === "published";
        })
        .map((ticketType) => ticketType.event_id)
    )
  );

  if (!availableEventIds.length) {
    return [] as CustomerEventTicketOption[];
  }

  const activeTypeIds = activeTicketTypes
    .filter((ticketType) => availableEventIds.includes(ticketType.event_id))
    .map((ticketType) => ticketType.id);

  const { data: lotData } = await supabase
    .from("ticket_lots")
    .select(
      "id, ticket_type_id, label, courtesy_total, inventory_total, sold_count, reserved_count, courtesy_count, sequence_prefix, sale_starts_at, sale_ends_at, is_active"
    )
    .in("ticket_type_id", activeTypeIds)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  const lotGroups = new Map<string, CustomerEventTicketOption["drops"]>();

  ((lotData || []) as TicketLotRow[]).forEach((lot) => {
    const current = lotGroups.get(lot.ticket_type_id) || [];
    current.push({
      id: lot.id,
      label: lot.label,
      availableUnits: Math.max(lot.inventory_total - lot.sold_count - lot.reserved_count, 0),
      courtesyTotal: lot.courtesy_total,
      sequencePrefix: lot.sequence_prefix,
      saleStartsAt: lot.sale_starts_at,
      saleEndsAt: lot.sale_ends_at
    });
    lotGroups.set(lot.ticket_type_id, current);
  });

  return activeTicketTypes
    .filter((ticketType) => availableEventIds.includes(ticketType.event_id))
    .map((ticketType) => {
      const event = eventMap.get(ticketType.event_id);
      const drops = lotGroups.get(ticketType.id) || [];

      return {
        id: ticketType.id,
        eventId: ticketType.event_id,
        eventTitle: event?.title || "Evento pendiente",
        eventStartsAt: event?.starts_at || null,
        eventCity: event?.city || null,
        name: ticketType.name,
        description: ticketType.description,
        price: ticketType.price,
        currency: ticketType.currency,
        saleStartsAt: ticketType.sale_starts_at,
        saleEndsAt: ticketType.sale_ends_at,
        availableUnits:
          ticketType.quantity_total === null
            ? null
            : Math.max(ticketType.quantity_total - ticketType.quantity_sold, 0),
        drops
      } satisfies CustomerEventTicketOption;
    });
}

export async function getRecentIssuedTickets(limit = 40, searchTerm?: string | null) {
  if (isBuildPhase()) {
    return [] as AdminIssuedTicketSummary[];
  }

  const supabase = createClient();
  let query = supabase
    .from("issued_tickets")
    .select(
      "id, ticket_type_id, ticket_lot_id, owner_user_id, purchaser_name, purchaser_email, purchaser_phone, ticket_code, qr_payload, status, issued_at, checked_in_at, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  const normalizedSearch = String(searchTerm || "").trim();

  if (normalizedSearch) {
    query = query.or(
      `ticket_code.ilike.%${normalizedSearch}%,purchaser_name.ilike.%${normalizedSearch}%,purchaser_email.ilike.%${normalizedSearch}%`
    );
  }

  const { data } = await query;

  if (!data?.length) {
    return [] as AdminIssuedTicketSummary[];
  }

  const issuedTickets = (data || []) as IssuedTicketRow[];
  const ticketTypeIds = Array.from(new Set(issuedTickets.map((ticket) => ticket.ticket_type_id)));
  const lotIds = Array.from(new Set(issuedTickets.map((ticket) => ticket.ticket_lot_id).filter(Boolean)));
  const ownerIds = Array.from(new Set(issuedTickets.map((ticket) => ticket.owner_user_id).filter(Boolean)));

  const [{ data: ticketTypes }, { data: lots }, { data: owners }] = await Promise.all([
    supabase.from("ticket_types").select("id, event_id, name").in("id", ticketTypeIds),
    lotIds.length
      ? supabase.from("ticket_lots").select("id, label").in("id", lotIds)
      : Promise.resolve({ data: [] as Array<{ id: string; label: string }> }),
    ownerIds.length
      ? supabase.from("profiles").select("id, email, first_name, last_name").in("id", ownerIds)
      : Promise.resolve({ data: [] as Array<{ id: string; email: string | null; first_name: string | null; last_name: string | null }> })
  ]);

  const ticketTypeMap = new Map((ticketTypes || []).map((ticketType) => [ticketType.id, ticketType]));
  const lotMap = new Map((lots || []).map((lot) => [lot.id, lot]));
  const ownerMap = new Map(
    (owners || []).map((owner) => {
      const ownerLabel = [owner.first_name, owner.last_name].filter(Boolean).join(" ").trim() || owner.email || "Cliente";
      return [owner.id, ownerLabel];
    })
  );
  const eventMap = await getEventMapByIds(
    Array.from(new Set((ticketTypes || []).map((ticketType) => ticketType.event_id)))
  );

  return issuedTickets.map((ticket) => {
    const ticketType = ticketTypeMap.get(ticket.ticket_type_id);
    const event = ticketType ? eventMap.get(ticketType.event_id) : null;
    const lot = ticket.ticket_lot_id ? lotMap.get(ticket.ticket_lot_id) : null;

    return {
      id: ticket.id,
      eventTitle: event?.title || "Evento pendiente",
      ticketTypeName: ticketType?.name || "Tipo pendiente",
      ticketLotLabel: lot?.label || null,
      purchaserName: ticket.purchaser_name,
      purchaserEmail: ticket.purchaser_email,
      purchaserPhone: ticket.purchaser_phone,
      ownerLabel: ticket.owner_user_id ? ownerMap.get(ticket.owner_user_id) || null : null,
      ticketCode: ticket.ticket_code,
      qrPayload: ticket.qr_payload,
      status: ticket.status,
      issuedAt: ticket.issued_at,
      checkedInAt: ticket.checked_in_at
    } satisfies AdminIssuedTicketSummary;
  });
}
