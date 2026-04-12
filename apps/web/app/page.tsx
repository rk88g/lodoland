"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SocialLink = {
  label: string;
  href: string;
};

type Influencer = {
  name: string;
  role: string;
  description: string;
  links: SocialLink[];
};

type SaleOffer = {
  title: string;
  subtitle: string;
  price: string;
  accent: string;
};

type MenuSponsorPanel = {
  name: string;
  websiteUrl: string;
  socials: SocialLink[];
};

const officialSponsor = {
  title: "Patrocinador oficial",
  name: "Sponsor Principal",
  description:
    "Este modal inicial presenta al patrocinador oficial del evento con imagen protagonista, mensaje destacado y salidas configurables a web y red social.",
  websiteLabel: "Ir al sitio",
  websiteUrl: "https://example.com",
  socialLabel: "Ver red social",
  socialUrl: "https://instagram.com"
};

const socialProfiles = [
  {
    platform: "Facebook",
    account: "LODO LAND GDL",
    handle: "@lodolandgdl",
    url: "https://facebook.com/lodolandgdl",
    teaser: "Eventos, galerias, boletos y anuncios oficiales."
  },
  {
    platform: "Instagram",
    account: "LODO LAND GDL",
    handle: "@lodolandgdl",
    url: "https://instagram.com/lodolandgdl",
    teaser: "Reels, drops, backstage y cobertura visual."
  }
];

const sponsorTiles = [
  "Monster Energy",
  "Fox Racing",
  "Oakley",
  "Can-Am",
  "BFGoodrich",
  "Red Bull",
  "GoPro",
  "Polaris"
];

const influencerProfiles: Influencer[] = [
  {
    name: "Ana Torque",
    role: "Embajadora de pista",
    description: "Contenido de backstage, retos de lodo y activaciones con marcas aliadas.",
    links: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "TikTok", href: "https://tiktok.com" }
    ]
  },
  {
    name: "Rafa Mud",
    role: "Creator de carreras",
    description: "Cobertura de recorridos, entrevistas y dinamicas con la comunidad.",
    links: [
      { label: "YouTube", href: "https://youtube.com" },
      { label: "Instagram", href: "https://instagram.com" }
    ]
  },
  {
    name: "Jess Nitro",
    role: "Host de experiencias",
    description: "Moda, merch, experiencias premium y contenido en vivo durante el evento.",
    links: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "Facebook", href: "https://facebook.com" }
    ]
  },
  {
    name: "Moto Rayo",
    role: "Invitado especial",
    description: "Cobertura de retos extremos y colaboraciones con riders y sponsors.",
    links: [
      { label: "TikTok", href: "https://tiktok.com" },
      { label: "YouTube", href: "https://youtube.com" }
    ]
  }
];

const salesOffers: SaleOffer[] = [
  {
    title: "Boletos",
    subtitle: "General, VIP y preventa",
    price: "Desde $399 MXN",
    accent: "sale-mud"
  },
  {
    title: "Rifas",
    subtitle: "Numeros especiales y premios",
    price: "Desde $99 MXN",
    accent: "sale-gold"
  },
  {
    title: "Quinielas",
    subtitle: "Entradas, picks y premios",
    price: "Desde $149 MXN",
    accent: "sale-blue"
  },
  {
    title: "Promos",
    subtitle: "Combos y drops online",
    price: "Edicion limitada",
    accent: "sale-pink"
  }
];

const merchItems = ["Jersey oficial", "Gorra track", "Kit rider"];

const footerTrack = [
  "Monster",
  "Fox",
  "Oakley",
  "Ana Torque",
  "Rafa Mud",
  "Jess Nitro",
  "Can-Am",
  "GoPro"
];

