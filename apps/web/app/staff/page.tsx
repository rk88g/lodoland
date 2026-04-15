import { redirect } from "next/navigation";
import { requireOperator } from "../../lib/auth/session";

export const dynamic = "force-dynamic";

export default async function StaffIndexPage() {
  await requireOperator();
  redirect("/staff/tickets");
}
