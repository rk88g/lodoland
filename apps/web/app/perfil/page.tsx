import Link from "next/link";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DashboardShell } from "../../components/dashboard-shell";
import { requireUser } from "../../lib/auth/session";
import { getCustomerPools, getCustomerRaffles, getCustomerTickets } from "../../lib/data/customer";
import { getAvatarPresets, getNextEvent } from "../../lib/data/portal";
import { formatEventDateTimeWallClock } from "../../lib/date-format";
import { customerNavItems } from "../../lib/navigation";
import { updateCustomerAvatarAction, updateCustomerProfileAction } from "./actions";

export const dynamic = "force-dynamic";

type ProfilePageProps = {
  searchParams?: {
    error?: string;
    success?: string;
  };
};

function formatDate(dateValue: string | null) {
  return formatEventDateTimeWallClock(dateValue) || "Sin fecha";
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const { user, profile } = await requireUser();
  const [nextEvent, avatarPresets, tickets, raffles, pools] = await Promise.all([
    getNextEvent(),
    getAvatarPresets(),
    getCustomerTickets(user.id, user.email),
    getCustomerRaffles(user.id),
    getCustomerPools(user.id)
  ]);

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
  const activeAvatar = avatarPresets.find((avatarPreset) => avatarPreset.id === profile?.avatar_preset_id) || null;
  const errorMessage = searchParams?.error ? decodeURIComponent(searchParams.error) : null;
  const successMessage = searchParams?.success ? decodeURIComponent(searchParams.success) : null;

  return (
    <DashboardShell navItems={customerNavItems} subtitle="Intranet de clientes" title="Mi perfil">
      {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Stack spacing={1.5}>
        <Typography variant="h2">Proximo evento</Typography>
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
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover"
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
                {nextEvent.description || nextEvent.shortDescription ? (
                  <Typography color="text.secondary">
                    {nextEvent.description || nextEvent.shortDescription}
                  </Typography>
                ) : null}
                <Stack direction="row" spacing={1.25} useFlexGap flexWrap="wrap">
                  <Link href="/eventos" style={{ textDecoration: "none" }}>
                    <Button variant="contained">Ver evento</Button>
                  </Link>
                  <Link href="/perfil/compras" style={{ textDecoration: "none" }}>
                    <Button variant="outlined">Mis compras</Button>
                  </Link>
                </Stack>
              </Stack>
            </Box>
          </Box>
        ) : (
          <Typography color="text.secondary">
            Aun no hay un evento publicado para mostrar en intranet.
          </Typography>
        )}
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Mis datos</Typography>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "280px minmax(0, 1fr)" } }}>
          <Box
            sx={{
              display: "grid",
              gap: 1.25,
              alignContent: "start",
              border: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              p: 2.5
            }}
          >
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                minHeight: 180,
                border: 1,
                borderColor: "divider",
                backgroundColor: activeAvatar?.backgroundColor || "background.default",
                backgroundImage: activeAvatar?.mediaUrl ? `url(${activeAvatar.mediaUrl})` : "none",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover"
              }}
            >
              {!activeAvatar?.mediaUrl ? (
                <Avatar
                  sx={{
                    bgcolor: activeAvatar?.accentColor || "primary.main",
                    color: "#fff",
                    width: 72,
                    height: 72
                  }}
                >
                  {(fullName || profile?.email || user.email || "U").slice(0, 1).toUpperCase()}
                </Avatar>
              ) : null}
            </Box>
            <Typography variant="h3">{fullName || "Cliente LODO LAND"}</Typography>
            <Typography color="text.secondary">{profile?.email || user.email}</Typography>
            <Typography color="text.secondary">
              Avatar actual: {activeAvatar?.label || "Sin seleccionar"}
            </Typography>
          </Box>

          <Box
            component="form"
            action={updateCustomerProfileAction}
            autoComplete="off"
            method="post"
            sx={{
              display: "grid",
              gap: 2,
              border: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              p: 2.5
            }}
          >
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
              <TextField autoComplete="off" defaultValue={profile?.first_name || ""} label="Nombre" name="firstName" />
              <TextField autoComplete="off" defaultValue={profile?.last_name || ""} label="Apellidos" name="lastName" />
              <TextField autoComplete="off" defaultValue={profile?.email || user.email || ""} disabled label="Correo" />
              <TextField autoComplete="off" defaultValue={profile?.phone || ""} label="Telefono" name="phone" />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" variant="contained">
                Guardar mis datos
              </Button>
            </Box>
          </Box>
        </Box>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Elegir avatar</Typography>
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
              <Box
                component="form"
                action={updateCustomerAvatarAction}
                autoComplete="off"
                key={avatarPreset.id}
                method="post"
                sx={{
                  display: "grid",
                  gap: 1,
                  border: 1,
                  borderColor: profile?.avatar_preset_id === avatarPreset.id ? "primary.main" : "divider",
                  bgcolor: "background.paper",
                  p: 1.5
                }}
              >
                <input name="avatarPresetId" type="hidden" value={avatarPreset.id} />
                <Box
                  sx={{
                    display: "grid",
                    placeItems: "center",
                    minHeight: 120,
                    backgroundColor: avatarPreset.backgroundColor || "background.default",
                    backgroundImage: avatarPreset.mediaUrl ? `url(${avatarPreset.mediaUrl})` : "none",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover"
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
                <Button type="submit" variant={profile?.avatar_preset_id === avatarPreset.id ? "contained" : "outlined"}>
                  {profile?.avatar_preset_id === avatarPreset.id ? "Seleccionado" : "Usar avatar"}
                </Button>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">
            Aun no hay avatares registrados en CONTROL &gt; Diseno web.
          </Typography>
        )}
      </Stack>

      <Stack spacing={1.5}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
          <Typography variant="h2">Mis compras</Typography>
          <Link href="/perfil/compras" style={{ textDecoration: "none" }}>
            <Button variant="outlined">Ver todo</Button>
          </Link>
        </Stack>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", xl: "repeat(3, minmax(0, 1fr))" } }}>
          <PurchasePreviewCard
            emptyLabel="Todavia no tienes tickets en tu cuenta."
            items={tickets.slice(0, 3).map((ticket) => ({
              title: ticket.eventTitle,
              meta: `${ticket.ticketTypeName} - ${ticket.ticketCode}`,
              detail: `${ticket.priceLabel} - ${ticket.status}`
            }))}
            title="Tickets"
          />
          <PurchasePreviewCard
            emptyLabel="Todavia no tienes rifas registradas."
            items={raffles.slice(0, 3).map((raffle) => ({
              title: raffle.title,
              meta: `${raffle.quantity} numeros`,
              detail: `${raffle.currency} ${raffle.unitPrice} - ${raffle.status}`
            }))}
            title="Rifas"
          />
          <PurchasePreviewCard
            emptyLabel="Todavia no tienes quinielas registradas."
            items={pools.slice(0, 3).map((pool) => ({
              title: pool.title,
              meta: pool.picks[0] || "Picks pendientes",
              detail: `${pool.currency} ${pool.unitPrice} - ${pool.status}`
            }))}
            title="Quinielas"
          />
        </Box>
      </Stack>
    </DashboardShell>
  );
}

function PurchasePreviewCard({
  title,
  items,
  emptyLabel
}: {
  title: string;
  items: Array<{ title: string; meta: string; detail: string }>;
  emptyLabel: string;
}) {
  return (
    <Box sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper", p: 2.5, display: "grid", gap: 1.25 }}>
      <Typography variant="h3">{title}</Typography>
      {items.length ? (
        items.map((item) => (
          <Box key={`${title}-${item.title}-${item.meta}`} sx={{ borderTop: 1, borderColor: "divider", pt: 1.25 }}>
            <Typography sx={{ fontWeight: 700 }}>{item.title}</Typography>
            <Typography color="text.secondary" variant="body2">
              {item.meta}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {item.detail}
            </Typography>
          </Box>
        ))
      ) : (
        <Typography color="text.secondary">{emptyLabel}</Typography>
      )}
    </Box>
  );
}
