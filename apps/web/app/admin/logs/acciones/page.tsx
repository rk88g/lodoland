import { Box, Chip, Stack, Typography } from "@mui/material";
import { DashboardShell } from "../../../../components/dashboard-shell";
import { requireAdmin } from "../../../../lib/auth/session";
import { getAdminAuditLogs } from "../../../../lib/data/audit";
import { controlNavItems } from "../../../../lib/navigation";

export const dynamic = "force-dynamic";

const LAST_THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(dateValue));
}

export default async function AdminActionLogsPage() {
  await requireAdmin();
  const rawLogs = await getAdminAuditLogs(150);
  const cutoff = Date.now() - LAST_THREE_DAYS_MS;
  const logs = rawLogs.filter((log) => new Date(log.createdAt).getTime() >= cutoff);
  const groupedLogs = logs.reduce<Record<string, typeof logs>>((accumulator, log) => {
    const dayKey = new Intl.DateTimeFormat("es-MX", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(new Date(log.createdAt));

    if (!accumulator[dayKey]) {
      accumulator[dayKey] = [];
    }

    accumulator[dayKey].push(log);
    return accumulator;
  }, {});
  const dayEntries = Object.entries(groupedLogs);

  return (
    <DashboardShell navItems={controlNavItems} subtitle="Auditoria de cambios" title="Log acciones">
      <Stack spacing={1.5}>
        <Typography variant="h2">Acciones registradas</Typography>
        <Typography color="text.secondary">
          Aqui ves los cambios de CONTROL de los ultimos 3 dias, agrupados por dia.
        </Typography>
      </Stack>

      {dayEntries.length ? (
        <Stack spacing={1.5}>
          {dayEntries.map(([dayLabel, dayLogs]) => (
            <Stack key={dayLabel} spacing={1.5}>
              <Box
                sx={{
                  borderTop: 2,
                  borderColor: "primary.main",
                  pt: 1
                }}
              >
                <Typography variant="h3">{dayLabel}</Typography>
              </Box>

              {dayLogs.map((log) => (
                <Box
                  key={log.id}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    p: 2,
                    display: "grid",
                    gap: 1
                  }}
                >
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1} useFlexGap justifyContent="space-between">
                    <Typography sx={{ fontWeight: 700 }}>{log.summary || "Accion en control"}</Typography>
                    <Typography color="text.secondary" variant="body2">
                      {formatDate(log.createdAt)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip label={log.action} size="small" />
                    <Chip label={log.entityType} size="small" />
                    {log.entityId ? <Chip label={log.entityId} size="small" /> : null}
                    {log.actorUserId ? <Chip label={log.actorUserId} size="small" /> : null}
                  </Stack>
                  {Object.keys(log.payload).length ? (
                    <Box
                      component="pre"
                      sx={{
                        m: 0,
                        p: 1.5,
                        overflowX: "auto",
                        border: 1,
                        borderColor: "divider",
                        bgcolor: "background.default",
                        fontSize: 12
                      }}
                    >
                      {JSON.stringify(log.payload, null, 2)}
                    </Box>
                  ) : null}
                </Box>
              ))}
            </Stack>
          ))}
        </Stack>
      ) : (
        <Typography color="text.secondary">No hay actualizaciones registradas dentro de CONTROL en los ultimos 3 dias.</Typography>
      )}
    </DashboardShell>
  );
}
