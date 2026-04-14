"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { InfluencerCollage } from "./influencer-collage";
import type { HomePageViewModel } from "../lib/data/home";

type HomeExperienceProps = {
  data: HomePageViewModel;
};

const saleToneClasses = ["sale-mud", "sale-gold", "sale-blue", "sale-pink"] as const;
const menuSponsorToneClasses = ["menu-sponsor-tone-1", "menu-sponsor-tone-2", "menu-sponsor-tone-3"] as const;
const mexicoEventDateTime = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Mexico_City"
});

function getStaticIntentHref(intent: "tickets" | "merch") {
  return `/login?intent=${intent}`;
}

function buildSponsorToneStyle(backgroundColor: string | null, accentColor: string | null) {
  if (!backgroundColor && !accentColor) {
    return undefined;
  }

  return {
    ["--menu-sponsor-bg" as string]: backgroundColor || "rgba(7, 10, 18, 0.84)",
    ["--menu-sponsor-accent" as string]: accentColor || backgroundColor || "rgba(255, 186, 87, 0.36)",
    ["--sponsor-tile-bg" as string]: backgroundColor || "rgba(8, 10, 18, 0.46)",
    ["--sponsor-tile-accent" as string]: accentColor || backgroundColor || "rgba(255, 186, 87, 0.24)"
  } as CSSProperties;
}

