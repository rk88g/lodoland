import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSessionProfile } from "../../lib/auth/session";
import {
  sendPhoneOtpAction,
  signInStaffAction,
  signInWithGoogleAction
} from "./actions";

type LoginPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getCurrentSessionProfile();

  if (session.user) {
    if (session.profile?.role === "admin" || session.profile?.role === "super_admin") {
      redirect("/admin");
    }

    redirect("/perfil");
  }

  const errorMessage = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

  return (
    <main className="page-frame">
      <section className="page-card auth-card auth-card-wide">
        <h1>Acceso LODO LAND</h1>
        <p>
          Clientes: Google o telefono. Staff, ventas, supervisores y administracion: correo
          organizacional `@lodoland.mx`.
        </p>

        {errorMessage ? <p className="status-note status-note-error">{errorMessage}</p> : null}

        <div className="auth-split">
          <article className="list-card auth-panel">
            <strong>Acceso cliente</strong>
            <p>Entra a compras, tickets, rifas, quinielas, pedidos y promociones.</p>

            <form action={signInWithGoogleAction} className="auth-inline-form">
              <button className="button button-primary auth-button-wide" type="submit">
                Entrar con Google
              </button>
            </form>

            <form action={sendPhoneOtpAction} className="auth-form">
              <label className="field-stack" htmlFor="phone">
                Numero de telefono
                <input
                  className="input-shell"
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+523312345678"
                  required
                />
              </label>

              <button className="button button-secondary auth-button-wide" type="submit">
                Recibir codigo SMS
              </button>
            </form>
          </article>

          <article className="list-card auth-panel">
            <strong>Acceso staff</strong>
            <p>Solo para super-admin, administracion, ventas, gerencias y personal interno.</p>

            <form action={signInStaffAction} className="auth-form">
              <label className="field-stack" htmlFor="email">
                Correo organizacional
                <input
                  className="input-shell"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ventas2@lodoland.mx"
                  required
                />
              </label>

              <label className="field-stack" htmlFor="password">
                Contrasena
                <input className="input-shell" id="password" name="password" type="password" required />
              </label>

              <button className="button button-primary auth-button-wide" type="submit">
                Entrar al control
              </button>
            </form>
          </article>
        </div>

        <div className="hero-actions">
          <Link className="button button-secondary" href="/">
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
