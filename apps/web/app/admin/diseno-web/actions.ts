"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAdminAction } from "../../../lib/audit";
import { requireAdmin } from "../../../lib/auth/session";
import { MEDIA_BUCKET } from "../../../lib/supabase/storage";
import { createClient } from "../../../lib/supabase/server";

const managedGroupDefinitions = {
  sponsor_tiles: {
    entityType: "sponsor_tile",
    summaryLabel: "patrocinador",
    fields: [
      { key: "name", label: "Nombre", kind: "text", sortOrder: 1 },
      { key: "target_url", label: "Link", kind: "link", sortOrder: 2 },
      { key: "logo_media", label: "Logo", kind: "image", sortOrder: 3 },
      { key: "background_color", label: "Color fondo", kind: "text", sortOrder: 4 },
      { key: "accent_color", label: "Color acento", kind: "text", sortOrder: 5 }
    ]
  },
  influencer_profiles: {
    entityType: "influencer_profile",
    summaryLabel: "influencer",
    fields: [
      { key: "name", label: "Nombre", kind: "text", sortOrder: 1 },
      { key: "role", label: "Rol", kind: "text", sortOrder: 2 },
      { key: "description", label: "Descripcion", kind: "textarea", sortOrder: 3 },
      { key: "cover_media", label: "Foto", kind: "image", sortOrder: 4 },
      { key: "instagram_url", label: "Instagram", kind: "link", sortOrder: 5 },
      { key: "facebook_url", label: "Facebook", kind: "link", sortOrder: 6 },
      { key: "youtube_url", label: "YouTube", kind: "link", sortOrder: 7 },
      { key: "tiktok_url", label: "TikTok", kind: "link", sortOrder: 8 }
    ]
  }
} as const;

const INFLUENCER_COLLAGE_FOLDER = "home/influencers/collage";

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildAssetPath(folder: string, originalName: string, customPath: string) {
  if (customPath) {
    return customPath.replace(/^\/+/, "");
  }

  const normalizedFolder = folder
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();

  const extensionMatch = originalName.toLowerCase().match(/\.(png|jpe?g|webp|gif|svg)$/);
  const extension = extensionMatch ? extensionMatch[0] : ".webp";
  const baseName = toSlug(originalName.replace(/\.[^.]+$/, "")) || "asset";

  return `${normalizedFolder}/${Date.now()}-${baseName}-${crypto.randomUUID().slice(0, 8)}${extension}`;
}

const homeEntityDefinitions = {
  sponsor: {
    table: "home_sponsors",
    sectionKey: "patrocinadores",
    entityType: "home_sponsor",
    summaryLabel: "patrocinador"
  },
  influencer: {
    table: "home_influencers",
    sectionKey: "influencers",
    entityType: "home_influencer",
    summaryLabel: "influencer"
  }
} as const;

export async function registerMediaAssetAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const customPath = String(formData.get("path") ?? "").trim();
  const folder = String(formData.get("folder") ?? "").trim() || "home/general";
  const title = String(formData.get("title") ?? "").trim();
  const altText = String(formData.get("altText") ?? "").trim();
  const file = formData.get("file");

  let path = customPath;

  if (file instanceof File && file.size > 0) {
    path = buildAssetPath(folder, file.name || title || "asset", customPath);

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, Buffer.from(arrayBuffer), {
        cacheControl: "3600",
        contentType: file.type || "application/octet-stream",
        upsert: false
      });

    if (uploadError) {
      redirect(`/admin/diseno-web?error=${encodeURIComponent(uploadError.message)}`);
    }
  }

  if (!path) {
    redirect("/admin/diseno-web?error=Debes subir un archivo o indicar la ruta del asset.");
  }

  const { error } = await supabase.from("media_assets").insert({
    bucket: MEDIA_BUCKET,
    path,
    title: title || null,
    alt_text: altText || null,
    is_public: true,
    created_by: session.profile?.id || null
  });

  if (error) {
    redirect(`/admin/diseno-web?error=${encodeURIComponent(error.message)}`);
  }

  await logAdminAction({
    supabase,
    actorUserId: session.profile?.id,
    entityType: "media_asset",
    action: "create",
    summary: "Registro de asset en diseno web",
    payload: {
      bucket: MEDIA_BUCKET,
      path,
      title: title || null,
      isPublic: true
    }
  });

  revalidatePath("/admin/diseno-web");
  revalidatePath("/");
  redirect("/admin/diseno-web?success=Asset%20subido%20y%20registrado%20correctamente.");
}

