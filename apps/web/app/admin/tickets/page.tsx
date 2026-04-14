import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DashboardShell } from "../../../components/dashboard-shell";
import { requireAdmin } from "../../../lib/auth/session";
import {
  getAdminTicketLots,
  getAdminTicketTypes,
  getMercadoPagoSettings,
  getTicketConfigEvents,
  getTicketOperationSummary,
  getTicketTypeOptions
} from "../../../lib/data/tickets";
import { formatEventDateTimeWallClock } from "../../../lib/date-format";
import { controlNavItems } from "../../../lib/navigation";
import {
  createTicketLotAction,
  createTicketTypeAction,
  saveMercadoPagoSettingsAction
} from "./actions";

export const dynamic = "force-dynamic";

type AdminTicketsPageProps = {
  searchParams?: {
    error?: string;
    success?: string;
  };
};

function formatDate(dateValue: string | null) {
  return formatEventDateTimeWallClock(dateValue) || "Sin fecha";
}

export default async function AdminTicketsPage({ searchParams }: AdminTicketsPageProps) {
  await requireAdmin();

  const [summary, events, ticketTypes, ticketTypeOptions, ticketLots, mercadoPagoSettings] = await Promise.all([
    getTicketOperationSummary(),
    getTicketConfigEvents(),
    getAdminTicketTypes(40),
    getTicketTypeOptions(80),
    getAdminTicketLots(48),
    getMercadoPagoSettings()
  ]);

  const errorMessage = searchParams?.error ? decodeURIComponent(searchParams.error) : null;
  const successMessage = searchParams?.success ? decodeURIComponent(searchParams.success) : null;

  return (
    <DashboardShell navItems={controlNavItems} subtitle="Drops, lotes, emision y cobro" title="Tickets">
      {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Stack spacing={1.5}>
        <Typography variant="h2">Operacion general</Typography>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", xl: "repeat(4, minmax(0, 1fr))" } }}>
          <SummaryCard label="Tipos activos" value={summary.ticketTypes} />
          <SummaryCard label="Drops o lotes" value={summary.ticketLots} />
          <SummaryCard label="Tickets emitidos" value={summary.issuedTickets} />
          <SummaryCard label="Capacidad cortesia" value={summary.courtesyCapacity} />
        </Box>
        <Typography color="text.secondary">
          Para este flujo, un tipo de ticket representa la combinacion comercial que quieras vender: General, VIP,
          Preventa 1, Fase 2, Confort o cualquier categoria/etapa. Los lotes son el drop operativo de stock y
          emision sobre ese tipo.
        </Typography>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Crear tipo de ticket</Typography>
        <form action={createTicketTypeAction} autoComplete="off" method="post">
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(12, minmax(0, 1fr))" } }}>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField label="Evento" name="eventId" required select>
                {events.map((event) => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.title}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField label="Nombre comercial" name="name" required placeholder="VIP Preventa 1" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField label="SKU" name="sku" placeholder="vip-p1" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField inputProps={{ min: 1, step: "0.01" }} label="Precio" name="price" required type="number" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 8" } }}>
              <TextField fullWidth label="Descripcion" multiline minRows={2} name="description" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField defaultValue="MXN" label="Moneda" name="currency" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField inputProps={{ min: 1, step: 1 }} label="Capacidad total" name="quantityTotal" type="number" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField InputLabelProps={{ shrink: true }} label="Venta desde" name="saleStartsAt" type="datetime-local" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField InputLabelProps={{ shrink: true }} label="Venta hasta" name="saleEndsAt" type="datetime-local" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField defaultValue="true" label="Activo" name="isActive" select>
                <MenuItem value="true">Si</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" }, display: "flex", alignItems: "flex-end" }}>
              <Button fullWidth type="submit" variant="contained">
                Crear tipo
              </Button>
            </Box>
          </Box>
        </form>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Crear lote o drop</Typography>
        <form action={createTicketLotAction} autoComplete="off" method="post">
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(12, minmax(0, 1fr))" } }}>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField label="Tipo de ticket" name="ticketTypeId" required select>
                {ticketTypeOptions.map((ticketType) => (
                  <MenuItem key={ticketType.id} value={ticketType.id}>
                    {ticketType.eventTitle} - {ticketType.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField label="Nombre del drop" name="label" required placeholder="Drop 01 / Taquilla / VIP mayo" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField inputProps={{ min: 1, step: 1 }} label="Stock" name="inventoryTotal" required type="number" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField inputProps={{ min: 0, step: 1 }} label="Cortesias" name="courtesyTotal" type="number" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 1" } }}>
              <TextField defaultValue="true" label="Activo" name="isActive" select>
                <MenuItem value="true">Si</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField fullWidth label="Descripcion operativa" multiline minRows={2} name="description" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField label="Prefijo" name="sequencePrefix" placeholder="LLVIP" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField InputLabelProps={{ shrink: true }} label="Disponible desde" name="saleStartsAt" type="datetime-local" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField InputLabelProps={{ shrink: true }} label="Disponible hasta" name="saleEndsAt" type="datetime-local" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 12" }, display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" variant="contained">
                Crear drop
              </Button>
            </Box>
          </Box>
        </form>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Mercado Pago developer</Typography>
        <Typography color="text.secondary">
          Aqui dejamos la configuracion lista para prender el flujo completo de pagos en la siguiente fase. Por ahora se
          guarda todo lo necesario para sandbox, webhook y redirecciones.
        </Typography>
        <form action={saveMercadoPagoSettingsAction} autoComplete="off" method="post">
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(12, minmax(0, 1fr))" } }}>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField autoComplete="off" defaultValue={mercadoPagoSettings.publicKey} label="Public key" name="publicKey" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField autoComplete="off" defaultValue={mercadoPagoSettings.accessToken} label="Access token" name="accessToken" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField autoComplete="off" defaultValue={mercadoPagoSettings.webhookSecret} label="Webhook secret" name="webhookSecret" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField autoComplete="off" defaultValue={mercadoPagoSettings.statementDescriptor} label="Statement descriptor" name="statementDescriptor" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField defaultValue={mercadoPagoSettings.checkoutMode} label="Modo de checkout" name="checkoutMode" select>
                <MenuItem value="redirect">redirect</MenuItem>
                <MenuItem value="wallet">wallet</MenuItem>
                <MenuItem value="embedded">embedded</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField defaultValue={mercadoPagoSettings.sandboxMode ? "true" : "false"} label="Sandbox" name="sandboxMode" select>
                <MenuItem value="true">Si</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField autoComplete="off" defaultValue={mercadoPagoSettings.successUrl} label="URL success" name="successUrl" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField autoComplete="off" defaultValue={mercadoPagoSettings.failureUrl} label="URL failure" name="failureUrl" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField autoComplete="off" defaultValue={mercadoPagoSettings.pendingUrl} label="URL pending" name="pendingUrl" />
            </Box>
            <Box sx={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" variant="contained">
                Guardar Mercado Pago
              </Button>
            </Box>
          </Box>
        </form>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Tipos configurados</Typography>
        {ticketTypes.length ? (
          <Box sx={{ display: "grid", gap: 2 }}>
            {ticketTypes.map((ticketType) => (
              <Box key={ticketType.id} sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper", p: 2.5 }}>
                <Stack spacing={1}>
                  <Typography variant="h3">{ticketType.name}</Typography>
                  <Typography color="text.secondary">{ticketType.eventTitle}</Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip label={`${ticketType.currency} ${ticketType.price}`} size="small" />
                    <Chip label={ticketType.isActive ? "Activo" : "Inactivo"} size="small" />
                    <Chip label={ticketType.sku || "Sin SKU"} size="small" />
                    <Chip
                      label={
                        ticketType.quantityTotal === null
                          ? "Capacidad abierta"
                          : `${Math.max(ticketType.quantityTotal - ticketType.quantitySold, 0)} disponibles`
                      }
                      size="small"
                    />
                  </Stack>
                  {ticketType.description ? (
                    <Typography color="text.secondary">{ticketType.description}</Typography>
                  ) : null}
                  <Typography color="text.secondary">
                    Venta: {formatDate(ticketType.saleStartsAt)} - {formatDate(ticketType.saleEndsAt)}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">Todavia no hay tipos de ticket registrados.</Typography>
        )}
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Drops y lotes</Typography>
        {ticketLots.length ? (
          <Box sx={{ display: "grid", gap: 2 }}>
            {ticketLots.map((lot) => (
              <Box key={lot.id} sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper", p: 2.5 }}>
                <Stack spacing={1}>
                  <Typography variant="h3">{lot.label}</Typography>
                  <Typography color="text.secondary">
                    {lot.eventTitle} - {lot.ticketTypeName}
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip label={`${Math.max(lot.inventoryTotal - lot.soldCount - lot.reservedCount, 0)} disponibles`} size="small" />
                    <Chip label={`${lot.courtesyTotal} cortesia`} size="small" />
                    <Chip label={lot.isActive ? "Activo" : "Inactivo"} size="small" />
                    <Chip label={lot.sequencePrefix || "Sin prefijo"} size="small" />
                  </Stack>
                  {lot.description ? <Typography color="text.secondary">{lot.description}</Typography> : null}
                  <Typography color="text.secondary">
                    Ventana: {formatDate(lot.saleStartsAt)} - {formatDate(lot.saleEndsAt)}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">Todavia no hay drops o lotes registrados.</Typography>
        )}
      </Stack>
    </DashboardShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Box sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper", p: 2.5 }}>
      <Stack spacing={0.5}>
        <Typography color="text.secondary" variant="body2">
          {label}
        </Typography>
        <Typography variant="h2">{value}</Typography>
      </Stack>
    </Box>
  );
}
