import { Box, Chip, Stack, Typography } from "@mui/material";
import { DashboardShell } from "../../components/dashboard-shell";
import { requireUser } from "../../lib/auth/session";
import { getAvailablePools, getCustomerPools } from "../../lib/data/customer";
import { formatEventDateTimeWallClock } from "../../lib/date-format";
import { customerNavItems } from "../../lib/navigation";

export const dynamic = "force-dynamic";

function formatDate(dateValue: string | null) {
  return formatEventDateTimeWallClock(dateValue) || "Sin fecha";
}

export default async function PoolsPage() {
  const { user } = await requireUser();
  const [myEntries, pools] = await Promise.all([
    getCustomerPools(user.id),
    getAvailablePools(12)
  ]);

  return (
    <DashboardShell navItems={customerNavItems} subtitle="Mis picks y quinielas activas" title="Quinielas">
      <Stack spacing={1.5}>
        <Typography variant="h2">Mis picks</Typography>
        {myEntries.length ? (
          <Box sx={{ display: "grid", gap: 2 }}>
            {myEntries.map((entry) => (
              <Box key={entry.id} sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper", p: 2.5 }}>
                <Stack spacing={1.25}>
                  <Typography variant="h3">{entry.title}</Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip label={`${entry.currency} ${entry.unitPrice}`} size="small" />
                    <Chip label={entry.status} size="small" />
                  </Stack>
                  <Typography color="text.secondary">Cierre: {formatDate(entry.closesAt)}</Typography>
                  <Typography color="text.secondary">Resultado: {formatDate(entry.resolvesAt)}</Typography>
                  <Typography color="text.secondary">
                    {entry.picks.length ? entry.picks.join(" | ") : "Picks pendientes"}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">Todavia no tienes quinielas registradas.</Typography>
        )}
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Quinielas disponibles</Typography>
        {pools.length ? (
          <Box sx={{ display: "grid", gap: 2 }}>
            {pools.map((pool) => (
              <Box key={pool.id} sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper", p: 2.5 }}>
                <Stack spacing={1}>
                  <Typography variant="h3">{pool.title}</Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip label={`${pool.currency} ${pool.entryPrice}`} size="small" />
                    <Chip label={pool.status} size="small" />
                  </Stack>
                  <Typography color="text.secondary">Cierre: {formatDate(pool.closesAt)}</Typography>
                  <Typography color="text.secondary">Resultado: {formatDate(pool.resolvesAt)}</Typography>
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">Todavia no hay quinielas configuradas.</Typography>
        )}
      </Stack>
    </DashboardShell>
  );
}
