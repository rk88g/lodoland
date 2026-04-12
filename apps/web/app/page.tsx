import Link from "next/link";

const sponsors = ["Monster", "Red Bull", "Fox", "Oakley", "Can-Am", "BFGoodrich"];

const influencerNames = ["Ana Torque", "Rafa Mud", "Jess Nitro", "Moto Rayo"];

const merchNames = ["Jersey Oficial", "Gorra Track", "Kit Rider", "Poster Drop"];

export default function HomePage() {
  return (
    <main className="parallax-home">
      <div className="global-grain" />
      <div className="global-glow glow-one" />
      <div className="global-glow glow-two" />

      <header className="floating-header">
        <Link className="brand-lockup" href="/">
          <span className="brand-badge" />
          <span>LODO LAND</span>
        </Link>

        <details className="section-menu">
          <summary className="section-menu-trigger">Explorar</summary>
          <div className="section-menu-panel">
            <a href="#evento">Evento reciente</a>
            <a href="#redes">Redes sociales</a>
            <a href="#patrocinadores">Patrocinadores</a>
            <a href="#influencers">Influencers</a>
            <a href="#ventas">Ventas</a>
            <a href="#merch">Merch</a>
            <Link href="/login">Mi cuenta</Link>
          </div>
        </details>
      </header>

      <section className="immersive-section event-section" id="evento">
        <div className="sticky-stage">
          <div className="scene-layer event-haze" />
          <div className="scene-layer event-sun" />
          <div className="scene-layer mud-wave mud-wave-a" />
          <div className="scene-layer mud-wave mud-wave-b" />
          <div className="scene-layer tire-track tire-track-a" />
          <div className="scene-layer tire-track tire-track-b" />

          <div className="section-content">
            <span className="section-tag">Evento mas reciente</span>
            <h1 className="hero-wordmark">LODO LAND</h1>
            <h2 className="section-headline">Mud Festival 2026</h2>
            <p className="section-copy">
              La primera capa presenta el evento principal como una escena completa: fecha,
              ciudad, fases de ticket, narrativa visual y una entrada directa al flujo de compra.
            </p>

            <div className="inline-metadata">
              <span>28 JUN</span>
              <span>Guadalajara</span>
              <span>General + VIP</span>
            </div>

            <div className="section-actions">
              <Link className="action-solid" href="/eventos">
                Ver evento
              </Link>
              <Link className="action-outline" href="/login">
                Comprar boletos
              </Link>
            </div>
          </div>

          <div className="side-message event-message">
            Pistas extremas, activaciones de marca, creators invitados y una salida limpia hacia
            boletos, rifas y promociones.
          </div>
        </div>
      </section>

      <section className="immersive-section social-section" id="redes">
        <div className="sticky-stage">
          <div className="scene-layer social-gradient" />
          <div className="scene-layer social-frame social-frame-left" />
          <div className="scene-layer social-frame social-frame-right" />
          <div className="scene-layer social-ribbon social-ribbon-top">
            FACEBOOK INSTAGRAM FACEBOOK INSTAGRAM
          </div>
          <div className="scene-layer social-ribbon social-ribbon-bottom">
            REELS POSTS STORIES HIGHLIGHTS REELS POSTS STORIES
          </div>

          <div className="section-content align-right">
            <span className="section-tag">Redes sociales</span>
            <h2 className="section-headline">La Pagina Debe Respirar Como Feed Vivo</h2>
            <p className="section-copy">
              Esta capa esta pensada para previews mini de Facebook e Instagram integrados como
              escenografia del sitio, no como simples tarjetas sueltas.
            </p>
            <p className="section-note">
              Aqui van handles, links, embeds, visual mini y cualquier copy promocional editable.
            </p>
          </div>
        </div>
      </section>

      <section className="immersive-section sponsors-section" id="patrocinadores">
        <div className="sticky-stage">
          <div className="scene-layer sponsor-glow" />
          <div className="scene-layer sponsor-grid-lines" />
          <div className="scene-layer sponsor-marquee sponsor-marquee-a">
            {sponsors.join("  |  ")}  |  {sponsors.join("  |  ")}
          </div>
          <div className="scene-layer sponsor-marquee sponsor-marquee-b">
            PARTNERS  |  LOGOS  |  MARCAS  |  ALIANZAS  |  PARTNERS  |  LOGOS
          </div>

          <div className="section-content">
            <span className="section-tag">Patrocinadores</span>
            <h2 className="section-headline">Marcas Que Tambien Se Sientan Escena</h2>
            <p className="section-copy">
              Los patrocinadores no deben verse como lista plana. Esta pantalla esta pensada para
              logos, tiers, empresas, links oficiales y fondos visuales editables desde admin.
            </p>
          </div>
        </div>
      </section>

      <section className="immersive-section influencers-section" id="influencers">
        <div className="sticky-stage">
          <div className="scene-layer influencer-beam" />
          <div className="scene-layer influencer-orb influencer-orb-a" />
          <div className="scene-layer influencer-orb influencer-orb-b" />
          <div className="scene-layer influencer-column influencer-column-a" />
          <div className="scene-layer influencer-column influencer-column-b" />

          <div className="section-content align-right">
            <span className="section-tag">Influencers</span>
            <h2 className="section-headline">Perfiles, Colaboraciones Y Energia De Creator</h2>
            <p className="section-copy">
              Cada influencer entra como parte de una narrativa visual distinta: handle, enlaces,
              plataforma, foto, bio y colaboraciones con scroll inmersivo.
            </p>
          </div>

          <div className="name-cloud">
            {influencerNames.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="immersive-section sales-section" id="ventas">
        <div className="sticky-stage">
          <div className="scene-layer sales-halo" />
          <div className="scene-layer sales-ring sales-ring-a" />
          <div className="scene-layer sales-ring sales-ring-b" />
          <div className="scene-layer sales-splash sales-splash-a" />
          <div className="scene-layer sales-splash sales-splash-b" />

          <div className="section-content">
            <span className="section-tag">Ventas</span>
            <h2 className="section-headline">Promos, Drops Y Conversion Sin Salir Del Ritmo</h2>
            <p className="section-copy">
              Esta capa debe vender. Aqui entran rifas, quinielas, paquetes y promociones con un
              scroll poderoso y visuales de alto impacto.
            </p>

            <div className="price-bursts">
              <span>Desde $399 MXN</span>
              <span>Combos crew</span>
              <span>Promos limitadas</span>
            </div>

            <div className="section-actions">
              <Link className="action-solid" href="/perfil">
                Ir a compras
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="immersive-section merch-section" id="merch">
        <div className="sticky-stage">
          <div className="scene-layer merch-light" />
          <div className="scene-layer merch-panel merch-panel-a" />
          <div className="scene-layer merch-panel merch-panel-b" />
          <div className="scene-layer merch-panel merch-panel-c" />

          <div className="section-content align-right">
            <span className="section-tag">Merch</span>
            <h2 className="section-headline">La Ultima Capa Debe Sentirse Como Drop Editorial</h2>
            <p className="section-copy">
              Merch, bundles y colaboraciones deben cerrar la experiencia con una sensacion de
              coleccion especial, lista para comprar desde el perfil del usuario.
            </p>

            <div className="merch-list">
              {merchNames.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            <div className="section-actions">
              <Link className="action-solid" href="/login">
                Mi cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

