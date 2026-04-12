import Link from "next/link";

const latestEvent = {
  eyebrow: "Evento mas reciente",
  title: "Mud Festival 2026",
  description:
    "La experiencia principal de LODO LAND con pistas extremas, zonas premium, activaciones de marca, venta de boletos por fase y beneficios editables desde admin.",
  meta: [
    { label: "Fecha", value: "28 JUN" },
    { label: "Lugar", value: "Guadalajara" },
    { label: "Boletos", value: "General + VIP" }
  ],
  highlights: [
    "Preventa por fases con control de cupo.",
    "Zona de marcas, activaciones e influencers.",
    "Checkout directo desde la pagina."
  ]
};

const socialPreviews = [
  {
    platform: "Facebook",
    handle: "/LodoLandMx",
    label: "Feed mini",
    description: "Vista compacta para anunciar fechas, galerias y lanzamientos de boletos."
  },
  {
    platform: "Instagram",
    handle: "@lodolandmx",
    label: "Reels mini",
    description: "Highlights visuales, drops de merch, promos y cobertura de influencers."
  }
];

const sponsors = [
  "Monster",
  "Red Bull",
  "Fox Racing",
  "Oakley",
  "Can-Am",
  "BFGoodrich"
];

const influencers = [
  {
    name: "Ana Torque",
    handle: "@anatorque",
    channel: "Instagram + TikTok",
    quote: "Contenido extremo, backstage y activaciones en vivo."
  },
  {
    name: "Rafa Mud",
    handle: "@rafamud",
    channel: "YouTube",
    quote: "Cobertura de carrera, retos y experiencias con la comunidad."
  },
  {
    name: "Jess Nitro",
    handle: "@jessnitro",
    channel: "Instagram",
    quote: "Moda, merch y colaboraciones especiales del festival."
  }
];

const sales = [
  {
    title: "Drop de temporada",
    price: "Desde $399 MXN",
    note: "Promociones online, rifas especiales y combos activables por campana."
  },
  {
    title: "Paquete crew",
    price: "Desde $1,290 MXN",
    note: "Accesos grupales, experiencias con beneficios y venta limitada."
  }
];

const merch = [
  {
    title: "Jersey oficial",
    badge: "Nuevo",
    detail: "Edicion tecnica para eventos, lanzamientos y colaboraciones."
  },
  {
    title: "Gorra track",
    badge: "Top seller",
    detail: "Coleccion para fans, patrocinadores y creators invitados."
  },
  {
    title: "Kit rider",
    badge: "Bundle",
    detail: "Playera, stickers, lanyard y beneficios para activaciones."
  }
];

