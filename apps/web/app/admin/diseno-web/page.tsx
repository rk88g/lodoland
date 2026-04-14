import { Alert, Box, Button, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { DashboardShell } from "../../../components/dashboard-shell";
import { DesignWebEditorShell } from "../../../components/design-web-editor-shell";
import { ManagedGroupEditor } from "../../../components/managed-group-editor";
import { requireAdmin } from "../../../lib/auth/session";
import { getCmsPageConfig, type CmsFieldValue } from "../../../lib/data/cms";
import { getMediaAssets, getMediaAssetsByPrefix } from "../../../lib/data/portal";
import { controlNavItems } from "../../../lib/navigation";
import { createClient } from "../../../lib/supabase/server";
import {
  deleteInfluencerCollageAssetAction,
  registerMediaAssetAction,
  saveHomeSectionAction,
  toggleInfluencerCollageAssetAction,
  uploadInfluencerCollageAssetAction
} from "./actions";

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
  evento_reciente: ["title", "description", "primary_cta_label", "secondary_cta_label", "hero_media"],
  patrocinadores: ["title", "description", "banner_alt"],
  influencers: ["modal_button_label", "modal_title"],
  merch_destacado: ["title", "catalog_button_label"],
  footer: ["title", "description", "privacy_label", "contact_label", "terms_label"]
};

const sponsorFormSchema = [
  { key: "name", label: "Nombre", type: "text", required: true },
  { key: "target_url", label: "Link", type: "link" },
  { key: "logo_media", label: "Asset ID logo", type: "image", helperText: "Logo o imagen del patrocinador." },
  { key: "background_color", label: "Color fondo", type: "color" },
  { key: "accent_color", label: "Color acento", type: "color" }
] as const;

const influencerFormSchema = [
  { key: "name", label: "Nombre", type: "text", required: true },
  { key: "role", label: "Rol", type: "text" },
  { key: "cover_media", label: "Asset ID foto", type: "image", helperText: "Imagen individual del influencer." },
  { key: "instagram_url", label: "Instagram", type: "link" },
  { key: "facebook_url", label: "Facebook", type: "link" },
  { key: "youtube_url", label: "YouTube", type: "link" },
  { key: "tiktok_url", label: "TikTok", type: "link" },
  { key: "description", label: "Descripcion", type: "textarea" }
] as const;

