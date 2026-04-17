import { NextResponse, type NextRequest } from "next/server";
import { getPublicAppUrls } from "../../../../lib/app-urls";
import { sanitizeMessage } from "../../../../lib/auth/core";
import { createAuthRouteClient } from "../../../../lib/auth/route-client";

export async function POST(request: NextRequest) {
  const { siteUrl } = getPublicAppUrls();
  const { supabase, withCookies } = createAuthRouteClient(request);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback`
    }
  });

  if (error || !data.url) {
    return withCookies(
      NextResponse.redirect(
        new URL(`/login?error=${sanitizeMessage(error?.message || "No se pudo iniciar Google.")}`, siteUrl),
        303
      )
    );
  }

  return withCookies(NextResponse.redirect(data.url, 303));
}
