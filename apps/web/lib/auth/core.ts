import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicAppUrls } from "../app-urls";

export function sanitizeMessage(message: string) {
  return encodeURIComponent(message);
}

export function isStaffEmail(email: string) {
  return email.toLowerCase().endsWith("@lodoland.mx");
}

export async function resolveDestination(supabase: SupabaseClient) {
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
