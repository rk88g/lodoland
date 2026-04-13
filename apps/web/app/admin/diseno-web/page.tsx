import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DashboardShell } from "../../../components/dashboard-shell";
import { requireAdmin } from "../../../lib/auth/session";
import {
  getAvatarPresets,
  getMediaAssets,
  getMediaCollections,
  getSectionBindings
} from "../../../lib/data/portal";
import { controlNavItems } from "../../../lib/navigation";
import { signOutAction } from "../../login/actions";
import {
  createAvatarPresetAction,
  createMediaCollectionAction,
  registerMediaAssetAction
} from "./actions";

type AdminDisenoWebPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default async function AdminDisenoWebPage({ searchParams }: AdminDisenoWebPageProps) {
  await requireAdmin();
  const [mediaAssets, mediaCollections, sectionBindings, avatarPresets] = await Promise.all([
    getMediaAssets(12),
    getMediaCollections(8),
    getSectionBindings(8),
    getAvatarPresets()
  ]);

  const errorMessage = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

  return (
    <DashboardShell
      navItems={controlNavItems}
      signOutAction={signOutAction}
      subtitle="Sitio, assets y secciones"
      title="Diseño web"
    >
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Stack spacing={1.5}>
        <Typography variant="h2">Registrar imagen ya subida</Typography>
        <Typography color="text.secondary">
          Sube primero el archivo al bucket `lodoland-media` en Supabase Storage y después regístralo aquí.
        </Typography>

        <form action={registerMediaAssetAction}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField label="Ruta en Storage" name="path" placeholder="home/evento/flayer-principal.webp" required />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Título" name="title" />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Alt" name="altText" />
            </Grid>
            <Grid item xs={12}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <FormControlLabel control={<Checkbox name="isPublic" />} label="Visible públicamente" />
                <Button type="submit" variant="contained">
                  Registrar asset
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Colecciones y avatares</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <form action={createMediaCollectionAction}>
              <Stack spacing={1.5}>
                <TextField label="Nombre de colección" name="label" required />
                <TextField label="Slug" name="slug" placeholder="influencers-collage-2026" />
                <TextField label="Descripción" multiline minRows={3} name="description" />
                <Button type="submit" variant="contained">
                  Crear colección
                </Button>
              </Stack>
            </form>
          </Grid>
          <Grid item xs={12} md={6}>
            <form action={createAvatarPresetAction}>
              <Stack spacing={1.5}>
                <TextField label="Nombre del avatar" name="label" required />
                <TextField label="Slug" name="slug" placeholder="mud-core" />
                <TextField label="Descripción" name="description" />
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Color base" name="backgroundColor" placeholder="#111827" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Color acento" name="accentColor" placeholder="#7dd3fc" />
                  </Grid>
                </Grid>
                <Button type="submit" variant="contained">
                  Crear avatar
                </Button>
              </Stack>
            </form>
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Assets registrados</Typography>
        {mediaAssets.length ? (
          <Grid container spacing={2}>
            {mediaAssets.map((asset) => (
              <Grid item xs={12} sm={6} md={4} key={asset.id}>
                <Stack spacing={1}>
                  <Box
                    sx={{
                      minHeight: 148,
                      border: 1,
                      borderColor: "divider",
                      backgroundColor: "background.default",
                      backgroundImage: `url(${asset.publicUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }}
                  />
                  <Typography variant="body2">{asset.title || asset.path}</Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip label={asset.isPublic ? "Público" : "Privado"} size="small" />
                    <Chip label={asset.bucket} size="small" />
                  </Stack>
                </Stack>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary">
            Aún no hay imágenes registradas en `media_assets`.
          </Typography>
        )}
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Colecciones activas</Typography>
        <Grid container spacing={2}>
          {mediaCollections.map((collection) => (
            <Grid item xs={12} md={4} key={collection.id}>
              <Stack spacing={1}>
                <Typography variant="h3">{collection.label}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {collection.slug}
                </Typography>
                {collection.description ? (
                  <Typography color="text.secondary">{collection.description}</Typography>
                ) : null}
                <Chip
                  color={collection.isActive ? "success" : "default"}
                  label={collection.isActive ? "Activa" : "Inactiva"}
                  size="small"
                />
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Bindings por sección</Typography>
        {sectionBindings.length ? (
          <Grid container spacing={2}>
            {sectionBindings.map((binding) => (
              <Grid item xs={12} md={6} key={binding.id}>
                <Stack spacing={1}>
                  <Typography variant="h3">{binding.pageSlug}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {binding.sectionKey} · {binding.bindingKey}
                  </Typography>
                  <Typography color="text.secondary">
                    {binding.collectionLabel} · {binding.rotationMode} · {binding.itemsLimit} items
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary">
            Todavía no hay colecciones asignadas a secciones.
          </Typography>
        )}
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Avatares disponibles</Typography>
        <Grid container spacing={2}>
          {avatarPresets.map((avatarPreset) => (
            <Grid item xs={12} sm={6} md={3} key={avatarPreset.id}>
              <Stack spacing={1}>
                <Box
                  sx={{
                    minHeight: 110,
                    border: 1,
                    borderColor: "divider",
                    backgroundColor: avatarPreset.backgroundColor || "background.default",
                    backgroundImage: avatarPreset.mediaUrl ? `url(${avatarPreset.mediaUrl})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                />
                <Typography variant="body2">{avatarPreset.label}</Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </DashboardShell>
  );
}