export function HomeExperience({ data }: HomeExperienceProps) {
  const menuCollapsesRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sponsorModalOpen, setSponsorModalOpen] = useState(true);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [influencerModalOpen, setInfluencerModalOpen] = useState(false);
  const [merchModalOpen, setMerchModalOpen] = useState(false);
  const [activeSale, setActiveSale] = useState(0);
  const [saleModalIndex, setSaleModalIndex] = useState<number | null>(null);
  const [activeMenuPanel, setActiveMenuPanel] = useState(0);
  const [isMobileMenuViewport, setIsMobileMenuViewport] = useState(false);
  const isOverlayOpen =
    sponsorModalOpen || eventModalOpen || menuOpen || influencerModalOpen || merchModalOpen || saleModalIndex !== null;
  const currentYear = new Date().getFullYear();
  const menuPageCount = data.menuSponsorPanels.length + 1;

  const closeOverlay = () => {
    if (saleModalIndex !== null) {
      setSaleModalIndex(null);
      return;
    }

    if (merchModalOpen) {
      setMerchModalOpen(false);
      return;
    }

    if (eventModalOpen) {
      setEventModalOpen(false);
      return;
    }

    if (influencerModalOpen) {
      setInfluencerModalOpen(false);
      return;
    }

    if (menuOpen) {
      setMenuOpen(false);
      return;
    }

    if (sponsorModalOpen) {
      setSponsorModalOpen(false);
    }
  };

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (isOverlayOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOverlayOpen]);

  useEffect(() => {
    if (!isOverlayOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeOverlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOverlayOpen, saleModalIndex, merchModalOpen, eventModalOpen, influencerModalOpen, menuOpen, sponsorModalOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(max-width: 780px)");
    const updateViewport = () => {
      setIsMobileMenuViewport(mediaQuery.matches);
    };

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateViewport);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const menuPages = menuCollapsesRef.current;

    if (!menuPages || !isMobileMenuViewport) {
      return;
    }

    window.requestAnimationFrame(() => {
      menuPages.scrollTo({
        left: activeMenuPanel * menuPages.clientWidth,
        behavior: "auto"
      });
    });
  }, [menuOpen, activeMenuPanel, isMobileMenuViewport]);

  const goToMenuPanel = (index: number) => {
    setActiveMenuPanel(index);

    const menuPages = menuCollapsesRef.current;

    if (!menuPages || !isMobileMenuViewport) {
      return;
    }

    menuPages.scrollTo({
      left: index * menuPages.clientWidth,
      behavior: "smooth"
    });
  };

  const handleMenuScroll = () => {
    const menuPages = menuCollapsesRef.current;

    if (!menuPages || !isMobileMenuViewport) {
      return;
    }

    const nextPanel = Math.round(menuPages.scrollLeft / Math.max(menuPages.clientWidth, 1));

    if (nextPanel !== activeMenuPanel) {
      setActiveMenuPanel(nextPanel);
    }
  };

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
        <div aria-label="Patrocinador oficial" aria-modal="true" className="overlay-shell" role="dialog">
          <div className="spotlight-modal">
            <button
              aria-label="Cerrar modal"
              className="overlay-close"
              onClick={() => setSponsorModalOpen(false)}
              type="button"
            >
              x
            </button>

            <div
              aria-label={data.officialSponsor.image?.altText || "Imagen patrocinador oficial"}
              className={`spotlight-visual ${data.officialSponsor.image ? "has-media" : ""}`}
              role="img"
              style={
                data.officialSponsor.image
                  ? {
                      backgroundImage: `url(${data.officialSponsor.image.url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat"
                    }
                  : undefined
              }
            />

            <div className="spotlight-copy">
              <h1>{data.officialSponsor.name}</h1>
              <p>{data.officialSponsor.description}</p>

              <div className="overlay-actions">
                <a className="cta-solid" href={data.officialSponsor.websiteUrl} rel="noreferrer" target="_blank">
                  {data.officialSponsor.websiteLabel}
                </a>
                <a className="cta-outline" href={data.officialSponsor.socialUrl} rel="noreferrer" target="_blank">
                  {data.officialSponsor.socialLabel}
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {menuOpen ? (
        <div aria-label="Menu principal" aria-modal="true" className="menu-overlay" role="dialog">
          <button
            aria-label="Cerrar menu"
            className="overlay-close menu-close"
            onClick={() => setMenuOpen(false)}
            type="button"
          >
            x
          </button>

          <div className="menu-overlay-inner">
            <div aria-label="Indicador de paginas del menu" className="menu-page-dots">
              {Array.from({ length: menuPageCount }, (_, index) => (
                <button
                  aria-label={`Ir a pagina ${index + 1}`}
                  className={`menu-page-dot ${activeMenuPanel === index ? "is-active" : ""}`}
                  key={index}
                  onClick={() => goToMenuPanel(index)}
                  type="button"
                />
              ))}
            </div>

            <div
              aria-label="Menu colapsable principal"
              className="menu-collapses"
              onScroll={handleMenuScroll}
              ref={menuCollapsesRef}
              role="tablist"
            >
              {data.menuSponsorPanels.map((panel, index) => (
                <article
                  className={`menu-collapse sponsor-collapse ${isMobileMenuViewport && activeMenuPanel === index ? "is-open" : ""}`}
                  key={panel.id}
                  onClick={() => {
                    if (isMobileMenuViewport) {
                      goToMenuPanel(index);
                    }
                  }}
                  onKeyDown={(event) => {
                    if ((event.key === "Enter" || event.key === " ") && isMobileMenuViewport) {
                      event.preventDefault();
                      goToMenuPanel(index);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="menu-collapse-visual">
                    <div
                      className={`menu-sponsor-art ${menuSponsorToneClasses[index % menuSponsorToneClasses.length]}`}
                      style={buildSponsorToneStyle(panel.backgroundColor, panel.accentColor)}
                    >
                      {panel.image ? (
                        <span
                          className="menu-sponsor-logo"
                          style={{
                            backgroundImage: `url(${panel.image.url})`,
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center"
                          }}
                        />
                      ) : null}
                    </div>
                  </div>
                  <div className="menu-collapse-info">
                    <strong>{panel.name}</strong>
                    <a href={panel.href} rel="noreferrer" target="_blank">
                      Sitio
                    </a>
                  </div>
                </article>
              ))}

              <div
                className={`menu-collapse menu-links-collapse ${isMobileMenuViewport && activeMenuPanel === data.menuSponsorPanels.length ? "is-open" : ""}`}
              >
                <button
                  className="menu-collapse-trigger"
                  onClick={() => goToMenuPanel(data.menuSponsorPanels.length)}
                  type="button"
                >
                  Secciones
                </button>
                <nav aria-label="Secciones del sitio" className="menu-links-list">
                  {data.menuLinks.map((item) => (
                    <a href={item.href} key={item.id} onClick={() => setMenuOpen(false)}>
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {eventModalOpen ? (
        <div aria-label="Eventos disponibles" aria-modal="true" className="overlay-shell" role="dialog">
          <div className="event-modal">
            <button
              aria-label="Cerrar modal de eventos"
              className="overlay-close"
              onClick={() => setEventModalOpen(false)}
              type="button"
            >
              x
            </button>

            <div className="overlay-header">
              <h2>{data.event.title}</h2>
            </div>

            {data.event.latest ? (
              <section className="event-modal-featured">
                <div
                  className="event-modal-cover"
                  style={
                    data.event.latest.cover
                      ? {
                          backgroundImage: `url(${data.event.latest.cover.url})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center"
                        }
                      : undefined
                  }
                />
                <div className="event-modal-copy">
                  <span className="event-modal-chip">Proximo evento</span>
                  <strong>{data.event.latest.title}</strong>
                  <div className="meta-row">
                    {[
                      data.event.latest.startsAt
                        ? mexicoEventDateTime.format(new Date(data.event.latest.startsAt))
                        : null,
                      data.event.latest.city,
                      data.event.latest.venueName
                    ]
                      .filter(Boolean)
                      .map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                  </div>
                </div>
              </section>
            ) : null}

            <div className="event-modal-list">
              {data.event.upcoming.map((eventItem) => (
                <article className="event-modal-row" key={eventItem.id}>
                  <div
                    className="event-modal-thumb"
                    style={
                      eventItem.cover
                        ? {
                            backgroundImage: `url(${eventItem.cover.url})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center"
                          }
                        : undefined
                    }
                  />
                  <div>
                    <strong>{eventItem.title}</strong>
                    <p>{eventItem.shortDescription || "Evento programado en la agenda de LODO LAND."}</p>
                    <div className="meta-row">
                      {[
                        eventItem.startsAt
                          ? mexicoEventDateTime.format(new Date(eventItem.startsAt))
                          : null,
                        eventItem.city,
                        eventItem.venueName
                      ]
                        .filter(Boolean)
                        .map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="overlay-actions">
              <a className="cta-solid" href={getStaticIntentHref("tickets")}>
                Comprar tickets
              </a>
            </div>
          </div>
        </div>
      ) : null}

      {influencerModalOpen ? (
        <div aria-label="Influencers colaboradores" aria-modal="true" className="overlay-shell" role="dialog">
          <div className="influencer-modal">
            <button
              aria-label="Cerrar lista de influencers"
              className="overlay-close"
              onClick={() => setInfluencerModalOpen(false)}
              type="button"
            >
              x
            </button>

            <div className="overlay-header">
              <h2>{data.influencers.modalTitle}</h2>
            </div>

            <div className="influencer-modal-list">
              {data.influencers.profiles.map((profile) => (
                <article className="influencer-row" key={profile.id}>
                  <div
                    className="influencer-avatar"
                    style={
                      profile.image
                        ? {
                            backgroundImage: `url(${profile.image.url})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center"
                          }
                        : undefined
                    }
                  />
                  <div>
                    <strong>{profile.name}</strong>
                    <span>{profile.role}</span>
                    <p>{profile.description}</p>
                    <div className="social-icon-row">
                      {profile.links.map((link) => (
                        <a href={link.href} key={link.label} rel="noreferrer" target="_blank">
                          <span className="social-icon">{link.label.slice(0, 1).toUpperCase()}</span>
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
        <div aria-label="Comprar oferta" aria-modal="true" className="overlay-shell" role="dialog">
          <div className="sale-modal">
            <button
              aria-label="Cerrar modal de compra"
              className="overlay-close"
              onClick={() => setSaleModalIndex(null)}
              type="button"
            >
              x
            </button>

            <h2>{data.salesPanels[saleModalIndex].title}</h2>
            <p>
              Inicia sesion para continuar con la compra de esta promocion, rifa, quiniela o acceso
              especial.
            </p>

            <div className="overlay-actions">
              <a className="cta-solid" href={getStaticIntentHref("tickets")}>
                Iniciar sesion
              </a>
            </div>
          </div>
        </div>
      ) : null}

      {merchModalOpen ? (
        <div aria-label="Catalogo de merch" aria-modal="true" className="overlay-shell" role="dialog">
          <div className="merch-modal">
            <button
              aria-label="Cerrar catalogo de merch"
              className="overlay-close"
              onClick={() => setMerchModalOpen(false)}
              type="button"
            >
              x
            </button>

            <h2>{data.merch.title}</h2>
            <div className="merch-modal-grid">
              {data.merch.items.map((item) => (
                <article className="merch-modal-item" key={item.id}>
                  <div
                    className="merch-thumb"
                    style={
                      item.image
                        ? {
                            backgroundImage: `url(${item.image.url})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center"
                          }
                        : undefined
                    }
                  />
                  <div>
                    <strong>{item.title}</strong>
                    <p>Disponible para compra al iniciar sesion en tu cuenta.</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="overlay-actions">
              <a className="cta-solid" href={getStaticIntentHref("merch")}>
                Iniciar sesion
              </a>
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
          aria-label="Abrir menu principal"
          className="tire-menu-button"
          onClick={() => {
            setActiveMenuPanel(0);
            setMenuOpen(true);
          }}
          type="button"
        >
          <span className="tire-core" />
        </button>
      </header>

      <section className="full-section section-event" id="evento">
        <div className="sticky-scene">
          <div
            aria-label={data.event.heroAlt}
            className={`scene-background scene-flyer ${data.event.heroImage ? "has-media" : ""}`}
            role="img"
            style={
              data.event.heroImage
                ? {
                    backgroundImage: `url(${data.event.heroImage.url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                  }
                : undefined
            }
          />
          <div className="event-gradient" />

          <div className="scene-copy left-copy">
            <h1 id="INICIOWEB" className="scene-wordmark" />
            <h2 className="scene-title">{data.event.title}</h2>
            <p>{data.event.description}</p>
            <div className="meta-row">
              {data.event.meta.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <div className="scene-actions">
              <button className="cta-solid" onClick={() => setEventModalOpen(true)} type="button">
                {data.event.primaryLabel}
              </button>
              <a className="cta-outline" href={getStaticIntentHref("tickets")}>
                {data.event.secondaryLabel}
              </a>
            </div>
          </div>

          <a
            aria-label={data.event.sideBannerAlt}
            className="side-banner"
            href={data.event.sideBannerUrl}
            rel="noreferrer"
            target="_blank"
            style={
              data.event.sideBannerImage
                ? {
                    backgroundImage: `url(${data.event.sideBannerImage.url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    color: "transparent"
                  }
                : undefined
            }
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
            {data.socialProfiles.map((profile) => (
              <a className="social-frame" href={profile.href} key={profile.id} rel="noreferrer" target="_blank">
                <div className="phone-shell">
                  <div className="phone-notch" />
                  <div className="phone-iframe-shell">
                    {profile.embedUrl ? (
                      <iframe className="phone-embed-frame" loading="lazy" src={profile.embedUrl} title={profile.platform} />
                    ) : (
                      <div
                        className={`phone-embed phone-embed-${profile.platform.toLowerCase()}`}
                        style={
                          profile.previewImage
                            ? {
                                backgroundImage: `url(${profile.previewImage.url})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center"
                              }
                            : undefined
                        }
                      >
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
                    )}
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

          <div className="sponsor-showcase">
            <div className="sponsor-centerpiece">
              <span>{data.sponsors.showcaseTitle}</span>
              <strong>{data.sponsors.showcaseSubtitle}</strong>
            </div>
          </div>

          <div className="sponsor-grid sponsor-grid-wall">
            {data.sponsors.items.map((sponsor) => (
              <a
                className="sponsor-tile"
                href={sponsor.href}
                key={sponsor.id}
                rel="noreferrer"
                style={buildSponsorToneStyle(sponsor.backgroundColor, sponsor.accentColor)}
                target="_blank"
              >
                <span className="mud-dot mud-dot-a" />
                <span className="mud-dot mud-dot-b" />
                <span className="water-dot water-dot-a" />
                <span className="water-dot water-dot-b" />
                {sponsor.image ? (
                  <span
                    className="sponsor-logo"
                    style={{
                      backgroundImage: `url(${sponsor.image.url})`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center"
                    }}
                  />
                ) : null}
                <span>{sponsor.name}</span>
              </a>
            ))}
          </div>

          <a
            aria-label={data.sponsors.bannerAlt}
            className="sponsor-banner"
            href={data.sponsors.bannerUrl}
            rel="noreferrer"
            target="_blank"
            style={
              data.sponsors.bannerImage
                ? {
                    backgroundImage: `url(${data.sponsors.bannerImage.url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    color: "transparent"
                  }
                : undefined
            }
          >
            Banner principal horizontal
          </a>

        </div>
      </section>

      <section className="full-section section-influencers" id="influencers">
        <div className="sticky-scene">
          <InfluencerCollage images={data.influencers.collageImages} />

          <div className="influencer-floating-action">
            <button className="cta-solid" onClick={() => setInfluencerModalOpen(true)} type="button">
              {data.influencers.modalButtonLabel}
            </button>
          </div>
        </div>
      </section>

      <section className="full-section section-sales" id="ventas">
        <div className="sticky-scene">
          <div aria-label="Ofertas disponibles" className="sales-panels" role="tablist">
            {data.salesPanels.map((offer, index) => (
              <button
                className={`sales-panel ${saleToneClasses[index % saleToneClasses.length]} ${activeSale === index ? "is-active" : ""}`}
                key={offer.id}
                onClick={() => setSaleModalIndex(index)}
                onFocus={() => setActiveSale(index)}
                onMouseEnter={() => setActiveSale(index)}
                style={
                  offer.image
                    ? ({
                        ["--sales-panel-art" as string]: `linear-gradient(180deg, rgba(8,10,18,0.22), rgba(8,10,18,0.74)), url(${offer.image.url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                      } as CSSProperties)
                    : undefined
                }
                type="button"
              >
                <span className="sales-label">{offer.title}</span>
                <div className="sales-panel-content">
                  <strong>{offer.subtitle}</strong>
                  <p>{offer.price}</p>
                  <span className="panel-cta">Comprar</span>
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
            <h2 className="scene-title">{data.merch.title}</h2>
            <div className="scene-actions">
              <button className="cta-solid" onClick={() => setMerchModalOpen(true)} type="button">
                {data.merch.buttonLabel}
              </button>
            </div>
          </div>

          <div className="merch-hero-grid">
            {data.merch.items.map((item, index) => (
              <button className="merch-hero-card" key={item.id} onClick={() => setMerchModalOpen(true)} type="button">
                <div
                  className={`merch-photo merch-photo-${(index % 3) + 1}`}
                  style={
                    item.image
                      ? {
                          backgroundImage: `url(${item.image.url})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center"
                        }
                      : undefined
                  }
                />
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer className="mega-footer">
        <div className="footer-track">
          <div className="footer-track-row">
            {[...data.footer.marquee, ...data.footer.marquee].map((item, index) => (
              <div className="footer-track-chip" key={`${item.id}-${index}`}>
                {item.image ? (
                  <span
                    className="footer-chip-logo"
                    style={{
                      backgroundImage: `url(${item.image.url})`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center"
                    }}
                  />
                ) : (
                  item.label
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            <strong>{data.footer.brand}</strong>
            <p>
              {currentYear} | {data.footer.description}
            </p>
          </div>

          <div className="footer-links">
            <a href="/">{data.footer.privacyLabel}</a>
            <a href="/">{data.footer.contactLabel}</a>
            <a href="/">{data.footer.termsLabel}</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
