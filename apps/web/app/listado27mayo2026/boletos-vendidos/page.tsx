import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function OldRaffleSoldNumbersRedirectPage() {
  redirect("/Lodonautas14Junio/boletos-vendidos");
}