export async function createMediaCollectionAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const label = String(formData.get("label") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const slug = toSlug(String(formData.get("slug") ?? "") || label);

  if (!label || !slug) {
    redirect("/admin/diseno-web?error=Debes indicar nombre y slug de la coleccion.");
  }

  const { error } = await supabase.from("media_collections").insert({
    slug,
    label,
    description: description || null,
    created_by: session.profile?.id || null,
    updated_by: session.profile?.id || null
  });

  if (error) {
    redirect(`/admin/diseno-web?error=${encodeURIComponent(error.message)}`);
  }

  await logAdminAction({
    supabase,
    actorUserId: session.profile?.id,
    entityType: "media_collection",
    action: "create",
    summary: "Alta de coleccion de medios",
    payload: {
      slug,
      label
    }
  });

  revalidatePath("/admin/diseno-web");
  redirect("/admin/diseno-web?success=Coleccion%20creada%20correctamente.");
}

export async function createAvatarPresetAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const label = String(formData.get("label") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const backgroundColor = String(formData.get("backgroundColor") ?? "").trim();
  const accentColor = String(formData.get("accentColor") ?? "").trim();
  const slug = toSlug(String(formData.get("slug") ?? "") || label);

  if (!label || !slug) {
    redirect("/admin/diseno-web?error=Debes indicar nombre y slug del avatar.");
  }

  const { error } = await supabase.from("avatar_presets").insert({
    slug,
    label,
    description: description || null,
    background_color: backgroundColor || null,
    accent_color: accentColor || null
  });

  if (error) {
    redirect(`/admin/diseno-web?error=${encodeURIComponent(error.message)}`);
  }

  await logAdminAction({
    supabase,
    actorUserId: session.profile?.id,
    entityType: "avatar_preset",
    action: "create",
    summary: "Alta de avatar predefinido",
    payload: {
      slug,
      label
    }
  });

  revalidatePath("/admin/diseno-web");
  redirect("/admin/diseno-web?success=Avatar%20creado%20correctamente.");
}

export async function updateSectionFieldAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const fieldId = String(formData.get("fieldId") ?? "").trim();
  const kind = String(formData.get("kind") ?? "").trim();
  const textValue = String(formData.get("textValue") ?? "").trim();
  const linkUrl = String(formData.get("linkUrl") ?? "").trim();
  const mediaAssetId = String(formData.get("mediaAssetId") ?? "").trim();

  if (!fieldId) {
    redirect("/admin/diseno-web?error=No se encontro el campo a actualizar.");
  }

  const payload: Record<string, unknown> = {
    updated_by: session.profile?.id || null
  };

  if (kind === "link") {
    payload.link_url = linkUrl || null;
  } else if (kind === "image") {
    payload.media_asset_id = mediaAssetId || null;
  } else {
    payload.text_value = textValue || null;
  }

  const { error } = await supabase.from("cms_section_fields").update(payload).eq("id", fieldId);

  if (error) {
    redirect(`/admin/diseno-web?error=${encodeURIComponent(error.message)}`);
  }

  await logAdminAction({
    supabase,
    actorUserId: session.profile?.id,
    entityType: "cms_section_field",
    entityId: fieldId,
    action: "update",
    summary: `Actualizacion de campo de seccion (${kind})`,
    payload: {
      kind,
      textValue: textValue || null,
      linkUrl: linkUrl || null,
      mediaAssetId: mediaAssetId || null
    }
  });

  revalidatePath("/admin/diseno-web");
  revalidatePath("/");
  redirect("/admin/diseno-web?success=Campo%20actualizado%20correctamente.");
}

