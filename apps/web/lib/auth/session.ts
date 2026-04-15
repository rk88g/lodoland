import { redirect } from "next/navigation";
import { isBuildPhase } from "../runtime";
import { createClient } from "../supabase/server";

type AppRole = "customer" | "staff" | "admin" | "super_admin";

function isAdminRole(role: AppRole | null | undefined) {
  return role === "admin" || role === "super_admin";
}

function isOperatorRole(role: AppRole | null | undefined) {
  return role === "staff" || isAdminRole(role);
}

export async function getCurrentSessionProfile() {
  if (isBuildPhase()) {
    return { user: null, profile: null };
  }

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, phone, avatar_url, avatar_preset_id, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile: profile as
      | {
          id: string;
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          avatar_preset_id: string | null;
          role: AppRole;
          is_active: boolean;
        }
      | null
  };
}

export function isEmailConfirmed(user: { email_confirmed_at?: string | null } | null | undefined) {
  return Boolean(user?.email_confirmed_at);
}

export async function requireUser() {
  if (isBuildPhase()) {
    return {
      user: {
        id: "build-user",
        email: "build@lodoland.local"
      } as any,
      profile: {
        id: "build-user",
        email: "build@lodoland.local",
        first_name: "Build",
        last_name: "User",
        phone: null,
        avatar_url: null,
        avatar_preset_id: null,
        role: "customer" as AppRole,
        is_active: true
      }
    };
  }

  const session = await getCurrentSessionProfile();

  if (!session.user) {
    redirect("/login");
  }

  return session;
}

export async function requireAdmin() {
  if (isBuildPhase()) {
    return {
      user: {
        id: "build-admin",
        email: "build-admin@lodoland.local"
      } as any,
      profile: {
        id: "build-admin",
        email: "build-admin@lodoland.local",
        first_name: "Build",
        last_name: "Admin",
        phone: null,
        avatar_url: null,
        avatar_preset_id: null,
        role: "super_admin" as AppRole,
        is_active: true
      }
    };
  }

  const session = await requireUser();
  const role = session.profile?.role;

  if (!isAdminRole(role)) {
    redirect("/admin/login");
  }

  return session;
}

export async function requireOperator() {
  if (isBuildPhase()) {
    return {
      user: {
        id: "build-staff",
        email: "build-staff@lodoland.local"
      } as any,
      profile: {
        id: "build-staff",
        email: "build-staff@lodoland.local",
        first_name: "Build",
        last_name: "Staff",
        phone: null,
        avatar_url: null,
        avatar_preset_id: null,
        role: "staff" as AppRole,
        is_active: true
      }
    };
  }

  const session = await requireUser();
  const role = session.profile?.role;

  if (!isOperatorRole(role)) {
    redirect("/admin/login");
  }

  return session;
}