const groupFieldKeys: Record<string, string[]> = {
  menu_links: ["label", "url"],
  official_sponsor_modal: ["title", "description", "website_label", "website_url", "social_label", "social_url", "media"],
  event_side_banner: ["media", "target_url"],
  social_profiles: ["platform", "target_url", "embed_url", "preview_media"],
  sponsor_main_banner: ["media", "target_url"],
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
  const supabase = createClient();

  let homeConfig: Awaited<ReturnType<typeof getCmsPageConfig>> = null;
  let mediaAssets = [] as Awaited<ReturnType<typeof getMediaAssets>>;
  let influencerFolderAssets = [] as Awaited<ReturnType<typeof getMediaAssetsByPrefix>>;
  let sponsorRows: Array<{
    id: string;
    name: string;
    website_url: string | null;
    logo_asset_id: string | null;
    background_color: string | null;
    accent_color: string | null;
    sort_order: number;
  }> = [];
  let influencerRows: Array<{
    id: string;
    display_name: string;
    headline: string | null;
    bio: string | null;
    cover_asset_id: string | null;
    instagram_url: string | null;
    facebook_url: string | null;
    youtube_url: string | null;
    tiktok_url: string | null;
    sort_order: number;
  }> = [];
  let loadError: string | null = null;

  try {
    [homeConfig, mediaAssets, influencerFolderAssets] = await Promise.all([
      getCmsPageConfig("home", { includeMedia: false }),
      getMediaAssets(120),
      getMediaAssetsByPrefix("home/influencers/collage/", 240)
    ]);

    const sponsorSectionId = homeConfig?.sections.patrocinadores?.id || null;
    const influencerSectionId = homeConfig?.sections.influencers?.id || null;

    if (sponsorSectionId) {
      const { data } = await supabase
        .from("home_sponsors")
        .select("id, name, website_url, logo_asset_id, background_color, accent_color, sort_order")
        .eq("section_id", sponsorSectionId)
        .order("sort_order", { ascending: true });
      sponsorRows = data || [];
    }

    if (influencerSectionId) {
      const { data } = await supabase
        .from("home_influencers")
        .select("id, display_name, headline, bio, cover_asset_id, instagram_url, facebook_url, youtube_url, tiktok_url, sort_order")
        .eq("section_id", influencerSectionId)
        .order("sort_order", { ascending: true });
      influencerRows = data || [];
    }
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
  const sectionLinks = editorSectionOrder.map((sectionKey) => ({
    id: `section-${sectionKey}`,
    label:
      homeConfig?.sections[sectionKey]?.label ||
      sectionKey
  }));

  try {
    homeEditorContent = homeConfig ? (
      <Stack spacing={3}>
        {editorSectionOrder
          .map((sectionKey) => homeConfig.sections[sectionKey])
          .filter((section): section is NonNullable<(typeof homeConfig.sections)[string]> => Boolean(section))
          .map((section) => (
            <Box
              id={`section-${section.sectionKey}`}
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
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                  <Typography variant="h3">{section.label}</Typography>
                  <Button data-loading-label={`Guardando ${section.label}...`} form={`section-form-${section.id}`} type="submit" variant="contained">
                    Guardar {section.label}
                  </Button>
                </Stack>
              </Box>

              <Box
                sx={{ display: "grid", gap: 2 }}
              >
                <Box
                  component="form"
                  action={saveHomeSectionAction}
                  autoComplete="off"
                  data-blocking-form="true"
                  data-loading-label={`Guardando ${section.label}...`}
                  id={`section-form-${section.id}`}
                  sx={{ display: "grid" }}
                >
                  <input name="sectionKey" type="hidden" value={section.sectionKey} />
                  <input name="sectionLabel" type="hidden" value={section.label} />
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
                            <CmsFieldEditor field={field} helperText={getFieldHint(section.sectionKey, field.fieldKey)} scope="section" />
                          </Box>
                        ))}
                      </Box>
                    ) : null}

                    {Object.values(section.groups)
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .filter((group) => !["sponsor_tiles", "influencer_profiles", "influencer_collage"].includes(group.groupKey))
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
                                        <CmsFieldEditor field={field} helperText={getFieldHint(section.sectionKey, `${group.groupKey}.${field.fieldKey}`)} scope="group" />
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

                <Box sx={{ px: { xs: 2, md: 2.5 }, pb: { xs: 2, md: 2.5 }, display: "grid", gap: 2.5 }}>
                {section.sectionKey === "patrocinadores" ? (
                  <ManagedGroupEditor
                    formAnchor="sponsors-manager-form"
                    entityKind="sponsor"
                    items={sponsorRows.map((item) => ({
                      id: item.id,
                      label: item.name,
                      assetId: item.logo_asset_id || null,
                      primaryDetail: item.website_url || "Sin link",
                      values: {
                        name: item.name || "",
                        target_url: item.website_url || "",
                        logo_media: item.logo_asset_id || "",
                        background_color: item.background_color || "#111827",
                        accent_color: item.accent_color || "#22c55e"
                      }
                    }))}
                    sectionKey="patrocinadores"
                    singularTitle="Patrocinador"
                    schema={[...sponsorFormSchema]}
                    title="Patrocinadores"
                    />
                ) : null}

                {section.sectionKey === "influencers" ? (
                  <Stack spacing={2.5}>
                    {(() => {
                      const collageGroup =
                        Object.values(section.groups).find((group) => group.groupKey === "influencer_collage") || null;

                      return (
                        <>
                    <ManagedGroupEditor
                      formAnchor="influencers-manager-form"
                      entityKind="influencer"
                      items={influencerRows.map((item) => ({
                        id: item.id,
                        label: item.display_name,
                        assetId: item.cover_asset_id || null,
                        primaryDetail: item.headline || "Sin rol",
                        badges: ["instagram_url", "facebook_url", "youtube_url", "tiktok_url"]
                          .filter((key) => Boolean(item[key as keyof typeof item]))
                          .map((key) => key.replace("_url", "")),
                        values: {
                          name: item.display_name || "",
                          role: item.headline || "",
                          description: item.bio || "",
                          cover_media: item.cover_asset_id || "",
                          instagram_url: item.instagram_url || "",
                          facebook_url: item.facebook_url || "",
                          youtube_url: item.youtube_url || "",
                          tiktok_url: item.tiktok_url || ""
                        }
                      }))}
                      sectionKey="influencers"
                      singularTitle="Influencer"
                      schema={[...influencerFormSchema]}
                      title="Influencers"
                    />

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
                      <Typography variant="h3">Collage de influencers</Typography>
                    </Box>

                    <Box sx={{ overflowX: "auto", border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Estado</TableCell>
                            <TableCell>Titulo</TableCell>
                            <TableCell>Asset ID</TableCell>
                            <TableCell>Ruta</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {influencerFolderAssets.length ? (
                            influencerFolderAssets.map((asset) => {
                              const groupItem =
                                collageGroup?.items.find(
                                  (item) => item.fields.media?.mediaAssetId === asset.id
                                ) || null;

                              return (
                                <TableRow key={asset.id}>
                                  <TableCell>{groupItem?.isVisible === false ? "Inactiva" : "Activa"}</TableCell>
                                  <TableCell>{asset.title || "Sin titulo"}</TableCell>
                                  <TableCell>{asset.id}</TableCell>
                                  <TableCell sx={{ maxWidth: 300, wordBreak: "break-all" }}>{asset.path}</TableCell>
                                  <TableCell align="right">
                                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end" spacing={1}>
                                      {groupItem ? (
                                        <form action={toggleInfluencerCollageAssetAction} data-blocking-form="true" data-loading-label="Actualizando collage...">
                                          <input name="itemId" type="hidden" value={groupItem.id} />
                                          <input name="nextVisible" type="hidden" value={groupItem.isVisible ? "false" : "true"} />
                                          <Button size="small" type="submit" variant="outlined">
                                            {groupItem.isVisible ? "Desactivar" : "Activar"}
                                          </Button>
                                        </form>
                                      ) : null}
                                      <form action={deleteInfluencerCollageAssetAction} data-blocking-form="true" data-loading-label="Eliminando imagen...">
                                        <input name="itemId" type="hidden" value={groupItem?.id || ""} />
                                        <input name="mediaAssetId" type="hidden" value={asset.id} />
                                        <input name="path" type="hidden" value={asset.path} />
                                        <Button color="error" size="small" type="submit" variant="outlined">
                                          Eliminar
                                        </Button>
                                      </form>
                                    </Stack>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5}>
                                <Typography color="text.secondary">Todavia no hay imagenes en la carpeta del collage.</Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </Box>

                    <Box
                      component="form"
                      action={uploadInfluencerCollageAssetAction}
                      autoComplete="off"
                      data-blocking-form="true"
                      data-loading-label="Subiendo imagen del collage..."
                      sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper", p: 2.5, display: "grid", gap: 2 }}
                    >
                      <Typography variant="h3">Agregar imagen al collage</Typography>
                      <Typography color="text.secondary">
                        La imagen se guarda en la carpeta `home/influencers/collage` y queda activa para la rotacion aleatoria.
                      </Typography>
                      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
                        <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 1" } }}>
                          <Stack spacing={0.75}>
                            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Archivo</Typography>
                            <Box
                              sx={{
                                border: 1,
                                borderColor: "divider",
                                bgcolor: "background.default",
                                px: 1.5,
                                py: 1.25
                              }}
                            >
                              <input accept="image/png,image/jpeg,image/webp,image/gif" name="file" required style={{ width: "100%" }} type="file" />
                            </Box>
                          </Stack>
                        </Box>
                        <TextField autoComplete="off" label="Titulo" name="title" />
                        <Box sx={{ gridColumn: "1 / -1" }}>
                          <TextField autoComplete="off" label="Alt" name="altText" />
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button type="submit" variant="contained">
                          Subir imagen al collage
                        </Button>
                      </Box>
                    </Box>
                        </>
                      );
                    })()}
                  </Stack>
                ) : null}
                </Box>
              </Box>
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
      <DesignWebEditorShell
        assets={mediaAssets.map((asset) => ({ id: asset.id, title: asset.title, path: asset.path }))}
        errorMessage={errorMessage}
        loadError={loadError}
        sectionLinks={sectionLinks}
        successMessage={successMessage}
      >
        <Stack spacing={1.5}>
          <Typography variant="h2">Assets</Typography>

          <form
            action={registerMediaAssetAction}
            autoComplete="off"
            data-blocking-form="true"
            data-loading-label="Subiendo asset..."
            encType="multipart/form-data"
          >
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
                    Formato recomendado: WebP, PNG o JPG. Maximo 10 MB. Se publica automaticamente para la web.
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
                  <Button data-loading-label="Subiendo asset..." type="submit" variant="contained">
                    Subir y registrar asset
                  </Button>
                </Stack>
              </Box>
            </Box>
          </form>
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="h2">Portada</Typography>
          {homeEditorContent}
        </Stack>
      </DesignWebEditorShell>
    </DashboardShell>
  );
}

type CmsFieldEditorProps = {
  field: CmsFieldValue;
  helperText?: string;
  scope: "section" | "group";
};

function CmsFieldEditor({ field, helperText, scope }: CmsFieldEditorProps) {
  const inputName = `field::${scope}::${field.id}::${field.kind}`;

  return (
    <Stack spacing={1.25}>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {field.label}
      </Typography>

      {field.kind === "link" ? (
        <TextField autoComplete="off" defaultValue={field.linkUrl || ""} helperText={helperText} label="URL" name={inputName} />
      ) : field.kind === "image" ? (
        <TextField
          autoComplete="off"
          defaultValue={field.mediaAssetId || ""}
          helperText={helperText || "Pega aqui el ID del asset ya cargado en Supabase Storage."}
          label="Asset ID"
          name={inputName}
        />
      ) : (
        <TextField
          autoComplete="off"
          defaultValue={field.textValue || ""}
          helperText={helperText}
          label="Valor"
          multiline={field.kind === "textarea" || field.kind === "richtext"}
          minRows={field.kind === "textarea" || field.kind === "richtext" ? 3 : undefined}
          name={inputName}
        />
      )}
    </Stack>
  );
}

function getFieldHint(sectionKey: string, fieldKey: string) {
    const hints: Record<string, string> = {
      "menu_overlay.menu_links.label": "Texto que se vera en el menu principal.",
      "menu_overlay.menu_links.url": "Ancla o ruta. Ejemplo: #ventas o /login.",
      "evento_reciente.hero_media": "Asset ID de la imagen gigante principal del evento.",
      "evento_reciente.official_sponsor_modal.media": "Asset ID de la imagen grande del patrocinador oficial.",
    "evento_reciente.event_side_banner.media": "Asset ID del banner vertical del evento.",
    "redes_sociales.social_profiles.embed_url": "Usa una URL publica de embed. Si no existe, deja solo la preview.",
    "redes_sociales.social_profiles.preview_media": "Asset ID de la preview vertical de la red social.",
    "patrocinadores.sponsor_main_banner.media": "Asset ID del banner horizontal principal.",
    "ventas_destacadas.sales_panels.cover_media": "Asset ID del panel de venta.",
    "merch_destacado.merch_gallery.media": "Asset ID de la imagen del producto.",
    "footer.footer_marquee.logo_media": "Asset ID del logo del footer."
  };

  const normalized = fieldKey
    .replace(/^event_side_banner\./, "evento_reciente.event_side_banner.")
    .replace(/^social_profiles\./, "redes_sociales.social_profiles.")
    .replace(/^sponsor_main_banner\./, "patrocinadores.sponsor_main_banner.")
    .replace(/^sales_panels\./, "ventas_destacadas.sales_panels.")
    .replace(/^merch_gallery\./, "merch_destacado.merch_gallery.")
    .replace(/^footer_marquee\./, "footer.footer_marquee.");

  return hints[`${sectionKey}.${fieldKey}`] || hints[normalized];
}
