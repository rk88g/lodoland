import { isBuildPhase } from "../runtime";
import { createClient } from "../supabase/server";

export type AdminAuditLogRecord = {
  id: string;
  actorUserId: string | null;
  actorLabel: string | null;
  actorEmail: string | null;
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
  actorLabel: string | null;
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

type ProfileRef = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
};

function buildProfileLabel(profile: ProfileRef | undefined) {
  if (!profile) {
    return null;
  }

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
  return fullName || profile.email || "Usuario interno";
}

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

  const rows = data || [];
  const actorIds = Array.from(new Set(rows.map((row) => row.actor_user_id).filter(Boolean))) as string[];
  const { data: profilesRaw } = actorIds.length
    ? await supabase.from("profiles").select("id, email, first_name, last_name").in("id", actorIds)
    : { data: [] };
  const profileMap = new Map(((profilesRaw || []) as ProfileRef[]).map((profile) => [profile.id, profile]));

  return rows.map((row) => ({
    id: row.id,
    actorUserId: row.actor_user_id,
    actorLabel: row.actor_user_id ? buildProfileLabel(profileMap.get(row.actor_user_id)) : null,
    actorEmail: row.actor_user_id ? profileMap.get(row.actor_user_id)?.email || null : null,
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

  const rows = data || [];
  const actorIds = Array.from(new Set(rows.map((row) => row.actor_user_id).filter(Boolean))) as string[];
  const { data: profilesRaw } = actorIds.length
    ? await supabase.from("profiles").select("id, email, first_name, last_name").in("id", actorIds)
    : { data: [] };
  const profileMap = new Map(((profilesRaw || []) as ProfileRef[]).map((profile) => [profile.id, profile]));

  return rows.map((row) => ({
    id: row.id,
    actorUserId: row.actor_user_id,
    actorLabel: row.actor_user_id ? buildProfileLabel(profileMap.get(row.actor_user_id)) : null,
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
