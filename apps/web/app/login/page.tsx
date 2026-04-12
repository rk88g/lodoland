import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSessionProfile } from "../../lib/auth/session";
import { sendPhoneOtpAction, signInWithGoogleAction } from "./actions";

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
      <section className="page-card auth-card">
        <h1>Intranet LODO LAND</h1>
        <p>
          Acceso para clientes. Entra con Google o recibe tu codigo SMS para abrir tu perfil,
          compras, tickets, rifas, quinielas y promociones.
        </p>

        {errorMessage ? <p className="status-note status-note-error">{errorMessage}</p> : null}

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

        <div className="hero-actions">
          <Link className="button button-secondary" href="/admin/login">
            Acceso staff
          </Link>
          <Link className="button button-secondary" href="/">
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
