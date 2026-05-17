import Link from "next/link";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { AdminSectionCard } from "../../../../components/admin-section-card";
import { DashboardShell } from "../../../../components/dashboard-shell";
import { FlashAlert } from "../../../../components/flash-alert";
import { requireAdmin } from "../../../../lib/auth/session";
import { readFlashMessage } from "../../../../lib/flash";
import { getRaffle27AdminData } from "../../../../lib/raffle27";
import { controlNavItems } from "../../../../lib/navigation";
import { saveRaffle27SettingsAction, sellRaffle27NumberAction } from "./actions";

export const dynamic = "force-dynamic";

const FLASH_COOKIE = "admin-raffle27-flash";

function formatDate(dateValue: string | null) {
  if (!dateValue) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(dateValue));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN"
  }).format(value);
}

function formatNumberLabel(numberValue: number) {
  return numberValue.toString().padStart(4, "0");
}

export default async function AdminRaffle27May2026Page() {
  await requireAdmin();
  const flash = readFlashMessage(FLASH_COOKIE);
  const data = await getRaffle27AdminData();

  return (
    <DashboardShell navItems={controlNavItems} subtitle="Operacion y ventas de la landing especial" title="Rifa 27 Mayo 2026">
      <FlashAlert cookieName={FLASH_COOKIE} payload={flash} />

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} useFlexGap flexWrap="wrap">
        <Button component={Link} href="/admin/rifas" variant="outlined">
          Volver a Rifas
        </Button>
        <Button component={Link} href="/listado27mayo2026" target="_blank" variant="contained">
          Abrir landing publica
        </Button>
      </Stack>

      <Box sx={{ display: "grid", gap: 1.25, gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", xl: "repeat(5, minmax(0, 1fr))" } }}>
        <SummaryCard label="Total numeros" value={data.stats.total.toString()} />
        <SummaryCard label="Vendidos" value={data.stats.sold.toString()} />
        <SummaryCard label="Apartados" value={data.stats.held.toString()} />
        <SummaryCard label="Disponibles" value={data.stats.available.toString()} />
        <SummaryCard label="Ingresos" value={formatMoney(data.stats.revenue)} />
      </Box>

      <AdminSectionCard description="Controla WhatsApp, precio, instrucciones de pago y la fecha oficial del contador." title="Configuracion publica">
        <form action={saveRaffle27SettingsAction} autoComplete="off" method="post">
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", xl: "repeat(12, minmax(0, 1fr))" } }}>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 4" } }}>
              <TextField defaultValue={data.settings.title} label="Titulo" name="title" required />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 3" } }}>
              <TextField defaultValue={data.settings.whatsapp_number} label="WhatsApp" name="whatsappNumber" required />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 2" } }}>
              <TextField defaultValue={data.settings.ticket_price} inputProps={{ min: 1, step: "0.01" }} label="Precio boleto" name="ticketPrice" required type="number" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 3" } }}>
              <TextField InputLabelProps={{ shrink: true }} defaultValue={data.settings.countdown_ends_at.slice(0, 16)} label="Cierre contador" name="countdownEndsAt" required type="datetime-local" />
            </Box>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField defaultValue={data.settings.transfer_instructions} fullWidth label="Instrucciones de transferencia" multiline minRows={3} name="transferInstructions" required />
            </Box>
            <Box sx={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" variant="contained">Guardar configuracion</Button>
            </Box>
          </Box>
        </form>
      </AdminSectionCard>

      <AdminSectionCard description="Marca un numero como vendido, apaga el boleto en la landing y registra el ingreso en finanzas." title="Vender / apagar numero">
        <form action={sellRaffle27NumberAction} autoComplete="off" method="post">
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", xl: "repeat(12, minmax(0, 1fr))" } }}>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 2" } }}>
              <TextField inputProps={{ min: 1, max: 1500, step: 1 }} label="Numero" name="numberValue" required type="number" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 4" } }}>
              <TextField label="Nombre completo" name="buyerName" required />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 3" } }}>
              <TextField label="Telefono" name="buyerPhone" required />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 3" } }}>
              <TextField defaultValue={data.settings.ticket_price} inputProps={{ min: 1, step: "0.01" }} label="Monto" name="amount" required type="number" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 4" } }}>
              <TextField InputLabelProps={{ shrink: true }} label="Fecha de pago" name="paymentDate" type="datetime-local" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", xl: "span 8" } }}>
              <TextField fullWidth label="Notas internas" name="notes" />
            </Box>
            <Box sx={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" variant="contained">Marcar como vendido</Button>
            </Box>
          </Box>
        </form>
      </AdminSectionCard>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", xl: "repeat(2, minmax(0, 1fr))" } }}>
        <AdminSectionCard description="Apartados vivos durante 30 minutos. Si no pagan a tiempo, la suerte se movera." title="Apartados activos">
          {data.heldRows.length ? (
            <Stack spacing={1.25}>
              {data.heldRows.map((row) => (
                <Box key={`held-${row.number_value}`} sx={{ border: 1, borderColor: "divider", bgcolor: "background.default", p: 1.5 }}>
                  <Typography sx={{ fontWeight: 800 }}>#{formatNumberLabel(row.number_value)}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    Dispositivo: {row.held_by_device_id || "Sin dato"}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Expira: {formatDate(row.hold_expires_at)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary">No hay numeros apartados en este momento.</Typography>
          )}
        </AdminSectionCard>

        <AdminSectionCard description="Ultimos boletos cobrados y registrados como ingreso." title="Vendidos">
          {data.soldRows.length ? (
            <Stack spacing={1.25}>
              {data.soldRows.slice(0, 40).map((row) => (
                <Box key={`sold-${row.number_value}`} sx={{ border: 1, borderColor: "divider", bgcolor: "background.default", p: 1.5 }}>
                  <Typography sx={{ fontWeight: 800 }}>#{formatNumberLabel(row.number_value)} · {row.sold_to_name || "Sin nombre"}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    Telefono: {row.sold_to_phone || "Sin telefono"}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Monto: {formatMoney(Number(row.sold_amount || 0))} · Fecha: {formatDate(row.payment_date || row.sold_at)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary">Todavia no hay boletos vendidos.</Typography>
          )}
        </AdminSectionCard>
      </Box>

      <AdminSectionCard description="Visitas, asignaciones y corrimientos de suerte registrados por la landing." title="Log Rifa">
        {data.recentLogs.length ? (
          <Stack spacing={1.25}>
            {data.recentLogs.map((log) => (
              <Box key={log.id} sx={{ border: 1, borderColor: "divider", bgcolor: "background.default", p: 1.5 }}>
                <Typography sx={{ fontWeight: 800 }}>
                  {log.action} {typeof log.lucky_number === "number" ? `· #${formatNumberLabel(log.lucky_number)}` : ""}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {log.message || "Sin mensaje"}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {formatDate(log.created_at)} · {log.device_id || "Sin dispositivo"}
                </Typography>
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary">Todavia no hay registros en el log de esta rifa.</Typography>
        )}
      </AdminSectionCard>
    </DashboardShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper", p: 1.5 }}>
      <Stack spacing={0.5}>
        <Typography color="text.secondary" variant="body2">
          {label}
        </Typography>
        <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 900, lineHeight: 1 }}>
          {value}
        </Typography>
      </Stack>
    </Box>
  );
}
