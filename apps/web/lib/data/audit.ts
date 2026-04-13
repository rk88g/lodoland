import { isBuildPhase } from "../runtime";
import { createClient } from "../supabase/server";

export type AdminAuditLogRecord = {
  id: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type CollaboratorLoginLogRecord = {
  id: string;
  actorUserId: string | null;
  email: string | null;
  role: string | null;
  authProvider: string;
  host: string | null;
  requestPath: string | null;
  ipAddress: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  deviceType: string | null;
  browserName: string | null;
  osName: string | null;
  userAgent: string | null;
  createdAt: string;
};

export async function getAdminAuditLogs(limit = 50) {
  if (isBuildPhase()) {
    return [] as AdminAuditLogRecord[];
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("admin_audit_logs")
    .select("id, actor_user_id, action, entity_type, entity_id, summary, payload, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data || []).map((row) => ({
    id: row.id,
    actorUserId: row.actor_user_id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    summary: row.summary,
    payload: (row.payload || {}) as Record<string, unknown>,
    createdAt: row.created_at
  }));
}

export async function getCollaboratorLoginLogs(limit = 50) {
  if (isBuildPhase()) {
    return [] as CollaboratorLoginLogRecord[];
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("collaborator_login_logs")
    .select(
      "id, actor_user_id, email, role, auth_provider, host, request_path, ip_address, city, region, country, device_type, browser_name, os_name, user_agent, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data || []).map((row) => ({
    id: row.id,
    actorUserId: row.actor_user_id,
    email: row.email,
    role: row.role,
    authProvider: row.auth_provider,
    host: row.host,
    requestPath: row.request_path,
    ipAddress: row.ip_address,
    city: row.city,
    region: row.region,
    country: row.country,
    deviceType: row.device_type,
    browserName: row.browser_name,
    osName: row.os_name,
    userAgent: row.user_agent,
    createdAt: row.created_at
  }));
}
