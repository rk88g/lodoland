import { Grid, Stack, Typography } from "@mui/material";
import { DashboardShell } from "../../../components/dashboard-shell";
import { requireAdmin } from "../../../lib/auth/session";
import { controlNavItems } from "../../../lib/navigation";
import { signOutAction } from "../../login/actions";

export default async function AdminPromocionesPage() {
  await requireAdmin();

  return (
    <DashboardShell
      navItems={controlNavItems}
      signOutAction={signOutAction}
      subtitle="Rifas, quinielas y motor comercial"
      title="Promoción"
    >
      <Stack spacing={1.5}>
        <Typography variant="h2">Promociones visibles</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography>Controlaremos las 4 promociones principales visibles en la home pública.</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography color="text.secondary">
              La estructura ya está prevista con `promotions`, `promotion_feature_slots` y `promotion_offers`.
            </Typography>
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Operación interna</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography>Rifas, quinielas, venta directa, campañas, regalos y otros esquemas escalables.</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography color="text.secondary">
              Aquí conectaremos inventario, reglas, premios, fechas, números vendidos y resultados.
            </Typography>
          </Grid>
        </Grid>
      </Stack>
    </DashboardShell>
  );
}
