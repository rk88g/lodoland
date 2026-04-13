import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DashboardShell } from "../../../components/dashboard-shell";
import { requireAdmin } from "../../../lib/auth/session";
import { getMediaAssets, getUpcomingEvents } from "../../../lib/data/portal";
import { controlNavItems } from "../../../lib/navigation";
import { signOutAction } from "../../login/actions";
import { createEventAction } from "./actions";

type AdminEventsPageProps = {
  searchParams?: {
    error?: string;
  };
};

function formatDate(dateValue: string | null) {
  if (!dateValue) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(dateValue));
}

export default async function AdminEventsPage({ searchParams }: AdminEventsPageProps) {
  await requireAdmin();
  const [upcomingEvents, mediaAssets] = await Promise.all([getUpcomingEvents(5), getMediaAssets(24)]);
  const errorMessage = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

  return (
    <DashboardShell
      navItems={controlNavItems}
      signOutAction={signOutAction}
      subtitle="Próximo evento y lista operativa"
      title="Eventos"
    >
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Stack spacing={1.5}>
        <Typography variant="h2">Crear evento</Typography>
        <form action={createEventAction}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField label="Título" name="title" required />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Slug" name="slug" placeholder="mud-festival-2026" />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Ciudad" name="city" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Descripción corta" name="shortDescription" />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Sede" name="venueName" />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                InputLabelProps={{ shrink: true }}
                label="Fecha y hora"
                name="startsAt"
                type="datetime-local"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField defaultValue="draft" label="Estado" name="status" select>
                <MenuItem value="draft">draft</MenuItem>
                <MenuItem value="published">published</MenuItem>
                <MenuItem value="archived">archived</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                helperText="Selecciona el ID de un asset ya registrado en Diseño web."
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
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained">
                Guardar evento
              </Button>
            </Grid>
          </Grid>
        </form>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Próximos 5 eventos</Typography>
        {upcomingEvents.length ? (
          <Grid container spacing={2}>
            {upcomingEvents.map((event) => (
              <Grid item xs={12} key={event.id}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
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
                  </Grid>
                  <Grid item xs={12} md={9}>
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
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary">
            Aún no hay eventos publicados con fecha futura.
          </Typography>
        )}
      </Stack>
    </DashboardShell>
  );
}
