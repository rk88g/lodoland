"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

export async function registerMediaAssetAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const path = String(formData.get("path") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const altText = String(formData.get("altText") ?? "").trim();
  const isPublic = String(formData.get("isPublic") ?? "") === "on";

  if (!path) {
    redirect("/admin/diseno-web?error=Debes indicar la ruta del archivo en Storage.");
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

  revalidatePath("/admin/diseno-web");
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

  revalidatePath("/admin/diseno-web");
}

export async function createAvatarPresetAction(formData: FormData) {
  await requireAdmin();
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

  revalidatePath("/admin/diseno-web");
}
