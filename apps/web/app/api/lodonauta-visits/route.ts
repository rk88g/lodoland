import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function POST() {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("increment_lodonauta_visit");

  if (error) {
    return NextResponse.json({ error: "No se pudo actualizar el contador." }, { status: 500 });
  }

  return NextResponse.json({
    count: typeof data === "number" ? data : Number(data ?? 0)
  });
}
