import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function OldLodonautasSoldNumbersRedirectPage() {
  redirect("/rifa2026/boletos-vendidos");
}
