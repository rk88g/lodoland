import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";

type AppRole = "customer" | "admin" | "super_admin";

export async function getCurrentSessionProfile() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, phone, avatar_url, role, is_active")
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
          role: AppRole;
          is_active: boolean;
        }
      | null
  };
}

export async function requireUser() {
  const session = await getCurrentSessionProfile();

  if (!session.user) {
    redirect("/login");
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  const role = session.profile?.role;

  if (role !== "admin" && role !== "super_admin") {
    redirect("/perfil");
  }

  return session;
}
