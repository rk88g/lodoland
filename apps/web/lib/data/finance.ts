import { isBuildPhase } from "../runtime";
import { createClient } from "../supabase/server";
import { getMexicoDateParts, mexicoDayBoundaryIso, mexicoLocalDateTimeToIso } from "../date-format";

type FinancialCategoryRow = {
  id: string;
  label: string;
  kind: string;
  is_active: boolean;
};

type FinancialEntryRow = {
  id: string;
  kind: string;
  amount: number;
  currency: string;
  reference_label: string | null;
  note: string | null;
  occurred_at: string;
  actor_user_id: string | null;
  category_id: string | null;
  event_id: string | null;
  promotion_id: string | null;
};

type EventRef = {
  id: string;
  title: string;
};

type PromotionRef = {
  id: string;
  title: string;
};

type ProfileRef = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
};

export type FinanceEntrySummary = {
  id: string;
  kind: "income" | "expense" | "adjustment";
  amount: number;
  currency: string;
  referenceLabel: string | null;
  note: string | null;
  occurredAt: string;
  actorLabel: string | null;
  categoryLabel: string | null;
  relationLabel: string | null;
};

export type FinanceDashboardData = {
  totals: {
    income: number;
    expense: number;
    balance: number;
  };
  entries: {
    income: FinanceEntrySummary[];
    expense: FinanceEntrySummary[];
  };
  categories: Array<{
    id: string;
    label: string;
    kind: string;
  }>;
  analytics: {
    incomesByCategory: Array<{ label: string; amount: number }>;
    expensesByCategory: Array<{ label: string; amount: number }>;
    latestMovements: FinanceEntrySummary[];
  };
  cuts: {
    today: { income: number; expense: number; balance: number };
    month: { income: number; expense: number; balance: number };
    year: { income: number; expense: number; balance: number };
  };
};

export type FinanceDashboardFilters = {
  eventId?: string | null;
  month?: number | null;
  year?: number | null;
  from?: string | null;
  to?: string | null;
};

function buildProfileLabel(profile: ProfileRef | undefined) {
  if (!profile) {
    return null;
  }

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
  return fullName || profile.email || "Usuario interno";
}

function buildCategoryTotals(entries: FinanceEntrySummary[]) {
  const totals = new Map<string, number>();

  entries.forEach((entry) => {
    const key = entry.categoryLabel || "Sin categoria";
    totals.set(key, (totals.get(key) || 0) + Number(entry.amount || 0));
  });

  return Array.from(totals.entries())
    .map(([label, amount]) => ({ label, amount }))
    .sort((left, right) => right.amount - left.amount)
    .slice(0, 6);
}

function computeTotals(entries: FinanceEntrySummary[]) {
  const income = entries.filter((entry) => entry.kind === "income").reduce((total, entry) => total + entry.amount, 0);
  const expense = entries.filter((entry) => entry.kind === "expense").reduce((total, entry) => total + entry.amount, 0);

  return {
    income,
    expense,
    balance: income - expense
  };
}

