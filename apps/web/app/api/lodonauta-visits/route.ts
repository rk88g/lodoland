import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "../../../lib/supabase/server";

const DEVICE_COOKIE_NAME = "lodonauta_device_id";
const DEVICE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export async function POST(request: NextRequest) {
  const existingDeviceId = request.cookies.get(DEVICE_COOKIE_NAME)?.value;
  const deviceId = existingDeviceId || crypto.randomUUID();
  const supabase = createClient();
  const { data, error } = await supabase.rpc("increment_lodonauta_visit", {
    visitor_device_id: deviceId
  });

  if (error) {
    return NextResponse.json({ error: "No se pudo actualizar el contador." }, { status: 500 });
  }

  const response = NextResponse.json({
    count: typeof data === "number" ? data : Number(data ?? 0)
  });

  if (!existingDeviceId) {
    response.cookies.set(DEVICE_COOKIE_NAME, deviceId, {
      httpOnly: true,
      maxAge: DEVICE_COOKIE_MAX_AGE_SECONDS,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });
  }

  return response;
}
