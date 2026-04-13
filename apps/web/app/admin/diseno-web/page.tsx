import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
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
import {
  createAvatarPresetAction,
  createMediaCollectionAction,
  registerMediaAssetAction
} from "./actions";

export const dynamic = "force-dynamic";

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
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(12, minmax(0, 1fr))" } }}>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 6" } }}>
              <TextField label="Ruta en Storage" name="path" placeholder="home/evento/flayer-principal.webp" required />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField label="Título" name="title" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField label="Alt" name="altText" />
            </Box>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <FormControlLabel control={<Checkbox name="isPublic" />} label="Visible públicamente" />
                <Button type="submit" variant="contained">
                  Registrar asset
                </Button>
              </Stack>
            </Box>
          </Box>
        </form>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Colecciones y avatares</Typography>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
          <Box>
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
          </Box>
          <Box>
            <form action={createAvatarPresetAction}>
              <Stack spacing={1.5}>
                <TextField label="Nombre del avatar" name="label" required />
                <TextField label="Slug" name="slug" placeholder="mud-core" />
                <TextField label="Descripción" name="description" />
                <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" } }}>
                  <Box>
                    <TextField label="Color base" name="backgroundColor" placeholder="#111827" />
                  </Box>
                  <Box>
                    <TextField label="Color acento" name="accentColor" placeholder="#7dd3fc" />
                  </Box>
                </Box>
                <Button type="submit" variant="contained">
                  Crear avatar
                </Button>
              </Stack>
            </form>
          </Box>
        </Box>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Assets registrados</Typography>
        {mediaAssets.length ? (
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" } }}>
            {mediaAssets.map((asset) => (
              <Box key={asset.id}>
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
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">
            Aún no hay imágenes registradas en `media_assets`.
          </Typography>
        )}
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Colecciones activas</Typography>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" } }}>
          {mediaCollections.map((collection) => (
            <Box key={collection.id}>
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
            </Box>
          ))}
        </Box>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Bindings por sección</Typography>
        {sectionBindings.length ? (
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
            {sectionBindings.map((binding) => (
              <Box key={binding.id}>
                <Stack spacing={1}>
                  <Typography variant="h3">{binding.pageSlug}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {binding.sectionKey} · {binding.bindingKey}
                  </Typography>
                  <Typography color="text.secondary">
                    {binding.collectionLabel} · {binding.rotationMode} · {binding.itemsLimit} items
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">
            Todavía no hay colecciones asignadas a secciones.
          </Typography>
        )}
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h2">Avatares disponibles</Typography>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" } }}>
          {avatarPresets.map((avatarPreset) => (
            <Box key={avatarPreset.id}>
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
            </Box>
          ))}
        </Box>
      </Stack>
    </DashboardShell>
  );
}
