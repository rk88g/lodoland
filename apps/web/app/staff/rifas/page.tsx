import { Box, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { AdminSectionCard } from "../../../components/admin-section-card";
import { DashboardShell } from "../../../components/dashboard-shell";
import { FlashAlert } from "../../../components/flash-alert";
import { requireOperator } from "../../../lib/auth/session";
import { readFlashMessage } from "../../../lib/flash";
import { getCustomerAccountOptions } from "../../../lib/data/admin-sales";
import { getAvailableRaffles } from "../../../lib/data/customer";
import { staffNavItems } from "../../../lib/navigation";
import { sellRaffleNumbersAsAdminAction } from "../../admin/rifas/actions";

export const dynamic = "force-dynamic";

export default async function StaffRafflesPage() {
  await requireOperator();
  const flash = readFlashMessage("staff-raffles-flash");
  const [raffles, customers] = await Promise.all([getAvailableRaffles(24), getCustomerAccountOptions(120)]);

  return (
    <DashboardShell navItems={staffNavItems} subtitle="Venta operativa" title="Venta rifas">
      <FlashAlert cookieName="staff-raffles-flash" payload={flash} />

      <AdminSectionCard
        description="Vende numeros directamente al cliente. Si la rifa esta configurada como aleatoria, no permitira captura manual."
        title="Autorizar venta"
      >
        <form action={sellRaffleNumbersAsAdminAction} autoComplete="off" method="post">
          <input name="redirectTo" type="hidden" value="/staff/rifas" />
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(12, minmax(0, 1fr))" } }}>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField label="Cliente" name="ownerUserId" required select>
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.label} {customer.email ? `- ${customer.email}` : ""}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField label="Rifa" name="raffleId" required select>
                {raffles.map((raffle) => (
                  <MenuItem key={raffle.id} value={raffle.id}>
                    {raffle.title}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField inputProps={{ min: 1, step: 1 }} label="Cantidad" name="quantity" required type="number" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
              <TextField defaultValue="manual" label="Asignacion" name="selectionMode" select>
                <MenuItem value="manual">Manual</MenuItem>
                <MenuItem value="random">Aleatoria</MenuItem>
              </TextField>
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
            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField
                fullWidth
                helperText="Solo para asignacion manual. Separa por coma o espacio."
                label="Numeros manuales"
                name="manualNumbers"
              />
            </Box>
            <Box sx={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" variant="contained">
                Autorizar venta de numeros
              </Button>
            </Box>
          </Box>
        </form>
      </AdminSectionCard>

      <AdminSectionCard description="Resumen rapido de rifas activas para no saturar la operacion." title="Rifas activas">
        {raffles.length ? (
          <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" } }}>
            {raffles.map((raffle) => (
              <Box key={raffle.id} sx={{ border: 1, borderColor: "divider", bgcolor: "background.default", p: 2 }}>
                <Stack spacing={0.75}>
                  <Typography variant="h3">{raffle.title}</Typography>
                  <Typography color="text.secondary">
                    {raffle.currency} {raffle.entryPrice} por numero
                  </Typography>
                  <Typography color="text.secondary">
                    Vendidos: {raffle.soldNumbers.length} / {raffle.totalNumbers || "abierto"}
                  </Typography>
                  <Typography color="text.secondary">
                    Modo: {raffle.priceMode === "random_number" ? "Solo aleatoria" : raffle.allowManualPick ? "Manual o aleatoria" : "Aleatoria"}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">Todavia no hay rifas disponibles para venta.</Typography>
        )}
      </AdminSectionCard>
    </DashboardShell>
  );
}
