"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import type { AdminIssuedTicketSummary } from "../lib/data/tickets";
import { formatEventDateTimeWallClock } from "../lib/date-format";
import { buildQrCodeUrl } from "../lib/qr";
import { validateIssuedTicketAction } from "../app/admin/tickets/actions";
import { updateIssuedTicketStatusAction } from "../app/admin/tickets/actions";

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

const ticketStatuses = [
  "available",
  "reserved",
  "sold",
  "issued",
  "courtesy",
  "checked_in",
  "cancelled",
  "refunded"
];

export function AdminIssuedTicketsPanel({
  items
}: {
  items: AdminIssuedTicketSummary[];
}) {
  const [query, setQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<AdminIssuedTicketSummary | null>(null);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return items;
    }

    return items.filter((item) =>
      [
        item.ticketCode,
        item.eventTitle,
        item.ticketTypeName,
        item.ticketLotLabel,
        item.ownerLabel,
        item.purchaserName,
        item.purchaserEmail
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized))
    );
  }, [items, query]);

  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }}>
        <Typography variant="h2">Tickets emitidos</Typography>
        <TextField
          label="Buscar ticket"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Codigo, evento, comprador..."
          value={query}
        />
      </Stack>

      {filteredItems.length ? (
        <TableContainer sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ticket</TableCell>
                <TableCell>Evento</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Emitido</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((ticket) => (
                <TableRow hover key={ticket.id}>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography fontWeight={700}>{ticket.ticketCode}</Typography>
                      <Typography color="text.secondary" variant="body2">
                        {ticket.ticketTypeName}
                        {ticket.ticketLotLabel ? ` - ${ticket.ticketLotLabel}` : ""}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{ticket.eventTitle}</TableCell>
                  <TableCell>
                    <Stack spacing={0.35}>
                      <Typography variant="body2">{ticket.ownerLabel || "Cliente pendiente"}</Typography>
                      {ticket.purchaserName || ticket.purchaserEmail ? (
                        <Typography color="text.secondary" variant="body2">
                          {[ticket.purchaserName, ticket.purchaserEmail].filter(Boolean).join(" - ")}
                        </Typography>
                      ) : null}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip color={ticket.status === "checked_in" ? "success" : "default"} label={formatTicketStatus(ticket.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.35}>
                      <Typography variant="body2">{formatDate(ticket.issuedAt)}</Typography>
                      {ticket.checkedInAt ? (
                        <Typography color="success.main" variant="body2">
                          Usado: {formatDate(ticket.checkedInAt)}
                        </Typography>
                      ) : null}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction={{ xs: "column", lg: "row" }} spacing={1}>
                      <Button onClick={() => setSelectedTicket(ticket)} size="small" variant="outlined">
                        Ver ticket
                      </Button>
                      {ticket.status !== "checked_in" && ticket.status !== "cancelled" && ticket.status !== "refunded" ? (
                        <form action={validateIssuedTicketAction} method="post">
                          <input name="scanValue" type="hidden" value={ticket.qrPayload || ticket.ticketCode} />
                          <Button size="small" type="submit" variant="contained">
                            Quemar
                          </Button>
                        </form>
                      ) : null}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography color="text.secondary">
          {query ? "No encontramos tickets emitidos con ese criterio." : "Todavia no hay tickets emitidos desde control."}
        </Typography>
      )}

      <Dialog fullWidth maxWidth="md" onClose={() => setSelectedTicket(null)} open={Boolean(selectedTicket)}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          Ticket emitido
          <IconButton onClick={() => setSelectedTicket(null)}>
            <CloseOutlinedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedTicket ? (
            <Box sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper", overflow: "hidden" }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "280px minmax(0, 1fr)" } }}>
                <Box
                  sx={{
                    display: "grid",
                    placeItems: "center",
                    minHeight: 280,
                    p: 3,
                    background: "linear-gradient(160deg, rgba(255,157,92,0.22) 0%, rgba(255,105,180,0.16) 45%, rgba(88,160,255,0.18) 100%)"
                  }}
                >
                  <Box sx={{ width: "100%", maxWidth: 220, aspectRatio: "1 / 1", bgcolor: "#fff", p: 1.5 }}>
                    <Box
                      alt={`QR ${selectedTicket.ticketCode}`}
                      component="img"
                      src={buildQrCodeUrl(selectedTicket.qrPayload || selectedTicket.ticketCode, 240)}
                      sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                    />
                  </Box>
                </Box>
                <Stack spacing={2} sx={{ p: 3 }}>
                  <Typography variant="h2">{selectedTicket.eventTitle}</Typography>
                  <Typography color="text.secondary">Ticket {selectedTicket.ticketCode}</Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip label={selectedTicket.ticketTypeName} />
                    {selectedTicket.ticketLotLabel ? <Chip label={selectedTicket.ticketLotLabel} /> : null}
                    <Chip color={selectedTicket.status === "checked_in" ? "success" : "default"} label={formatTicketStatus(selectedTicket.status)} />
                  </Stack>
                  <Typography color="text.secondary">Emitido: {formatDate(selectedTicket.issuedAt)}</Typography>
                  {selectedTicket.checkedInAt ? (
                    <Typography color="success.main">Usado: {formatDate(selectedTicket.checkedInAt)}</Typography>
                  ) : null}
                  {selectedTicket.ownerLabel ? (
                    <Typography color="text.secondary">Cuenta: {selectedTicket.ownerLabel}</Typography>
                  ) : null}
                  {selectedTicket.purchaserName || selectedTicket.purchaserEmail || selectedTicket.purchaserPhone ? (
                    <Typography color="text.secondary">
                      {[selectedTicket.purchaserName, selectedTicket.purchaserEmail, selectedTicket.purchaserPhone].filter(Boolean).join(" - ")}
                    </Typography>
                  ) : null}
                  <form action={updateIssuedTicketStatusAction} method="post">
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                      <input name="ticketId" type="hidden" value={selectedTicket.id} />
                      <TextField defaultValue={selectedTicket.status} label="Estatus" name="status" select sx={{ minWidth: 220 }}>
                        {ticketStatuses.map((status) => (
                          <MenuItem key={status} value={status}>
                            {formatTicketStatus(status)}
                          </MenuItem>
                        ))}
                      </TextField>
                      <Button type="submit" variant="outlined">
                        Guardar estatus
                      </Button>
                    </Stack>
                  </form>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <Button component={Link} href={`/admin/tickets/${selectedTicket.id}`} variant="outlined">
                      Abrir detalle
                    </Button>
                    {selectedTicket.status !== "checked_in" && selectedTicket.status !== "cancelled" && selectedTicket.status !== "refunded" ? (
                      <form action={validateIssuedTicketAction} method="post">
                        <input name="scanValue" type="hidden" value={selectedTicket.qrPayload || selectedTicket.ticketCode} />
                        <Button type="submit" variant="contained">
                          Validar y quemar
                        </Button>
                      </form>
                    ) : null}
                  </Stack>
                </Stack>
              </Box>
            </Box>
          ) : null}
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
