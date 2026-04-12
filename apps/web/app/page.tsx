import Link from "next/link";

const stats = [
  { value: "+12", label: "formatos de venta para eventos y dinamicas" },
  { value: "100%", label: "contenido editable desde el panel admin" },
  { value: "24/7", label: "compra en linea con acceso a promociones" },
  { value: "1", label: "ecosistema para tickets, rifas y quinielas" }
];

const commerceFeatures = [
  {
    title: "Tickets para eventos",
    description:
      "Crea experiencias con cupos, tipos de acceso, fechas, precios y estados de venta."
  },
  {
    title: "Rifas digitales",
    description:
      "Publica rifas con reglas, limites de participacion, resultados y seguimiento de compras."
  },
  {
    title: "Quinielas",
    description:
      "Vende accesos a quinielas con dinamicas configurables y control de estatus."
  },
  {
    title: "Promociones y ventas",
    description:
      "Lanza productos especiales, promociones por temporada y ofertas activadas desde admin."
  }
];

const adminFeatures = [
  {
    title: "CMS por campo",
    description: "Cada titulo, etiqueta, boton, imagen o link se edita de forma individual."
  },
  {
    title: "Panel modular",
    description: "Eventos, rifas, quinielas y ventas se administran desde modulos separados."
  },
  {
    title: "Auditoria",
    description: "Los cambios importantes quedan registrados para control interno."
  },
  {
    title: "Escalable",
    description: "La estructura queda lista para pagos, notificaciones y reportes."
  }
];

export default function HomePage() {
  return (
    <main className="site-shell">
      <div className="grain" />

      <header className="topbar">
        <Link className="brand" href="/">
          <span className="brand-mark" />
          <span>LODO LAND</span>
        </Link>

        <nav className="nav">
          <Link href="#experiencias">Experiencias</Link>
          <Link href="#commerce">Compras</Link>
          <Link href="#admin">Admin</Link>
          <Link href="/login">Iniciar sesion</Link>
          <Link className="cta-link" href="/perfil">
            Comprar ahora
          </Link>
        </nav>
      </header>

      <section className="hero" id="experiencias">
        <div className="hero-copy">
          <span className="eyebrow">Eventos, rifas, quinielas y ventas online</span>
          <h1>LODO LAND</h1>
          <p>
            Una plataforma hecha para vender experiencias con una portada visual potente,
            acceso de usuarios, compras integradas y un panel administrador que controla cada
            texto, imagen, etiqueta y enlace de la web por separado.
          </p>

          <div className="hero-actions">
            <Link className="button button-primary" href="/login">
              Iniciar sesion
            </Link>
            <Link className="button button-secondary" href="/admin">
              Ver panel admin
            </Link>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="sun" />
          <div className="mud-ring ring-a" />
          <div className="mud-ring ring-b" />
          <div className="float-card card-main">
            <strong>Landing con narrativa visual</strong>
            <p>
              Scroll inmersivo, capas, bloques con profundidad y llamadas a la accion para
              convertir visitas en compras.
            </p>
          </div>
          <div className="float-card card-event">
            <strong>Evento destacado</strong>
            <p>Tickets generales, VIP, preventa y promociones activables desde el panel.</p>
          </div>
          <div className="float-card card-cta">
            <strong>Compra directa</strong>
            <p>El usuario entra, inicia sesion y compra sin salir de la pagina.</p>
          </div>
          <div className="mud-wave" />
        </div>
      </section>

      <section className="stat-grid">
        {stats.map((stat) => (
          <article className="stat" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </section>

      <section className="parallax-section" id="commerce">
        <div className="parallax-panel">
          <article className="panel-copy">
            <span className="kicker">Comercio digital</span>
            <h2 className="display-title">Compra Todo Desde Tu Perfil</h2>
            <p>
              La experiencia autenticada se centra en una cuenta desde donde cada persona puede
              comprar tickets, rifas, quinielas y promociones sin brincar entre paginas
              aisladas.
            </p>

            <div className="feature-grid">
              {commerceFeatures.map((feature) => (
                <article className="feature" key={feature.title}>
                  <strong>{feature.title}</strong>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </article>

          <article className="panel-card">
            <div>
              <span className="kicker">Usuario autenticado</span>
              <h3 className="display-title">Perfil</h3>
              <p>
                Historial de ordenes, metodos de pago, boletos activos, rifas compradas y acceso
                a promociones privadas.
              </p>
            </div>

            <div className="mini-grid">
              <article className="mini-card">
                <strong>Eventos</strong>
                <p>Boletos con cupo, variantes y control de disponibilidad.</p>
              </article>
              <article className="mini-card">
                <strong>Rifas</strong>
                <p>Entradas por participante, resultados y estados de compra.</p>
              </article>
              <article className="mini-card">
                <strong>Quinielas</strong>
                <p>Pago de acceso, reglas y seguimiento de participacion.</p>
              </article>
              <article className="mini-card">
                <strong>Promos</strong>
                <p>Productos o campanas especiales vendidas directo en la web.</p>
              </article>
            </div>
          </article>
        </div>
      </section>

      <section className="parallax-section" id="admin">
        <div className="parallax-panel">
          <article className="panel-card">
            <div>
              <span className="kicker">Control total</span>
              <h3 className="display-title">Admin</h3>
              <p>
                Todo lo visible en la pagina puede editarse como contenido administrable:
                textos, links, botones, imagenes, tarjetas, bloques y CTA.
              </p>
            </div>

            <div className="mini-grid">
              {adminFeatures.map((feature) => (
                <article className="mini-card" key={feature.title}>
                  <strong>{feature.title}</strong>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </article>

          <article className="panel-copy">
            <span className="kicker">Backoffice operativo</span>
            <h2 className="display-title">Gestiona Cada Venta</h2>
            <p>
              El panel inicial queda listo para crear eventos, rifas, quinielas y ventas
              especiales, ademas de preparar el terreno para pagos integrados y auditoria.
            </p>

            <div className="feature-grid">
              <article className="feature">
                <strong>Eventos</strong>
                <p>Nombre, slug, fechas, ubicacion, capacidad, visibilidad y tipos de ticket.</p>
              </article>
              <article className="feature">
                <strong>Rifas</strong>
                <p>Reglas, precio por entrada, maximos, fechas y publicacion.</p>
              </article>
              <article className="feature">
                <strong>Quinielas</strong>
                <p>Edicion de dinamica, precio, cierre, resultados y estatus.</p>
              </article>
              <article className="feature">
                <strong>Ventas</strong>
                <p>Promociones, productos y bundles visibles en campanas o en perfil.</p>
              </article>
            </div>
          </article>
        </div>
      </section>

      <section className="cta-band">
        <h2 className="display-title">Listo Para Crecer</h2>
        <p>
          Esta base ya contempla frontend en Vercel, backend en Railway, dominio en Cloudflare,
          autenticacion y datos en Supabase, y una estructura de base de datos preparada para
          migraciones, pagos y control granular del contenido.
        </p>

        <div className="hero-actions">
          <Link className="button button-secondary" href="/perfil">
            Ir a mi perfil
          </Link>
          <Link className="button button-secondary" href="/admin/contenido">
            Editar contenido
          </Link>
        </div>
      </section>

      <footer className="footer">
        <span>LODO LAND | Plataforma comercial y experiencia visual</span>
        <span>Cloudflare | Vercel | Railway | Supabase | GitHub</span>
      </footer>
    </main>
  );
}
