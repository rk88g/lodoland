import { Alert, Box, Chip, Stack, Typography } from "@mui/material";
import { formatEventDateTimeWallClock } from "../lib/date-format";
import type { TicketPassDetail } from "../lib/data/ticket-pass";

function formatDate(dateValue: string | null) {
  return formatEventDateTimeWallClock(dateValue) || "Sin fecha";
}

function formatTicketStatus(status: string) {
  switch (status) {
    case "checked_in":
      return "Utilizado";
    case "issued":
      return "Emitido";
    case "cancelled":
      return "Cancelado";
    case "refunded":
      return "Reintegro";
    default:
      return status;
  }
}

function formatAccessStatus(status: string, checkedInAt: string | null) {
  if (status === "checked_in") {
    return checkedInAt ? `Utilizado · ${formatDate(checkedInAt)}` : "Utilizado";
  }

  if (status === "cancelled") {
    return "Cancelado";
  }

  if (status === "refunded") {
    return "Reintegro";
  }

  return "Disponible";
}

function maskEmail(email: string | null) {
  if (!email) {
    return "Sin correo registrado";
  }

  const [local, domain] = email.split("@");

  if (!domain) {
    return email;
  }

  if (local.length <= 2) {
    return `${local.slice(0, 1)}***@${domain}`;
  }

  return `${local.slice(0, 2)}${"*".repeat(Math.max(local.length - 2, 3))}@${domain}`;
}

function maskPhone(phone: string | null) {
  if (!phone) {
    return "Sin telefono";
  }

  const digits = phone.replace(/\D/g, "");

  if (!digits) {
    return phone;
  }

  if (digits.length <= 3) {
    return `***${digits}`;
  }

  return `${digits.slice(0, -3).replace(/\d/g, "*")}${digits.slice(-3)}`;
}

function getTicketStatusSx(status: string) {
  if (status === "issued") {
    return {
      bgcolor: "rgba(46, 125, 50, 0.18)",
      color: "#1b5e20",
      borderColor: "rgba(46, 125, 50, 0.35)"
    };
  }

  if (status === "checked_in") {
    return {
      bgcolor: "rgba(25, 118, 210, 0.18)",
      color: "#0d47a1",
      borderColor: "rgba(25, 118, 210, 0.35)"
    };
  }

  return {
    bgcolor: "rgba(211, 47, 47, 0.14)",
    color: "#b71c1c",
    borderColor: "rgba(211, 47, 47, 0.35)"
  };
}

