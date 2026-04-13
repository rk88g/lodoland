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

const editorSectionOrder = [
  "evento_reciente",
  "redes_sociales",
  "patrocinadores",
  "influencers",
  "ventas_destacadas",
  "merch_destacado",
  "menu_overlay",
  "footer"
] as const;

const sectionFieldKeys: Record<string, string[]> = {
  evento_reciente: ["title", "description", "primary_cta_label", "secondary_cta_label", "hero_image_alt", "side_banner_alt"],
  patrocinadores: ["title", "description", "banner_alt"],
  influencers: ["modal_button_label", "modal_title"],
  merch_destacado: ["title", "catalog_button_label"],
  footer: ["title", "description", "privacy_label", "contact_label", "terms_label"]
};

const groupFieldKeys: Record<string, string[]> = {
  menu_links: ["label", "url"],
  official_sponsor_modal: ["title", "description", "website_label", "website_url", "social_label", "social_url", "media"],
  event_side_banner: ["media", "target_url"],
  social_profiles: ["platform", "target_url", "embed_url", "preview_media"],
  sponsor_tiles: ["name", "target_url", "logo_media"],
  sponsor_main_banner: ["media", "target_url"],
  influencer_collage: ["media"],
  influencer_profiles: ["name", "role", "description", "cover_media", "instagram_url", "facebook_url", "youtube_url", "tiktok_url"],
  sales_panels: ["title", "subtitle", "price", "cover_media"],
  merch_gallery: ["title", "media"],
  footer_marquee: ["label", "logo_media", "target_url"]
};

