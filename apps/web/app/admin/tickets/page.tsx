import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import Link from "next/link";
import { DashboardShell } from "../../../components/dashboard-shell";
import { requireAdmin } from "../../../lib/auth/session";
import { getCustomerAccountOptions } from "../../../lib/data/admin-sales";
import {
  getAdminTicketLots,
  getAdminTicketTypes,
  getMercadoPagoSettings,
  getRecentIssuedTickets,
  getTicketConfigEvents,
  getTicketOperationSummary,
  getTicketTypeOptions
} from "../../../lib/data/tickets";
import { formatEventDateTimeWallClock } from "../../../lib/date-format";
import { controlNavItems } from "../../../lib/navigation";
import {
  createTicketLotAction,
  createTicketTypeAction,
  saveMercadoPagoSettingsAction,
  sellTicketsAsAdminAction,
  validateIssuedTicketAction
} from "./actions";

export const dynamic = "force-dynamic";

type AdminTicketsPageProps = {
  searchParams?: {
    error?: string;
    success?: string;
    q?: string;
  };
};

function formatDate(dateValue: string | null) {
  return formatEventDateTimeWallClock(dateValue) || "Sin fecha";
}

function formatTicketStatus(status: string) {
  switch (status) {
    case "checked_in":
      return "Usado";
    case "issued":
      return "Emitido";
    case "cancelled":
      return "Cancelado";
    case "refunded":
      return "Reembolsado";
    default:
      return status;
  }
}

