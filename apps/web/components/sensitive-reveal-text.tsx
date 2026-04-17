"use client";

import { useState } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";

function maskEmail(email: string) {
  const [local, domain] = email.split("@");

  if (!domain) {
    return email;
  }

  if (local.length <= 2) {
    return `${local.slice(0, 1)}***@${domain}`;
  }

  return `${local.slice(0, 2)}${"*".repeat(Math.max(local.length - 2, 3))}@${domain}`;
}

export function SensitiveRevealText({
  value,
  label
}: {
  value: string | null | undefined;
  label: string;
}) {
  const [revealed, setRevealed] = useState(false);

  if (!value) {
    return (
      <Box>
        <Typography color="text.secondary" variant="body2">
          {label}
        </Typography>
        <Typography color="text.secondary">No disponible</Typography>
      </Box>
    );
  }

  return (
    <ButtonBase
      onBlur={() => setRevealed(false)}
      onFocus={() => setRevealed(true)}
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
      onTouchStart={() => setRevealed((current) => !current)}
      sx={{
        alignItems: "flex-start",
        display: "grid",
        gap: 0.3,
        justifyItems: "start",
        textAlign: "left"
      }}
    >
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      <Typography>{revealed ? value : maskEmail(value)}</Typography>
    </ButtonBase>
  );
}
