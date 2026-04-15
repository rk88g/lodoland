import { Box, Button, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { TicketPass } from "../../../../components/ticket-pass";
import { AdminSectionCard } from "../../../../components/admin-section-card";
import { DashboardShell } from "../../../../components/dashboard-shell";
import { FlashAlert } from "../../../../components/flash-alert";
import { requireOperator } from "../../../../lib/auth/session";
import { readFlashMessage } from "../../../../lib/flash";
import { getTicketPassDetail } from "../../../../lib/data/ticket-pass";
import { staffNavItems } from "../../../../lib/navigation";
import { validateIssuedTicketAction } from "../../../admin/tickets/actions";

export const dynamic = "force-dynamic";

type StaffTicketDetailPageProps = {
  params: {
    ticketId: string;
  };
  searchParams?: {
    token?: string;
  };
};

export default async function StaffTicketDetailPage({ params, searchParams }: StaffTicketDetailPageProps) {
  await requireOperator();
  const flash = readFlashMessage("staff-tickets-flash");
  const ticket = await getTicketPassDetail(params.ticketId, { token: searchParams?.token || null });
  const currentPath = `/staff/tickets/${params.ticketId}${searchParams?.token ? `?token=${encodeURIComponent(searchParams.token)}` : ""}`;

  return (
    <DashboardShell navItems={staffNavItems} subtitle="Escaneo, validacion y quema" title="Ticket leido">
      <FlashAlert cookieName="staff-tickets-flash" payload={flash} />

      {ticket ? (
        <>
          <TicketPass ticket={ticket} />

          <AdminSectionCard
            description="Valida solo una vez. Si el ticket ya esta usado, cancelado o reembolsado, no vuelvas a permitir acceso."
            title="Accion de acceso"
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              {ticket.status === "issued" ? (
                <form action={validateIssuedTicketAction} method="post">
                  <input name="redirectTo" type="hidden" value={currentPath} />
                  <input name="scanValue" type="hidden" value={ticket.qrPayload} />
                  <Button type="submit" variant="contained">
                    Validar y quemar ticket
                  </Button>
                </form>
              ) : (
                <Box sx={{ display: "grid", gap: 0.75 }}>
                  <Typography color="error.main" sx={{ fontWeight: 800 }}>
                    Este ticket ya no puede volver a utilizarse.
                  </Typography>
                  <Typography color="text.secondary">
                    Verifica la compra del cliente y no permitas un nuevo acceso con este mismo codigo.
                  </Typography>
                </Box>
              )}

              <Link href="/staff/tickets" style={{ textDecoration: "none" }}>
                <Button variant="outlined">Volver al lector</Button>
              </Link>
            </Stack>
          </AdminSectionCard>
        </>
      ) : (
        <Stack spacing={2}>
          <Typography color="text.secondary">No encontramos ese ticket o el QR no es valido.</Typography>
          <Link href="/staff/tickets" style={{ textDecoration: "none" }}>
            <Button variant="contained">Volver al lector</Button>
          </Link>
        </Stack>
      )}
    </DashboardShell>
  );
}
