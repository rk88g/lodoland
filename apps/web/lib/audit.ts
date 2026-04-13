import type { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

type AppRole = "customer" | "admin" | "super_admin";

type AdminAuditInput = {
  supabase: SupabaseClient;
  actorUserId: string | null | undefined;
  entityType: string;
  entityId?: string | null;
  action: string;
  summary: string;
  payload?: Record<string, unknown>;
};

type CollaboratorLoginInput = {
  supabase: SupabaseClient;
  request: NextRequest;
  actorUserId: string;
  email: string | null | undefined;
  role: AppRole;
  provider: string;
};

function firstHeaderValue(value: string | null) {
  if (!value) {
    return null;
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .find(Boolean) || null;
}

function parseDeviceType(userAgent: string) {
  const agent = userAgent.toLowerCase();

  if (/tablet|ipad/.test(agent)) {
    return "tablet";
  }

  if (/mobile|android|iphone/.test(agent)) {
    return "mobile";
  }

  return "desktop";
}

function parseBrowser(userAgent: string) {
  const agent = userAgent.toLowerCase();

  if (agent.includes("edg/")) {
    return "Edge";
  }
  if (agent.includes("opr/") || agent.includes("opera")) {
    return "Opera";
  }
  if (agent.includes("chrome/")) {
    return "Chrome";
  }
  if (agent.includes("firefox/")) {
    return "Firefox";
  }
  if (agent.includes("safari/")) {
    return "Safari";
  }

  return "Desconocido";
}

function parseOs(userAgent: string) {
  const agent = userAgent.toLowerCase();

  if (agent.includes("windows")) {
    return "Windows";
  }
  if (agent.includes("android")) {
    return "Android";
  }
  if (agent.includes("iphone") || agent.includes("ipad") || agent.includes("ios")) {
    return "iOS";
  }
  if (agent.includes("mac os") || agent.includes("macintosh")) {
    return "macOS";
  }
  if (agent.includes("linux")) {
    return "Linux";
  }

  return "Desconocido";
}

export async function logAdminAction({
  supabase,
  actorUserId,
  entityType,
  entityId,
  action,
  summary,
  payload = {}
}: AdminAuditInput) {
  try {
    const { error } = await supabase.from("admin_audit_logs").insert({
      actor_user_id: actorUserId || null,
      entity_type: entityType,
      entity_id: entityId || null,
      action,
      summary,
      payload
    });

    if (error) {
      console.error("[audit] admin action log failed", error);
    }
  } catch (error) {
    console.error("[audit] admin action log exception", error);
  }
}

export async function logCollaboratorLogin({
  supabase,
  request,
  actorUserId,
  email,
  role,
  provider
}: CollaboratorLoginInput) {
  const userAgent = request.headers.get("user-agent") || "";
  const ipAddress = firstHeaderValue(request.headers.get("x-forwarded-for"));

  try {
    const { error } = await supabase.from("collaborator_login_logs").insert({
      actor_user_id: actorUserId,
      email: email || null,
      role,
      auth_provider: provider,
      host: request.headers.get("host"),
      request_path: request.nextUrl.pathname,
      ip_address: ipAddress,
      city: request.headers.get("x-vercel-ip-city"),
      region: request.headers.get("x-vercel-ip-country-region"),
      country: request.headers.get("x-vercel-ip-country"),
      device_type: parseDeviceType(userAgent),
      browser_name: parseBrowser(userAgent),
      os_name: parseOs(userAgent),
      user_agent: userAgent
    });

    if (error) {
      console.error("[audit] collaborator login log failed", error);
    }
  } catch (error) {
    console.error("[audit] collaborator login log exception", error);
  }
}
