import { Button, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { TicketPass } from "../../../../../components/ticket-pass";
import { DashboardShell } from "../../../../../components/dashboard-shell";
import { requireUser } from "../../../../../lib/auth/session";
import { getTicketPassDetail } from "../../../../../lib/data/ticket-pass";
import { customerNavItems } from "../../../../../lib/navigation";

export const dynamic = "force-dynamic";

type CustomerTicketPassPageProps = {
  params: {
    ticketId: string;
  };
};

export default async function CustomerTicketPassPage({ params }: CustomerTicketPassPageProps) {
  const { user } = await requireUser();
  const ticket = await getTicketPassDetail(params.ticketId, { ownerUserId: user.id });

  return (
    <DashboardShell navItems={customerNavItems} subtitle="Codigo QR y acceso" title="Mi ticket">
      {ticket ? (
        <TicketPass ticket={ticket} />
      ) : (
        <Stack spacing={2}>
          <Typography color="text.secondary">No encontramos ese ticket en tu cuenta.</Typography>
          <Button component={Link} href="/perfil/compras" variant="contained">
            Volver a mis compras
          </Button>
        </Stack>
      )}
    </DashboardShell>
  );
}
