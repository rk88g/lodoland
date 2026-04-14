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

export async function createPoolAction(formData: FormData) {
  const session = await requireAdmin();
  const supabase = createClient();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const rules = String(formData.get("rules") ?? "").trim();
  const entryPrice = Number(String(formData.get("entryPrice") ?? "0").trim() || 0);
  const startsAt = String(formData.get("startsAt") ?? "").trim();
  const closesAt = String(formData.get("closesAt") ?? "").trim();
  const resolvesAt = String(formData.get("resolvesAt") ?? "").trim();
  const status = String(formData.get("status") ?? "draft").trim();
  const slug = toSlug(String(formData.get("slug") ?? "") || title);

  if (!title || !slug || !entryPrice) {
    redirect("/admin/quinielas?error=Debes indicar titulo, slug y precio de acceso.");
  }

  const { data, error } = await supabase
    .from("pools")
    .insert({
      slug,
      title,
      description: description || null,
      rules: rules || null,
      entry_price: entryPrice,
      starts_at: startsAt || null,
      closes_at: closesAt || null,
      resolves_at: resolvesAt || null,
      status,
      created_by: session.profile?.id || null,
      updated_by: session.profile?.id || null
    })
    .select("id")
    .maybeSingle();

  if (error) {
    redirect(`/admin/quinielas?error=${encodeURIComponent(error.message)}`);
  }

  await logAdminAction({
    supabase,
    actorUserId: session.profile?.id,
    entityType: "pool",
    entityId: data?.id || null,
    action: "create",
    summary: "Alta de quiniela desde control",
    payload: {
      slug,
      title,
      entryPrice,
      startsAt: startsAt || null,
      closesAt: closesAt || null,
      resolvesAt: resolvesAt || null,
      status
    }
  });

  revalidatePath("/admin/quinielas");
  revalidatePath("/quinielas");
  redirect("/admin/quinielas?success=Quiniela%20creada%20correctamente.");
}
