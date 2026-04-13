import Link from "next/link";
import { Box, Button, Stack, Typography } from "@mui/material";
import { DashboardShell } from "../../components/dashboard-shell";
import { requireAdmin } from "../../lib/auth/session";
import { getMediaAssets, getUpcomingEvents } from "../../lib/data/portal";
import { controlNavItems } from "../../lib/navigation";
import { signOutAction } from "../login/actions";

export default async function AdminPage() {
  await requireAdmin();
  const [upcomingEvents, mediaAssets] = await Promise.all([getUpcomingEvents(5), getMediaAssets(8)]);

  return (
    <DashboardShell
      navItems={controlNavItems}
      signOutAction={signOutAction}
      subtitle="Panel central"
      title="Control"
    >
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" } }}>
        <Box>
          <Stack spacing={0.75}>
            <Typography variant="body2" color="text.secondary">
              Próximos eventos
            </Typography>
            <Typography variant="h2">{upcomingEvents.length}</Typography>
          </Stack>
        </Box>
        <Box>
          <Stack spacing={0.75}>
            <Typography variant="body2" color="text.secondary">
              Assets registrados
            </Typography>
            <Typography variant="h2">{mediaAssets.length}</Typography>
          </Stack>
        </Box>
        <Box>
          <Stack spacing={0.75}>
            <Typography variant="body2" color="text.secondary">
              Sistema
            </Typography>
            <Typography variant="h2">Material UI</Typography>
          </Stack>
        </Box>
      </Box>

      <Stack spacing={1.5}>
        <Typography variant="h2">Módulos principales</Typography>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" } }}>
          {controlNavItems
            .filter((item) => item.href !== "/admin")
            .map((item) => (
              <Box key={item.href}>
                <Stack spacing={1.25}>
                  <Typography variant="h3">{item.label}</Typography>
                  <Link href={item.href} style={{ textDecoration: "none" }}>
                    <Button variant="outlined">Abrir módulo</Button>
                  </Link>
                </Stack>
              </Box>
            ))}
        </Box>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Actividad inmediata</Typography>
        {upcomingEvents.length ? (
          <Stack spacing={1}>
            {upcomingEvents.map((event) => (
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                key={event.id}
                spacing={1}
              >
                <Typography>{event.title}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {event.startsAt
                    ? new Intl.DateTimeFormat("es-MX", {
                        dateStyle: "medium",
                        timeStyle: "short"
                      }).format(new Date(event.startsAt))
                    : "Sin fecha"}
                </Typography>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary">
            No hay eventos publicados todavía. El siguiente paso natural es registrar uno en el módulo de Eventos.
          </Typography>
        )}
      </Stack>
    </DashboardShell>
  );
}
