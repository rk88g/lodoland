"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "../../lib/auth/session";
import { createClient } from "../../lib/supabase/server";

export async function updateCustomerProfileAction(formData: FormData) {
  const session = await requireUser();
  const supabase = createClient();

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName || null,
      last_name: lastName || null,
      phone: phone || null
    })
    .eq("id", session.user.id);

  if (error) {
    redirect(`/perfil?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/perfil");
  revalidatePath("/perfil/compras");
  redirect("/perfil?success=Perfil%20actualizado%20correctamente.");
}

export async function updateCustomerAvatarAction(formData: FormData) {
  const session = await requireUser();
  const supabase = createClient();

  const avatarPresetId = String(formData.get("avatarPresetId") ?? "").trim();

  const { error } = await supabase
    .from("profiles")
    .update({
      avatar_preset_id: avatarPresetId || null
    })
    .eq("id", session.user.id);

  if (error) {
    redirect(`/perfil?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/perfil");
  revalidatePath("/perfil/compras");
  redirect("/perfil?success=Avatar%20actualizado%20correctamente.");
}
