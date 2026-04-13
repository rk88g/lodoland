import { Alert, Box, Button, Checkbox, FormControlLabel, Stack, TextField, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { DashboardShell } from "../../../components/dashboard-shell";
import { requireAdmin } from "../../../lib/auth/session";
import { getCmsPageConfig, type CmsFieldValue } from "../../../lib/data/cms";
import { controlNavItems } from "../../../lib/navigation";
import { registerMediaAssetAction, updateGroupItemFieldAction, updateSectionFieldAction } from "./actions";

export const dynamic = "force-dynamic";

type AdminDisenoWebPageProps = {
  searchParams?: {
    error?: string;
    success?: string;
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
  sponsor_tiles: ["name", "target_url", "logo_media", "background_color", "accent_color"],
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

  let homeConfig: Awaited<ReturnType<typeof getCmsPageConfig>> = null;
  let loadError: string | null = null;

  try {
    homeConfig = await getCmsPageConfig("home", { includeMedia: false });
  } catch (error) {
    console.error("[admin/diseno-web] load error", error);
    loadError = error instanceof Error ? error.message : "No se pudo cargar la configuracion del editor.";
  }

  let errorMessage: string | null = null;
  let successMessage: string | null = null;

  if (searchParams?.error) {
    try {
      errorMessage = decodeURIComponent(searchParams.error);
    } catch {
      errorMessage = searchParams.error;
    }
  }

  if (searchParams?.success) {
    try {
      successMessage = decodeURIComponent(searchParams.success);
    } catch {
      successMessage = searchParams.success;
    }
  }

  let homeEditorContent: ReactNode = null;

  try {
    homeEditorContent = homeConfig ? (
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
                background: "linear-gradient(180deg, rgba(26,35,50,0.92), rgba(18,26,39,0.92))",
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
                <Typography variant="h3">{section.label}</Typography>
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
                        />
                      </Box>
                    ))}
                  </Box>
                ) : null}

                {Object.values(section.groups)
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .filter(
                    (group) =>
                      getVisibleGroupFields(group.groupKey, group.items[0]?.fields || {}).length ||
                      group.items.some((item) => getVisibleGroupFields(group.groupKey, item.fields).length)
                  )
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
                              <Typography sx={{ fontWeight: 700 }}>{item.label}</Typography>

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
    );
  } catch (error) {
    console.error("[admin/diseno-web] render error", error);
    homeEditorContent = (
      <Alert severity="error">
        La configuracion del home cargo con un dato invalido y no pudo renderizarse por completo. Revisa los logs del
        servidor para el detalle tecnico.
      </Alert>
    );
  }

  return (
    <DashboardShell navItems={controlNavItems} subtitle="Sitio, textos y assets" title="Diseno web">
      {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      {loadError ? <Alert severity="warning">{loadError}</Alert> : null}

      <Stack spacing={1.5}>
        <Typography variant="h2">Subir asset a Supabase</Typography>
        <Typography color="text.secondary">
          Sube una imagen por vez al bucket `lodoland-media`. Aqui no se muestran previews; solo se registra el asset
          para usarlo despues en la web.
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
              <TextField autoComplete="off" disabled label="Bucket" value="lodoland-media" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 6" } }}>
              <TextField autoComplete="off" label="Titulo" name="title" />
            </Box>
            <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 6" } }}>
              <TextField autoComplete="off" label="Alt" name="altText" />
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
        <Typography variant="h2">Configuracion de portada</Typography>
        <Typography color="text.secondary">
          Aqui solo aparecen los campos que la home usa realmente. Para imagenes, pega el `Asset ID` del archivo que
          ya subiste.
        </Typography>
        {homeEditorContent}
      </Stack>
    </DashboardShell>
  );
}

type CmsFieldEditorProps = {
  action: (formData: FormData) => Promise<void>;
  field: CmsFieldValue;
  helperText?: string;
};

function CmsFieldEditor({ action, field, helperText }: CmsFieldEditorProps) {
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
            autoComplete="off"
            defaultValue={field.mediaAssetId || ""}
            helperText={helperText || "Pega aqui el ID del asset ya cargado en Supabase Storage."}
            label="Asset ID"
            name="mediaAssetId"
          />
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
    "evento_reciente.official_sponsor_modal.media": "Asset ID de la imagen grande del patrocinador oficial.",
    "evento_reciente.event_side_banner.media": "Asset ID del banner vertical del evento.",
    "redes_sociales.social_profiles.embed_url": "Usa una URL publica de embed. Si no existe, deja solo la preview.",
    "redes_sociales.social_profiles.preview_media": "Asset ID de la preview vertical de la red social.",
    "patrocinadores.sponsor_tiles.logo_media": "Asset ID del logo del patrocinador.",
    "patrocinadores.sponsor_tiles.background_color": "Color base opcional del patrocinador. Ejemplo: #111827.",
    "patrocinadores.sponsor_tiles.accent_color": "Color de acento opcional. Ejemplo: #22c55e.",
    "patrocinadores.sponsor_main_banner.media": "Asset ID del banner horizontal principal.",
    "influencers.influencer_collage.media": "Asset ID para el collage de influencers.",
    "influencers.influencer_profiles.cover_media": "Asset ID de la foto del influencer.",
    "ventas_destacadas.sales_panels.cover_media": "Asset ID del panel de venta.",
    "merch_destacado.merch_gallery.media": "Asset ID de la imagen del producto.",
    "footer.footer_marquee.logo_media": "Asset ID del logo del footer."
  };

  const normalized = fieldKey
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
