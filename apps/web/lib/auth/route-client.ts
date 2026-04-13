import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "../supabase/env";

export function createAuthRouteClient(request: NextRequest) {
  const { url, anonKey } = getSupabaseEnv();
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

  function withCookies(response: NextResponse) {
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });

    return response;
  }

  return {
    supabase,
    withCookies
  };
}
