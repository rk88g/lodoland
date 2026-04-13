import { Box, Chip, Stack, Typography } from "@mui/material";
import { requireUser } from "../../lib/auth/session";
import { getUpcomingEvents } from "../../lib/data/portal";
import { customerNavItems } from "../../lib/navigation";
import { DashboardShell } from "../../components/dashboard-shell";

export const dynamic = "force-dynamic";

function formatDate(dateValue: string | null) {
  if (!dateValue) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(dateValue));
}

export default async function EventsPage() {
  await requireUser();
  const upcomingEvents = await getUpcomingEvents(5);

  return (
    <DashboardShell
      navItems={customerNavItems}
      subtitle="Calendario visible"
      title="Eventos"
    >
      <Stack spacing={1.5}>
        <Typography variant="h2">Próximos eventos</Typography>
        {upcomingEvents.length ? (
          <Box sx={{ display: "grid", gap: 2 }}>
            {upcomingEvents.map((event) => (
              <Box key={event.id}>
                <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "240px minmax(0, 1fr)" } }}>
                  <Box>
                    <Box
                      sx={{
                        minHeight: 148,
                        border: 1,
                        borderColor: "divider",
                        backgroundColor: "background.default",
                        backgroundImage: event.cover?.url ? `url(${event.cover.url})` : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                      }}
                    />
                  </Box>
                  <Box>
                    <Stack spacing={1}>
                      <Typography variant="h3">{event.title}</Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        <Chip label={formatDate(event.startsAt)} size="small" />
                        <Chip label={event.venueName || "Sede"} size="small" />
                        <Chip label={event.city || "Ciudad"} size="small" />
                      </Stack>
                      {event.shortDescription ? (
                        <Typography color="text.secondary">{event.shortDescription}</Typography>
                      ) : null}
                    </Stack>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">
            Aún no hay eventos publicados.
          </Typography>
        )}
      </Stack>
    </DashboardShell>
  );
}
