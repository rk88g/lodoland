import { Box, Chip, Stack, Typography } from "@mui/material";
import { CustomerTicketPurchasesPanel } from "../../../components/customer-ticket-purchases-panel";
import { DashboardShell } from "../../../components/dashboard-shell";
import { isEmailConfirmed, requireUser } from "../../../lib/auth/session";
import { getCustomerPools, getCustomerRaffles, getCustomerTickets } from "../../../lib/data/customer";
import { getMercadoPagoSettings } from "../../../lib/data/tickets";
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

  const [tickets, raffles, pools, paymentSettings] = await Promise.all([
    getCustomerTickets(user.id, user.email),
    getCustomerRaffles(user.id),
    getCustomerPools(user.id),
    getMercadoPagoSettings()
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
          chips: [ticket.ticketTypeName, ticket.priceLabel, formatTicketStatus(ticket.status)],
          detailLines: [
            `Codigo: ${ticket.ticketCode}`,
            `Fecha del evento: ${formatDate(ticket.eventStartsAt)}`,
            `Ciudad: ${ticket.eventCity || "Pendiente"}`
          ]
        }))}
        ticketDetails={ticketDetails}
      />

      <PaymentInstructionsCard
        instructions={paymentSettings.ticketPaymentInstructions}
        whatsapp={paymentSettings.ticketPaymentWhatsapp}
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

function formatTicketStatus(status: string) {
  switch (status) {
    case "reserved":
      return "Pendiente de pago";
    case "issued":
      return "Emitido";
    case "checked_in":
      return "Usado";
    case "cancelled":
      return "Cancelado";
    case "refunded":
      return "Reintegro";
    default:
      return status;
  }
}

function buildWhatsAppHref(whatsapp: string) {
  const phone = whatsapp.replace(/[^\d]/g, "");

  if (!phone) {
    return null;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent("Hola, ya realice el pago de mi boleto LODO LAND. Te comparto mi comprobante.")}`;
}

function PaymentInstructionsCard({ instructions, whatsapp }: { instructions: string; whatsapp: string }) {
  const whatsappHref = buildWhatsAppHref(whatsapp);

  return (
    <Box sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper", p: 2.5 }}>
      <Stack spacing={1.25}>
        <Typography variant="h2">Metodos de pago</Typography>
        {instructions ? (
          <Typography color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
            {instructions}
          </Typography>
        ) : (
          <Typography color="text.secondary">
            Solicita los datos de pago por WhatsApp y envia tu comprobante para que CONTROL autorice tu boleto.
          </Typography>
        )}
        {whatsappHref ? (
          <Box>
            <a href={whatsappHref} rel="noreferrer" style={{ textDecoration: "none" }} target="_blank">
              <Chip color="primary" clickable label="Notificar pago por WhatsApp" />
            </a>
          </Box>
        ) : null}
      </Stack>
    </Box>
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
