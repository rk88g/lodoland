import { Grid, Stack, Typography } from "@mui/material";
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
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography>Lotes, capacidad, reservas, tickets vendidos, pendientes y cortesías.</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography color="text.secondary">
              La estructura ya está prevista con `ticket_lots`, `issued_tickets` y movimientos de inventario.
            </Typography>
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Operación</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography>Escaneo, check-in, anulación, cortesía, reimpresión e historial de emisión.</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography color="text.secondary">
              En la siguiente fase uniremos esto con eventos, órdenes y pagos.
            </Typography>
          </Grid>
        </Grid>
      </Stack>
    </DashboardShell>
  );
}
