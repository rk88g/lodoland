import { NextResponse, type NextRequest } from "next/server";
import { getPublicAppUrls } from "../../../../lib/app-urls";
import { isStaffEmail, resolveDestination, sanitizeMessage } from "../../../../lib/auth/core";
import { applyAppSessionCookie } from "../../../../lib/auth/session-policy";
import { createAuthRouteClient } from "../../../../lib/auth/route-client";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const { siteUrl } = getPublicAppUrls();

  if (!email || !password) {
    return NextResponse.redirect(
      new URL(`/login?error=${sanitizeMessage("Ingresa tu correo y contrasena.")}`, siteUrl)
    );
  }

  if (isStaffEmail(email)) {
    return NextResponse.redirect(
      new URL(
        `/admin/login?error=${sanitizeMessage("El personal interno debe entrar desde el acceso de control.")}`,
        siteUrl
      )
    );
  }

  const { supabase, withCookies } = createAuthRouteClient(request);
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return withCookies(
      NextResponse.redirect(new URL(`/login?error=${sanitizeMessage(error.message)}`, siteUrl))
    );
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };

  const response = withCookies(NextResponse.redirect(new URL(await resolveDestination(supabase), siteUrl)));
  applyAppSessionCookie(response, profile?.role ?? null);
  return response;
}