export async function updateGroupItemFieldAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const fieldId = String(formData.get("fieldId") ?? "").trim();
  const kind = String(formData.get("kind") ?? "").trim();
  const textValue = String(formData.get("textValue") ?? "").trim();
  const linkUrl = String(formData.get("linkUrl") ?? "").trim();
  const mediaAssetId = String(formData.get("mediaAssetId") ?? "").trim();

  if (!fieldId) {
    redirect("/admin/diseno-web?error=No se encontro el campo del item a actualizar.");
  }

  const payload: Record<string, unknown> = {
    updated_by: session.profile?.id || null
  };

  if (kind === "link") {
    payload.link_url = linkUrl || null;
  } else if (kind === "image") {
    payload.media_asset_id = mediaAssetId || null;
  } else {
    payload.text_value = textValue || null;
  }

  const { error } = await supabase.from("cms_group_item_fields").update(payload).eq("id", fieldId);

  if (error) {
    redirect(`/admin/diseno-web?error=${encodeURIComponent(error.message)}`);
  }

  await logAdminAction({
    supabase,
    actorUserId: session.profile?.id,
    entityType: "cms_group_item_field",
    entityId: fieldId,
    action: "update",
    summary: `Actualizacion de campo de item (${kind})`,
    payload: {
      kind,
      textValue: textValue || null,
      linkUrl: linkUrl || null,
      mediaAssetId: mediaAssetId || null
    }
  });

  revalidatePath("/admin/diseno-web");
  revalidatePath("/");
  redirect("/admin/diseno-web?success=Campo%20actualizado%20correctamente.");
}

function buildCmsFieldPayload(kind: string, value: string) {
  const payload: Record<string, unknown> = {};

  if (kind === "link") {
    payload.link_url = value || null;
  } else if (kind === "image") {
    payload.media_asset_id = value || null;
  } else {
    payload.text_value = value || null;
  }

  return payload;
}

export async function saveHomeSectionAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const sectionKey = String(formData.get("sectionKey") ?? "").trim();
  const sectionLabel = String(formData.get("sectionLabel") ?? "").trim() || sectionKey;
  const pendingUpdates: Array<{
    scope: "section" | "group";
    fieldId: string;
    kind: string;
    value: string;
  }> = [];

  for (const [key, rawValue] of formData.entries()) {
    if (!key.startsWith("field::") || typeof rawValue !== "string") {
      continue;
    }

    const [, scope, fieldId, kind] = key.split("::");

    if (!fieldId || !kind || (scope !== "section" && scope !== "group")) {
      continue;
    }

    pendingUpdates.push({
      scope,
      fieldId,
      kind,
      value: rawValue.trim()
    });
  }

  if (!pendingUpdates.length) {
    redirect("/admin/diseno-web?error=No%20hay%20campos%20para%20guardar%20en%20esta%20seccion.");
  }

  for (const update of pendingUpdates) {
    const table = update.scope === "section" ? "cms_section_fields" : "cms_group_item_fields";
    const payload = {
      ...buildCmsFieldPayload(update.kind, update.value),
      updated_by: session.profile?.id || null
    };

    const { error } = await supabase.from(table).update(payload).eq("id", update.fieldId);

    if (error) {
      redirect(`/admin/diseno-web?error=${encodeURIComponent(error.message)}`);
    }
  }

  const referencedMediaIds = pendingUpdates
    .filter((update) => update.kind === "image" && update.value)
    .map((update) => update.value);

  if (referencedMediaIds.length) {
    const { error: mediaError } = await supabase
      .from("media_assets")
      .update({
        is_public: true
      })
      .in("id", referencedMediaIds);

    if (mediaError) {
      redirect(`/admin/diseno-web?error=${encodeURIComponent(mediaError.message)}`);
    }
  }

  await logAdminAction({
    supabase,
    actorUserId: session.profile?.id,
    entityType: "cms_section",
    action: "bulk_update",
    summary: `Actualizacion de seccion ${sectionLabel}`,
    payload: {
      sectionKey,
      totalFields: pendingUpdates.length,
      fieldIds: pendingUpdates.map((item) => item.fieldId)
    }
  });

  revalidatePath("/admin/diseno-web");
  revalidatePath("/");
  redirect(`/admin/diseno-web?success=${encodeURIComponent(`Se guardo correctamente la seccion ${sectionLabel}.`)}`);
}

