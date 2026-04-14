import { isBuildPhase } from "../runtime";
import { createClient } from "../supabase/server";

export type CustomerAccountOption = {
  id: string;
  label: string;
  email: string | null;
};

export async function getCustomerAccountOptions(limit = 120) {
  if (isBuildPhase()) {
    return [] as CustomerAccountOption[];
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data || []).map((profile) => {
    const label = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();

    return {
      id: profile.id,
      label: label || profile.email || "Cliente sin nombre",
      email: profile.email || null
    } satisfies CustomerAccountOption;
  });
}
