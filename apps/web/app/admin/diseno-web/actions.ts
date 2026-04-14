"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAdminAction } from "../../../lib/audit";
import { requireAdmin } from "../../../lib/auth/session";
import { MEDIA_BUCKET } from "../../../lib/supabase/storage";
import { createClient } from "../../../lib/supabase/server";

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

export async function registerMediaAssetAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const customPath = String(formData.get("path") ?? "").trim();
  const folder = String(formData.get("folder") ?? "").trim() || "home/general";
  const title = String(formData.get("title") ?? "").trim();
  const altText = String(formData.get("altText") ?? "").trim();
  const isPublic = String(formData.get("isPublic") ?? "") === "on";
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
    is_public: isPublic,
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
      isPublic
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
