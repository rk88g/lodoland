import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

type AdminSectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function AdminSectionCard({ title, description, children }: AdminSectionCardProps) {
  return (
    <Stack spacing={1.5}>
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
            height: 4,
            background: "linear-gradient(90deg, rgba(100,181,246,0.95) 0%, rgba(255,138,101,0.75) 100%)"
          }}
        />
        <Stack spacing={1.5} sx={{ p: 2.25 }}>
          <Stack spacing={0.5}>
            <Typography variant="h2">{title}</Typography>
            {description ? (
              <Typography color="text.secondary">{description}</Typography>
            ) : null}
          </Stack>
          {children}
        </Stack>
      </Box>
    </Stack>
  );
}
