import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DashboardShell } from "../../../components/dashboard-shell";
import { requireAdmin } from "../../../lib/auth/session";
import { getAdminEvents, getMediaAssets, getUpcomingEvents } from "../../../lib/data/portal";
import { formatMexicoDateTime, formatMexicoDateTimeInput } from "../../../lib/date-format";
import { controlNavItems } from "../../../lib/navigation";
import { createEventAction, updateEventAction } from "./actions";

export const dynamic = "force-dynamic";

type AdminEventsPageProps = {
  searchParams?: {
    error?: string;
    success?: string;
  };
};

type EventStatusShape = {
  status: string;
  operationalStatus: string | null;
};

function formatDate(dateValue: string | null) {
  return formatMexicoDateTime(dateValue) || "Sin fecha";
}

function getDisplayStatus(event: EventStatusShape) {
  if (event.operationalStatus === "completed") {
    return "completed";
  }

  if (event.operationalStatus === "cancelled") {
    return "cancelled";
  }

  return event.status;
}

function formatStatusLabel(status: string) {
  switch (status) {
    case "published":
      return "Publicado";
    case "draft":
      return "Borrador";
    case "completed":
      return "Concluido";
    case "cancelled":
      return "Cancelado";
    case "archived":
      return "Archivado";
    default:
      return status;
  }
}

function getStatusColor(status: string) {
  if (status === "published") {
    return "success" as const;
  }

  if (status === "cancelled") {
    return "error" as const;
  }

  if (status === "completed") {
    return "info" as const;
  }

  return "default" as const;
}

export default async function AdminEventsPage({ searchParams }: AdminEventsPageProps) {
  await requireAdmin();
  const [upcomingEvents, adminEvents, mediaAssets] = await Promise.all([
    getUpcomingEvents(5),
    getAdminEvents(40),
    getMediaAssets(80)
  ]);
  const errorMessage = searchParams?.error ? decodeURIComponent(searchParams.error) : null;
  const successMessage = searchParams?.success ? decodeURIComponent(searchParams.success) : null;

  return (
    <DashboardShell
      navItems={controlNavItems}
      subtitle="Proximo evento, edicion y estado operativo"
      title="Eventos"
    >
      {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Stack spacing={1.5}>
        <Typography variant="h2">Crear evento</Typography>
        <form action={createEventAction} autoComplete="off" method="post">
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(12, minmax(0, 1fr))" } }}>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 6" } }}>
              <TextField label="Titulo" name="title" required />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField label="Slug" name="slug" placeholder="mud-festival-2026" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField label="Ciudad" name="city" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 6" } }}>
              <TextField label="Descripcion corta" name="shortDescription" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField label="Sede" name="venueName" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField
                InputLabelProps={{ shrink: true }}
                label="Fecha y hora"
                name="startsAt"
                type="datetime-local"
              />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField defaultValue="draft" label="Estado" name="status" select>
                <MenuItem value="draft">Borrador</MenuItem>
                <MenuItem value="published">Publicado</MenuItem>
                <MenuItem value="archived">Archivado</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 8" } }}>
              <TextField
                helperText="Selecciona el ID de un asset ya registrado en Diseno web."
                label="Cover asset ID"
                name="coverAssetId"
                select
              >
                <MenuItem value="">Sin portada</MenuItem>
                {mediaAssets.map((asset) => (
                  <MenuItem key={asset.id} value={asset.id}>
                    {asset.title || asset.path}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Button type="submit" variant="contained">
                Guardar evento
              </Button>
            </Box>
          </Box>
        </form>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Proximos 5 eventos publicados</Typography>
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
            Aun no hay eventos publicados con fecha futura.
          </Typography>
        )}
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Editar eventos</Typography>
        <Typography color="text.secondary">
          Marca un evento como concluido o cancelado para quitarlo de proximos eventos y permitir que se muestre el siguiente publicado.
        </Typography>
        {adminEvents.length ? (
          <Box sx={{ display: "grid", gap: 2 }}>
            {adminEvents.map((event) => {
              const displayStatus = getDisplayStatus(event);

              return (
                <Box key={event.id} sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper", p: { xs: 2, md: 2.5 } }}>
                  <form action={updateEventAction} autoComplete="off" method="post">
                    <input name="eventId" type="hidden" value={event.id} />
                    <Stack spacing={2}>
                      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "220px minmax(0, 1fr)" } }}>
                        <Box
                          sx={{
                            minHeight: 140,
                            border: 1,
                            borderColor: "divider",
                            backgroundColor: "background.default",
                            backgroundImage: event.cover?.url ? `url(${event.cover.url})` : "none",
                            backgroundSize: "cover",
                            backgroundPosition: "center"
                          }}
                        />
                        <Stack spacing={1}>
                          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                            <Chip color={getStatusColor(displayStatus)} label={formatStatusLabel(displayStatus)} size="small" />
                            <Chip label={formatDate(event.startsAt)} size="small" />
                            {event.venueName ? <Chip label={event.venueName} size="small" /> : null}
                            {event.city ? <Chip label={event.city} size="small" /> : null}
                          </Stack>
                          <Typography variant="h3">{event.title}</Typography>
                          <Typography color="text.secondary" variant="body2">
                            Si queda como Publicado y tiene fecha futura, podra aparecer como proximo evento.
                          </Typography>
                        </Stack>
                      </Box>

                      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(12, minmax(0, 1fr))" } }}>
                        <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 5" } }}>
                          <TextField defaultValue={event.title} label="Titulo" name="title" required />
                        </Box>
                        <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
                          <TextField defaultValue={event.slug} label="Slug" name="slug" required />
                        </Box>
                        <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
                          <TextField defaultValue={displayStatus} label="Estado" name="status" select>
                            <MenuItem value="draft">Borrador</MenuItem>
                            <MenuItem value="published">Publicado / proximo</MenuItem>
                            <MenuItem value="completed">Concluido</MenuItem>
                            <MenuItem value="cancelled">Cancelado</MenuItem>
                            <MenuItem value="archived">Archivado</MenuItem>
                          </TextField>
                        </Box>
                        <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 5" } }}>
                          <TextField defaultValue={event.shortDescription || ""} label="Descripcion corta" name="shortDescription" />
                        </Box>
                        <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
                          <TextField defaultValue={event.venueName || ""} label="Sede" name="venueName" />
                        </Box>
                        <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
                          <TextField defaultValue={event.city || ""} label="Ciudad" name="city" />
                        </Box>
                        <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
                          <TextField
                            InputLabelProps={{ shrink: true }}
                            defaultValue={formatMexicoDateTimeInput(event.startsAt)}
                            label="Fecha y hora"
                            name="startsAt"
                            type="datetime-local"
                          />
                        </Box>
                        <Box sx={{ gridColumn: "1 / -1" }}>
                          <TextField
                            defaultValue={event.coverAssetId || ""}
                            helperText="Portada/flyer del evento."
                            label="Cover asset ID"
                            name="coverAssetId"
                            select
                          >
                            <MenuItem value="">Sin portada</MenuItem>
                            {mediaAssets.map((asset) => (
                              <MenuItem key={asset.id} value={asset.id}>
                                {asset.title || asset.path}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Box>
                        <Box sx={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
                          <Button type="submit" variant="contained">
                            Guardar cambios
                          </Button>
                        </Box>
                      </Box>
                    </Stack>
                  </form>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Typography color="text.secondary">Todavia no hay eventos registrados.</Typography>
        )}
      </Stack>
    </DashboardShell>
  );
}
