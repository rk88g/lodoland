import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicAppUrls } from "../../../lib/app-urls";
import { applyAppSessionCookie } from "../../../lib/auth/session-policy";
import { getSupabaseEnv } from "../../../lib/supabase/env";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const { url, anonKey } = getSupabaseEnv();
  const { siteUrl, intranetUrl, controlUrl, staffUrl } = getPublicAppUrls();
  const cookiesToSet: Array<{
    name: string;
    value: string;
    options?: Parameters<NextResponse["cookies"]["set"]>[2];
  }> = [];

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(newCookies) {
        newCookies.forEach(({ name, value, options }) => {
          cookiesToSet.push({ name, value, options });
        });
      }
    }
  });

  const exchangeResult = code ? await supabase.auth.exchangeCodeForSession(code) : null;
  const exchangedUser = exchangeResult?.data?.session?.user || null;
  const {
    data: { user: fetchedUser }
  } = await supabase.auth.getUser();
  const user = exchangedUser || fetchedUser;

  if (!user) {
    const failureResponse = NextResponse.redirect(
      `${siteUrl}/login?error=${encodeURIComponent("No se pudo abrir la sesion.")}`
    );

    cookiesToSet.forEach(({ name, value, options }) => {
      failureResponse.cookies.set(name, value, options);
    });

    return failureResponse;
  }

  if (user.email?.toLowerCase().endsWith("@lodoland.mx")) {
    await supabase.auth.signOut();
    const staffRedirect = NextResponse.redirect(
      `${siteUrl}/admin/login?error=${encodeURIComponent("El personal interno debe entrar con correo organizacional y contrasena.")}`
    );

    cookiesToSet.forEach(({ name, value, options }) => {
      staffRedirect.cookies.set(name, value, options);
    });

    return staffRedirect;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_active === false) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent("Tu cuenta esta desactivada.")}`);
  }

  const response = NextResponse.redirect(
    profile?.role === "admin" || profile?.role === "super_admin"
      ? controlUrl
      : profile?.role === "staff"
        ? staffUrl
        : intranetUrl
  );

  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  applyAppSessionCookie(response, profile?.role ?? null);

  return response;
}
