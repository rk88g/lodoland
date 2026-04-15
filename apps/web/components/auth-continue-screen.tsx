"use client";

import { useEffect } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";

export function AuthContinueScreen({ nextTarget }: { nextTarget: string }) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.replace(nextTarget);
    }, 160);

    return () => window.clearTimeout(timer);
  }, [nextTarget]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        background: "linear-gradient(180deg, #09101c 0%, #0b111d 100%)"
      }}
    >
      <Stack alignItems="center" spacing={1.5}>
        <CircularProgress color="inherit" />
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Abriendo tu cuenta...</Typography>
        <Typography color="rgba(255,255,255,0.72)" variant="body2">
          Estamos completando tu acceso.
        </Typography>
      </Stack>
    </Box>
  );
}
