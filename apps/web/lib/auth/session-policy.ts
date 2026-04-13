import type { NextRequest, NextResponse } from "next/server";

type AppRole = "customer" | "admin" | "super_admin";

export const APP_SESSION_EXPIRES_COOKIE = "lodoland-app-session-expires-at";

const THIRTY_MINUTES_MS = 30 * 60 * 1000;
const SUPER_ADMIN_SESSION_MS = 12 * 60 * 60 * 1000;

export function getSessionLifetimeMs(role: AppRole | null | undefined) {
  return role === "super_admin" ? SUPER_ADMIN_SESSION_MS : THIRTY_MINUTES_MS;
}

export function parseSessionExpiry(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getExpiredRedirectPath(pathname: string) {
  return pathname.startsWith("/admin") ? "/admin/login" : "/login";
}

export function clearAppSessionCookie(response: NextResponse) {
  response.cookies.set(APP_SESSION_EXPIRES_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export function applyAppSessionCookie(response: NextResponse, role: AppRole | null | undefined) {
  const expiresAt = Date.now() + getSessionLifetimeMs(role);

  response.cookies.set(APP_SESSION_EXPIRES_COOKIE, String(expiresAt), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(getSessionLifetimeMs(role) / 1000)
  });
}

export function isAppSessionExpired(request: NextRequest) {
  const value = request.cookies.get(APP_SESSION_EXPIRES_COOKIE)?.value;
  const expiresAt = parseSessionExpiry(value);

  if (!expiresAt) {
    return false;
  }

  return expiresAt <= Date.now();
}
