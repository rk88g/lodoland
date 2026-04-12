"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

function sanitizeMessage(message: string) {
  return encodeURIComponent(message);
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(`/login?error=${sanitizeMessage("Ingresa correo y contrasena.")}`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(`/login?error=${sanitizeMessage(error.message)}`);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?error=${sanitizeMessage("No se pudo iniciar la sesion.")}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_active === false) {
    await supabase.auth.signOut();
    redirect(`/login?error=${sanitizeMessage("Tu cuenta esta desactivada.")}`);
  }

  if (profile?.role === "admin" || profile?.role === "super_admin") {
    redirect("/admin");
  }

  redirect("/perfil");
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
