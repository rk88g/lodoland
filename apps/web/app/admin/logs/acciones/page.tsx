import { Box, Chip, Stack, Typography } from "@mui/material";
import { DashboardShell } from "../../../../components/dashboard-shell";
import { requireAdmin } from "../../../../lib/auth/session";
import { getAdminAuditLogs } from "../../../../lib/data/audit";
import { controlNavItems } from "../../../../lib/navigation";

export const dynamic = "force-dynamic";

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(dateValue));
}

export default async function AdminActionLogsPage() {
  await requireAdmin();
  const logs = await getAdminAuditLogs(80);

  return (
    <DashboardShell navItems={controlNavItems} subtitle="Auditoria de cambios" title="Log acciones">
      <Stack spacing={1.5}>
        <Typography variant="h2">Acciones registradas</Typography>
        <Typography color="text.secondary">
          Aqui ves que se hizo, sobre que modulo y en que momento dentro de CONTROL.
        </Typography>
      </Stack>

      {logs.length ? (
        <Stack spacing={1.5}>
          {logs.map((log) => (
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
      ) : (
        <Typography color="text.secondary">Todavia no hay acciones registradas dentro de CONTROL.</Typography>
      )}
    </DashboardShell>
  );
}
