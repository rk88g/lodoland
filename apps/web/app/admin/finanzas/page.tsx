import { Box, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { AdminSectionCard } from "../../../components/admin-section-card";
import { DashboardShell } from "../../../components/dashboard-shell";
import { FlashAlert } from "../../../components/flash-alert";
import { requireAdmin } from "../../../lib/auth/session";
import { getFinanceDashboardData } from "../../../lib/data/finance";
import { readFlashMessage } from "../../../lib/flash";
import { controlNavItems } from "../../../lib/navigation";
import { createClient } from "../../../lib/supabase/server";
import { createFinancialCategoryAction, createFinancialEntryAction } from "./actions";

export const dynamic = "force-dynamic";

const FLASH_COOKIE = "admin-finanzas-flash";

function formatMoney(value: number, currency = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency
  }).format(value);
}

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(dateValue));
}

type AdminFinanzasPageProps = {
  searchParams?: {
    eventId?: string;
    month?: string;
    year?: string;
    from?: string;
    to?: string;
  };
};

const monthOptions = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" }
];

export default async function AdminFinanzasPage({ searchParams }: AdminFinanzasPageProps) {
  await requireAdmin();
  const flash = readFlashMessage(FLASH_COOKIE);
  const selectedEventId = String(searchParams?.eventId ?? "").trim() || null;
  const selectedMonth = Number(String(searchParams?.month ?? "").trim() || 0) || null;
  const selectedYear = Number(String(searchParams?.year ?? "").trim() || 0) || null;
  const selectedFrom = String(searchParams?.from ?? "").trim() || null;
  const selectedTo = String(searchParams?.to ?? "").trim() || null;
  const supabase = createClient();

  const [dashboard, eventsResponse, promotionsResponse] = await Promise.all([
    getFinanceDashboardData(30, {
      eventId: selectedEventId,
      month: selectedMonth,
      year: selectedYear,
      from: selectedFrom,
      to: selectedTo
    }),
    supabase.from("events").select("id, title").order("starts_at", { ascending: false }).limit(40),
    supabase.from("promotions").select("id, title").order("created_at", { ascending: false }).limit(40)
  ]);

  const events = eventsResponse.data || [];
  const promotions = promotionsResponse.data || [];
  const yearOptions = Array.from({ length: 6 }, (_, index) => new Date().getFullYear() - index);

  return (
    <DashboardShell navItems={controlNavItems} subtitle="Ingresos, gastos y analitica operativa" title="Finanzas">
      <FlashAlert cookieName={FLASH_COOKIE} payload={flash} />

      <Stack spacing={1.5}>
        <Typography variant="h2">Resumen general</Typography>
        <Box
          sx={{
            display: "grid",
            gap: 1.25,
            gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" }
          }}
        >
          <SummaryCard accent="rgba(46, 125, 50, 0.16)" label="Ingresos" value={formatMoney(dashboard.totals.income)} />
          <SummaryCard accent="rgba(211, 47, 47, 0.16)" label="Gastos" value={formatMoney(dashboard.totals.expense)} />
          <SummaryCard accent="rgba(25, 118, 210, 0.16)" label="Balance" value={formatMoney(dashboard.totals.balance)} />
        </Box>
      </Stack>

      <AdminSectionCard
        description="Filtra por evento, mes, año o rango de fechas para hacer cortes operativos."
        title="Filtros y cortes"
      >
        <form autoComplete="off" method="get">
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", xl: "repeat(12, minmax(0, 1fr))" } }}>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 3" } }}>
              <TextField defaultValue={selectedEventId || ""} label="Evento" name="eventId" select>
                <MenuItem value="">Todos</MenuItem>
                {events.map((event) => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.title}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 2" } }}>
              <TextField defaultValue={selectedMonth || ""} label="Mes" name="month" select>
                <MenuItem value="">Todos</MenuItem>
                {monthOptions.map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 2" } }}>
              <TextField defaultValue={selectedYear || ""} label="Año" name="year" select>
                <MenuItem value="">Todos</MenuItem>
                {yearOptions.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 2" } }}>
              <TextField InputLabelProps={{ shrink: true }} defaultValue={selectedFrom || ""} label="Desde" name="from" type="date" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 2" } }}>
              <TextField InputLabelProps={{ shrink: true }} defaultValue={selectedTo || ""} label="Hasta" name="to" type="date" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 1" }, display: "flex", alignItems: "flex-end" }}>
              <Button fullWidth type="submit" variant="contained">
                Filtrar
              </Button>
            </Box>
          </Box>
        </form>

        <Box
          sx={{
            mt: 2,
            display: "grid",
            gap: 1.25,
            gridTemplateColumns: { xs: "1fr", lg: "repeat(3, minmax(0, 1fr))" }
          }}
        >
          <SummaryCard accent="rgba(16, 185, 129, 0.16)" label="Corte hoy" value={formatMoney(dashboard.cuts.today.balance)} />
          <SummaryCard accent="rgba(59, 130, 246, 0.16)" label="Corte mes" value={formatMoney(dashboard.cuts.month.balance)} />
          <SummaryCard accent="rgba(251, 191, 36, 0.16)" label="Corte año" value={formatMoney(dashboard.cuts.year.balance)} />
        </Box>
      </AdminSectionCard>

      <AdminSectionCard description="Crea categorias para clasificar mejor ingresos y gastos." title="Categorias">
        <form action={createFinancialCategoryAction} autoComplete="off" method="post">
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", xl: "repeat(12, minmax(0, 1fr))" } }}>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 5" } }}>
              <TextField label="Nombre de categoria" name="label" required />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 4" } }}>
              <TextField defaultValue="income" label="Tipo" name="kind" required select>
                <MenuItem value="income">Ingreso</MenuItem>
                <MenuItem value="expense">Gasto</MenuItem>
                <MenuItem value="adjustment">Ajuste</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 3" }, display: "flex", alignItems: "flex-end" }}>
              <Button fullWidth type="submit" variant="contained">
                Crear categoria
              </Button>
            </Box>
          </Box>
        </form>
      </AdminSectionCard>

      <AdminSectionCard
        description="Registra movimientos manuales y quedaran reflejados en los totales, los listados y el log de acciones."
        title="Registrar movimiento"
      >
        <form action={createFinancialEntryAction} autoComplete="off" method="post">
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", xl: "repeat(12, minmax(0, 1fr))" } }}>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 2" } }}>
              <TextField defaultValue="income" label="Tipo" name="kind" required select>
                <MenuItem value="income">Ingreso</MenuItem>
                <MenuItem value="expense">Gasto</MenuItem>
                <MenuItem value="adjustment">Ajuste</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 2" } }}>
              <TextField inputProps={{ min: 1, step: "0.01" }} label="Monto" name="amount" required type="number" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 2" } }}>
              <TextField defaultValue="MXN" label="Moneda" name="currency" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 3" } }}>
              <TextField label="Categoria" name="categoryId" select>
                <MenuItem value="">Sin categoria</MenuItem>
                {dashboard.categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.label} ({category.kind === "income" ? "Ingreso" : category.kind === "expense" ? "Gasto" : "Otro"})
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 3" } }}>
              <TextField label="Referencia" name="referenceLabel" placeholder="Venta taquilla / Pago proveedor / Ajuste" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 6" } }}>
              <TextField InputLabelProps={{ shrink: true }} label="Fecha y hora" name="occurredAt" type="datetime-local" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 3" } }}>
              <TextField label="Evento" name="eventId" select>
                <MenuItem value="">Sin evento</MenuItem>
                {events.map((event) => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.title}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 3" } }}>
              <TextField label="Promocion" name="promotionId" select>
                <MenuItem value="">Sin promocion</MenuItem>
                {promotions.map((promotion) => (
                  <MenuItem key={promotion.id} value={promotion.id}>
                    {promotion.title}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField fullWidth label="Nota operativa" multiline minRows={2} name="note" />
            </Box>
            <Box sx={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" variant="contained">
                Guardar movimiento
              </Button>
            </Box>
          </Box>
        </form>
      </AdminSectionCard>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", xl: "repeat(2, minmax(0, 1fr))" } }}>
        <AdminSectionCard description="Ingresos registrados y sumatoria consolidada." title="Ingresos">
          <Stack spacing={1.5}>
            <SummaryInline label="Total ingresos" value={formatMoney(dashboard.totals.income)} />
            {dashboard.entries.income.length ? (
              <Stack spacing={1.25}>
                {dashboard.entries.income.map((entry) => (
                  <EntryRow entry={entry} key={entry.id} />
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">Todavia no hay ingresos registrados.</Typography>
            )}
          </Stack>
        </AdminSectionCard>

        <AdminSectionCard description="Gastos hechos y sumatoria total." title="Gastos">
          <Stack spacing={1.5}>
            <SummaryInline label="Total gastos" value={formatMoney(dashboard.totals.expense)} />
            {dashboard.entries.expense.length ? (
              <Stack spacing={1.25}>
                {dashboard.entries.expense.map((entry) => (
                  <EntryRow entry={entry} key={entry.id} />
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">Todavia no hay gastos registrados.</Typography>
            )}
          </Stack>
        </AdminSectionCard>
      </Box>

      <AdminSectionCard description="Cortes rapidos para detectar de donde entra y sale mas dinero." title="Analitica">
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", xl: "repeat(3, minmax(0, 1fr))" } }}>
          <AnalyticsColumn
            emptyLabel="Sin ingresos por categoria todavia."
            items={dashboard.analytics.incomesByCategory.map((item) => ({
              label: item.label,
              value: formatMoney(item.amount)
            }))}
            title="Ingresos por categoria"
          />
          <AnalyticsColumn
            emptyLabel="Sin gastos por categoria todavia."
            items={dashboard.analytics.expensesByCategory.map((item) => ({
              label: item.label,
              value: formatMoney(item.amount)
            }))}
            title="Gastos por categoria"
          />
          <AnalyticsColumn
            emptyLabel="Todavia no hay movimientos."
            items={dashboard.analytics.latestMovements.map((item) => ({
              label: `${item.kind === "income" ? "Ingreso" : item.kind === "expense" ? "Gasto" : "Ajuste"} · ${item.referenceLabel || "Movimiento"}`,
              value: `${formatMoney(item.amount, item.currency)} · ${formatDate(item.occurredAt)}`
            }))}
            title="Ultimos movimientos"
          />
        </Box>
      </AdminSectionCard>
    </DashboardShell>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <Box sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper", p: 1.5 }}>
      <Stack spacing={0.5}>
        <Box sx={{ width: 44, height: 4, borderRadius: 999, bgcolor: accent }} />
        <Typography color="text.secondary" variant="body2">
          {label}
        </Typography>
        <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 900, lineHeight: 1 }}>{value}</Typography>
      </Stack>
    </Box>
  );
}

function SummaryInline({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ border: 1, borderColor: "divider", bgcolor: "background.default", p: 1.5 }}>
      <Stack direction="row" justifyContent="space-between" spacing={1}>
        <Typography color="text.secondary">{label}</Typography>
        <Typography sx={{ fontWeight: 900 }}>{value}</Typography>
      </Stack>
    </Box>
  );
}

function EntryRow({ entry }: { entry: Awaited<ReturnType<typeof getFinanceDashboardData>>["entries"]["income"][number] }) {
  return (
    <Box sx={{ border: 1, borderColor: "divider", bgcolor: "background.default", p: 1.5 }}>
      <Stack spacing={0.75}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
          <Typography sx={{ fontWeight: 800 }}>{entry.referenceLabel || "Movimiento sin referencia"}</Typography>
          <Typography sx={{ fontWeight: 800 }}>{formatMoney(entry.amount, entry.currency)}</Typography>
        </Stack>
        <Typography color="text.secondary" variant="body2">
          {formatDate(entry.occurredAt)}
          {entry.actorLabel ? ` · ${entry.actorLabel}` : ""}
          {entry.categoryLabel ? ` · ${entry.categoryLabel}` : ""}
          {entry.relationLabel ? ` · ${entry.relationLabel}` : ""}
        </Typography>
        {entry.note ? (
          <Typography color="text.secondary" variant="body2">
            {entry.note}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}

function AnalyticsColumn({
  title,
  items,
  emptyLabel
}: {
  title: string;
  items: Array<{ label: string; value: string }>;
  emptyLabel: string;
}) {
  return (
    <Stack spacing={1}>
      <Typography variant="h3">{title}</Typography>
      {items.length ? (
        items.map((item) => (
          <Box key={`${title}-${item.label}`} sx={{ border: 1, borderColor: "divider", bgcolor: "background.default", p: 1.25 }}>
            <Typography sx={{ fontWeight: 700 }}>{item.label}</Typography>
            <Typography color="text.secondary" variant="body2">
              {item.value}
            </Typography>
          </Box>
        ))
      ) : (
        <Typography color="text.secondary">{emptyLabel}</Typography>
      )}
    </Stack>
  );
}
