import { Box, Stack, Typography } from "@mui/material";
import { DashboardShell } from "../../../components/dashboard-shell";
import { requireAdmin } from "../../../lib/auth/session";
import { controlNavItems } from "../../../lib/navigation";

export const dynamic = "force-dynamic";

export default async function AdminCatalogoPage() {
  await requireAdmin();

  return (
    <DashboardShell
      navItems={controlNavItems}
      subtitle="Merch y productos"
      title="Catálogo"
    >
      <Stack spacing={1.5}>
        <Typography variant="h2">Producto base</Typography>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
          <Box>
            <Typography>Nombre, slug, descripción, imagen principal, estado, categoría y precio.</Typography>
          </Box>
          <Box>
            <Typography color="text.secondary">
              Este módulo se conectará con `products`, `product_variants` y assets del bucket.
            </Typography>
          </Box>
        </Box>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Variantes</Typography>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
          <Box>
            <Typography>Talla, color, SKU, costo, precio y stock por variante.</Typography>
          </Box>
          <Box>
            <Typography color="text.secondary">
              Después conectaremos inventario, movimientos, assets por variante y disponibilidad.
            </Typography>
          </Box>
        </Box>
      </Stack>
    </DashboardShell>
  );
}
