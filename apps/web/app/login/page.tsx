import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSessionProfile } from "../../lib/auth/session";
import {
  signInWithEmailAction,
  signInWithFacebookAction,
  signInWithGoogleAction,
  signUpWithEmailAction
} from "./actions";

type LoginPageProps = {
  searchParams?: {
    error?: string;
    message?: string;
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
  const successMessage = searchParams?.message ? decodeURIComponent(searchParams.message) : null;

  return (
    <main className="page-frame">
      <section className="page-card auth-card auth-card-wide">
        <h1>Intranet LODO LAND</h1>
        <p>
          Acceso para clientes con Google, Facebook o correo electronico. Antes de cualquier
          compra, movimiento, pedido o participacion, debes verificar tu correo.
        </p>

        {errorMessage ? <p className="status-note status-note-error">{errorMessage}</p> : null}
        {successMessage ? <p className="status-note status-note-success">{successMessage}</p> : null}

        <div className="auth-split">
          <section className="auth-panel">
            <h2>Entrar rapido</h2>
            <p>Usa tu proveedor social para iniciar sesion o crear tu acceso de cliente.</p>

            <div className="auth-provider-stack">
              <form action={signInWithGoogleAction} className="auth-inline-form">
                <button className="button auth-provider-button auth-provider-google auth-button-wide" type="submit">
                  <span className="provider-logo provider-logo-google" aria-hidden="true">
                    <svg viewBox="0 0 24 24" role="img">
                      <path
                        d="M21.8 12.23c0-.73-.06-1.43-.2-2.09H12v3.95h5.49a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.05-4.4 3.05-7.5Z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 22c2.76 0 5.08-.91 6.77-2.47l-3.3-2.56c-.92.62-2.08.98-3.47.98-2.67 0-4.94-1.8-5.74-4.22H2.85v2.64A10 10 0 0 0 12 22Z"
                        fill="#34A853"
                      />
                      <path
                        d="M6.26 13.73a5.98 5.98 0 0 1 0-3.46V7.63H2.85a10 10 0 0 0 0 8.74l3.41-2.64Z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 6.05c1.5 0 2.85.52 3.91 1.53l2.93-2.93C17.07 2.98 14.76 2 12 2A10 10 0 0 0 2.85 7.63l3.41 2.64C7.06 7.85 9.33 6.05 12 6.05Z"
                        fill="#EA4335"
                      />
                    </svg>
                  </span>
                  <span>Entrar con Google</span>
                </button>
              </form>

              <form action={signInWithFacebookAction} className="auth-inline-form">
                <button className="button auth-provider-button auth-provider-facebook auth-button-wide" type="submit">
                  <span className="provider-logo provider-logo-facebook" aria-hidden="true">
                    <svg viewBox="0 0 24 24" role="img">
                      <path
                        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.03 4.39 11.02 10.13 11.93v-8.44H7.08v-3.5h3.05V9.39c0-3.03 1.79-4.7 4.54-4.7 1.31 0 2.69.24 2.69.24v2.98h-1.52c-1.5 0-1.96.94-1.96 1.89v2.26h3.34l-.53 3.5h-2.81V24C19.61 23.09 24 18.1 24 12.07Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  <span>Entrar con Facebook</span>
                </button>
              </form>
            </div>
          </section>

          <section className="auth-panel">
            <h2>Entrar con correo</h2>
            <p>Si ya tienes cuenta, entra con tu correo y contrasena.</p>

            <form action={signInWithEmailAction} className="auth-form">
              <label className="field-stack" htmlFor="customer-login-email">
                Correo electronico
                <input
                  className="input-shell"
                  id="customer-login-email"
                  name="email"
                  type="email"
                  placeholder="cliente@correo.com"
                  required
                />
              </label>

              <label className="field-stack" htmlFor="customer-login-password">
                Contrasena
                <input
                  className="input-shell"
                  id="customer-login-password"
                  name="password"
                  type="password"
                  required
                />
              </label>

              <button className="button button-secondary auth-button-wide" type="submit">
                Iniciar sesion
              </button>
            </form>
          </section>

          <section className="auth-panel">
            <h2>Crear cuenta con correo</h2>
            <p>
              Antes de cualquier movimiento como cliente, el sistema te pedira verificar este
              correo.
            </p>

            <form action={signUpWithEmailAction} className="auth-form">
              <label className="field-stack" htmlFor="customer-signup-email">
                Correo electronico
                <input
                  className="input-shell"
                  id="customer-signup-email"
                  name="email"
                  type="email"
                  placeholder="cliente@correo.com"
                  required
                />
              </label>

              <label className="field-stack" htmlFor="customer-signup-password">
                Contrasena
                <input
                  className="input-shell"
                  id="customer-signup-password"
                  name="password"
                  type="password"
                  minLength={8}
                  required
                />
              </label>

              <label className="field-stack" htmlFor="customer-signup-password-confirm">
                Confirmar contrasena
                <input
                  className="input-shell"
                  id="customer-signup-password-confirm"
                  name="passwordConfirm"
                  type="password"
                  minLength={8}
                  required
                />
              </label>

              <button className="button button-primary auth-button-wide" type="submit">
                Crear cuenta y verificar correo
              </button>
            </form>
          </section>
        </div>

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
