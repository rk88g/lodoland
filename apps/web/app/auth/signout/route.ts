import { NextResponse, type NextRequest } from "next/server";
import { getPublicAppUrls } from "../../../lib/app-urls";
import { createAuthRouteClient } from "../../../lib/auth/route-client";

export async function POST(request: NextRequest) {
  const { siteUrl } = getPublicAppUrls();
  const { supabase, withCookies } = createAuthRouteClient(request);

  await supabase.auth.signOut();

  return withCookies(NextResponse.redirect(new URL("/login", siteUrl)));
}
