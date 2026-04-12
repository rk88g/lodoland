"use server";

import { redirect } from "next/navigation";
import { getPublicAppUrls } from "../../lib/app-urls";
import { createClient } from "../../lib/supabase/server";

function sanitizeMessage(message: string) {
  return encodeURIComponent(message);
}

async function resolveDestination(supabase: ReturnType<typeof createClient>) {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return "/login";
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_active === false) {
    await supabase.auth.signOut();
    return `/login?error=${sanitizeMessage("Tu cuenta esta desactivada.")}`;
  }

  const { intranetUrl, controlUrl } = getPublicAppUrls();

  if (profile?.role === "admin" || profile?.role === "super_admin") {
    return controlUrl;
  }

  return intranetUrl;
}

export async function signInStaffAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(`/admin/login?error=${sanitizeMessage("Ingresa correo y contrasena.")}`);
  }

  if (!email.toLowerCase().endsWith("@lodoland.mx")) {
    redirect(`/admin/login?error=${sanitizeMessage("El acceso administrativo requiere correo organizacional.")}`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(`/admin/login?error=${sanitizeMessage(error.message)}`);
  }

  redirect(await resolveDestination(supabase));
}

export async function signInWithGoogleAction() {
  const supabase = createClient();
  const { siteUrl } = getPublicAppUrls();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback`
    }
  });

  if (error || !data.url) {
    redirect(`/login?error=${sanitizeMessage(error?.message || "No se pudo iniciar Google.")}`);
  }

  redirect(data.url);
}

export async function signInWithFacebookAction() {
  const supabase = createClient();
  const { siteUrl } = getPublicAppUrls();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "facebook",
    options: {
      redirectTo: `${siteUrl}/auth/callback`
    }
  });

  if (error || !data.url) {
    redirect(`/login?error=${sanitizeMessage(error?.message || "No se pudo iniciar Facebook.")}`);
  }

  redirect(data.url);
}

export async function signUpWithEmailAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!email || !password || !passwordConfirm) {
    redirect(`/login?error=${sanitizeMessage("Completa correo y ambas contrasenas.")}`);
  }

  if (email.toLowerCase().endsWith("@lodoland.mx")) {
    redirect(
      `/admin/login?error=${sanitizeMessage("El personal interno debe entrar desde el acceso de control.")}`
    );
  }

  if (password.length < 8) {
    redirect(`/login?error=${sanitizeMessage("La contrasena debe tener minimo 8 caracteres.")}`);
  }

  if (password !== passwordConfirm) {
    redirect(`/login?error=${sanitizeMessage("Las contrasenas no coinciden.")}`);
  }

  const supabase = createClient();
  const { siteUrl } = getPublicAppUrls();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`
    }
  });

  if (error) {
    redirect(`/login?error=${sanitizeMessage(error.message)}`);
  }

  redirect(
    `/login?message=${sanitizeMessage(
      "Te enviamos un correo de verificacion. Antes de cualquier compra o movimiento debes confirmarlo."
    )}`
  );
}

export async function signInWithEmailAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(`/login?error=${sanitizeMessage("Ingresa tu correo y contrasena.")}`);
  }

  if (email.toLowerCase().endsWith("@lodoland.mx")) {
    redirect(
      `/admin/login?error=${sanitizeMessage("El personal interno debe entrar desde el acceso de control.")}`
    );
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(`/login?error=${sanitizeMessage(error.message)}`);
  }

  redirect(await resolveDestination(supabase));
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
