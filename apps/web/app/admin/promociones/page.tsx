import { Box, Stack, Typography } from "@mui/material";
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
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
          <Box>
            <Typography>Controlaremos las 4 promociones principales visibles en la home pública.</Typography>
          </Box>
          <Box>
            <Typography color="text.secondary">
              La estructura ya está prevista con `promotions`, `promotion_feature_slots` y `promotion_offers`.
            </Typography>
          </Box>
        </Box>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Operación interna</Typography>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
          <Box>
            <Typography>Rifas, quinielas, venta directa, campañas, regalos y otros esquemas escalables.</Typography>
          </Box>
          <Box>
            <Typography color="text.secondary">
              Aquí conectaremos inventario, reglas, premios, fechas, números vendidos y resultados.
            </Typography>
          </Box>
        </Box>
      </Stack>
    </DashboardShell>
  );
}
