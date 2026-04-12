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
    redirect(`/login?error=${sanitizeMessage("Ingresa correo y contrasena.")}`);
  }

  if (!email.toLowerCase().endsWith("@lodoland.mx")) {
    redirect(`/login?error=${sanitizeMessage("El acceso administrativo requiere correo organizacional.")}`);
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

export async function sendPhoneOtpAction(formData: FormData) {
  const phone = String(formData.get("phone") ?? "").trim();

  if (!phone) {
    redirect(`/login?error=${sanitizeMessage("Ingresa un numero de telefono.")}`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      shouldCreateUser: true
    }
  });

  if (error) {
    redirect(`/login?error=${sanitizeMessage(error.message)}`);
  }

  redirect(`/login/verificar?phone=${encodeURIComponent(phone)}`);
}

export async function verifyPhoneOtpAction(formData: FormData) {
  const phone = String(formData.get("phone") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();

  if (!phone || !token) {
    redirect(`/login/verificar?phone=${encodeURIComponent(phone)}&error=${sanitizeMessage("Ingresa el codigo completo.")}`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms"
  });

  if (error) {
    redirect(`/login/verificar?phone=${encodeURIComponent(phone)}&error=${sanitizeMessage(error.message)}`);
  }

  redirect(await resolveDestination(supabase));
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
