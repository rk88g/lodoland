import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { AdminSectionCard } from "../../../components/admin-section-card";
import { DashboardShell } from "../../../components/dashboard-shell";
import { FlashAlert } from "../../../components/flash-alert";
import { TicketQrScanner } from "../../../components/ticket-qr-scanner";
import { requireOperator } from "../../../lib/auth/session";
import { readFlashMessage } from "../../../lib/flash";
import { staffNavItems } from "../../../lib/navigation";
import { validateIssuedTicketAction } from "../../admin/tickets/actions";

export const dynamic = "force-dynamic";

export default async function StaffTicketsPage() {
  await requireOperator();
  const flash = readFlashMessage("staff-tickets-flash");

  return (
    <DashboardShell navItems={staffNavItems} subtitle="Validacion de accesos" title="QR y tickets">
      <FlashAlert cookieName="staff-tickets-flash" payload={flash} />

      <AdminSectionCard
        description="Escanea el QR o pega el codigo. Un ticket usado, cancelado o reembolsado ya no puede volver a entrar."
        title="Lector QR"
      >
        <form action={validateIssuedTicketAction} autoComplete="off" id="staff-ticket-scan-form" method="post">
          <input name="redirectTo" type="hidden" value="/staff/tickets" />
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 220px" } }}>
            <TextField id="staff-ticket-scan-input" label="QR o codigo del ticket" name="scanValue" required />
            <Button sx={{ minHeight: 56 }} type="submit" variant="contained">
              Validar y quemar
            </Button>
          </Box>
        </form>
        <TicketQrScanner formId="staff-ticket-scan-form" inputId="staff-ticket-scan-input" />
      </AdminSectionCard>

      <Stack spacing={1}>
        <Typography variant="h2">Operacion de acceso</Typography>
        <Typography color="text.secondary">
          Este panel es solo para lectura de QR y validacion. Si el ticket ya fue usado, cancelado o reembolsado,
          el sistema bloqueara el acceso automaticamente.
        </Typography>
      </Stack>
    </DashboardShell>
  );
}