export async function upsertManagedGroupItemAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const groupKey = String(formData.get("groupKey") ?? "").trim() as keyof typeof managedGroupDefinitions;
  const itemId = String(formData.get("itemId") ?? "").trim();
  const returnAnchor = String(formData.get("returnAnchor") ?? "").trim() || "section-diseno-web";
  const labelSource = String(formData.get("name") ?? formData.get("label") ?? "").trim();
  const definition = managedGroupDefinitions[groupKey];

  if (!definition) {
    redirect("/admin/diseno-web?error=No%20se%20reconocio%20el%20grupo%20a%20guardar.");
  }

  if (!labelSource) {
    redirect(`/admin/diseno-web?error=${encodeURIComponent("Debes indicar el nombre principal del registro.")}#${returnAnchor}`);
  }

  const { data: groupRow } = await supabase
    .from("cms_item_groups")
    .select("id, label")
    .eq("group_key", groupKey)
    .maybeSingle();

  if (!groupRow) {
    redirect(`/admin/diseno-web?error=${encodeURIComponent("No se encontro el grupo a editar en la configuracion.")}#${returnAnchor}`);
  }

  let resolvedItemId = itemId;

  if (!resolvedItemId) {
    const { data: lastItem } = await supabase
      .from("cms_group_items")
      .select("sort_order")
      .eq("group_id", groupRow.id)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: insertedItem, error: insertItemError } = await supabase
      .from("cms_group_items")
      .insert({
        group_id: groupRow.id,
        item_key: `${toSlug(labelSource)}-${crypto.randomUUID().slice(0, 8)}`,
        label: labelSource,
        slug: toSlug(labelSource) || null,
        sort_order: (lastItem?.sort_order || 0) + 1,
        is_visible: true
      })
      .select("id")
      .single();

    if (insertItemError || !insertedItem) {
      redirect(`/admin/diseno-web?error=${encodeURIComponent(insertItemError?.message || "No se pudo crear el nuevo elemento.")}#${returnAnchor}`);
    }

    resolvedItemId = insertedItem.id;
  } else {
    const { error: updateItemError } = await supabase
      .from("cms_group_items")
      .update({
        label: labelSource,
        slug: toSlug(labelSource) || null
      })
      .eq("id", resolvedItemId);

    if (updateItemError) {
      redirect(`/admin/diseno-web?error=${encodeURIComponent(updateItemError.message)}#${returnAnchor}`);
    }
  }

  const rows = definition.fields.map((field) => {
    const value = String(formData.get(field.key) ?? "").trim();
    const baseRow = {
      item_id: resolvedItemId,
      field_key: field.key,
      label: field.label,
      kind: field.kind,
      locale: "es-MX",
      sort_order: field.sortOrder,
      is_visible: true,
      updated_by: session.profile?.id || null
    } as Record<string, unknown>;

    if (field.kind === "link") {
      baseRow.link_url = value || null;
    } else if (field.kind === "image") {
      baseRow.media_asset_id = value || null;
    } else {
      baseRow.text_value = value || null;
    }

    return baseRow;
  });

  const { error: upsertFieldsError } = await supabase
    .from("cms_group_item_fields")
    .upsert(rows, { onConflict: "item_id,field_key,locale" });

  if (upsertFieldsError) {
    redirect(`/admin/diseno-web?error=${encodeURIComponent(upsertFieldsError.message)}#${returnAnchor}`);
  }

  const referencedMediaIds = rows
    .map((row) => row.media_asset_id)
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  if (referencedMediaIds.length) {
    const { error: mediaError } = await supabase
      .from("media_assets")
      .update({ is_public: true })
      .in("id", referencedMediaIds);

    if (mediaError) {
      redirect(`/admin/diseno-web?error=${encodeURIComponent(mediaError.message)}#${returnAnchor}`);
    }
  }

  await logAdminAction({
    supabase,
    actorUserId: session.profile?.id,
    entityType: definition.entityType,
    entityId: resolvedItemId,
    action: itemId ? "update" : "create",
    summary: `${itemId ? "Actualizacion" : "Alta"} de ${definition.summaryLabel}`,
    payload: {
      groupKey,
      itemId: resolvedItemId,
      label: labelSource
    }
  });

  revalidatePath("/admin/diseno-web");
  revalidatePath("/");
  redirect(`/admin/diseno-web?success=${encodeURIComponent(`Se guardo correctamente el ${definition.summaryLabel}.`)}#${returnAnchor}`);
}

