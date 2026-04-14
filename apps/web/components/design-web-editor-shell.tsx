"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Alert,
  Backdrop,
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
  const [blockingMessage, setBlockingMessage] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(Boolean(successMessage || errorMessage));

  useEffect(() => {
    setSnackbarOpen(Boolean(successMessage || errorMessage));
  }, [successMessage, errorMessage]);

  useEffect(() => {
    if (successMessage || errorMessage || loadError) {
      setBlockingMessage(null);
    }
  }, [successMessage, errorMessage, loadError]);

  useEffect(() => {
    const handleSubmit = (event: Event) => {
      const form = event.target instanceof HTMLFormElement ? event.target : null;

      if (!form) {
        return;
      }

      const submitter = event instanceof SubmitEvent && event.submitter instanceof HTMLElement ? event.submitter : null;
      const message =
        submitter?.getAttribute("data-loading-label") ||
        form.getAttribute("data-loading-label") ||
        "Loading...";

      setBlockingMessage(message);
    };

    const clearBlocking = () => {
      setBlockingMessage(null);
    };

    window.addEventListener("submit", handleSubmit, true);
    window.addEventListener("pageshow", clearBlocking);

    return () => {
      window.removeEventListener("submit", handleSubmit, true);
      window.removeEventListener("pageshow", clearBlocking);
    };
  }, []);

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
            width: { xs: "100%", lg: 58 },
            mb: { xs: 2, lg: 0 },
            overflow: "hidden",
            transition: "width 180ms ease, box-shadow 180ms ease",
            "&:hover, &:focus-within": {
              width: { lg: 232 },
              boxShadow: 8
            },
            "&:hover .floating-nav-title, &:focus-within .floating-nav-title, &:hover .floating-nav-label, &:focus-within .floating-nav-label": {
              opacity: { lg: 1 },
              maxWidth: { lg: 220 }
            }
          }}
        >
          <Typography
            className="floating-nav-title"
            sx={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textTransform: "uppercase",
              opacity: { xs: 1, lg: 0 },
              maxWidth: { xs: "100%", lg: 0 },
              transition: "opacity 180ms ease, max-width 180ms ease"
            }}
          >
            Navegacion
          </Typography>
          <Stack spacing={0.75}>
            {sectionLinks.map((section) => (
              <Box
                component="a"
                href={`#${section.id}`}
                key={section.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  minHeight: 40,
                  px: 1.1,
                  border: 1,
                  borderColor: "divider",
                  color: "text.primary",
                  textDecoration: "none",
                  bgcolor: "background.paper",
                  transition: "border-color 180ms ease, background-color 180ms ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "action.hover"
                  }
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    flex: "0 0 auto",
                    bgcolor: "primary.main"
                  }}
                />
                <Typography
                  className="floating-nav-label"
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    opacity: { xs: 1, lg: 0 },
                    maxWidth: { xs: "100%", lg: 0 },
                    transition: "opacity 180ms ease, max-width 180ms ease"
                  }}
                >
                  {section.label}
                </Typography>
              </Box>
            ))}
          </Stack>
          <Button
            onClick={() => setAssetModalOpen(true)}
            sx={{
              justifyContent: { xs: "center", lg: "flex-start" },
              minWidth: 0,
              px: { xs: 1.25, lg: 1.1 }
            }}
            variant="contained"
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                flex: "0 0 auto",
                bgcolor: "rgba(255,255,255,0.88)"
              }}
            />
            <Typography
              className="floating-nav-label"
              sx={{
                ml: 1.25,
                fontSize: 13,
                fontWeight: 700,
                whiteSpace: "nowrap",
                overflow: "hidden",
                opacity: { xs: 1, lg: 0 },
                maxWidth: { xs: "100%", lg: 0 },
                transition: "opacity 180ms ease, max-width 180ms ease"
              }}
            >
              Ver Asset ID
            </Typography>
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

      <Backdrop
        open={Boolean(blockingMessage)}
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 10,
          color: "#fff",
          backdropFilter: "blur(8px)",
          bgcolor: "rgba(3, 7, 18, 0.78)"
        }}
      >
        <Stack alignItems="center" spacing={1.25}>
          <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{blockingMessage || "Loading..."}</Typography>
          <Typography color="rgba(255,255,255,0.72)" variant="body2">
            Espera un momento, estamos procesando los cambios.
          </Typography>
        </Stack>
      </Backdrop>

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
