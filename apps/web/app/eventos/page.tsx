import Link from "next/link";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { DashboardShell } from "../../components/dashboard-shell";
import { isEmailConfirmed, requireUser } from "../../lib/auth/session";
import { getUpcomingEvents } from "../../lib/data/portal";
import { getCustomerEventTicketOptions } from "../../lib/data/tickets";
import { formatEventDateTimeWallClock } from "../../lib/date-format";
import { customerNavItems } from "../../lib/navigation";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function formatDate(dateValue: string | null) {
  return formatEventDateTimeWallClock(dateValue) || "Sin fecha";
}

export default async function EventsPage() {
  const { user } = await requireUser();

  if (!isEmailConfirmed(user)) {
    redirect("/perfil?message=Confirma tu correo para usar el modulo de eventos.");
  }

  const [upcomingEvents, ticketOptions] = await Promise.all([getUpcomingEvents(5), getCustomerEventTicketOptions()]);

  return (
    <DashboardShell navItems={customerNavItems} subtitle="Calendario visible y tickets activos" title="Eventos">
      <Stack spacing={1.5}>
        <Typography variant="h2">Proximos eventos</Typography>
        {upcomingEvents.length ? (
          <Box sx={{ display: "grid", gap: 2 }}>
            {upcomingEvents.map((event) => {
              const eventTickets = ticketOptions.filter((ticketOption) => ticketOption.eventId === event.id);

              return (
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
                      <Stack spacing={1.25}>
                        <Typography variant="h3">{event.title}</Typography>
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                          <Chip label={formatDate(event.startsAt)} size="small" />
                          <Chip label={event.venueName || "Sede"} size="small" />
                          <Chip label={event.city || "Ciudad"} size="small" />
                        </Stack>
                        {event.description || event.shortDescription ? (
                          <Typography color="text.secondary">
                            {event.description || event.shortDescription}
                          </Typography>
                        ) : null}

                        {eventTickets.length ? (
                          <Stack spacing={1}>
                            <Typography variant="body2">Lista de Precios</Typography>
                            <Box sx={{ display: "grid", gap: 1 }}>
                              {eventTickets.map((ticketOption) => (
                                <Box
                                  key={ticketOption.id}
                                  sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper", p: 1.5 }}
                                >
                                  <Stack spacing={1}>
                                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                      <Chip label={ticketOption.name} size="small" />
                                      <Chip label={`${ticketOption.currency} ${ticketOption.price}`} size="small" />
                                      <Chip
                                        label={
                                          ticketOption.availableUnits === null
                                            ? "Stock abierto"
                                            : `${ticketOption.availableUnits} disponibles`
                                        }
                                        size="small"
                                      />
                                    </Stack>
                                    {ticketOption.description ? (
                                      <Typography color="text.secondary" variant="body2">
                                        {ticketOption.description}
                                      </Typography>
                                    ) : null}
                                    {ticketOption.drops.length ? (
                                      <Box sx={{ display: "grid", gap: 1 }}>
                                        {ticketOption.drops.map((drop) => (
                                          <Typography color="text.secondary" key={drop.id} variant="body2">
                                            {drop.label}: {drop.availableUnits} disponibles
                                            {drop.sequencePrefix ? ` - ${drop.sequencePrefix}` : ""}
                                          </Typography>
                                        ))}
                                      </Box>
                                    ) : null}
                                  </Stack>
                                </Box>
                              ))}
                            </Box>
                          </Stack>
                        ) : (
                          <Typography color="text.secondary" variant="body2">
                            Este evento aun no tiene tickets activos configurados.
                          </Typography>
                        )}

                        <Link href="/perfil/compras" style={{ textDecoration: "none" }}>
                          <Button variant="contained">Mis compras</Button>
                        </Link>
                      </Stack>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Typography color="text.secondary">Aun no hay eventos publicados.</Typography>
        )}
      </Stack>
    </DashboardShell>
  );
}
