import { Button, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { PrintOnLoad } from "../../../../components/print-on-load";
import { TicketPass } from "../../../../components/ticket-pass";
import { DashboardShell } from "../../../../components/dashboard-shell";
import { requireAdmin } from "../../../../lib/auth/session";
import { getTicketPassDetail } from "../../../../lib/data/ticket-pass";
import { controlNavItems } from "../../../../lib/navigation";

export const dynamic = "force-dynamic";

type AdminTicketPassPageProps = {
  params: {
    ticketId: string;
  };
  searchParams?: {
    token?: string;
    print?: string;
  };
};

export default async function AdminTicketPassPage({ params, searchParams }: AdminTicketPassPageProps) {
  await requireAdmin();
  const ticket = await getTicketPassDetail(params.ticketId, { token: searchParams?.token || null });
  const isPrintMode = searchParams?.print === "1";

  if (isPrintMode) {
    return ticket ? (
      <main style={{ padding: 24 }}>
        <PrintOnLoad />
        <TicketPass ticket={ticket} />
      </main>
    ) : (
      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography color="text.secondary">No encontramos ese ticket en control.</Typography>
      </Stack>
    );
  }

  return (
    <DashboardShell navItems={controlNavItems} subtitle="Visual y validacion" title="Ticket emitido">
      {ticket ? (
        <TicketPass ticket={ticket} />
      ) : (
        <Stack spacing={2}>
          <Typography color="text.secondary">No encontramos ese ticket en control.</Typography>
          <Button component={Link} href="/admin/tickets" variant="contained">
            Volver a tickets
          </Button>
        </Stack>
      )}
    </DashboardShell>
  );
}