export function TicketPass({ ticket }: { ticket: TicketPassDetail }) {
  return (
    <Stack spacing={2.25}>
      {ticket.status === "checked_in" ? (
        <Alert
          severity="error"
          sx={{
            border: 2,
            borderColor: "error.main",
            bgcolor: "rgba(211, 47, 47, 0.12)",
            "& .MuiAlert-message": {
              fontSize: 20,
              fontWeight: 800,
              lineHeight: 1.35
            }
          }}
        >
          ESTA ENTRADA YA SE UTILIZO. REVISA TU COMPRA Y NO COMPARTAS TU TICKET.
        </Alert>
      ) : null}

      <Box
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid rgba(148, 163, 184, 0.24)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,248,252,0.98) 100%)",
          boxShadow: "0 24px 80px rgba(3, 7, 18, 0.18)"
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", xl: "minmax(340px, 37%) minmax(0, 1fr)" }
          }}
        >
          <Box
            sx={{
              position: "relative",
              px: { xs: 3, md: 4 },
              py: { xs: 3, md: 4 },
              color: "#fff",
              background: "linear-gradient(180deg, #0455d4 0%, #0d6cf2 48%, #0f67dd 100%)"
            }}
          >
            <Stack spacing={2.3} sx={{ minHeight: "100%" }}>
              <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="flex-start">
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.65,
                    borderRadius: 999,
                    bgcolor: "rgba(255,255,255,0.16)"
                  }}
                >
                  <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em" }}>
                    EVENT TICKET
                  </Typography>
                </Box>
                <Chip
                  label={formatTicketStatus(ticket.status)}
                  size="small"
                  sx={{
                    ...getTicketStatusSx(ticket.status),
                    bgcolor: "rgba(255,255,255,0.18)",
                    color: "#fff",
                    borderColor: "rgba(255,255,255,0.28)"
                  }}
                />
              </Stack>

              <Stack spacing={0.9}>
                <Typography sx={{ fontSize: { xs: 34, md: 42 }, fontWeight: 900, lineHeight: 0.98 }}>
                  {ticket.eventTitle}
                </Typography>
                <Typography sx={{ fontSize: 14, opacity: 0.82 }}>
                  {ticket.eventCity || "Ciudad pendiente"} · {ticket.eventVenue || "Venue pendiente"}
                </Typography>
              </Stack>

              <Box sx={{ display: "grid", gap: 1.25, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <TicketMetric light label="Fecha" value={formatDate(ticket.eventStartsAt)} />
                <TicketMetric light label="Tipo" value={ticket.ticketTypeName} />
                <TicketMetric light label="Drop" value={ticket.ticketLotLabel || "General"} />
                <TicketMetric light label="Acceso" value={formatAccessStatus(ticket.status, ticket.checkedInAt)} />
              </Box>

              <Box
                sx={{
                  px: 2,
                  py: 1.75,
                  borderRadius: 2.5,
                  bgcolor: "rgba(255,255,255,0.08)"
                }}
              >
                <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.74)", letterSpacing: "0.08em" }}>
                  CODIGO DEL BOLETO
                </Typography>
                <Typography
                  sx={{
                    mt: 0.55,
                    fontSize: { xs: 17, md: 21 },
                    fontWeight: 900,
                    letterSpacing: "0.035em",
                    lineHeight: 1.15,
                    wordBreak: "break-word"
                  }}
                >
                  {ticket.ticketCode}
                </Typography>
              </Box>

              {ticket.sponsors.official ? (
                <Stack spacing={0.7}>
                  <Typography sx={{ fontSize: 10.5, color: "rgba(255,255,255,0.78)", letterSpacing: "0.1em" }}>
                    PATROCINADOR OFICIAL
                  </Typography>
                  <Box
                    sx={{
                      minHeight: 118,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 2.5,
                      bgcolor: "rgba(255,255,255,0.1)",
                      px: 2.5,
                      py: 2
                    }}
                  >
                    {ticket.sponsors.official.imageUrl ? (
                      <Box
                        alt={ticket.sponsors.official.name}
                        component="img"
                        src={ticket.sponsors.official.imageUrl}
                        sx={{ maxHeight: 80, maxWidth: "100%", objectFit: "contain", display: "block" }}
                      />
                    ) : (
                      <Typography sx={{ fontSize: 22, fontWeight: 900, color: "#fff", textAlign: "center" }}>
                        {ticket.sponsors.official.name}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              ) : null}

              <Box sx={{ mt: "auto", pt: 1.5 }}>
                <Typography sx={{ fontSize: 12, letterSpacing: "0.08em", opacity: 0.82 }}>{ticket.siteHost}</Typography>
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              position: "relative",
              px: { xs: 3, md: 4 },
              py: { xs: 3, md: 4 },
              bgcolor: "#fbfcfe"
            }}
          >
            <Stack spacing={2.25}>
              <Box
                sx={{
                  display: "grid",
                  gap: 2.25,
                  alignItems: "center",
                  gridTemplateColumns: { xs: "1fr", lg: "minmax(250px, 280px) minmax(0, 1fr)" }
                }}
              >
                <Box sx={{ display: "grid", placeItems: "center", bgcolor: "#fff", p: 2.25, borderRadius: 3 }}>
                  <Box
                    alt={`QR ${ticket.ticketCode}`}
                    component="img"
                    src={ticket.qrImageUrl}
                    sx={{ width: "100%", maxWidth: 240, aspectRatio: "1 / 1", objectFit: "contain", display: "block" }}
                  />
                </Box>

                <Stack spacing={1.2}>
                  <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#0f172a", letterSpacing: "0.04em" }}>
                    PRESENTA ESTE QR EN EL ACCESO
                  </Typography>
                  <TicketMetric label="Cuenta" value={ticket.ownerLabel || ticket.purchaserEmail || "Cliente"} />
                  <TicketMetric label="Comprador" value={ticket.purchaserName || "Sin nombre registrado"} />
                  <TicketMetric label="Correo" value={maskEmail(ticket.purchaserEmail)} />
                  <TicketMetric label="Telefono" value={maskPhone(ticket.purchaserPhone)} />
                  <TicketMetric label="Emitido" value={formatDate(ticket.issuedAt)} />
                </Stack>
              </Box>

              <Box sx={{ display: "grid", gap: 1.25, gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" } }}>
                <TicketMetric label="Direccion" value={ticket.eventAddress || "Pendiente"} />
                <TicketMetric label="Precio" value={ticket.priceLabel} />
                <TicketMetric label="Acceso" value={formatAccessStatus(ticket.status, ticket.checkedInAt)} />
              </Box>

              <Box
                sx={{
                  pt: 2,
                  borderTop: "1px dashed rgba(148, 163, 184, 0.32)",
                  display: "grid",
                  gap: 1.45
                }}
              >
                {ticket.sponsors.featured.length ? (
                  <SponsorRow items={ticket.sponsors.featured} label="Nivel 2 · 3 · 4" logoHeight={58} />
                ) : null}

                {ticket.sponsors.standard.length ? (
                  <SponsorRow items={ticket.sponsors.standard} label="Nivel 5 · 6 · 7" logoHeight={38} />
                ) : null}

                {ticket.sponsors.support.length ? (
                  <SponsorRow items={ticket.sponsors.support} label="Nivel 8 · 9 · 10" logoHeight={28} />
                ) : null}
              </Box>

              <Typography sx={{ fontSize: 11.5, color: "#475569" }}>
                No compartas este ticket. Si otra persona usa este QR antes que tu, no nos hacemos responsables y
                sera necesario adquirir un nuevo acceso.
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>

      <Box sx={{ bgcolor: "background.paper", p: { xs: 2, md: 2.25 } }}>
        <Stack spacing={0.75}>
          <Typography sx={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.08em" }}>
            Recomendaciones importantes
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Nuestros sistemas de validacion son robustos y seguros. Las compras en linea se conectan con Mercado Pago
            developer y el acceso solo se valida una vez por ticket.
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Conserva este ticket en tu cuenta y muestra el QR directamente desde tu perfil para acelerar el ingreso.
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}

function TicketMetric({
  label,
  value,
  light = false
}: {
  label: string;
  value: string;
  light?: boolean;
}) {
  return (
    <Box
      sx={{
        borderRadius: 2,
        px: 1.6,
        py: 1.25,
        border: "none",
        bgcolor: light ? "rgba(255,255,255,0.08)" : "rgba(241, 245, 249, 0.82)"
      }}
    >
      <Stack spacing={0.35}>
        <Typography sx={{ fontSize: 11, color: light ? "rgba(255,255,255,0.76)" : "#64748b", letterSpacing: "0.06em" }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 15, fontWeight: 800, color: light ? "#fff" : "#0f172a", lineHeight: 1.25 }}>
          {value}
        </Typography>
      </Stack>
    </Box>
  );
}

function SponsorRow({
  label,
  items,
  logoHeight
}: {
  label: string;
  items: Array<{ id: string; name: string; imageUrl: string | null }>;
  logoHeight: number;
}) {
  return (
    <Stack spacing={0.7}>
      <Typography sx={{ fontSize: 10.5, color: "#64748b", letterSpacing: "0.1em" }}>{label.toUpperCase()}</Typography>
      <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => (
          <Box
            key={item.id}
            sx={{
              minHeight: logoHeight + 24,
              display: "grid",
              placeItems: "center",
              borderRadius: 2,
              bgcolor: "rgba(248, 250, 252, 0.92)",
              px: 1.25,
              py: 1
            }}
          >
            {item.imageUrl ? (
              <Box
                alt={item.name}
                component="img"
                src={item.imageUrl}
                sx={{ maxHeight: logoHeight, maxWidth: "100%", objectFit: "contain", display: "block" }}
              />
            ) : (
              <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#0f172a", textAlign: "center" }}>
                {item.name}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
