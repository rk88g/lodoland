import { Grid, Stack, Typography } from "@mui/material";
import { DashboardShell } from "../../../components/dashboard-shell";
import { requireAdmin } from "../../../lib/auth/session";
import { controlNavItems } from "../../../lib/navigation";
import { signOutAction } from "../../login/actions";

export default async function AdminFinanzasPage() {
  await requireAdmin();

  return (
    <DashboardShell
      navItems={controlNavItems}
      signOutAction={signOutAction}
      subtitle="Ingresos, gastos y balance"
      title="Finanzas"
    >
      <Stack spacing={1.5}>
        <Typography variant="h2">Operación</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography>Registro manual y automático de ingresos, gastos, ajustes y responsables.</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography color="text.secondary">
              La base ya contempla `financial_categories` y `financial_entries`.
            </Typography>
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Analítica</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography>Totales por evento, promoción, ticket, merch y consolidado global.</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography color="text.secondary">
              En la siguiente etapa conectaremos gráficos, cortes por categoría y utilidad.
            </Typography>
          </Grid>
        </Grid>
      </Stack>
    </DashboardShell>
  );
}
