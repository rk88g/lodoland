import Link from "next/link";
import { verifyPhoneOtpAction } from "../actions";

type VerifyPageProps = {
  searchParams?: {
    phone?: string;
    error?: string;
  };
};

export default function VerifyPhonePage({ searchParams }: VerifyPageProps) {
  const phone = searchParams?.phone ? decodeURIComponent(searchParams.phone) : "";
  const errorMessage = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

  return (
    <main className="page-frame">
      <section className="page-card auth-card">
        <h1>Verificar Codigo</h1>
        <p>Ingresa el codigo SMS enviado a {phone || "tu telefono"}.</p>

        {errorMessage ? <p className="status-note status-note-error">{errorMessage}</p> : null}

        <form action={verifyPhoneOtpAction} className="auth-form">
          <input name="phone" type="hidden" value={phone} />

          <label className="field-stack" htmlFor="token">
            Codigo
            <input className="input-shell" id="token" name="token" inputMode="numeric" required />
          </label>

          <div className="hero-actions">
            <button className="button button-primary" type="submit">
              Verificar
            </button>
            <Link className="button button-secondary" href="/login">
              Volver
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
