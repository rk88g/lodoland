"use client";

import { useMemo, useState } from "react";
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
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import type { AdminIssuedTicketSummary } from "../lib/data/tickets";
import { formatEventDateTimeWallClock } from "../lib/date-format";
import { validateIssuedTicketAction, updateIssuedTicketStatusAction } from "../app/admin/tickets/actions";
import type { TicketPassDetail } from "../lib/data/ticket-pass";
import { TicketPass } from "./ticket-pass";

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

const ticketStatuses = ["issued", "checked_in", "cancelled", "refunded"];

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

export function AdminIssuedTicketsPanel({
  items,
  ticketDetails
}: {
  items: AdminIssuedTicketSummary[];
  ticketDetails: Record<string, TicketPassDetail>;
}) {
  const [query, setQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<AdminIssuedTicketSummary | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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

  const selectedDetail = selectedTicket ? ticketDetails[selectedTicket.id] || null : null;

  return (
    <Stack spacing={1.5}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
      >
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
                    <Chip label={formatTicketStatus(ticket.status)} size="small" sx={getTicketStatusSx(ticket.status)} />
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.35}>
                      <Typography variant="body2">{formatDate(ticket.issuedAt)}</Typography>
                      {ticket.checkedInAt ? (
                        <Typography color="info.main" variant="body2">
                          Utilizado: {formatDate(ticket.checkedInAt)}
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
                          <input name="redirectTo" type="hidden" value="/admin/tickets" />
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

      <Dialog
        fullScreen={isMobile}
        onClose={() => setSelectedTicket(null)}
        open={Boolean(selectedTicket)}
        PaperProps={{
          sx: isMobile
            ? {
                bgcolor: "#08111d"
              }
            : {
                bgcolor: "#08111d",
                width: "min(860px, 56vw)",
                maxWidth: "56vw",
                maxHeight: "90vh"
              }
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            px: { xs: 2, md: 3 }
          }}
        >
          Ticket emitido
          <IconButton onClick={() => setSelectedTicket(null)}>
            <CloseOutlinedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
          {selectedTicket && selectedDetail ? (
            <Stack spacing={2.5}>
              <TicketPass ticket={selectedDetail} />

              <Stack
                direction={{ xs: "column", xl: "row" }}
                spacing={1.5}
                justifyContent="space-between"
                sx={{ p: { xs: 2, md: 2.5 }, bgcolor: "background.paper", border: 1, borderColor: "divider" }}
              >
                <Stack spacing={0.4}>
                  <Typography fontWeight={800}>Operacion del ticket</Typography>
                  <Typography color="text.secondary" variant="body2">
                    Cambia el estatus o valida el acceso desde esta misma ventana.
                  </Typography>
                </Stack>

                <Stack direction={{ xs: "column", lg: "row" }} spacing={1} useFlexGap flexWrap="wrap">
                  <form action={updateIssuedTicketStatusAction} method="post">
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                      <input name="redirectTo" type="hidden" value="/admin/tickets" />
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

                  {selectedTicket.status !== "checked_in" && selectedTicket.status !== "cancelled" && selectedTicket.status !== "refunded" ? (
                    <form action={validateIssuedTicketAction} method="post">
                      <input name="redirectTo" type="hidden" value="/admin/tickets" />
                      <input name="scanValue" type="hidden" value={selectedTicket.qrPayload || selectedTicket.ticketCode} />
                      <Button type="submit" variant="contained">
                        Validar y quemar
                      </Button>
                    </form>
                  ) : null}
                  <Button
                    onClick={() => window.open(`/admin/tickets/${selectedTicket.id}?print=1`, "_blank", "noopener,noreferrer")}
                    variant="outlined"
                  >
                    Descargar PDF
                  </Button>
                </Stack>
              </Stack>
              <Typography color="error.main" variant="body2">
                Comprar tus accesos solo en nuestra plataforma LODO LAND. No comprar a revendedores. No nos hacemos responsables del mal uso y operaciones ajenas al sistema.
              </Typography>
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
