import { Grid, Stack, Typography } from "@mui/material";
import { DashboardShell } from "../../../components/dashboard-shell";
import { requireAdmin } from "../../../lib/auth/session";
import { controlNavItems } from "../../../lib/navigation";
import { signOutAction } from "../../login/actions";

export default async function AdminCatalogoPage() {
  await requireAdmin();

  return (
    <DashboardShell
      navItems={controlNavItems}
      signOutAction={signOutAction}
      subtitle="Merch y productos"
      title="Catálogo"
    >
      <Stack spacing={1.5}>
        <Typography variant="h2">Producto base</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography>Nombre, slug, descripción, imagen principal, estado, categoría y precio.</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography color="text.secondary">
              Este módulo se conectará con `products`, `product_variants` y assets del bucket.
            </Typography>
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Variantes</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography>Talla, color, SKU, costo, precio y stock por variante.</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography color="text.secondary">
              Después conectaremos inventario, movimientos, assets por variante y disponibilidad.
            </Typography>
          </Grid>
        </Grid>
      </Stack>
    </DashboardShell>
  );
}
