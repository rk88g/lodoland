import { isBuildPhase } from "../runtime";
import { createClient } from "../supabase/server";

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
  city: string | null;
};

type RaffleRow = {
  id: string;
  title: string;
  description: string | null;
  ends_at: string | null;
  draw_at: string | null;
  entry_price: number;
  currency: string;
  status: string;
  total_numbers: number | null;
  numbers_start: number;
  numbers_end: number | null;
  number_digits: number;
  allow_manual_pick: boolean;
  price_mode: string;
};

type PoolRow = {
  id: string;
  title: string;
  closes_at: string | null;
  resolves_at: string | null;
  entry_price: number;
  currency: string;
  status: string;
};

export type CustomerTicketSummary = {
  id: string;
  ticketCode: string;
  status: string;
  issuedAt: string | null;
  eventTitle: string;
  eventStartsAt: string | null;
  eventCity: string | null;
  ticketTypeName: string;
  priceLabel: string;
};

export type CustomerRaffleSummary = {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  status: string;
  endsAt: string | null;
  drawAt: string | null;
  createdAt: string;
  numbers: number[];
};

export type CustomerPoolSummary = {
  id: string;
  title: string;
  unitPrice: number;
  currency: string;
  status: string;
  closesAt: string | null;
  resolvesAt: string | null;
  createdAt: string;
  picks: string[];
};

export type CustomerAvailableRaffle = {
  id: string;
  title: string;
  description: string | null;
  entryPrice: number;
  currency: string;
  endsAt: string | null;
  drawAt: string | null;
  status: string;
  totalNumbers: number | null;
  numbersStart: number;
  numbersEnd: number | null;
  numberDigits: number;
  allowManualPick: boolean;
  priceMode: string;
  soldNumbers: number[];
  prizes: string[];
};

