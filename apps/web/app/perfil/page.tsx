import Link from "next/link";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
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
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
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
            </Grid>
            <Grid item xs={12} md={8}>
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
            </Grid>
          </Grid>
        ) : (
          <Typography color="text.secondary">
            Aún no hay un evento publicado para mostrar en intranet.
          </Typography>
        )}
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Perfil</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
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
          </Grid>
          <Grid item xs={12} md={6}>
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
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Avatares disponibles</Typography>
        {avatarPresets.length ? (
          <Grid container spacing={2}>
            {avatarPresets.map((avatarPreset) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={avatarPreset.id}>
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
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary">
            Aún no hay avatares registrados en CONTROL &gt; Diseño web.
          </Typography>
        )}
      </Stack>
    </DashboardShell>
  );
}
