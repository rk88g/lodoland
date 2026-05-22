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

function normalizeEventStatus(value: string) {
  if (value === "completed" || value === "cancelled") {
    return {
      publishStatus: "archived",
      operationalStatus: value
    };
  }

  return {
    publishStatus: value || "draft",
    operationalStatus: value === "archived" ? "archived" : null
  };
}

export async function updateEventAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const eventId = String(formData.get("eventId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const shortDescription = String(formData.get("shortDescription") ?? "").trim();
  const venueName = String(formData.get("venueName") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const startsAt = String(formData.get("startsAt") ?? "").trim();
  const coverAssetId = String(formData.get("coverAssetId") ?? "").trim();
  const requestedStatus = String(formData.get("status") ?? "draft").trim();
  const slug = toSlug(String(formData.get("slug") ?? "") || title);

  if (!eventId || !title || !slug) {
    redirect("/admin/eventos?error=Debes indicar evento, titulo y slug.");
  }

  const { data: currentEvent, error: currentError } = await supabase
    .from("events")
    .select("id, metadata, status")
    .eq("id", eventId)
    .maybeSingle();

  if (currentError || !currentEvent) {
    redirect(`/admin/eventos?error=${encodeURIComponent(currentError?.message || "No se encontro el evento.")}`);
  }

  const statusConfig = normalizeEventStatus(requestedStatus);
  const currentMetadata = (currentEvent.metadata || {}) as Record<string, unknown>;
  const metadata = {
    ...currentMetadata,
    operational_status: statusConfig.operationalStatus,
    operational_status_updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from("events")
    .update({
      slug,
      title,
      short_description: shortDescription || null,
      venue_name: venueName || null,
      city: city || null,
      starts_at: startsAt || null,
      cover_asset_id: coverAssetId || null,
      status: statusConfig.publishStatus,
      metadata,
      updated_by: session.profile?.id || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", eventId);

  if (error) {
    redirect(`/admin/eventos?error=${encodeURIComponent(error.message)}`);
  }

  await logAdminAction({
    supabase,
    actorUserId: session.profile?.id,
    entityType: "event",
    entityId: eventId,
    action: "update",
    summary: "Actualizacion de evento desde control",
    payload: {
      slug,
      title,
      startsAt: startsAt || null,
      previousStatus: currentEvent.status,
      nextStatus: statusConfig.publishStatus,
      operationalStatus: statusConfig.operationalStatus
    }
  });

  revalidatePath("/admin/eventos");
  revalidatePath("/admin");
  revalidatePath("/eventos");
  revalidatePath("/perfil");
  revalidatePath("/");
  redirect("/admin/eventos?success=Evento%20actualizado%20correctamente.");
}
