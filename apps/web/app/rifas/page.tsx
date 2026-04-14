import { Box, Chip, Stack, Typography } from "@mui/material";
import { DashboardShell } from "../../components/dashboard-shell";
import { requireUser } from "../../lib/auth/session";
import { getAvailableRaffles, getCustomerRaffles } from "../../lib/data/customer";
import { formatEventDateTimeWallClock } from "../../lib/date-format";
import { customerNavItems } from "../../lib/navigation";

export const dynamic = "force-dynamic";

function formatDate(dateValue: string | null) {
  return formatEventDateTimeWallClock(dateValue) || "Sin fecha";
}

export default async function RafflesPage() {
  const { user } = await requireUser();
  const [myEntries, raffles] = await Promise.all([
    getCustomerRaffles(user.id),
    getAvailableRaffles(12)
  ]);

  return (
    <DashboardShell navItems={customerNavItems} subtitle="Mis numeros y rifas activas" title="Rifas">
      <Stack spacing={1.5}>
        <Typography variant="h2">Mis participaciones</Typography>
        {myEntries.length ? (
          <Box sx={{ display: "grid", gap: 2 }}>
            {myEntries.map((entry) => (
              <Box key={entry.id} sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper", p: 2.5 }}>
                <Stack spacing={1.25}>
                  <Typography variant="h3">{entry.title}</Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip label={`${entry.quantity} numeros`} size="small" />
                    <Chip label={`${entry.currency} ${entry.unitPrice}`} size="small" />
                    <Chip label={entry.status} size="small" />
                  </Stack>
                  <Typography color="text.secondary">Cierre: {formatDate(entry.endsAt)}</Typography>
                  <Typography color="text.secondary">Sorteo: {formatDate(entry.drawAt)}</Typography>
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">Todavia no tienes compras de rifas en tu cuenta.</Typography>
        )}
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Rifas disponibles</Typography>
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
          <Typography color="text.secondary">Todavia no hay rifas configuradas.</Typography>
        )}
      </Stack>
    </DashboardShell>
  );
}
