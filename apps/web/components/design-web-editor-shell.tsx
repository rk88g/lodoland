"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Typography
} from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

type AssetListItem = {
  id: string;
  title: string | null;
  path: string;
};

type SectionLink = {
  id: string;
  label: string;
};

type DesignWebEditorShellProps = {
  assets: AssetListItem[];
  children: ReactNode;
  errorMessage?: string | null;
  loadError?: string | null;
  sectionLinks: SectionLink[];
  successMessage?: string | null;
};

export function DesignWebEditorShell({
  assets,
  children,
  errorMessage,
  loadError,
  sectionLinks,
  successMessage
}: DesignWebEditorShellProps) {
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(Boolean(successMessage || errorMessage));

  useEffect(() => {
    setSnackbarOpen(Boolean(successMessage || errorMessage));
  }, [successMessage, errorMessage]);

  const snackbarSeverity = useMemo(() => {
    if (errorMessage) {
      return "error" as const;
    }

    return "success" as const;
  }, [errorMessage]);

  const snackbarMessage = errorMessage || successMessage || "";

  return (
    <>
      {loadError ? <Alert severity="warning">{loadError}</Alert> : null}

      <Box sx={{ position: "relative" }}>
        <Paper
          sx={{
            position: { xs: "sticky", lg: "fixed" },
            top: { xs: 76, lg: 96 },
            right: { lg: 24 },
            zIndex: 20,
            border: 1,
            borderColor: "divider",
            p: 1,
            display: "grid",
            gap: 1,
            width: { xs: "100%", lg: 220 },
            mb: { xs: 2, lg: 0 }
          }}
        >
          <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em" }}>Navegacion</Typography>
          <Stack spacing={0.75}>
            {sectionLinks.map((section) => (
              <Button component={Link} href={`#${section.id}`} key={section.id} variant="outlined">
                {section.label}
              </Button>
            ))}
          </Stack>
          <Button onClick={() => setAssetModalOpen(true)} variant="contained">
            Ver Asset ID
          </Button>
        </Paper>

        <Box sx={{ display: "grid", gap: 2 }}>{children}</Box>
      </Box>

      <Dialog fullWidth maxWidth="md" onClose={() => setAssetModalOpen(false)} open={assetModalOpen}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          Asset ID disponibles
          <IconButton onClick={() => setAssetModalOpen(false)}>
            <CloseOutlinedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {assets.length ? (
            <Stack spacing={1.25}>
              {assets.map((asset) => (
                <Box
                  key={asset.id}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    p: 1.5,
                    display: "grid",
                    gap: 0.5
                  }}
                >
                  <Typography sx={{ fontWeight: 700, wordBreak: "break-all" }}>Asset ID: {asset.id}</Typography>
                  <Typography color="text.secondary">{asset.title || "Sin titulo"}</Typography>
                  <Typography color="text.secondary" sx={{ wordBreak: "break-all" }}>
                    {asset.path}
                  </Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary">Todavia no hay assets registrados para usar en la web.</Typography>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        autoHideDuration={4200}
        onClose={() => setSnackbarOpen(false)}
        open={snackbarOpen}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
