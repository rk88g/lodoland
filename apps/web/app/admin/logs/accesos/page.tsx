import { Box, Chip, Stack, Typography } from "@mui/material";
import { DashboardShell } from "../../../../components/dashboard-shell";
import { requireAdmin } from "../../../../lib/auth/session";
import { getCollaboratorLoginLogs } from "../../../../lib/data/audit";
import { controlNavItems } from "../../../../lib/navigation";

export const dynamic = "force-dynamic";

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(dateValue));
}

function buildLocation(log: Awaited<ReturnType<typeof getCollaboratorLoginLogs>>[number]) {
  const parts = [log.city, log.region, log.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "Ubicacion no disponible";
}

export default async function AdminAccessLogsPage() {
  await requireAdmin();
  const logs = await getCollaboratorLoginLogs(80);

  return (
    <DashboardShell navItems={controlNavItems} subtitle="Accesos de colaboradores" title="Log accesos">
      <Stack spacing={1.5}>
        <Typography variant="h2">Inicios de sesion del equipo</Typography>
        <Typography color="text.secondary">
          Aqui se guarda cuando entraron, desde donde y con que dispositivo los colaboradores con correo
          organizacional.
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
                <Typography sx={{ fontWeight: 700 }}>{log.email || "Colaborador"}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {formatDate(log.createdAt)}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {log.role ? <Chip label={log.role} size="small" /> : null}
                <Chip label={log.authProvider} size="small" />
                {log.deviceType ? <Chip label={log.deviceType} size="small" /> : null}
                {log.browserName ? <Chip label={log.browserName} size="small" /> : null}
                {log.osName ? <Chip label={log.osName} size="small" /> : null}
              </Stack>
              <Typography color="text.secondary">Ubicacion: {buildLocation(log)}</Typography>
              <Typography color="text.secondary">IP: {log.ipAddress || "No disponible"}</Typography>
              <Typography color="text.secondary">Ruta: {log.host || "host"}{log.requestPath || ""}</Typography>
              {log.userAgent ? (
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 1.5,
                    overflowX: "auto",
                    border: 1,
                    borderColor: "divider",
                    bgcolor: "background.default",
                    fontSize: 12,
                    whiteSpace: "pre-wrap"
                  }}
                >
                  {log.userAgent}
                </Box>
              ) : null}
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography color="text.secondary">Todavia no hay accesos registrados del equipo interno.</Typography>
      )}
    </DashboardShell>
  );
}