export async function getFinanceDashboardData(
  limitPerKind = 30,
  filters?: FinanceDashboardFilters
): Promise<FinanceDashboardData> {
  if (isBuildPhase()) {
    return {
      totals: {
        income: 0,
        expense: 0,
        balance: 0
      },
      entries: {
        income: [],
        expense: []
      },
      categories: [],
      analytics: {
        incomesByCategory: [],
        expensesByCategory: [],
        latestMovements: []
      },
      cuts: {
        today: { income: 0, expense: 0, balance: 0 },
        month: { income: 0, expense: 0, balance: 0 },
        year: { income: 0, expense: 0, balance: 0 }
      }
    };
  }

  const supabase = createClient();
  const [{ data: categoriesRaw }, { data: entriesRaw }, { data: allEntriesRaw }] = await Promise.all([
    supabase
      .from("financial_categories")
      .select("id, label, kind, is_active")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    (async () => {
      let query = supabase
        .from("financial_entries")
        .select("id, kind, amount, currency, reference_label, note, occurred_at, actor_user_id, category_id, event_id, promotion_id")
        .order("occurred_at", { ascending: false })
        .limit(Math.max(limitPerKind * 5, 180));

      if (filters?.eventId) {
        query = query.eq("event_id", filters.eventId);
      }

      if (filters?.year) {
        query = query
          .gte("occurred_at", mexicoDayBoundaryIso(filters.year, 1, 1) || `${filters.year}-01-01T00:00:00.000Z`)
          .lte("occurred_at", mexicoDayBoundaryIso(filters.year, 12, 31, true) || `${filters.year}-12-31T23:59:59.999Z`);
      }

      if (filters?.month && filters?.year) {
        const lastDay = new Date(Date.UTC(filters.year, filters.month, 0)).getUTCDate();
        query = query
          .gte("occurred_at", mexicoDayBoundaryIso(filters.year, filters.month, 1) || "")
          .lte("occurred_at", mexicoDayBoundaryIso(filters.year, filters.month, lastDay, true) || "");
      }

      if (filters?.from) {
        query = query.gte("occurred_at", mexicoLocalDateTimeToIso(`${filters.from}T00:00:00.000`) || `${filters.from}T00:00:00.000Z`);
      }

      if (filters?.to) {
        query = query.lte("occurred_at", mexicoLocalDateTimeToIso(`${filters.to}T23:59:59.999`) || `${filters.to}T23:59:59.999Z`);
      }

      return query;
    })(),
    supabase
      .from("financial_entries")
      .select("id, kind, amount, currency, reference_label, note, occurred_at, actor_user_id, category_id, event_id, promotion_id")
      .order("occurred_at", { ascending: false })
      .limit(400)
  ]);

  const categories = ((categoriesRaw || []) as FinancialCategoryRow[]).map((category) => ({
    id: category.id,
    label: category.label,
    kind: category.kind
  }));
  const entries = (entriesRaw || []) as FinancialEntryRow[];
  const allEntries = (allEntriesRaw || []) as FinancialEntryRow[];

  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const actorIds = Array.from(new Set([...entries, ...allEntries].map((entry) => entry.actor_user_id).filter(Boolean))) as string[];
  const eventIds = Array.from(new Set([...entries, ...allEntries].map((entry) => entry.event_id).filter(Boolean))) as string[];
  const promotionIds = Array.from(new Set([...entries, ...allEntries].map((entry) => entry.promotion_id).filter(Boolean))) as string[];

  const [{ data: profilesRaw }, { data: eventsRaw }, { data: promotionsRaw }] = await Promise.all([
    actorIds.length
      ? supabase.from("profiles").select("id, email, first_name, last_name").in("id", actorIds)
      : Promise.resolve({ data: [] as ProfileRef[] }),
    eventIds.length
      ? supabase.from("events").select("id, title").in("id", eventIds)
      : Promise.resolve({ data: [] as EventRef[] }),
    promotionIds.length
      ? supabase.from("promotions").select("id, title").in("id", promotionIds)
      : Promise.resolve({ data: [] as PromotionRef[] })
  ]);

  const profileMap = new Map(((profilesRaw || []) as ProfileRef[]).map((profile) => [profile.id, profile]));
  const eventMap = new Map(((eventsRaw || []) as EventRef[]).map((event) => [event.id, event]));
  const promotionMap = new Map(((promotionsRaw || []) as PromotionRef[]).map((promotion) => [promotion.id, promotion]));

  const normalizeEntries = (sourceEntries: FinancialEntryRow[]) =>
    sourceEntries.map((entry) => ({
      id: entry.id,
      kind: entry.kind as "income" | "expense" | "adjustment",
      amount: Number(entry.amount || 0),
      currency: entry.currency || "MXN",
      referenceLabel: entry.reference_label,
      note: entry.note,
      occurredAt: entry.occurred_at,
      actorLabel: buildProfileLabel(entry.actor_user_id ? profileMap.get(entry.actor_user_id) : undefined),
      categoryLabel: entry.category_id ? categoryMap.get(entry.category_id)?.label || null : null,
      relationLabel: entry.event_id
        ? eventMap.get(entry.event_id)?.title || null
        : entry.promotion_id
          ? promotionMap.get(entry.promotion_id)?.title || null
          : null
    })) satisfies FinanceEntrySummary[];

  const normalizedEntries = normalizeEntries(entries);
  const allNormalizedEntries = normalizeEntries(allEntries);

  const incomeEntries = normalizedEntries.filter((entry) => entry.kind === "income");
  const expenseEntries = normalizedEntries.filter((entry) => entry.kind === "expense");

  const currentMexicoDate = getMexicoDateParts();
  const startOfToday = new Date(mexicoDayBoundaryIso(currentMexicoDate.year, currentMexicoDate.month, currentMexicoDate.day) || 0);
  const startOfMonth = new Date(mexicoDayBoundaryIso(currentMexicoDate.year, currentMexicoDate.month, 1) || 0);
  const startOfYear = new Date(mexicoDayBoundaryIso(currentMexicoDate.year, 1, 1) || 0);

  const todayEntries = allNormalizedEntries.filter((entry) => new Date(entry.occurredAt) >= startOfToday);
  const monthEntries = allNormalizedEntries.filter((entry) => new Date(entry.occurredAt) >= startOfMonth);
  const yearEntries = allNormalizedEntries.filter((entry) => new Date(entry.occurredAt) >= startOfYear);

  return {
    totals: computeTotals(normalizedEntries),
    entries: {
      income: incomeEntries.slice(0, limitPerKind),
      expense: expenseEntries.slice(0, limitPerKind)
    },
    categories,
    analytics: {
      incomesByCategory: buildCategoryTotals(incomeEntries),
      expensesByCategory: buildCategoryTotals(expenseEntries),
      latestMovements: normalizedEntries.slice(0, 12)
    },
    cuts: {
      today: computeTotals(todayEntries),
      month: computeTotals(monthEntries),
      year: computeTotals(yearEntries)
    }
  };
}
