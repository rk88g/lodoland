import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { sanitizeMessage } from "../auth/core";
import {
  applyAppSessionCookie,
  clearAppSessionCookie,
  getExistingAppSessionExpiry,
  getExpiredRedirectPath,
  isAppSessionExpired
} from "../auth/session-policy";
import { getSupabaseEnv } from "./env";

export async function updateSession(request: NextRequest) {
  const { url, anonKey } = getSupabaseEnv();

  let response = NextResponse.next({
    request
  });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        response = NextResponse.next({
          request
        });

        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    clearAppSessionCookie(response);
    return response;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_active === false) {
    await supabase.auth.signOut();
    const redirectUrl = new URL(getExpiredRedirectPath(request.nextUrl.pathname), request.url);
    redirectUrl.searchParams.set("error", sanitizeMessage("Tu cuenta esta desactivada."));
    const redirectResponse = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    clearAppSessionCookie(redirectResponse);
    return redirectResponse;
  }

  if (isAppSessionExpired(request)) {
    await supabase.auth.signOut();
    const redirectUrl = new URL(getExpiredRedirectPath(request.nextUrl.pathname), request.url);
    redirectUrl.searchParams.set("error", sanitizeMessage("Tu sesion expiro por seguridad."));
    const redirectResponse = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    clearAppSessionCookie(redirectResponse);
    return redirectResponse;
  }

  const existingExpiry = getExistingAppSessionExpiry(request);

  if (!existingExpiry) {
    await supabase.auth.signOut();
    const redirectUrl = new URL(getExpiredRedirectPath(request.nextUrl.pathname), request.url);
    redirectUrl.searchParams.set("error", sanitizeMessage("Tu sesion expiro por seguridad."));
    const redirectResponse = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    clearAppSessionCookie(redirectResponse);
    return redirectResponse;
  }

  return response;
}