export default function HomePage() {
  return (
    <main className="home-shell">
      <div className="noise-layer" />
      <div className="aurora aurora-a" />
      <div className="aurora aurora-b" />

      <header className="site-header">
        <Link className="site-brand" href="/">
          <span className="site-brand-mark" />
          <span>LODO LAND</span>
        </Link>

        <nav className="site-nav" aria-label="Secciones principales">
          <a href="#evento">Evento</a>
          <a href="#redes">Redes</a>
          <a href="#patrocinadores">Patrocinadores</a>
          <a href="#influencers">Influencers</a>
          <a href="#ventas">Ventas</a>
          <a href="#merch">Merch</a>
          <Link className="site-nav-login" href="/login">
            Mi cuenta
          </Link>
        </nav>
      </header>

      <section className="intro-band">
        <span className="home-chip">Experiencias, compras y contenido vivo</span>
        <p>
          Landing inmersiva con scroll narrativo, bloques editables y acceso a login para compras,
          boletos, rifas, quinielas y promociones.
        </p>
      </section>

      <section className="story-section section-event" id="evento">
        <div className="section-backdrop">
          <div className="section-orb orb-event-a" />
          <div className="section-orb orb-event-b" />
        </div>

        <div className="section-grid">
          <article className="section-copy">
            <span className="section-kicker">{latestEvent.eyebrow}</span>
            <h1 className="section-title">El Proximo Golpe De Lodo</h1>
            <p className="section-body">{latestEvent.description}</p>

            <div className="meta-strip">
              {latestEvent.meta.map((item) => (
                <article className="meta-card" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>

            <div className="cta-row">
              <Link className="primary-button" href="/eventos">
                Ver evento
              </Link>
              <Link className="ghost-button" href="/login">
                Comprar boletos
              </Link>
            </div>
          </article>

          <article className="section-stage">
            <div className="stage-window">
              <div className="stage-topline">
                <span>Evento reciente</span>
                <span>{latestEvent.title}</span>
              </div>

              <div className="stage-poster">
                <div className="poster-badge">Featured</div>
                <div className="poster-title">Mud Festival</div>
                <div className="poster-subtitle">Drops, boletos, alianzas y activaciones</div>
              </div>

              <div className="bullet-stack">
                {latestEvent.highlights.map((item) => (
                  <div className="bullet-card" key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="story-section section-social" id="redes">
        <div className="section-backdrop">
          <div className="section-orb orb-social-a" />
          <div className="section-orb orb-social-b" />
        </div>

        <div className="section-grid reverse-grid">
          <article className="section-stage">
            <div className="social-stack">
              {socialPreviews.map((profile) => (
                <article className="social-card" key={profile.platform}>
                  <div className="social-header">
                    <strong>{profile.platform}</strong>
                    <span>{profile.label}</span>
                  </div>
                  <div className="social-screen">
                    <div className="social-bar" />
                    <div className="social-post large-post" />
                    <div className="social-post-grid">
                      <div className="social-post small-post" />
                      <div className="social-post small-post" />
                      <div className="social-post small-post" />
                    </div>
                  </div>
                  <div className="social-footer">
                    <span>{profile.handle}</span>
                    <p>{profile.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="section-copy">
            <span className="section-kicker">Social hub</span>
            <h2 className="section-title">Facebook E Instagram Como Mini Escaparates</h2>
            <p className="section-body">
              Esta seccion esta pensada para mostrar previews compactos del contenido social y
              empujar trafico a las cuentas oficiales con visuales vivos y CTAs medibles.
            </p>

            <div className="info-panel">
              <strong>Editable desde admin</strong>
              <p>
                Links, embeds, handles, textos, colores, miniaturas y orden de aparicion por
                plataforma.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="story-section section-sponsors" id="patrocinadores">
        <div className="section-backdrop">
          <div className="section-orb orb-sponsor-a" />
          <div className="section-orb orb-sponsor-b" />
        </div>

        <div className="section-grid">
          <article className="section-copy">
            <span className="section-kicker">Partners</span>
            <h2 className="section-title">Patrocinadores Con Peso Propio</h2>
            <p className="section-body">
              Cada marca debe sentirse como parte del festival, no como una lista plana. Aqui
              mostramos logos, categorias, links y presencia visual con jerarquia.
            </p>
          </article>

          <article className="section-stage">
            <div className="logo-wall">
              {sponsors.map((sponsor, index) => (
                <div className="logo-chip" key={sponsor} style={{ animationDelay: `${index * 120}ms` }}>
                  {sponsor}
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="story-section section-influencers" id="influencers">
        <div className="section-backdrop">
          <div className="section-orb orb-influencer-a" />
          <div className="section-orb orb-influencer-b" />
        </div>

        <div className="section-grid reverse-grid">
          <article className="section-stage">
            <div className="influencer-rail">
              {influencers.map((person) => (
                <article className="influencer-card" key={person.handle}>
                  <div className="avatar-glow" />
                  <strong>{person.name}</strong>
                  <span>{person.handle}</span>
                  <small>{person.channel}</small>
                  <p>{person.quote}</p>
                </article>
              ))}
            </div>
          </article>

          <article className="section-copy">
            <span className="section-kicker">Creators</span>
            <h2 className="section-title">Influencers, Canales Y Colaboraciones</h2>
            <p className="section-body">
              Esta capa esta hecha para destacar perfiles invitados, colaboraciones, links directos
              y activaciones de creators con presencia visual distinta a las otras secciones.
            </p>

            <div className="cta-row">
              <a className="ghost-button" href="#ventas">
                Ver ventas destacadas
              </a>
            </div>
          </article>
        </div>
      </section>

      <section className="story-section section-sales" id="ventas">
        <div className="section-backdrop">
          <div className="section-orb orb-sales-a" />
          <div className="section-orb orb-sales-b" />
        </div>

        <div className="section-grid">
          <article className="section-copy">
            <span className="section-kicker">Ventas online</span>
            <h2 className="section-title">Promos, Combos Y Drops Comerciales</h2>
            <p className="section-body">
              Esta seccion debe empujar conversion. Cada card puede apuntar a ticketing, rifas,
              quinielas o promociones especiales con control total desde admin.
            </p>
          </article>

          <article className="section-stage">
            <div className="sales-grid">
              {sales.map((sale) => (
                <article className="sale-card" key={sale.title}>
                  <span>{sale.price}</span>
                  <strong>{sale.title}</strong>
                  <p>{sale.note}</p>
                  <Link className="sale-link" href="/perfil">
                    Ir a compras
                  </Link>
                </article>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="story-section section-merch" id="merch">
        <div className="section-backdrop">
          <div className="section-orb orb-merch-a" />
          <div className="section-orb orb-merch-b" />
        </div>

        <div className="section-grid reverse-grid">
          <article className="section-stage">
            <div className="merch-carousel">
              {merch.map((item) => (
                <article className="merch-card" key={item.title}>
                  <span>{item.badge}</span>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </article>

          <article className="section-copy">
            <span className="section-kicker">Store</span>
            <h2 className="section-title">Merch Que Se Sienta Como Coleccion</h2>
            <p className="section-body">
              El cierre del home se convierte en vitrina de producto: texturas, ediciones,
              bundles, drops y colaboraciones con una identidad mas editorial.
            </p>

            <div className="cta-row">
              <Link className="primary-button" href="/perfil">
                Ver mi cuenta
              </Link>
              <Link className="ghost-button" href="/login">
                Iniciar sesion
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

