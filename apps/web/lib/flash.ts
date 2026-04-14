import { cookies } from "next/headers";

export type FlashMessage = {
  type: "success" | "error";
  message: string;
};

export function setFlashMessage(cookieName: string, payload: FlashMessage) {
  cookies().set(cookieName, JSON.stringify(payload), {
    path: "/",
    maxAge: 60,
    sameSite: "lax"
  });
}

export function readFlashMessage(cookieName: string) {
  const rawValue = cookies().get(cookieName)?.value;

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as FlashMessage;
    if (!parsed?.message || !parsed?.type) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
