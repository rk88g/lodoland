"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAdminAction } from "../../../lib/audit";
import { requireAdmin } from "../../../lib/auth/session";
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

export async function createEventAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const title = String(formData.get("title") ?? "").trim();
  const shortDescription = String(formData.get("shortDescription") ?? "").trim();
  const venueName = String(formData.get("venueName") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const startsAt = String(formData.get("startsAt") ?? "").trim();
  const status = String(formData.get("status") ?? "draft").trim();
  const coverAssetId = String(formData.get("coverAssetId") ?? "").trim();
  const slug = toSlug(String(formData.get("slug") ?? "") || title);

  if (!title || !slug) {
    redirect("/admin/eventos?error=Debes indicar titulo y slug del evento.");
  }

  const { data, error } = await supabase.from("events").insert({
    slug,
    title,
    short_description: shortDescription || null,
    venue_name: venueName || null,
    city: city || null,
    starts_at: startsAt || null,
    cover_asset_id: coverAssetId || null,
    status,
    created_by: session.profile?.id || null,
    updated_by: session.profile?.id || null
  }).select("id").maybeSingle();

  if (error) {
    redirect(`/admin/eventos?error=${encodeURIComponent(error.message)}`);
  }

  await logAdminAction({
    supabase,
    actorUserId: session.profile?.id,
    entityType: "event",
    entityId: data?.id || null,
    action: "create",
    summary: "Alta de evento desde control",
    payload: {
      slug,
      title,
      venueName: venueName || null,
      city: city || null,
      startsAt: startsAt || null,
      status
    }
  });

  revalidatePath("/admin/eventos");
  revalidatePath("/perfil");
  revalidatePath("/");
  redirect("/admin/eventos?success=Evento%20creado%20correctamente.");
}
