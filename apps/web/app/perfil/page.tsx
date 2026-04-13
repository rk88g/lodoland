import Link from "next/link";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Stack,
  Typography
} from "@mui/material";
import { DashboardShell } from "../../components/dashboard-shell";
import { requireUser } from "../../lib/auth/session";
import { getAvatarPresets, getNextEvent } from "../../lib/data/portal";
import { customerNavItems } from "../../lib/navigation";
import { signOutAction } from "../login/actions";

function formatDate(dateValue: string | null) {
  if (!dateValue) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(dateValue));
}

export default async function ProfilePage() {
  const { user, profile } = await requireUser();
  const [nextEvent, avatarPresets] = await Promise.all([getNextEvent(), getAvatarPresets()]);
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");

  return (
    <DashboardShell
      navItems={customerNavItems}
      signOutAction={signOutAction}
      subtitle="Intranet de clientes"
      title="Mi cuenta"
    >
      <Stack spacing={1.5}>
        <Typography variant="h2">Próximo evento</Typography>
        {nextEvent ? (
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "280px minmax(0, 1fr)" } }}>
            <Box>
              <Box
                sx={{
                  minHeight: 220,
                  border: 1,
                  borderColor: "divider",
                  backgroundColor: "background.default",
                  backgroundImage: nextEvent.cover?.url ? `url(${nextEvent.cover.url})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}
              />
            </Box>
            <Box>
              <Stack spacing={1.5}>
                <Typography variant="h3">{nextEvent.title}</Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <Chip label={formatDate(nextEvent.startsAt)} size="small" />
                  <Chip label={nextEvent.venueName || "Sede pendiente"} size="small" />
                  <Chip label={nextEvent.city || "Ciudad pendiente"} size="small" />
                </Stack>
                {nextEvent.shortDescription ? (
                  <Typography color="text.secondary">{nextEvent.shortDescription}</Typography>
                ) : null}
                <Stack direction="row" spacing={1.25} useFlexGap flexWrap="wrap">
                  <Button component={Link} href="/eventos" variant="contained">
                    Ver evento
                  </Button>
                  <Button variant="outlined">Comprar después</Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
        ) : (
          <Typography color="text.secondary">
            Aún no hay un evento publicado para mostrar en intranet.
          </Typography>
        )}
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Perfil</Typography>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
          <Box>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Nombre
              </Typography>
              <Typography>{fullName || "Pendiente de completar"}</Typography>
              <Typography variant="body2" color="text.secondary">
                Correo
              </Typography>
              <Typography>{profile?.email || user.email}</Typography>
              <Typography variant="body2" color="text.secondary">
                Teléfono
              </Typography>
              <Typography>{profile?.phone || "Pendiente"}</Typography>
              <Typography variant="body2" color="text.secondary">
                Rol
              </Typography>
              <Typography>{profile?.role || "customer"}</Typography>
            </Stack>
          </Box>
          <Box>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Estado
              </Typography>
              <Typography>{profile?.is_active ? "Cuenta activa" : "Cuenta desactivada"}</Typography>
              <Typography variant="body2" color="text.secondary">
                Accesos siguientes
              </Typography>
              <Typography>Tickets, rifas, quinielas, compras y campañas personalizadas.</Typography>
            </Stack>
          </Box>
        </Box>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Avatares disponibles</Typography>
        {avatarPresets.length ? (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(3, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
                lg: "repeat(6, minmax(0, 1fr))"
              }
            }}
          >
            {avatarPresets.map((avatarPreset) => (
              <Box key={avatarPreset.id}>
                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: "grid",
                      placeItems: "center",
                      minHeight: 120,
                      border: 1,
                      borderColor:
                        profile?.avatar_preset_id === avatarPreset.id ? "primary.main" : "divider",
                      backgroundColor: avatarPreset.backgroundColor || "background.default",
                      backgroundImage: avatarPreset.mediaUrl ? `url(${avatarPreset.mediaUrl})` : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }}
                  >
                    {!avatarPreset.mediaUrl ? (
                      <Avatar
                        sx={{
                          bgcolor: avatarPreset.accentColor || "primary.main",
                          color: "#fff",
                          width: 56,
                          height: 56
                        }}
                      >
                        {avatarPreset.label.slice(0, 1)}
                      </Avatar>
                    ) : null}
                  </Box>
                  <Typography variant="body2">{avatarPreset.label}</Typography>
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">
            Aún no hay avatares registrados en CONTROL &gt; Diseño web.
          </Typography>
        )}
      </Stack>
    </DashboardShell>
  );
}
