import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DashboardShell } from "../../../components/dashboard-shell";
import { requireAdmin } from "../../../lib/auth/session";
import { getCmsPageConfig, type CmsFieldValue } from "../../../lib/data/cms";
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
  registerMediaAssetAction,
  updateGroupItemFieldAction,
  updateSectionFieldAction
} from "./actions";

export const dynamic = "force-dynamic";

type AdminDisenoWebPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default async function AdminDisenoWebPage({ searchParams }: AdminDisenoWebPageProps) {
  await requireAdmin();
  const [mediaAssets, mediaCollections, sectionBindings, avatarPresets, homeConfig] = await Promise.all([
    getMediaAssets(120),
    getMediaCollections(20),
    getSectionBindings(20),
    getAvatarPresets(),
    getCmsPageConfig("home")
  ]);

  const errorMessage = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

  return (
    <DashboardShell navItems={controlNavItems} subtitle="Sitio, assets y secciones" title="Diseno web">
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Stack spacing={1.5}>
        <Typography variant="h2">Registrar imagen ya subida</Typography>
        <Typography color="text.secondary">
          Sube primero el archivo al bucket `lodoland-media` en Supabase Storage y despues registralo aqui.
        </Typography>

        <form action={registerMediaAssetAction} autoComplete="off">
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(12, minmax(0, 1fr))" } }}>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 6" } }}>
              <TextField autoComplete="off" label="Ruta en Storage" name="path" placeholder="home/evento/flayer-principal.webp" required />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField autoComplete="off" label="Titulo" name="title" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField autoComplete="off" label="Alt" name="altText" />
            </Box>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <FormControlLabel control={<Checkbox name="isPublic" />} label="Visible publicamente" />
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
            <form action={createMediaCollectionAction} autoComplete="off">
              <Stack spacing={1.5}>
                <TextField autoComplete="off" label="Nombre de coleccion" name="label" required />
                <TextField autoComplete="off" label="Slug" name="slug" placeholder="influencers-collage-2026" />
                <TextField autoComplete="off" label="Descripcion" multiline minRows={3} name="description" />
                <Button type="submit" variant="contained">
                  Crear coleccion
                </Button>
              </Stack>
            </form>
          </Box>
          <Box>
            <form action={createAvatarPresetAction} autoComplete="off">
              <Stack spacing={1.5}>
                <TextField autoComplete="off" label="Nombre del avatar" name="label" required />
                <TextField autoComplete="off" label="Slug" name="slug" placeholder="mud-core" />
                <TextField autoComplete="off" label="Descripcion" name="description" />
                <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" } }}>
                  <Box>
                    <TextField autoComplete="off" label="Color base" name="backgroundColor" placeholder="#111827" />
                  </Box>
                  <Box>
                    <TextField autoComplete="off" label="Color acento" name="accentColor" placeholder="#7dd3fc" />
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
        <Typography variant="h2">Configuracion de portada</Typography>
        <Typography color="text.secondary">
          Cada texto, link e imagen de la home ya puede salir desde aqui. Los botones de tickets y merch se
          mantienen estaticos hacia login, pero el resto de labels, banners y componentes ya son editables.
        </Typography>

        {homeConfig ? (
          <Stack spacing={3}>
            {Object.values(homeConfig.sections)
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((section) => (
                <Box key={section.id} sx={{ border: 1, borderColor: "divider", p: 2, display: "grid", gap: 2 }}>
                  <Stack spacing={0.5}>
                    <Typography variant="h3">{section.label}</Typography>
                    <Typography color="text.secondary" variant="body2">
                      {section.sectionKey}
                    </Typography>
                  </Stack>

                  <Box
                    sx={{
                      display: "grid",
                      gap: 2,
                      gridTemplateColumns: { xs: "1fr", xl: "repeat(2, minmax(0, 1fr))" }
                    }}
                  >
                    {Object.values(section.fields)
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((field) => (
                        <Box key={field.id} sx={{ border: 1, borderColor: "divider", p: 2 }}>
                          <CmsFieldEditor
                            action={updateSectionFieldAction}
                            field={field}
                            helperText={getFieldHint(section.sectionKey, field.fieldKey)}
                            mediaAssets={mediaAssets}
                          />
                        </Box>
                      ))}
                  </Box>

                  {Object.values(section.groups)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((group) => (
                      <Box key={group.id} sx={{ borderTop: 1, borderColor: "divider", pt: 2 }}>
                        <Stack spacing={1.25}>
                          <Typography variant="h3">{group.label}</Typography>
                          <Typography color="text.secondary" variant="body2">
                            {group.groupKey}
                          </Typography>

                          <Box
                            sx={{
                              display: "grid",
                              gap: 2,
                              gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" }
                            }}
                          >
                            {group.items.map((item) => (
                              <Box key={item.id} sx={{ border: 1, borderColor: "divider", p: 2, display: "grid", gap: 1.5 }}>
                                <Stack spacing={0.25}>
                                  <Typography sx={{ fontWeight: 700 }}>{item.label}</Typography>
                                  <Typography color="text.secondary" variant="body2">
                                    {item.itemKey}
                                  </Typography>
                                </Stack>

                                <Box sx={{ display: "grid", gap: 1.5 }}>
                                  {Object.values(item.fields)
                                    .sort((a, b) => a.sortOrder - b.sortOrder)
                                    .map((field) => (
                                      <Box key={field.id} sx={{ border: 1, borderColor: "divider", p: 1.5 }}>
                                        <CmsFieldEditor
                                          action={updateGroupItemFieldAction}
                                          field={field}
                                          helperText={getFieldHint(section.sectionKey, `${group.groupKey}.${field.fieldKey}`)}
                                          mediaAssets={mediaAssets}
                                        />
                                      </Box>
                                    ))}
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        </Stack>
                      </Box>
                    ))}
                </Box>
              ))}
          </Stack>
        ) : (
          <Typography color="text.secondary">
            No se pudo cargar la configuracion del home. Aplica primero las migraciones de homepage en Supabase.
          </Typography>
        )}
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
                    <Chip label={asset.isPublic ? "Publico" : "Privado"} size="small" />
                    <Chip label={asset.bucket} size="small" />
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">
            Aun no hay imagenes registradas en `media_assets`.
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
        <Typography variant="h2">Bindings por seccion</Typography>
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
            Todavia no hay colecciones asignadas a secciones.
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

type CmsFieldEditorProps = {
  action: (formData: FormData) => Promise<void>;
  field: CmsFieldValue;
  helperText?: string;
  mediaAssets: Awaited<ReturnType<typeof getMediaAssets>>;
};

function CmsFieldEditor({ action, field, helperText, mediaAssets }: CmsFieldEditorProps) {
  return (
    <form action={action} autoComplete="off">
      <Stack spacing={1.25}>
        <input name="fieldId" type="hidden" value={field.id} />
        <input name="kind" type="hidden" value={field.kind} />
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {field.label}
        </Typography>

        {field.kind === "link" ? (
          <TextField autoComplete="off" defaultValue={field.linkUrl || ""} helperText={helperText} label="URL" name="linkUrl" />
        ) : field.kind === "image" ? (
          <TextField
            defaultValue={field.mediaAssetId || ""}
            helperText={helperText || "Selecciona un asset ya registrado en Storage."}
            label="Asset"
            name="mediaAssetId"
            select
          >
            <MenuItem value="">Sin imagen</MenuItem>
            {mediaAssets.map((asset) => (
              <MenuItem key={asset.id} value={asset.id}>
                {asset.title || asset.path}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <TextField
            autoComplete="off"
            defaultValue={field.textValue || ""}
            helperText={helperText}
            label="Valor"
            multiline={field.kind === "textarea" || field.kind === "richtext"}
            minRows={field.kind === "textarea" || field.kind === "richtext" ? 3 : undefined}
            name="textValue"
          />
        )}

        {field.kind === "image" && field.media ? (
          <Box
            sx={{
              minHeight: 120,
              border: 1,
              borderColor: "divider",
              backgroundImage: `url(${field.media.url})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          />
        ) : null}

        <Button type="submit" variant="outlined">
          Guardar campo
        </Button>
      </Stack>
    </form>
  );
}

function getFieldHint(sectionKey: string, fieldKey: string) {
  const hints: Record<string, string> = {
    "menu_overlay.menu_ads.media": "Banner menu cuadrado: 1080x1080 o rectangular: 1920x1080, segun el item.",
    "evento_reciente.event_side_banner.media": "Banner vertical recomendado: 1080x1920 px.",
    "redes_sociales.social_profiles.embed_url": "Usa URL publica/embed. Si no hay embed, se mostrara la imagen preview.",
    "redes_sociales.social_profiles.preview_media": "Preview recomendada: 1290x2796 px o equivalente vertical.",
    "patrocinadores.sponsor_tiles.logo_media": "Logo sponsor recomendado en PNG transparente o WebP horizontal.",
    "patrocinadores.sponsor_main_banner.media": "Banner horizontal recomendado: 1920x640 px.",
    "influencers.influencer_collage.media": "Imagen collage recomendada: alta resolucion, vertical u horizontal.",
    "influencers.influencer_profiles.cover_media": "Foto influencer recomendada: 1200x1600 px.",
    "ventas_destacadas.sales_panels.cover_media": "Imagen panel recomendada: 1400x2200 px.",
    "merch_destacado.merch_gallery.media": "Imagen merch recomendada: 1400x1800 px.",
    "footer.footer_marquee.logo_media": "Logo footer recomendado: 600x240 px."
  };

  const normalized = fieldKey
    .replace(/^menu_ads\./, "menu_overlay.menu_ads.")
    .replace(/^event_side_banner\./, "evento_reciente.event_side_banner.")
    .replace(/^social_profiles\./, "redes_sociales.social_profiles.")
    .replace(/^sponsor_tiles\./, "patrocinadores.sponsor_tiles.")
    .replace(/^sponsor_main_banner\./, "patrocinadores.sponsor_main_banner.")
    .replace(/^influencer_collage\./, "influencers.influencer_collage.")
    .replace(/^influencer_profiles\./, "influencers.influencer_profiles.")
    .replace(/^sales_panels\./, "ventas_destacadas.sales_panels.")
    .replace(/^merch_gallery\./, "merch_destacado.merch_gallery.")
    .replace(/^footer_marquee\./, "footer.footer_marquee.");

  return hints[`${sectionKey}.${fieldKey}`] || hints[normalized];
}