export type CustomerAvailablePool = {
  id: string;
  title: string;
  entryPrice: number;
  currency: string;
  closesAt: string | null;
  resolvesAt: string | null;
  status: string;
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

function normalizePickValues(picks: unknown) {
  if (!picks || typeof picks !== "object") {
    return [];
  }

  return Object.entries(picks as Record<string, unknown>).map(([key, value]) => `${key}: ${String(value)}`);
}

export async function getCustomerTickets(userId: string, userEmail?: string | null) {
  if (isBuildPhase()) {
    return [];
  }

  const supabase = createClient();
  const ownerQuery = supabase
    .from("issued_tickets")
    .select("id, ticket_code, status, issued_at, ticket_type_id")
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(24);

  const emailQuery = userEmail
    ? supabase
        .from("issued_tickets")
        .select("id, ticket_code, status, issued_at, ticket_type_id")
        .ilike("purchaser_email", userEmail)
        .order("created_at", { ascending: false })
        .limit(24)
    : Promise.resolve({ data: [] as Array<{ id: string; ticket_code: string; status: string; issued_at: string | null; ticket_type_id: string }> });

  const [{ data: ownerTickets }, { data: emailTickets }] = await Promise.all([ownerQuery, emailQuery]);
  const issuedTickets = [...(ownerTickets || []), ...(emailTickets || [])].filter(
    (ticket, index, collection) => collection.findIndex((candidate) => candidate.id === ticket.id) === index
  );

  if (!issuedTickets?.length) {
    return [] as CustomerTicketSummary[];
  }

  const ticketTypeIds = Array.from(new Set(issuedTickets.map((ticket) => ticket.ticket_type_id)));
  const { data: ticketTypes } = await supabase
    .from("ticket_types")
    .select("id, event_id, name, price, currency")
    .in("id", ticketTypeIds);

  const ticketTypeMap = new Map(((ticketTypes || []) as TicketTypeRow[]).map((ticketType) => [ticketType.id, ticketType]));
  const eventIds = Array.from(new Set((ticketTypes || []).map((ticketType) => ticketType.event_id)));
  const { data: events } = await supabase
    .from("events")
    .select("id, title, starts_at, city")
    .in("id", eventIds);

  const eventMap = new Map(((events || []) as EventRow[]).map((event) => [event.id, event]));

  return issuedTickets.map((ticket) => {
    const ticketType = ticketTypeMap.get(ticket.ticket_type_id);
    const event = ticketType ? eventMap.get(ticketType.event_id) : null;

    return {
      id: ticket.id,
      ticketCode: ticket.ticket_code,
      status: ticket.status,
      issuedAt: ticket.issued_at,
      eventTitle: event?.title || "Evento pendiente",
      eventStartsAt: event?.starts_at || null,
      eventCity: event?.city || null,
      ticketTypeName: ticketType?.name || "Tipo pendiente",
      priceLabel: formatMoney(ticketType?.price, ticketType?.currency || "MXN")
    } satisfies CustomerTicketSummary;
  });
}

export async function getCustomerRaffles(userId: string) {
  if (isBuildPhase()) {
    return [];
  }

  const supabase = createClient();
  const { data: entries } = await supabase
    .from("raffle_entries")
    .select("id, raffle_id, quantity, unit_price, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(24);

  if (!entries?.length) {
    return [] as CustomerRaffleSummary[];
  }

  const raffleIds = Array.from(new Set(entries.map((entry) => entry.raffle_id)));
  const { data: raffles } = await supabase
    .from("raffles")
    .select("id, title, description, ends_at, draw_at, entry_price, currency, status, total_numbers, numbers_start, numbers_end, number_digits, allow_manual_pick, price_mode")
    .in("id", raffleIds);

  const entryIds = entries.map((entry) => entry.id);
  const { data: entryNumbers } = await supabase
    .from("raffle_entry_numbers")
    .select("raffle_entry_id, number_value")
    .in("raffle_entry_id", entryIds);

  const raffleMap = new Map(((raffles || []) as RaffleRow[]).map((raffle) => [raffle.id, raffle]));
  const numbersMap = new Map<string, number[]>();

  (entryNumbers || []).forEach((row) => {
    const current = numbersMap.get(row.raffle_entry_id) || [];
    current.push(row.number_value);
    numbersMap.set(row.raffle_entry_id, current);
  });

  return entries.map((entry) => {
    const raffle = raffleMap.get(entry.raffle_id);

    return {
      id: entry.id,
      title: raffle?.title || "Rifa pendiente",
      quantity: entry.quantity,
      unitPrice: Number(entry.unit_price || 0),
      currency: raffle?.currency || "MXN",
      status: entry.status,
      endsAt: raffle?.ends_at || null,
      drawAt: raffle?.draw_at || null,
      createdAt: entry.created_at,
      numbers: (numbersMap.get(entry.id) || []).sort((left, right) => left - right)
    } satisfies CustomerRaffleSummary;
  });
}

export async function getCustomerPools(userId: string) {
  if (isBuildPhase()) {
    return [];
  }

  const supabase = createClient();
  const { data: entries } = await supabase
    .from("pool_entries")
    .select("id, pool_id, picks, unit_price, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(24);

  if (!entries?.length) {
    return [] as CustomerPoolSummary[];
  }

  const poolIds = Array.from(new Set(entries.map((entry) => entry.pool_id)));
  const { data: pools } = await supabase
    .from("pools")
    .select("id, title, closes_at, resolves_at, entry_price, currency, status")
    .in("id", poolIds);

  const poolMap = new Map(((pools || []) as PoolRow[]).map((pool) => [pool.id, pool]));

  return entries.map((entry) => {
    const pool = poolMap.get(entry.pool_id);

    return {
      id: entry.id,
      title: pool?.title || "Quiniela pendiente",
      unitPrice: Number(entry.unit_price || 0),
      currency: pool?.currency || "MXN",
      status: entry.status,
      closesAt: pool?.closes_at || null,
      resolvesAt: pool?.resolves_at || null,
      createdAt: entry.created_at,
      picks: normalizePickValues(entry.picks)
    } satisfies CustomerPoolSummary;
  });
}

export async function getAvailableRaffles(limit = 12) {
  if (isBuildPhase()) {
    return [];
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("raffles")
    .select("id, title, description, ends_at, draw_at, entry_price, currency, status, total_numbers, numbers_start, numbers_end, number_digits, allow_manual_pick, price_mode")
    .in("status", ["published", "draft"])
    .order("created_at", { ascending: false })
    .limit(limit);

  const raffleRows = (data || []) as RaffleRow[];
  if (!raffleRows.length) {
    return [] as CustomerAvailableRaffle[];
  }

  const raffleIds = raffleRows.map((raffle) => raffle.id);
  const [{ data: soldNumbers }, { data: prizes }] = await Promise.all([
    supabase.from("raffle_entry_numbers").select("raffle_id, number_value").in("raffle_id", raffleIds),
    supabase.from("raffle_prizes").select("raffle_id, title").in("raffle_id", raffleIds).order("sort_order", { ascending: true })
  ]);

  const soldMap = new Map<string, number[]>();
  const prizeMap = new Map<string, string[]>();

  (soldNumbers || []).forEach((row) => {
    const current = soldMap.get(row.raffle_id) || [];
    current.push(row.number_value);
    soldMap.set(row.raffle_id, current);
  });

  (prizes || []).forEach((row) => {
    const current = prizeMap.get(row.raffle_id) || [];
    current.push(row.title);
    prizeMap.set(row.raffle_id, current);
  });

  return raffleRows.map((raffle) => ({
    id: raffle.id,
    title: raffle.title,
    description: raffle.description,
    entryPrice: raffle.entry_price,
    currency: raffle.currency,
    endsAt: raffle.ends_at,
    drawAt: raffle.draw_at,
    status: raffle.status,
    totalNumbers: raffle.total_numbers,
    numbersStart: raffle.numbers_start,
    numbersEnd: raffle.numbers_end,
    numberDigits: raffle.number_digits,
    allowManualPick: raffle.allow_manual_pick,
    priceMode: raffle.price_mode,
    soldNumbers: (soldMap.get(raffle.id) || []).sort((left, right) => left - right),
    prizes: prizeMap.get(raffle.id) || []
  }));
}

export async function getAvailablePools(limit = 12) {
  if (isBuildPhase()) {
    return [];
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("pools")
    .select("id, title, closes_at, resolves_at, entry_price, currency, status")
    .in("status", ["published", "draft"])
    .order("created_at", { ascending: false })
    .limit(limit);

  return ((data || []) as PoolRow[]).map((pool) => ({
    id: pool.id,
    title: pool.title,
    entryPrice: pool.entry_price,
    currency: pool.currency,
    closesAt: pool.closes_at,
    resolvesAt: pool.resolves_at,
    status: pool.status
  }));
}
