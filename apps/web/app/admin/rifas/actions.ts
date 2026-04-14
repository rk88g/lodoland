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

export async function createRaffleAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const prizeDescription = String(formData.get("prizeDescription") ?? "").trim();
  const entryPrice = Number(String(formData.get("entryPrice") ?? "0").trim() || 0);
  const startsAt = String(formData.get("startsAt") ?? "").trim();
  const endsAt = String(formData.get("endsAt") ?? "").trim();
  const drawAt = String(formData.get("drawAt") ?? "").trim();
  const status = String(formData.get("status") ?? "draft").trim();
  const slug = toSlug(String(formData.get("slug") ?? "") || title);

  if (!title || !slug || !entryPrice) {
    redirect("/admin/rifas?error=Debes indicar titulo, slug y precio de participacion.");
  }

  const { data, error } = await supabase
    .from("raffles")
    .insert({
      slug,
      title,
      description: description || null,
      prize_description: prizeDescription || null,
      entry_price: entryPrice,
      starts_at: startsAt || null,
      ends_at: endsAt || null,
      draw_at: drawAt || null,
      status,
      created_by: session.profile?.id || null,
      updated_by: session.profile?.id || null
    })
    .select("id")
    .maybeSingle();

  if (error) {
    redirect(`/admin/rifas?error=${encodeURIComponent(error.message)}`);
  }

  await logAdminAction({
    supabase,
    actorUserId: session.profile?.id,
    entityType: "raffle",
    entityId: data?.id || null,
    action: "create",
    summary: "Alta de rifa desde control",
    payload: {
      slug,
      title,
      entryPrice,
      startsAt: startsAt || null,
      endsAt: endsAt || null,
      drawAt: drawAt || null,
      status
    }
  });

  revalidatePath("/admin/rifas");
  revalidatePath("/rifas");
  redirect("/admin/rifas?success=Rifa%20creada%20correctamente.");
}