export async function upsertHomeEntityAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const entityKind = String(formData.get("entityKind") ?? "").trim() as keyof typeof homeEntityDefinitions;
  const itemId = String(formData.get("itemId") ?? "").trim();
  const returnAnchor = String(formData.get("returnAnchor") ?? "").trim() || "section-home";
  const definition = homeEntityDefinitions[entityKind];

  if (!definition) {
    redirect(`/admin/diseno-web?error=${encodeURIComponent("No se encontro el tipo de entidad a guardar.")}#${returnAnchor}`);
  }

  const { data: sectionRow } = await supabase
    .from("cms_sections")
    .select("id")
    .eq("section_key", definition.sectionKey)
    .maybeSingle();

  if (!sectionRow) {
    redirect(`/admin/diseno-web?error=${encodeURIComponent("No se encontro la seccion relacionada.")}#${returnAnchor}`);
  }

  if (entityKind === "sponsor") {
    const name = String(formData.get("name") ?? "").trim();
    const targetUrl = String(formData.get("target_url") ?? "").trim();
    const logoMedia = String(formData.get("logo_media") ?? "").trim();
    const backgroundColor = String(formData.get("background_color") ?? "").trim();
    const accentColor = String(formData.get("accent_color") ?? "").trim();

    if (!name) {
      redirect(`/admin/diseno-web?error=${encodeURIComponent("Debes indicar el nombre del patrocinador.")}#${returnAnchor}`);
    }

    const payload = {
      section_id: sectionRow.id,
      name,
      company_name: null,
      website_url: targetUrl || null,
      logo_asset_id: logoMedia || null,
      description: null,
      accent_color: accentColor || null,
      background_color: backgroundColor || null,
      menu_label: name,
      is_menu_featured: true
    };

    if (itemId) {
      const { error } = await supabase.from(definition.table).update(payload).eq("id", itemId);

      if (error) {
        redirect(`/admin/diseno-web?error=${encodeURIComponent(error.message)}#${returnAnchor}`);
      }
    } else {
      const { data: lastRow } = await supabase
        .from(definition.table)
        .select("sort_order")
        .eq("section_id", sectionRow.id)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { error } = await supabase.from(definition.table).insert({
        ...payload,
        sort_order: (lastRow?.sort_order || 0) + 1,
        is_active: true
      });

      if (error) {
        redirect(`/admin/diseno-web?error=${encodeURIComponent(error.message)}#${returnAnchor}`);
      }
    }

    if (logoMedia) {
      const { error: mediaError } = await supabase.from("media_assets").update({ is_public: true }).eq("id", logoMedia);

      if (mediaError) {
        redirect(`/admin/diseno-web?error=${encodeURIComponent(mediaError.message)}#${returnAnchor}`);
      }
    }

    await logAdminAction({
      supabase,
      actorUserId: session.profile?.id,
      entityType: definition.entityType,
      entityId: itemId || null,
      action: itemId ? "update" : "create",
      summary: `${itemId ? "Actualizacion" : "Alta"} de ${definition.summaryLabel}`,
      payload: {
        name,
        websiteUrl: targetUrl || null,
        logoMedia: logoMedia || null
      }
    });
  }

  if (entityKind === "influencer") {
    const name = String(formData.get("name") ?? "").trim();
    const role = String(formData.get("role") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const coverMedia = String(formData.get("cover_media") ?? "").trim();
    const instagramUrl = String(formData.get("instagram_url") ?? "").trim();
    const facebookUrl = String(formData.get("facebook_url") ?? "").trim();
    const youtubeUrl = String(formData.get("youtube_url") ?? "").trim();
    const tiktokUrl = String(formData.get("tiktok_url") ?? "").trim();

    if (!name) {
      redirect(`/admin/diseno-web?error=${encodeURIComponent("Debes indicar el nombre del influencer.")}#${returnAnchor}`);
    }

    const payload = {
      section_id: sectionRow.id,
      display_name: name,
      handle: null,
      platform: "instagram",
      profile_url: instagramUrl || facebookUrl || youtubeUrl || tiktokUrl || null,
      avatar_asset_id: null,
      cover_asset_id: coverMedia || null,
      headline: role || null,
      bio: description || null,
      instagram_url: instagramUrl || null,
      facebook_url: facebookUrl || null,
      youtube_url: youtubeUrl || null,
      tiktok_url: tiktokUrl || null
    };

    if (itemId) {
      const { error } = await supabase.from(definition.table).update(payload).eq("id", itemId);

      if (error) {
        redirect(`/admin/diseno-web?error=${encodeURIComponent(error.message)}#${returnAnchor}`);
      }
    } else {
      const { data: lastRow } = await supabase
        .from(definition.table)
        .select("sort_order")
        .eq("section_id", sectionRow.id)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { error } = await supabase.from(definition.table).insert({
        ...payload,
        sort_order: (lastRow?.sort_order || 0) + 1,
        is_active: true
      });

      if (error) {
        redirect(`/admin/diseno-web?error=${encodeURIComponent(error.message)}#${returnAnchor}`);
      }
    }

    if (coverMedia) {
      const { error: mediaError } = await supabase.from("media_assets").update({ is_public: true }).eq("id", coverMedia);

      if (mediaError) {
        redirect(`/admin/diseno-web?error=${encodeURIComponent(mediaError.message)}#${returnAnchor}`);
      }
    }

    await logAdminAction({
      supabase,
      actorUserId: session.profile?.id,
      entityType: definition.entityType,
      entityId: itemId || null,
      action: itemId ? "update" : "create",
      summary: `${itemId ? "Actualizacion" : "Alta"} de ${definition.summaryLabel}`,
      payload: {
        displayName: name,
        coverMedia: coverMedia || null
      }
    });
  }

  revalidatePath("/admin/diseno-web");
  revalidatePath("/");
  redirect(`/admin/diseno-web?success=${encodeURIComponent(`Se guardo correctamente el ${definition.summaryLabel}.`)}#${returnAnchor}`);
}

export async function uploadInfluencerCollageAssetAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();
  const file = formData.get("file");
  const title = String(formData.get("title") ?? "").trim();
  const altText = String(formData.get("altText") ?? "").trim();

  if (!(file instanceof File) || file.size <= 0) {
    redirect("/admin/diseno-web?error=Debes%20seleccionar%20una%20imagen%20para%20el%20collage.#section-influencers");
  }

  const path = buildAssetPath(INFLUENCER_COLLAGE_FOLDER, file.name || title || "collage", "");
  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, Buffer.from(arrayBuffer), {
      cacheControl: "3600",
      contentType: file.type || "application/octet-stream",
      upsert: false
    });

  if (uploadError) {
    redirect(`/admin/diseno-web?error=${encodeURIComponent(uploadError.message)}#section-influencers`);
  }

  const { data: insertedAsset, error: assetError } = await supabase
    .from("media_assets")
    .insert({
      bucket: MEDIA_BUCKET,
      path,
      title: title || file.name || null,
      alt_text: altText || null,
      is_public: true,
      created_by: session.profile?.id || null
    })
    .select("id, title")
    .single();

  if (assetError || !insertedAsset) {
    redirect(`/admin/diseno-web?error=${encodeURIComponent(assetError?.message || "No se pudo registrar el asset del collage.")}#section-influencers`);
  }

  const { data: groupRow } = await supabase
    .from("cms_item_groups")
    .select("id")
    .eq("group_key", "influencer_collage")
    .maybeSingle();

  if (!groupRow) {
    redirect("/admin/diseno-web?error=No%20se%20encontro%20el%20grupo%20del%20collage%20de%20influencers.#section-influencers");
  }

  const { data: lastItem } = await supabase
    .from("cms_group_items")
    .select("sort_order")
    .eq("group_id", groupRow.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const label = title || file.name.replace(/\.[^.]+$/, "") || "Imagen collage";
  const { data: insertedItem, error: itemError } = await supabase
    .from("cms_group_items")
    .insert({
      group_id: groupRow.id,
      item_key: `${toSlug(label)}-${crypto.randomUUID().slice(0, 8)}`,
      label,
      slug: toSlug(label) || null,
      sort_order: (lastItem?.sort_order || 0) + 1,
      is_visible: true
    })
    .select("id")
    .single();

  if (itemError || !insertedItem) {
    redirect(`/admin/diseno-web?error=${encodeURIComponent(itemError?.message || "No se pudo vincular la imagen al collage.")}#section-influencers`);
  }

  const { error: fieldError } = await supabase.from("cms_group_item_fields").insert({
    item_id: insertedItem.id,
    field_key: "media",
    label: "Imagen collage",
    kind: "image",
    media_asset_id: insertedAsset.id,
    locale: "es-MX",
    sort_order: 1,
    is_visible: true,
    updated_by: session.profile?.id || null
  });

  if (fieldError) {
    redirect(`/admin/diseno-web?error=${encodeURIComponent(fieldError.message)}#section-influencers`);
  }

  await logAdminAction({
    supabase,
    actorUserId: session.profile?.id,
    entityType: "influencer_collage",
    entityId: insertedItem.id,
    action: "create",
    summary: "Alta de imagen para collage de influencers",
    payload: {
      mediaAssetId: insertedAsset.id,
      path
    }
  });

  revalidatePath("/admin/diseno-web");
  revalidatePath("/");
  redirect("/admin/diseno-web?success=Se%20subio%20correctamente%20la%20imagen%20del%20collage.#section-influencers");
}

export async function toggleInfluencerCollageAssetAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();
  const itemId = String(formData.get("itemId") ?? "").trim();
  const nextVisible = String(formData.get("nextVisible") ?? "").trim() === "true";

  if (!itemId) {
    redirect("/admin/diseno-web?error=No%20se%20encontro%20la%20imagen%20del%20collage.#section-influencers");
  }

  const { error } = await supabase.from("cms_group_items").update({ is_visible: nextVisible }).eq("id", itemId);

  if (error) {
    redirect(`/admin/diseno-web?error=${encodeURIComponent(error.message)}#section-influencers`);
  }

  await logAdminAction({
    supabase,
    actorUserId: session.profile?.id,
    entityType: "influencer_collage",
    entityId: itemId,
    action: nextVisible ? "activate" : "deactivate",
    summary: nextVisible ? "Activacion de imagen de collage" : "Desactivacion de imagen de collage"
  });

  revalidatePath("/admin/diseno-web");
  revalidatePath("/");
  redirect(`/admin/diseno-web?success=${encodeURIComponent(`Se ${nextVisible ? "activo" : "desactivo"} la imagen del collage.`)}#section-influencers`);
}

export async function deleteInfluencerCollageAssetAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();
  const itemId = String(formData.get("itemId") ?? "").trim();
  const mediaAssetId = String(formData.get("mediaAssetId") ?? "").trim();
  const path = String(formData.get("path") ?? "").trim();

  if (path) {
    const { error: storageError } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);

    if (storageError) {
      redirect(`/admin/diseno-web?error=${encodeURIComponent(storageError.message)}#section-influencers`);
    }
  }

  if (itemId) {
    const { error: itemError } = await supabase.from("cms_group_items").delete().eq("id", itemId);

    if (itemError) {
      redirect(`/admin/diseno-web?error=${encodeURIComponent(itemError.message)}#section-influencers`);
    }
  }

  if (mediaAssetId) {
    const { error: assetError } = await supabase.from("media_assets").delete().eq("id", mediaAssetId);

    if (assetError) {
      redirect(`/admin/diseno-web?error=${encodeURIComponent(assetError.message)}#section-influencers`);
    }
  }

  await logAdminAction({
    supabase,
    actorUserId: session.profile?.id,
    entityType: "influencer_collage",
    entityId: itemId || mediaAssetId || null,
    action: "delete",
    summary: "Eliminacion de imagen del collage",
    payload: {
      mediaAssetId: mediaAssetId || null,
      path: path || null
    }
  });

  revalidatePath("/admin/diseno-web");
  revalidatePath("/");
  redirect("/admin/diseno-web?success=Se%20elimino%20correctamente%20la%20imagen%20del%20collage.#section-influencers");
}