export default async function AdminTicketsPage({ searchParams }: AdminTicketsPageProps) {
  await requireAdmin();

  const searchTerm = String(searchParams?.q || "").trim();
  const [summary, events, ticketTypes, ticketTypeOptions, ticketLots, mercadoPagoSettings, customers, issuedTickets] =
    await Promise.all([
      getTicketOperationSummary(),
      getTicketConfigEvents(),
      getAdminTicketTypes(40),
      getTicketTypeOptions(80),
      getAdminTicketLots(48),
      getMercadoPagoSettings(),
      getCustomerAccountOptions(120),
      getRecentIssuedTickets(80, searchTerm)
    ]);

  const errorMessage = searchParams?.error ? decodeURIComponent(searchParams.error) : null;
  const successMessage = searchParams?.success ? decodeURIComponent(searchParams.success) : null;

  return (
    <DashboardShell navItems={controlNavItems} subtitle="Drops, emision, QR y validacion" title="Tickets">
      {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Stack spacing={1.5}>
        <Typography variant="h2">Operacion general</Typography>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", xl: "repeat(4, minmax(0, 1fr))" } }}>
          <SummaryCard accent="#ff8a65" label="Tipos activos" subtitle="Categorias o fases comerciales" value={summary.ticketTypes} />
          <SummaryCard accent="#66bb6a" label="Drops activos" subtitle="Stock operativo disponible" value={summary.ticketLots} />
          <SummaryCard accent="#64b5f6" label="Tickets emitidos" subtitle="Tickets creados por ventas" value={summary.issuedTickets} />
          <SummaryCard accent="#ffd54f" label="Cortesias" subtitle="Capacidad reservada sin costo" value={summary.courtesyCapacity} />
        </Box>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Validar y quemar ticket</Typography>
        <form action={validateIssuedTicketAction} autoComplete="off" method="post">
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 220px" } }}>
            <TextField
              helperText="Escanea el QR completo o pega el codigo visible del ticket."
              label="QR o codigo del ticket"
              name="scanValue"
              required
            />
            <Button sx={{ minHeight: 56 }} type="submit" variant="contained">
              Validar acceso
            </Button>
          </Box>
        </form>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Crear tipo de ticket</Typography>
        <form action={createTicketTypeAction} autoComplete="off" method="post">
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(12, minmax(0, 1fr))" } }}>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField helperText="Evento al que pertenece esta categoria o fase." label="Evento" name="eventId" required select>
                {events.map((event) => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.title}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField helperText="Nombre visible en web y control." label="Nombre comercial" name="name" required placeholder="VIP Preventa 1" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField helperText="Clave interna opcional." label="SKU" name="sku" placeholder="vip-p1" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField helperText="Precio unitario." inputProps={{ min: 1, step: "0.01" }} label="Precio" name="price" required type="number" />
            </Box>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField fullWidth helperText="Puedes describir beneficios, zona o restricciones." label="Descripcion" multiline minRows={2} name="description" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField defaultValue="MXN" label="Moneda" name="currency" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField helperText="Limite global entre todos los drops del tipo." inputProps={{ min: 1, step: 1 }} label="Capacidad total" name="quantityTotal" type="number" />
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
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 12" }, display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" variant="contained">
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
              <TextField helperText="Tipo comercial o fase a la que pertenece." label="Tipo de ticket" name="ticketTypeId" required select>
                {ticketTypeOptions.map((ticketType) => (
                  <MenuItem key={ticketType.id} value={ticketType.id}>
                    {ticketType.eventTitle} - {ticketType.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField helperText="Nombre operativo de la etapa." label="Nombre del drop" name="label" required placeholder="Drop 01 / Taquilla / VIP mayo" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField helperText="Stock solo de este drop." inputProps={{ min: 1, step: 1 }} label="Stock" name="inventoryTotal" required type="number" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField helperText="Boletos sin costo dentro del lote." inputProps={{ min: 0, step: 1 }} label="Cortesias" name="courtesyTotal" type="number" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 1" } }}>
              <TextField defaultValue="true" label="Activo" name="isActive" select>
                <MenuItem value="true">Si</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField fullWidth helperText="Referencia interna para taquilla, preventa o staff." label="Descripcion operativa" multiline minRows={2} name="description" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField helperText="Base del codigo visible del ticket." label="Prefijo" name="sequencePrefix" placeholder="LLVIP" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField InputLabelProps={{ shrink: true }} label="Disponible desde" name="saleStartsAt" type="datetime-local" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField InputLabelProps={{ shrink: true }} label="Disponible hasta" name="saleEndsAt" type="datetime-local" />
            </Box>
            <Box sx={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" variant="contained">
                Crear drop
              </Button>
            </Box>
          </Box>
        </form>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Autorizar venta manual</Typography>
        <Typography color="text.secondary">
          Este flujo crea la orden pagada y emite de inmediato los tickets con su codigo unico y QR.
        </Typography>
        <form action={sellTicketsAsAdminAction} autoComplete="off" method="post">
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(12, minmax(0, 1fr))" } }}>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField helperText="Cuenta del cliente donde quedaran los tickets." label="Cliente" name="ownerUserId" required select>
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.label} {customer.email ? `- ${customer.email}` : ""}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField label="Tipo de ticket" name="ticketTypeId" required select>
                {ticketTypeOptions.map((ticketType) => (
                  <MenuItem key={ticketType.id} value={ticketType.id}>
                    {ticketType.eventTitle} - {ticketType.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField label="Drop" name="ticketLotId" required select>
                {ticketLots.map((lot) => (
                  <MenuItem key={lot.id} value={lot.id}>
                    {lot.eventTitle} - {lot.ticketTypeName} - {lot.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField helperText="Cantidad a emitir." inputProps={{ min: 1, step: 1 }} label="Cantidad" name="quantity" required type="number" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField autoComplete="off" label="Nombre comprador" name="purchaserName" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField autoComplete="off" label="Correo comprador" name="purchaserEmail" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField autoComplete="off" label="Telefono comprador" name="purchaserPhone" />
            </Box>
            <Box sx={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" variant="contained">
                Autorizar y emitir tickets
              </Button>
            </Box>
          </Box>
        </form>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Mercado Pago developer</Typography>
        <Typography color="text.secondary">
          Aqui queda toda la configuracion lista para conectar cobro automatico en la siguiente fase.
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

      <Stack spacing={1.5}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }}>
          <Typography variant="h2">Tickets emitidos</Typography>
          <form action="/admin/tickets" method="get">
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <TextField defaultValue={searchTerm} label="Buscar ticket" name="q" placeholder="Codigo, comprador o correo" />
              <Button type="submit" variant="outlined">
                Buscar
              </Button>
            </Stack>
          </form>
        </Stack>
        {issuedTickets.length ? (
          <TableContainer sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ticket</TableCell>
                  <TableCell>Evento</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Emitido</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {issuedTickets.map((ticket) => (
                  <TableRow key={ticket.id} hover>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography fontWeight={700}>{ticket.ticketCode}</Typography>
                        <Typography color="text.secondary" variant="body2">
                          {ticket.ticketTypeName}
                          {ticket.ticketLotLabel ? ` - ${ticket.ticketLotLabel}` : ""}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{ticket.eventTitle}</TableCell>
                    <TableCell>
                      <Stack spacing={0.35}>
                        <Typography variant="body2">{ticket.ownerLabel || "Cliente pendiente"}</Typography>
                        {ticket.purchaserName || ticket.purchaserEmail ? (
                          <Typography color="text.secondary" variant="body2">
                            {[ticket.purchaserName, ticket.purchaserEmail].filter(Boolean).join(" - ")}
                          </Typography>
                        ) : null}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={ticket.status === "checked_in" ? "success" : "default"}
                        label={formatTicketStatus(ticket.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.35}>
                        <Typography variant="body2">{formatDate(ticket.issuedAt)}</Typography>
                        {ticket.checkedInAt ? (
                          <Typography color="success.main" variant="body2">
                            Usado: {formatDate(ticket.checkedInAt)}
                          </Typography>
                        ) : null}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction={{ xs: "column", lg: "row" }} spacing={1}>
                        <Button component={Link} href={`/admin/tickets/${ticket.id}`} size="small" variant="outlined">
                          Ver ticket
                        </Button>
                        {ticket.status !== "checked_in" && ticket.status !== "cancelled" && ticket.status !== "refunded" ? (
                          <form action={validateIssuedTicketAction} method="post">
                            <input name="scanValue" type="hidden" value={ticket.ticketCode} />
                            <Button size="small" type="submit" variant="contained">
                              Quemar
                            </Button>
                          </form>
                        ) : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="text.secondary">
            {searchTerm ? "No encontramos tickets emitidos con ese criterio." : "Todavia no hay tickets emitidos desde control."}
          </Typography>
        )}
      </Stack>
    </DashboardShell>
  );
}

function SummaryCard({
  label,
  subtitle,
  value,
  accent
}: {
  label: string;
  subtitle: string;
  value: number;
  accent: string;
}) {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        p: 2.25
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 58,
            height: 42,
            background: `linear-gradient(135deg, ${accent} 0%, rgba(255,255,255,0.12) 100%)`,
            border: "1px solid rgba(255,255,255,0.14)"
          }}
        />
        <Stack spacing={0.4} flex={1}>
          <Typography variant="h3">{label}</Typography>
          <Typography color="text.secondary" variant="body2">
            {subtitle}
          </Typography>
        </Stack>
        <Typography sx={{ fontSize: 34, fontWeight: 800, lineHeight: 1 }}>{value}</Typography>
      </Stack>
    </Box>
  );
}
