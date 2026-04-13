import { NextResponse, type NextRequest } from "next/server";
import { getPublicAppUrls } from "../../../lib/app-urls";
import { clearAppSessionCookie } from "../../../lib/auth/session-policy";
import { createAuthRouteClient } from "../../../lib/auth/route-client";

export async function POST(request: NextRequest) {
  const { siteUrl } = getPublicAppUrls();
  const { supabase, withCookies } = createAuthRouteClient(request);

  await supabase.auth.signOut();

  const response = withCookies(NextResponse.redirect(new URL("/login", siteUrl)));
  clearAppSessionCookie(response);
  return response;
}
