import { isBuildPhase } from "../runtime";
import { createClient } from "../supabase/server";
import { buildQrCodeUrl } from "../qr";
import { buildStorageImageUrl } from "../media";

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
  siteHost: string;
  sponsors: {
    official: {
      name: string;
      imageUrl: string | null;
    } | null;
    featured: Array<{
      id: string;
      name: string;
      imageUrl: string | null;
    }>;
    standard: Array<{
      id: string;
      name: string;
      imageUrl: string | null;
    }>;
    support: Array<{
      id: string;
      name: string;
      imageUrl: string | null;
    }>;
  };
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

function getSiteHost() {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.lodoland.mx";
    return new URL(siteUrl).host.replace(/^www\./, "");
  } catch (_error) {
    return "lodoland.mx";
  }
}

async function getTicketSponsorGroups() {
  const supabase = createClient();
  const [{ data: featuredEvent }, { data: sponsorRows }] = await Promise.all([
    supabase
      .from("home_featured_event")
      .select("sponsor_name, sponsor_media_asset_id, is_active")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("home_sponsors")
      .select("id, name, logo_asset_id, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(10)
  ]);

  const sponsorRowsTyped =
    (sponsorRows || []) as Array<{
      id: string;
      name: string;
      logo_asset_id: string | null;
      sort_order: number;
    }>;

  const mediaIds = Array.from(
    new Set(
      [
        featuredEvent?.sponsor_media_asset_id || null,
        ...sponsorRowsTyped.map((sponsor) => sponsor.logo_asset_id)
      ].filter(Boolean)
    )
  ) as string[];

  const { data: mediaRows } = mediaIds.length
    ? await supabase
        .from("media_assets")
        .select("id, bucket, path, title, alt_text")
        .in("id", mediaIds)
    : { data: [] };

  const mediaMap = new Map(
    (mediaRows || []).map((asset) => [
      asset.id,
      buildStorageImageUrl(asset.path, asset.bucket, {
        width: 560,
        height: 220,
        quality: 82,
        resize: "contain"
      })
    ])
  );

  const official =
    featuredEvent?.sponsor_name || featuredEvent?.sponsor_media_asset_id
      ? {
          name: featuredEvent?.sponsor_name || "Patrocinador oficial",
          imageUrl: featuredEvent?.sponsor_media_asset_id ? mediaMap.get(featuredEvent.sponsor_media_asset_id) || null : null
        }
      : null;

  const remainingSponsors = sponsorRowsTyped.filter((sponsor) => {
    if (!official) {
      return true;
    }

    return (
      sponsor.logo_asset_id !== featuredEvent?.sponsor_media_asset_id &&
      sponsor.name.toLowerCase() !== official.name.toLowerCase()
    );
  });

  const toSponsorItem = (sponsor: (typeof sponsorRowsTyped)[number]) => ({
    id: sponsor.id,
    name: sponsor.name,
    imageUrl: sponsor.logo_asset_id ? mediaMap.get(sponsor.logo_asset_id) || null : null
  });

  return {
    official,
    featured: remainingSponsors.slice(0, 3).map(toSponsorItem),
    standard: remainingSponsors.slice(3, 6).map(toSponsorItem),
    support: remainingSponsors.slice(6, 10).map(toSponsorItem)
  };
}

export async function getTicketPassDetail(
  ticketId: string,
  options?: { ownerUserId?: string | null; userEmail?: string | null; token?: string | null }
) {
  if (isBuildPhase()) {
    return null;
  }

  const supabase = createClient();
  const { data: ticket, error } = await supabase
    .from("issued_tickets")
    .select(
      "id, ticket_type_id, ticket_lot_id, owner_user_id, purchaser_name, purchaser_email, purchaser_phone, ticket_code, qr_payload, status, issued_at, checked_in_at, created_at, metadata"
    )
    .eq("id", ticketId)
    .maybeSingle();

  if (error || !ticket) {
    return null;
  }

  const issuedTicket = ticket as IssuedTicketRow & {
    metadata?: {
      hash?: string;
    } | null;
  };

  if (options?.ownerUserId || options?.userEmail) {
    const ownsTicket = issuedTicket.owner_user_id === options?.ownerUserId;
    const matchesPurchaserEmail = Boolean(
      options?.userEmail &&
      issuedTicket.purchaser_email &&
      issuedTicket.purchaser_email.toLowerCase() === options.userEmail.toLowerCase()
    );

    if (!ownsTicket && !matchesPurchaserEmail) {
      return null;
    }
  }

  if (options?.token) {
    const storedHash = issuedTicket.metadata?.hash || null;

    if (!storedHash || storedHash !== options.token) {
      return null;
    }
  }

  const [{ data: ticketType }, { data: lot }, { data: owner }, sponsors] = await Promise.all([
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
      : Promise.resolve({ data: null }),
    getTicketSponsorGroups()
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
    purchaserPhone: issuedTicket.purchaser_phone,
    siteHost: getSiteHost(),
    sponsors
  } satisfies TicketPassDetail;
}