const menuSponsorPanels: MenuSponsorPanel[] = [
  {
    name: "Monster Energy",
    websiteUrl: "https://example.com",
    socials: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "Facebook", href: "https://facebook.com" }
    ]
  },
  {
    name: "Fox Racing",
    websiteUrl: "https://example.com",
    socials: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "TikTok", href: "https://tiktok.com" }
    ]
  },
  {
    name: "Oakley",
    websiteUrl: "https://example.com",
    socials: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "YouTube", href: "https://youtube.com" }
    ]
  }
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sponsorModalOpen, setSponsorModalOpen] = useState(true);
  const [influencerModalOpen, setInfluencerModalOpen] = useState(false);
  const [merchModalOpen, setMerchModalOpen] = useState(false);
  const [activeSale, setActiveSale] = useState(0);
  const [saleModalIndex, setSaleModalIndex] = useState<number | null>(null);
  const [activeMenuPanel, setActiveMenuPanel] = useState(3);
  const isOverlayOpen = sponsorModalOpen || menuOpen || influencerModalOpen || merchModalOpen || saleModalIndex !== null;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (isOverlayOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOverlayOpen]);

  return (
    <main className="ll-home">
      <div className="page-noise" />
      <div className="page-glow glow-left" />
      <div className="page-glow glow-right" />
      <div className="mud-splash mud-splash-a" />
      <div className="mud-splash mud-splash-b" />
      <div className="mud-splash mud-splash-c" />
      <div className="water-drop water-drop-a" />
      <div className="water-drop water-drop-b" />
      <div className="water-drop water-drop-c" />

      {sponsorModalOpen ? (
        <div className="overlay-shell" role="dialog" aria-modal="true" aria-label="Patrocinador oficial">
          <div className="spotlight-modal">
            <button
              className="overlay-close"
              onClick={() => setSponsorModalOpen(false)}
              type="button"
              aria-label="Cerrar modal"
            >
              x
            </button>

            <div className="spotlight-visual" role="img" aria-label="Imagen grande del patrocinador oficial del evento" />

            <div className="spotlight-copy">
              <span className="eyebrow-chip">{officialSponsor.title}</span>
              <h1>{officialSponsor.name}</h1>
              <p>{officialSponsor.description}</p>

              <div className="overlay-actions">
                <a className="cta-solid" href={officialSponsor.websiteUrl} target="_blank" rel="noreferrer">
                  {officialSponsor.websiteLabel}
                </a>
                <a className="cta-outline" href={officialSponsor.socialUrl} target="_blank" rel="noreferrer">
                  {officialSponsor.socialLabel}
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {menuOpen ? (
        <div className="menu-overlay" role="dialog" aria-modal="true" aria-label="Menu principal">
          <button
            className="overlay-close menu-close"
            onClick={() => setMenuOpen(false)}
            type="button"
            aria-label="Cerrar menu"
          >
            x
          </button>

          <div className="menu-overlay-inner">
            <div className="menu-collapses" role="tablist" aria-label="Menu colapsable principal">
              {menuSponsorPanels.map((panel, index) => (
                <button
                  className={`menu-collapse sponsor-collapse ${activeMenuPanel === index ? "is-open" : ""}`}
                  key={panel.name}
                  onMouseEnter={() => setActiveMenuPanel(index)}
                  onClick={() => setActiveMenuPanel(index)}
                  type="button"
                >
                  <div className="menu-collapse-visual">
                    <div className={`menu-sponsor-art sponsor-art-${index + 1}`} />
                  </div>
                  <div className="menu-collapse-info">
                    <strong>{panel.name}</strong>
                    <div className="menu-socials">
                      {panel.socials.map((social) => (
                        <a href={social.href} key={social.label} target="_blank" rel="noreferrer">
                          {social.label}
                        </a>
                      ))}
                    </div>
                    <a href={panel.websiteUrl} target="_blank" rel="noreferrer">
                      Sitio
                    </a>
                  </div>
                </button>
              ))}

              <div className={`menu-collapse menu-links-collapse ${activeMenuPanel === 3 ? "is-open" : ""}`}>
                <button
                  className="menu-collapse-trigger"
                  onMouseEnter={() => setActiveMenuPanel(3)}
                  onClick={() => setActiveMenuPanel(3)}
                  type="button"
                >
                  Secciones
                </button>
                <nav className="menu-links-list" aria-label="Secciones del sitio">
                  <a href="#evento" onClick={() => setMenuOpen(false)}>
                    Evento reciente
                  </a>
                  <a href="#redes" onClick={() => setMenuOpen(false)}>
                    Redes sociales
                  </a>
                  <a href="#patrocinadores" onClick={() => setMenuOpen(false)}>
                    Patrocinadores
                  </a>
                  <a href="#influencers" onClick={() => setMenuOpen(false)}>
                    Influencers
                  </a>
                  <a href="#ventas" onClick={() => setMenuOpen(false)}>
                    Ventas
                  </a>
                  <a href="#merch" onClick={() => setMenuOpen(false)}>
                    Merch
                  </a>
                  <Link href="/login" onClick={() => setMenuOpen(false)}>
                    Mi cuenta
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {influencerModalOpen ? (
        <div className="overlay-shell" role="dialog" aria-modal="true" aria-label="Influencers colaboradores">
          <div className="influencer-modal">
            <button
              className="overlay-close"
              onClick={() => setInfluencerModalOpen(false)}
              type="button"
              aria-label="Cerrar lista de influencers"
            >
              x
            </button>

            <div className="overlay-header">
              <span className="eyebrow-chip">Colaboradores</span>
              <h2>Influencers de LODO LAND</h2>
            </div>

            <div className="influencer-modal-list">
              {influencerProfiles.map((profile) => (
                <article className="influencer-row" key={profile.name}>
                  <div className="influencer-avatar" />
                  <div>
                    <strong>{profile.name}</strong>
                    <span>{profile.role}</span>
                    <p>{profile.description}</p>
                    <div className="social-icon-row">
                      {profile.links.map((link) => (
                        <a href={link.href} key={link.label} target="_blank" rel="noreferrer">
                          <span className="social-icon">{link.label.slice(0, 1)}</span>
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {saleModalIndex !== null ? (
        <div className="overlay-shell" role="dialog" aria-modal="true" aria-label="Comprar oferta">
          <div className="sale-modal">
            <button
              className="overlay-close"
              onClick={() => setSaleModalIndex(null)}
              type="button"
              aria-label="Cerrar modal de compra"
            >
              x
            </button>

            <span className="eyebrow-chip">Compra rapida</span>
            <h2>{salesOffers[saleModalIndex].title}</h2>
            <p>
              Si no has iniciado sesion, esta accion debe enviarte al login. Si ya estas dentro,
              aqui apareceran las opciones para comprar ticket, numero de rifa, acceso o promo.
            </p>

            <div className="overlay-actions">
              <Link className="cta-solid" href="/login">
                Iniciar sesion
              </Link>
              <button className="cta-outline" onClick={() => setSaleModalIndex(null)} type="button">
                Seguir explorando
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {merchModalOpen ? (
        <div className="overlay-shell" role="dialog" aria-modal="true" aria-label="Catalogo de merch">
          <div className="merch-modal">
            <button
              className="overlay-close"
              onClick={() => setMerchModalOpen(false)}
              type="button"
              aria-label="Cerrar catalogo de merch"
            >
              x
            </button>

            <span className="eyebrow-chip">Catalogo merch</span>
            <h2>Productos en existencia</h2>
            <div className="merch-modal-grid">
              {merchItems.map((item) => (
                <article className="merch-modal-item" key={item}>
                  <div className="merch-thumb" />
                  <strong>{item}</strong>
                  <p>Producto disponible para compra cuando el usuario inicia sesion.</p>
                </article>
              ))}
            </div>
            <div className="overlay-actions">
              <Link className="cta-solid" href="/login">
                Iniciar sesion
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <header className="floating-ui">
        <Link className="floating-brand" href="/">
          <span className="floating-brand-mark" />
          <span>LODO LAND</span>
        </Link>

        <button
          className="tire-menu-button"
          onClick={() => setMenuOpen(true)}
          type="button"
          aria-label="Abrir menu principal"
        >
          <span className="tire-core" />
        </button>
      </header>

      <section className="full-section section-event" id="evento">
        <div className="sticky-scene">
          <div
            className="scene-background scene-flyer"
            role="img"
            aria-label="ALT del flyer o imagen principal del evento reciente"
          />
          <div className="event-gradient" />

          <div className="scene-copy left-copy">
            <h1 className="scene-wordmark">LODO LAND</h1>
            <h2 className="scene-title">Mud Festival 2026</h2>
            <p>
              La primera capa toma toda la pantalla con la imagen del evento y una narrativa
              directa hacia boletos, accesos y promociones activas.
            </p>
            <div className="meta-row">
              <span>28 JUN</span>
              <span>Guadalajara</span>
              <span>General + VIP</span>
            </div>
            <div className="scene-actions">
              <Link className="cta-solid" href="/eventos">
                Ver evento
              </Link>
              <Link className="cta-outline" href="/login">
                Comprar
              </Link>
            </div>
          </div>

          <a
            className="side-banner"
            href="https://example.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Banner vertical publicitario con link configurable"
          >
            Banner vertical
          </a>
        </div>
      </section>

      <section className="full-section section-social" id="redes">
        <div className="sticky-scene">
          <div className="social-glow social-glow-a" />
          <div className="social-glow social-glow-b" />
          <div className="social-splash social-splash-a" />
          <div className="social-splash social-splash-b" />
          <div className="social-splash social-splash-c" />
          <div className="social-splash social-splash-d" />
          <div className="social-splash social-splash-e" />
          <div className="social-water social-water-a" />
          <div className="social-water social-water-b" />
          <div className="social-water social-water-c" />
          <div className="social-water social-water-d" />
          <div className="social-water social-water-e" />

          <div className="social-frames">
            {socialProfiles.map((profile) => (
              <a className="social-frame" href={profile.url} key={profile.platform} target="_blank" rel="noreferrer">
                <div className="phone-shell">
                  <div className="phone-notch" />
                  <div className="phone-iframe-shell">
                    <div className={`phone-embed phone-embed-${profile.platform.toLowerCase()}`}>
                      <div className="embed-topbar" />
                      <div className="embed-cover" />
                      <div className="embed-grid">
                        <div />
                        <div />
                        <div />
                        <div />
                        <div />
                        <div />
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="full-section section-sponsors" id="patrocinadores">
        <div className="sticky-scene">
          <div className="sponsor-fog" />

          <div className="scene-copy sponsor-copy">
            <h2 className="scene-title">Partner Wall</h2>
          </div>

          <div className="sponsor-showcase">
            <div className="sponsor-centerpiece">
              <span>Marcas aliadas</span>
              <strong>Zona de exhibicion principal</strong>
            </div>
          </div>

          <div className="sponsor-grid sponsor-grid-wall">
            {sponsorTiles.map((sponsor) => (
              <a className="sponsor-tile" href="https://example.com" key={sponsor} target="_blank" rel="noreferrer">
                <span className="mud-dot mud-dot-a" />
                <span className="mud-dot mud-dot-b" />
                <span className="water-dot water-dot-a" />
                <span className="water-dot water-dot-b" />
                <span>{sponsor}</span>
              </a>
            ))}
          </div>

          <a
            className="sponsor-banner"
            href="https://example.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Banner horizontal principal de patrocinadores"
          >
            Banner principal horizontal
          </a>
        </div>
      </section>

      <section className="full-section section-influencers" id="influencers">
        <div className="sticky-scene">
          <div className="collage-bg">
            <div className="collage-photo photo-a" />
            <div className="collage-photo photo-b" />
            <div className="collage-photo photo-c" />
            <div className="collage-photo photo-d" />
            <div className="collage-photo photo-e" />
            <div className="collage-photo photo-f" />
            <div className="collage-photo photo-g" />
            <div className="collage-photo photo-h" />
            <div className="collage-photo photo-i" />
            <div className="collage-photo photo-j" />
            <div className="collage-photo photo-k" />
            <div className="collage-photo photo-l" />
            <div className="collage-photo photo-m" />
            <div className="collage-photo photo-n" />
            <div className="collage-photo photo-o" />
            <div className="collage-photo photo-p" />
            <div className="collage-photo photo-q" />
            <div className="collage-photo photo-r" />
            <div className="collage-photo photo-s" />
            <div className="collage-photo photo-t" />
            <div className="collage-photo photo-u" />
            <div className="collage-photo photo-v" />
            <div className="collage-photo photo-w" />
            <div className="collage-photo photo-x" />
            <div className="collage-photo photo-y" />
            <div className="collage-photo photo-z" />
            <div className="collage-photo photo-aa" />
            <div className="collage-photo photo-ab" />
            <div className="collage-photo photo-ac" />
            <div className="collage-photo photo-ad" />
          </div>

          <div className="influencer-floating-action">
            <button className="cta-solid" onClick={() => setInfluencerModalOpen(true)} type="button">
              Ver colaboradores
            </button>
          </div>
        </div>
      </section>

      <section className="full-section section-sales" id="ventas">
        <div className="sticky-scene">
          <div className="sales-panels" role="tablist" aria-label="Ofertas disponibles">
            {salesOffers.map((offer, index) => (
              <button
                className={`sales-panel ${offer.accent} ${activeSale === index ? "is-active" : ""}`}
                key={offer.title}
                onClick={() => setActiveSale(index)}
                onDoubleClick={() => setSaleModalIndex(index)}
                type="button"
              >
                <span className="sales-label">{offer.title}</span>
                <div className="sales-panel-content">
                  <strong>{offer.subtitle}</strong>
                  <p>{offer.price}</p>
                  <span className="panel-cta">Doble clic para comprar</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="full-section section-merch" id="merch">
        <div className="sticky-scene">
          <div className="merch-radiance" />

          <div className="scene-copy left-copy">
            <h2 className="scene-title">Productos Como Tres Piezas Protagonistas</h2>
            <div className="scene-actions">
              <button className="cta-solid" onClick={() => setMerchModalOpen(true)} type="button">
                Ver catalogo
              </button>
            </div>
          </div>

          <div className="merch-hero-grid">
            {merchItems.map((item, index) => (
              <button className="merch-hero-card" key={item} onClick={() => setMerchModalOpen(true)} type="button">
                <div className={`merch-photo merch-photo-${index + 1}`} />
                <span>{item}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer className="mega-footer">
        <div className="footer-track">
          <div className="footer-track-row">
            {[...footerTrack, ...footerTrack].map((item, index) => (
              <span className="footer-track-chip" key={`${item}-${index}`}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            <strong>LODO LAND</strong>
            <p>{currentYear} | Footer preparado para aviso de privacidad, contacto y datos legales.</p>
          </div>

          <div className="footer-links">
            <a href="/">Aviso de privacidad</a>
            <a href="/">Contacto</a>
            <a href="/">Terminos</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
