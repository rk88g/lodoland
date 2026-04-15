import { Alert, Box, Chip, Stack, Typography } from "@mui/material";
import { formatEventDateTimeWallClock } from "../lib/date-format";
import type { TicketPassDetail } from "../lib/data/ticket-pass";

function formatDate(dateValue: string | null) {
  return formatEventDateTimeWallClock(dateValue) || "Sin fecha";
}

function formatTicketStatus(status: string) {
  switch (status) {
    case "checked_in":
      return "Usado";
    case "issued":
      return "Emitido";
    case "cancelled":
      return "Cancelado";
    case "refunded":
      return "Reembolsado";
    default:
      return status;
  }
}

function getTicketStatusSx(status: string) {
  if (status === "issued") {
    return {
      bgcolor: "rgba(46, 125, 50, 0.22)",
      color: "#b9f6ca",
      borderColor: "rgba(46, 125, 50, 0.45)"
    };
  }

  if (status === "checked_in") {
    return {
      bgcolor: "rgba(21, 101, 192, 0.22)",
      color: "#90caf9",
      borderColor: "rgba(21, 101, 192, 0.45)"
    };
  }

  return {
    bgcolor: "rgba(211, 47, 47, 0.2)",
    color: "#ffb4ab",
    borderColor: "rgba(211, 47, 47, 0.45)"
  };
}

export function TicketPass({ ticket, adminMode = false }: { ticket: TicketPassDetail; adminMode?: boolean }) {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden"
      }}
    >
      <Box
        sx={{
          display: "grid",
          gap: 0,
          gridTemplateColumns: { xs: "1fr", lg: "340px minmax(0, 1fr)" }
        }}
      >
        <Box
          sx={{
            minHeight: { xs: 320, lg: "100%" },
            px: 3,
            py: 3,
            display: "grid",
            placeItems: "center",
            background:
              "linear-gradient(160deg, rgba(255,157,92,0.22) 0%, rgba(255,105,180,0.16) 45%, rgba(88,160,255,0.18) 100%)"
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 260,
              aspectRatio: "1 / 1",
              border: 1,
              borderColor: "divider",
              bgcolor: "#fff",
              p: 1.5
            }}
          >
            <Box
              alt={`QR ${ticket.ticketCode}`}
              component="img"
              src={ticket.qrImageUrl}
              sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
          </Box>
        </Box>

        <Stack spacing={2.5} sx={{ p: { xs: 3, lg: 4 } }}>
          {ticket.status === "checked_in" ? (
            <Alert
              severity="error"
              sx={{
                border: 2,
                borderColor: "error.main",
                bgcolor: "rgba(211, 47, 47, 0.18)",
                "& .MuiAlert-message": {
                  fontSize: 18,
                  fontWeight: 800,
                  lineHeight: 1.35
                }
              }}
            >
              ESTA ENTRADA YA SE UTILIZO. REVISA TU COMPRA Y NO COMPARTAS TU TICKET.
            </Alert>
          ) : null}

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="space-between" alignItems="flex-start">
            <Stack spacing={1}>
              <Typography variant="h2">{ticket.eventTitle}</Typography>
              <Typography color="text.secondary" variant="body1">
                Ticket {ticket.ticketCode}
              </Typography>
            </Stack>
            <Chip label={formatTicketStatus(ticket.status)} sx={getTicketStatusSx(ticket.status)} />
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip label={ticket.ticketTypeName} />
            {ticket.ticketLotLabel ? <Chip label={ticket.ticketLotLabel} /> : null}
            <Chip label={ticket.priceLabel} />
          </Stack>

          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
            <InfoBlock label="Fecha y hora" value={formatDate(ticket.eventStartsAt)} />
            <InfoBlock label="Ciudad" value={ticket.eventCity || "Pendiente"} />
            <InfoBlock label="Venue" value={ticket.eventVenue || "Pendiente"} />
            <InfoBlock label="Direccion" value={ticket.eventAddress || "Pendiente"} />
            <InfoBlock label="Emitido" value={formatDate(ticket.issuedAt)} />
            <InfoBlock label="Acceso" value={ticket.checkedInAt ? formatDate(ticket.checkedInAt) : "Pendiente"} />
          </Box>

          <Box sx={{ borderTop: 1, borderColor: "divider", pt: 2 }}>
            <Typography color="text.secondary" variant="body2">
              {adminMode ? "Presenta o escanea este QR en acceso. Una vez validado, el ticket quedara quemado." : "Presenta este QR en acceso. Al validarlo, el ticket quedara marcado como usado."}
            </Typography>
          </Box>

          {ticket.ownerLabel || ticket.purchaserName || ticket.purchaserEmail || ticket.purchaserPhone ? (
            <Box sx={{ display: "grid", gap: 1 }}>
              {ticket.ownerLabel ? <InfoLine label="Cuenta" value={ticket.ownerLabel} /> : null}
              {ticket.purchaserName ? <InfoLine label="Comprador" value={ticket.purchaserName} /> : null}
              {ticket.purchaserEmail ? <InfoLine label="Correo" value={ticket.purchaserEmail} /> : null}
              {ticket.purchaserPhone ? <InfoLine label="Telefono" value={ticket.purchaserPhone} /> : null}
            </Box>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ border: 1, borderColor: "divider", bgcolor: "background.default", p: 2 }}>
      <Stack spacing={0.5}>
        <Typography color="text.secondary" variant="body2">
          {label}
        </Typography>
        <Typography variant="h3">{value}</Typography>
      </Stack>
    </Box>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <Typography color="text.secondary">
      <Box component="span" sx={{ color: "text.primary", fontWeight: 700 }}>
        {label}:
      </Box>{" "}
      {value}
    </Typography>
  );
}
