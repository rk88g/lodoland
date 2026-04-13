import { Box, Stack, Typography } from "@mui/material";
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
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
          <Box>
            <Typography>Registro manual y automático de ingresos, gastos, ajustes y responsables.</Typography>
          </Box>
          <Box>
            <Typography color="text.secondary">
              La base ya contempla `financial_categories` y `financial_entries`.
            </Typography>
          </Box>
        </Box>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Analítica</Typography>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
          <Box>
            <Typography>Totales por evento, promoción, ticket, merch y consolidado global.</Typography>
          </Box>
          <Box>
            <Typography color="text.secondary">
              En la siguiente etapa conectaremos gráficos, cortes por categoría y utilidad.
            </Typography>
          </Box>
        </Box>
      </Stack>
    </DashboardShell>
  );
}
