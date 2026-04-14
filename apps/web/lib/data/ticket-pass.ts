import { isBuildPhase } from "../runtime";
import { createClient } from "../supabase/server";
import { buildQrCodeUrl } from "../qr";

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

type TicketTypeRow = {
  id: string;
  event_id: string;
  name: string;
  price: number | null;
  currency: string | null;
};

type EventRow = {
  id: string;
  title: string;
  starts_at: string | null;
  venue_name: string | null;
  venue_address: string | null;
  city: string | null;
};

export type TicketPassDetail = {
  id: string;
  ticketCode: string;
  status: string;
  issuedAt: string | null;
  checkedInAt: string | null;
  qrPayload: string;
  qrImageUrl: string;
  eventTitle: string;
  eventStartsAt: string | null;
  eventVenue: string | null;
  eventAddress: string | null;
  eventCity: string | null;
  ticketTypeName: string;
  ticketLotLabel: string | null;
  priceLabel: string;
  ownerLabel: string | null;
  purchaserName: string | null;
  purchaserEmail: string | null;
  purchaserPhone: string | null;
};

function formatMoney(value: number | null | undefined, currency = "MXN") {
  if (value === null || value === undefined) {
    return "Pendiente";
  }

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency
  }).format(value);
}

export async function getTicketPassDetail(
  ticketId: string,
  options?: { ownerUserId?: string | null; userEmail?: string | null }
) {
  if (isBuildPhase()) {
    return null;
  }

  const supabase = createClient();
  let query = supabase
    .from("issued_tickets")
    .select(
      "id, ticket_type_id, ticket_lot_id, owner_user_id, purchaser_name, purchaser_email, purchaser_phone, ticket_code, qr_payload, status, issued_at, checked_in_at, created_at"
    )
    .eq("id", ticketId);

  if (options?.ownerUserId && options?.userEmail) {
    query = query.or(`owner_user_id.eq.${options.ownerUserId},purchaser_email.eq.${options.userEmail}`);
  } else if (options?.ownerUserId) {
    query = query.eq("owner_user_id", options.ownerUserId);
  }

  const { data: ticket, error } = await query.maybeSingle();

  if (error || !ticket) {
    return null;
  }

  const issuedTicket = ticket as IssuedTicketRow;

  const [{ data: ticketType }, { data: lot }, { data: owner }] = await Promise.all([
    supabase
      .from("ticket_types")
      .select("id, event_id, name, price, currency")
      .eq("id", issuedTicket.ticket_type_id)
      .maybeSingle(),
    issuedTicket.ticket_lot_id
      ? supabase.from("ticket_lots").select("id, label").eq("id", issuedTicket.ticket_lot_id).maybeSingle()
      : Promise.resolve({ data: null }),
    issuedTicket.owner_user_id
      ? supabase
          .from("profiles")
          .select("id, email, first_name, last_name")
          .eq("id", issuedTicket.owner_user_id)
          .maybeSingle()
      : Promise.resolve({ data: null })
  ]);

  const typedTicketType = ticketType as TicketTypeRow | null;
  const { data: event } = typedTicketType
    ? await supabase
        .from("events")
        .select("id, title, starts_at, venue_name, venue_address, city")
        .eq("id", typedTicketType.event_id)
        .maybeSingle()
    : { data: null };

  const ownerLabel = owner
    ? [owner.first_name, owner.last_name].filter(Boolean).join(" ").trim() || owner.email || "Cliente"
    : null;
  const payload = issuedTicket.qr_payload || issuedTicket.ticket_code;

  return {
    id: issuedTicket.id,
    ticketCode: issuedTicket.ticket_code,
    status: issuedTicket.status,
    issuedAt: issuedTicket.issued_at,
    checkedInAt: issuedTicket.checked_in_at,
    qrPayload: payload,
    qrImageUrl: buildQrCodeUrl(payload, 260),
    eventTitle: (event as EventRow | null)?.title || "Evento pendiente",
    eventStartsAt: (event as EventRow | null)?.starts_at || null,
    eventVenue: (event as EventRow | null)?.venue_name || null,
    eventAddress: (event as EventRow | null)?.venue_address || null,
    eventCity: (event as EventRow | null)?.city || null,
    ticketTypeName: typedTicketType?.name || "Tipo pendiente",
    ticketLotLabel: (lot as { label: string } | null)?.label || null,
    priceLabel: formatMoney(typedTicketType?.price, typedTicketType?.currency || "MXN"),
    ownerLabel,
    purchaserName: issuedTicket.purchaser_name,
    purchaserEmail: issuedTicket.purchaser_email,
    purchaserPhone: issuedTicket.purchaser_phone
  } satisfies TicketPassDetail;
}
