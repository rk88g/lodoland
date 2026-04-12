import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSessionProfile } from "../../../lib/auth/session";
import { signInStaffAction } from "../../login/actions";

type AdminLoginPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const session = await getCurrentSessionProfile();

  if (session.user && (session.profile?.role === "admin" || session.profile?.role === "super_admin")) {
    redirect("/admin");
  }

  const errorMessage = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

  return (
    <main className="page-frame">
      <section className="page-card auth-card">
        <h1>Control LODO LAND</h1>
        <p>
          Acceso exclusivo para super-admin, administracion, ventas, supervisores y gerencias con
          correo organizacional `@lodoland.mx`.
        </p>

        {errorMessage ? <p className="status-note status-note-error">{errorMessage}</p> : null}

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

        <div className="hero-actions">
          <Link className="button button-secondary" href="/login">
            Acceso clientes
          </Link>
          <Link className="button button-secondary" href="/">
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
