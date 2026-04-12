import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="page-frame">
      <section className="page-card">
        <span className="eyebrow">Acceso</span>
        <h1>Iniciar Sesion</h1>
        <p>
          Esta pantalla queda lista para conectarse con Supabase Auth y permitir acceso por
          correo, magic link o proveedor social.
        </p>

        <div className="grid-two">
          <article className="list-card">
            <strong>Flujo previsto</strong>
            <p>
              Registro, inicio de sesion, recuperacion de acceso y redireccion al perfil del
              usuario.
            </p>
          </article>
          <article className="list-card">
            <strong>Destino</strong>
            <p>Una vez autenticado, el usuario entra a compras, boletos y promociones.</p>
          </article>
        </div>

        <div className="hero-actions">
          <Link className="button button-primary" href="/perfil">
            Continuar al perfil
          </Link>
          <Link className="button button-secondary" href="/">
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}

