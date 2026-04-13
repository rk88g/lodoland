import { Box, Stack, Typography } from "@mui/material";
import { DashboardShell } from "../../../components/dashboard-shell";
import { requireAdmin } from "../../../lib/auth/session";
import { controlNavItems } from "../../../lib/navigation";
import { signOutAction } from "../../login/actions";

export default async function AdminTicketsPage() {
  await requireAdmin();

  return (
    <DashboardShell
      navItems={controlNavItems}
      signOutAction={signOutAction}
      subtitle="Inventario y emisión"
      title="Tickets"
    >
      <Stack spacing={1.5}>
        <Typography variant="h2">Inventario</Typography>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
          <Box>
            <Typography>Lotes, capacidad, reservas, tickets vendidos, pendientes y cortesías.</Typography>
          </Box>
          <Box>
            <Typography color="text.secondary">
              La estructura ya está prevista con `ticket_lots`, `issued_tickets` y movimientos de inventario.
            </Typography>
          </Box>
        </Box>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Operación</Typography>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
          <Box>
            <Typography>Escaneo, check-in, anulación, cortesía, reimpresión e historial de emisión.</Typography>
          </Box>
          <Box>
            <Typography color="text.secondary">
              En la siguiente fase uniremos esto con eventos, órdenes y pagos.
            </Typography>
          </Box>
        </Box>
      </Stack>
    </DashboardShell>
  );
}
