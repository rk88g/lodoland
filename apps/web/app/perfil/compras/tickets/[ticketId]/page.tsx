import { Button, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { PrintOnLoad } from "../../../../../components/print-on-load";
import { TicketPass } from "../../../../../components/ticket-pass";
import { DashboardShell } from "../../../../../components/dashboard-shell";
import { isEmailConfirmed, requireUser } from "../../../../../lib/auth/session";
import { getTicketPassDetail } from "../../../../../lib/data/ticket-pass";
import { customerNavItems } from "../../../../../lib/navigation";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type CustomerTicketPassPageProps = {
  params: {
    ticketId: string;
  };
  searchParams?: {
    print?: string;
  };
};

export default async function CustomerTicketPassPage({ params, searchParams }: CustomerTicketPassPageProps) {
  const { user } = await requireUser();

  if (!isEmailConfirmed(user)) {
    redirect("/perfil?message=Confirma tu correo para usar tus tickets.");
  }

  const ticket = await getTicketPassDetail(params.ticketId, {
    ownerUserId: user.id,
    userEmail: user.email
  });
  const isPrintMode = searchParams?.print === "1";

  if (isPrintMode) {
    return ticket ? (
      <main style={{ padding: 24 }}>
        <PrintOnLoad />
        <TicketPass ticket={ticket} />
      </main>
    ) : (
      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography color="text.secondary">No encontramos ese ticket en tu cuenta.</Typography>
      </Stack>
    );
  }

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
