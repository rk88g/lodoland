"use client";

import { useMemo, useState } from "react";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import type { TicketPassDetail } from "../lib/data/ticket-pass";
import { TicketPass } from "./ticket-pass";

type CustomerTicketPurchaseItem = {
  id: string;
  title: string;
  chips: string[];
  detailLines: string[];
};

export function CustomerTicketPurchasesPanel({
  items,
  ticketDetails
}: {
  items: CustomerTicketPurchaseItem[];
  ticketDetails: Record<string, TicketPassDetail>;
}) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const selectedTicket = useMemo(
    () => (selectedTicketId ? ticketDetails[selectedTicketId] || null : null),
    [selectedTicketId, ticketDetails]
  );

  return (
    <Stack spacing={1.5}>
      <Typography variant="h2">Tickets</Typography>
      {items.length ? (
        <Box sx={{ display: "grid", gap: 2 }}>
          {items.map((item) => (
            <Box key={item.id} sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper", p: 2.5 }}>
              <Stack spacing={1.25}>
                <Typography variant="h3">{item.title}</Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {item.chips.map((chip) => (
                    <Chip key={`${item.id}-${chip}`} label={chip} size="small" />
                  ))}
                </Stack>
                {item.detailLines.map((line) => (
                  <Typography color="text.secondary" key={`${item.id}-${line}`}>
                    {line}
                  </Typography>
                ))}
                <Box>
                  <Button onClick={() => setSelectedTicketId(item.id)} variant="outlined">
                    Ver ticket
                  </Button>
                </Box>
              </Stack>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography color="text.secondary">Todavia no hay tickets emitidos en tu cuenta.</Typography>
      )}

      <Dialog
        fullScreen={isMobile}
        fullWidth
        maxWidth={false}
        onClose={() => setSelectedTicketId(null)}
        open={Boolean(selectedTicketId)}
        PaperProps={{
          sx: isMobile
            ? { bgcolor: "#08111d" }
            : {
                bgcolor: "#08111d",
                width: "min(980px, 68vw)",
                maxWidth: "68vw",
                maxHeight: "92vh"
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
          Mi ticket
          <IconButton onClick={() => setSelectedTicketId(null)}>
            <CloseOutlinedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
          {selectedTicket ? <TicketPass ticket={selectedTicket} /> : null}
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