function getVisibleSectionFields(sectionKey: string, fields: Record<string, CmsFieldValue>) {
  const allowed = new Set(sectionFieldKeys[sectionKey] || []);

  return Object.values(fields)
    .filter((field) => field.isVisible && (allowed.size === 0 || allowed.has(field.fieldKey)))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function getVisibleGroupFields(groupKey: string, fields: Record<string, CmsFieldValue>) {
  const allowed = new Set(groupFieldKeys[groupKey] || []);

  return Object.values(fields)
    .filter((field) => field.isVisible && (allowed.size === 0 || allowed.has(field.fieldKey)))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export default async function AdminDisenoWebPage({ searchParams }: AdminDisenoWebPageProps) {
  await requireAdmin();
  let mediaAssets = [] as Awaited<ReturnType<typeof getMediaAssets>>;
  let mediaCollections = [] as Awaited<ReturnType<typeof getMediaCollections>>;
  let sectionBindings = [] as Awaited<ReturnType<typeof getSectionBindings>>;
  let avatarPresets = [] as Awaited<ReturnType<typeof getAvatarPresets>>;
  let homeConfig: Awaited<ReturnType<typeof getCmsPageConfig>> = null;
  let loadError: string | null = null;

  try {
    [mediaAssets, mediaCollections, sectionBindings, avatarPresets, homeConfig] = await Promise.all([
      getMediaAssets(120),
      getMediaCollections(20),
      getSectionBindings(20),
      getAvatarPresets(),
      getCmsPageConfig("home")
    ]);
  } catch (error) {
    loadError = error instanceof Error ? error.message : "No se pudo cargar la configuracion del editor.";
  }

  let errorMessage: string | null = null;

  if (searchParams?.error) {
    try {
      errorMessage = decodeURIComponent(searchParams.error);
    } catch {
      errorMessage = searchParams.error;
    }
  }

  return (
    <DashboardShell navItems={controlNavItems} subtitle="Sitio, assets y secciones" title="Diseno web">
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      {loadError ? <Alert severity="warning">{loadError}</Alert> : null}

      <Stack spacing={1.5}>
        <Typography variant="h2">Subir asset a Supabase</Typography>
        <Typography color="text.secondary">
          Carga aqui mismo la imagen al bucket `lodoland-media`. La ruta se genera sola y despues queda lista para
          asignarse a cualquier seccion.
        </Typography>

        <form action={registerMediaAssetAction} autoComplete="off" encType="multipart/form-data">
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(12, minmax(0, 1fr))" } }}>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 6" } }}>
              <Stack spacing={0.75}>
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Archivo</Typography>
                <Box
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    px: 1.5,
                    py: 1.25
                  }}
                >
                  <input
                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                    name="file"
                    required
                    style={{ width: "100%" }}
                    type="file"
                  />
                </Box>
                <Typography color="text.secondary" variant="caption">
                  Formato recomendado: WebP, PNG o JPG. Maximo 10 MB.
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField autoComplete="off" defaultValue="home/general" helperText="Carpeta dentro del bucket." label="Seccion / carpeta" name="folder" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
              <TextField autoComplete="off" helperText="Opcional. Si lo dejas vacio se genera automaticamente." label="Ruta manual" name="path" placeholder="home/evento/flayer-principal.webp" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField autoComplete="off" label="Titulo" name="title" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField autoComplete="off" label="Alt" name="altText" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
              <TextField autoComplete="off" disabled label="Bucket" value="lodoland-media" />
            </Box>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <FormControlLabel control={<Checkbox name="isPublic" />} label="Visible publicamente" />
                <Button type="submit" variant="contained">
                  Subir y registrar asset
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
        <Typography color="text.secondary">Aqui solo aparecen los campos que la home usa realmente.</Typography>

        {homeConfig ? (
          <Stack spacing={3}>
            {editorSectionOrder
              .map((sectionKey) => homeConfig.sections[sectionKey])
              .filter((section): section is NonNullable<(typeof homeConfig.sections)[string]> => Boolean(section))
              .map((section) => (
                <Box
                  key={section.id}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    background: (theme) =>
                      theme.palette.mode === "dark"
                        ? "linear-gradient(180deg, rgba(26,35,50,0.92), rgba(18,26,39,0.92))"
                        : "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(244,247,252,0.98))",
                    overflow: "hidden"
                  }}
                >
                  <Box
                    sx={{
                      px: { xs: 2, md: 2.5 },
                      py: 1.5,
                      borderBottom: 1,
                      borderColor: "divider",
                      background:
                        "linear-gradient(90deg, rgba(124,77,255,0.18), rgba(0,188,212,0.14), rgba(255,193,7,0.18))"
                    }}
                  >
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} useFlexGap justifyContent="space-between">
                      <Typography variant="h3">{section.label}</Typography>
                      <Chip label={section.sectionKey} size="small" />
                    </Stack>
                  </Box>

                  <Stack spacing={2} sx={{ p: { xs: 2, md: 2.5 } }}>
                    {getVisibleSectionFields(section.sectionKey, section.fields).length ? (
                      <Box
                        sx={{
                          display: "grid",
                          gap: 2,
                          gridTemplateColumns: { xs: "1fr", xl: "repeat(2, minmax(0, 1fr))" }
                        }}
                      >
                        {getVisibleSectionFields(section.sectionKey, section.fields).map((field) => (
                          <Box
                            key={field.id}
                            sx={{
                              border: 1,
                              borderColor: "divider",
                              bgcolor: "background.paper",
                              p: 2
                            }}
                          >
                            <CmsFieldEditor
                              action={updateSectionFieldAction}
                              field={field}
                              helperText={getFieldHint(section.sectionKey, field.fieldKey)}
                              mediaAssets={mediaAssets}
                            />
                          </Box>
                        ))}
                      </Box>
                    ) : null}

                    {Object.values(section.groups)
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .filter((group) => getVisibleGroupFields(group.groupKey, group.items[0]?.fields || {}).length || group.items.some((item) => getVisibleGroupFields(group.groupKey, item.fields).length))
                      .map((group) => (
                        <Box key={group.id} sx={{ display: "grid", gap: 1.5 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.25,
                              py: 1,
                              borderTop: 1,
                              borderBottom: 1,
                              borderColor: "divider",
                              background:
                                "linear-gradient(90deg, rgba(255,255,255,0), rgba(124,77,255,0.08), rgba(0,188,212,0.08), rgba(255,255,255,0))"
                            }}
                          >
                            <Box sx={{ width: 42, height: 4, bgcolor: "primary.main" }} />
                            <Typography variant="h3">{group.label}</Typography>
                            <Chip label={group.groupKey} size="small" />
                          </Box>

                          <Box
                            sx={{
                              display: "grid",
                              gap: 2,
                              gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" }
                            }}
                          >
                            {group.items.map((item) => {
                              const visibleFields = getVisibleGroupFields(group.groupKey, item.fields);

                              if (!visibleFields.length) {
                                return null;
                              }

                              return (
                                <Box
                                  key={item.id}
                                  sx={{
                                    border: 1,
                                    borderColor: "divider",
                                    bgcolor: "background.paper",
                                    p: 2,
                                    display: "grid",
                                    gap: 1.5
                                  }}
                                >
                                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} useFlexGap justifyContent="space-between">
                                    <Typography sx={{ fontWeight: 700 }}>{item.label}</Typography>
                                    <Chip label={item.itemKey} size="small" />
                                  </Stack>

                                  <Box sx={{ display: "grid", gap: 1.5 }}>
                                    {visibleFields.map((field) => (
                                      <Box
                                        key={field.id}
                                        sx={{
                                          border: 1,
                                          borderColor: "divider",
                                          bgcolor: "background.default",
                                          p: 1.5
                                        }}
                                      >
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
                              );
                            })}
                          </Box>
                        </Box>
                      ))}
                  </Stack>
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
    "menu_overlay.menu_links.label": "Texto que se vera en el menu principal.",
    "menu_overlay.menu_links.url": "Ancla o ruta. Ejemplo: #ventas o /login.",
    "evento_reciente.hero_image_alt": "Texto alternativo del flyer del proximo evento.",
    "evento_reciente.official_sponsor_modal.media": "Imagen grande del patrocinador oficial. Recomendado: 1800x2200 px.",
    "evento_reciente.event_side_banner.media": "Banner vertical recomendado: 1080x1920 px.",
    "redes_sociales.social_profiles.embed_url": "Usa una URL publica de embed. Si no existe, deja solo la preview.",
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
