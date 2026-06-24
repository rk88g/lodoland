"use server";

import { randomUUID } from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { setFlashMessage } from "../../lib/flash";
import { syncRaffle27VisitorExperience } from "../../lib/raffle27";

const DEVICE_COOKIE = "raffle27-device";
const FLASH_COOKIE = "raffle27-public-flash";
const PUBLIC_RAFFLE_PATH = "/rifa2026";

function getOrCreateDeviceId() {
  const cookieStore = cookies();
  const existing = cookieStore.get(DEVICE_COOKIE)?.value;

  if (existing) {
    return existing;
  }

  const generated = randomUUID();
  cookieStore.set(DEVICE_COOKIE, generated, {
    path: "/",
    maxAge: 72 * 60 * 60,
    sameSite: "lax",
    httpOnly: true
  });
  return generated;
}

function firstHeaderValue(value: string | null) {
  if (!value) {
    return null;
  }

  return (
    value
      .split(",")
      .map((entry) => entry.trim())
      .find(Boolean) || null
  );
}

export async function claimRaffle27LuckyNumberAction() {
  const deviceId = getOrCreateDeviceId();
  const requestHeaders = headers();
  const experience = await syncRaffle27VisitorExperience({
    deviceId,
    userAgent: requestHeaders.get("user-agent"),
    ipAddress: firstHeaderValue(requestHeaders.get("x-forwarded-for"))
  });

  setFlashMessage(FLASH_COOKIE, {
    type: "success",
    message: experience.message
  });
  redirect(PUBLIC_RAFFLE_PATH);
}
