import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSessionProfile } from "../../lib/auth/session";
import { signInAction } from "./actions";

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
        <h1>Iniciar Sesion</h1>
        <p>
          Accede con tu correo y contrasena de Supabase. Si tu perfil tiene rol `admin` o
          `super_admin`, entraras directo al panel privado.
        </p>

        {errorMessage ? <p className="status-note status-note-error">{errorMessage}</p> : null}

        <form action={signInAction} className="auth-form">
          <label className="field-stack" htmlFor="email">
            Correo
            <input className="input-shell" id="email" name="email" type="email" required />
          </label>

          <label className="field-stack" htmlFor="password">
            Contrasena
            <input className="input-shell" id="password" name="password" type="password" required />
          </label>

          <div className="hero-actions">
            <button className="button button-primary" type="submit">
              Entrar
            </button>
            <Link className="button button-secondary" href="/">
              Volver al inicio
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
