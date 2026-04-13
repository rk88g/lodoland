import { NextResponse, type NextRequest } from "next/server";
import { getPublicAppUrls } from "../../../../lib/app-urls";
import { isStaffEmail, sanitizeMessage } from "../../../../lib/auth/core";
import { createAuthRouteClient } from "../../../../lib/auth/route-client";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  const { siteUrl } = getPublicAppUrls();

  if (!email || !password || !passwordConfirm) {
    return NextResponse.redirect(
      new URL(`/login?error=${sanitizeMessage("Completa correo y ambas contrasenas.")}`, siteUrl)
    );
  }

  if (isStaffEmail(email)) {
    return NextResponse.redirect(
      new URL(
        `/admin/login?error=${sanitizeMessage("El personal interno debe entrar desde el acceso de control.")}`,
        siteUrl
      )
    );
  }

  if (password.length < 8) {
    return NextResponse.redirect(
      new URL(`/login?error=${sanitizeMessage("La contrasena debe tener minimo 8 caracteres.")}`, siteUrl)
    );
  }

  if (password !== passwordConfirm) {
    return NextResponse.redirect(
      new URL(`/login?error=${sanitizeMessage("Las contrasenas no coinciden.")}`, siteUrl)
    );
  }

  const { supabase, withCookies } = createAuthRouteClient(request);
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`
    }
  });

  if (error) {
    return withCookies(
      NextResponse.redirect(new URL(`/login?error=${sanitizeMessage(error.message)}`, siteUrl))
    );
  }

  return withCookies(
    NextResponse.redirect(
      new URL(
        `/login?message=${sanitizeMessage(
          "Te enviamos un correo de verificacion. Antes de cualquier compra o movimiento debes confirmarlo."
        )}`,
        siteUrl
      )
    )
  );
}
