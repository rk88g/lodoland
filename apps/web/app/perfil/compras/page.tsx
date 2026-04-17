import { Box, Chip, Stack, Typography } from "@mui/material";
import { CustomerTicketPurchasesPanel } from "../../../components/customer-ticket-purchases-panel";
import { DashboardShell } from "../../../components/dashboard-shell";
import { isEmailConfirmed, requireUser } from "../../../lib/auth/session";
import { getCustomerPools, getCustomerRaffles, getCustomerTickets } from "../../../lib/data/customer";
import { getTicketPassDetail } from "../../../lib/data/ticket-pass";
import { formatEventDateTimeWallClock } from "../../../lib/date-format";
import { customerNavItems } from "../../../lib/navigation";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function formatDate(dateValue: string | null) {
  return formatEventDateTimeWallClock(dateValue) || "Sin fecha";
}

export default async function CustomerPurchasesPage() {
  const { user } = await requireUser();

  if (!isEmailConfirmed(user)) {
    redirect("/perfil?message=Confirma tu correo para usar tus compras y modulos.");
  }

  const [tickets, raffles, pools] = await Promise.all([
    getCustomerTickets(user.id, user.email),
    getCustomerRaffles(user.id),
    getCustomerPools(user.id)
  ]);

  const ticketDetailsEntries = await Promise.all(
    tickets.map(async (ticket) => {
      const detail = await getTicketPassDetail(ticket.id);
      return [ticket.id, detail] as const;
    })
  );

  const ticketDetails = Object.fromEntries(
    ticketDetailsEntries.reduce<Array<[string, NonNullable<(typeof ticketDetailsEntries)[number][1]>]>>((acc, entry) => {
      if (entry[1]) {
        acc.push([entry[0], entry[1]]);
      }

      return acc;
    }, [])
  );

  return (
    <DashboardShell
      navItems={customerNavItems}
      subtitle="Tickets, rifas y quinielas"
      title="Mis compras"
    >
      <CustomerTicketPurchasesPanel
        items={tickets.map((ticket) => ({
          id: ticket.id,
          title: ticket.eventTitle,
          chips: [ticket.ticketTypeName, ticket.priceLabel, ticket.status],
          detailLines: [
            `Codigo: ${ticket.ticketCode}`,
            `Fecha del evento: ${formatDate(ticket.eventStartsAt)}`,
            `Ciudad: ${ticket.eventCity || "Pendiente"}`
          ]
        }))}
        ticketDetails={ticketDetails}
      />

      <PurchaseSection
        emptyLabel="Todavia no tienes rifas registradas."
        items={raffles.map((raffle) => ({
          title: raffle.title,
          chips: [`${raffle.quantity} numeros`, `${raffle.currency} ${raffle.unitPrice}`, raffle.status],
          detailLines: [
            `Cierre: ${formatDate(raffle.endsAt)}`,
            `Sorteo: ${formatDate(raffle.drawAt)}`,
            `Compra: ${formatDate(raffle.createdAt)}`,
            raffle.numbers.length ? `Numeros: ${raffle.numbers.map((numberValue) => numberValue.toString().padStart(4, "0")).join(" | ")}` : "Numeros pendientes"
          ]
        }))}
        title="Rifas"
      />

      <PurchaseSection
        emptyLabel="Todavia no tienes quinielas registradas."
        items={pools.map((pool) => ({
          title: pool.title,
          chips: [`${pool.currency} ${pool.unitPrice}`, pool.status],
          detailLines: [
            `Cierre: ${formatDate(pool.closesAt)}`,
            `Resultado: ${formatDate(pool.resolvesAt)}`,
            pool.picks.length ? `Picks: ${pool.picks.join(" | ")}` : "Picks pendientes"
          ]
        }))}
        title="Quinielas"
      />
    </DashboardShell>
  );
}

function PurchaseSection({
  title,
  items,
  emptyLabel
}: {
  title: string;
  items: Array<{
    title: string;
    chips: string[];
    detailLines: string[];
  }>;
  emptyLabel: string;
}) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="h2">{title}</Typography>
      {items.length ? (
        <Box sx={{ display: "grid", gap: 2 }}>
          {items.map((item) => (
            <Box key={`${title}-${item.title}-${item.detailLines[0]}`} sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper", p: 2.5 }}>
              <Stack spacing={1.25}>
                <Typography variant="h3">{item.title}</Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {item.chips.map((chip) => (
                    <Chip key={`${item.title}-${chip}`} label={chip} size="small" />
                  ))}
                </Stack>
                {item.detailLines.map((line) => (
                  <Typography color="text.secondary" key={`${item.title}-${line}`}>
                    {line}
                  </Typography>
                ))}
              </Stack>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography color="text.secondary">{emptyLabel}</Typography>
      )}
    </Stack>
  );
}
