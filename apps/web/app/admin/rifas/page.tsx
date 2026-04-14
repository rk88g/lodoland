import { Alert, Box, Button, Chip, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { DashboardShell } from "../../../components/dashboard-shell";
import { requireAdmin } from "../../../lib/auth/session";
import { getAvailableRaffles } from "../../../lib/data/customer";
import { formatEventDateTimeWallClock } from "../../../lib/date-format";
import { controlNavItems } from "../../../lib/navigation";
import { createRaffleAction } from "./actions";

export const dynamic = "force-dynamic";

type AdminRafflesPageProps = {
  searchParams?: {
    error?: string;
    success?: string;
  };
};

function formatDate(dateValue: string | null) {
  return formatEventDateTimeWallClock(dateValue) || "Sin fecha";
}

export default async function AdminRafflesPage({ searchParams }: AdminRafflesPageProps) {
  await requireAdmin();
  const raffles = await getAvailableRaffles(20);
  const errorMessage = searchParams?.error ? decodeURIComponent(searchParams.error) : null;
  const successMessage = searchParams?.success ? decodeURIComponent(searchParams.success) : null;

  return (
    <DashboardShell navItems={controlNavItems} subtitle="Configuracion y operacion" title="Rifas">
      {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Stack spacing={1.5}>
        <Typography variant="h2">Nueva rifa</Typography>
        <form action={createRaffleAction} autoComplete="off" method="post">
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(12, minmax(0, 1fr))" } }}>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 6" } }}>
              <TextField label="Titulo" name="title" required />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField label="Slug" name="slug" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField inputProps={{ min: 1, step: "0.01" }} label="Precio" name="entryPrice" required type="number" />
            </Box>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField fullWidth label="Descripcion" multiline minRows={3} name="description" />
            </Box>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField fullWidth label="Premio" multiline minRows={2} name="prizeDescription" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField InputLabelProps={{ shrink: true }} label="Inicio" name="startsAt" type="datetime-local" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField InputLabelProps={{ shrink: true }} label="Cierre" name="endsAt" type="datetime-local" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField InputLabelProps={{ shrink: true }} label="Sorteo" name="drawAt" type="datetime-local" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField defaultValue="draft" label="Estado" name="status" select>
                <MenuItem value="draft">draft</MenuItem>
                <MenuItem value="published">published</MenuItem>
                <MenuItem value="archived">archived</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" variant="contained">Crear rifa</Button>
            </Box>
          </Box>
        </form>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Rifas configuradas</Typography>
        {raffles.length ? (
          <Box sx={{ display: "grid", gap: 2 }}>
            {raffles.map((raffle) => (
              <Box key={raffle.id} sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper", p: 2.5 }}>
                <Stack spacing={1}>
                  <Typography variant="h3">{raffle.title}</Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip label={`${raffle.currency} ${raffle.entryPrice}`} size="small" />
                    <Chip label={raffle.status} size="small" />
                  </Stack>
                  <Typography color="text.secondary">Cierre: {formatDate(raffle.endsAt)}</Typography>
                  <Typography color="text.secondary">Sorteo: {formatDate(raffle.drawAt)}</Typography>
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">Todavia no hay rifas registradas.</Typography>
        )}
      </Stack>
    </DashboardShell>
  );
}
