import { getCmsPageConfig, type CmsItem, type CmsMediaAsset } from "./cms";
import { getNextEvent, getUpcomingEvents, type EventCard } from "./portal";

type SocialLink = {
  label: string;
  href: string;
};

export type HomeMenuLink = {
  id: string;
  label: string;
  href: string;
};

export type HomeSponsorItem = {
  id: string;
  name: string;
  href: string;
  image: CmsMediaAsset | null;
  backgroundColor: string | null;
  accentColor: string | null;
};

export type HomeInfluencerProfile = {
  id: string;
  name: string;
  role: string;
  description: string;
  image: CmsMediaAsset | null;
  links: SocialLink[];
};

export type HomeSalePanel = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  image: CmsMediaAsset | null;
};

export type HomeSocialProfile = {
  id: string;
  platform: string;
  account: string;
  handle: string;
  href: string;
  embedUrl: string | null;
  previewImage: CmsMediaAsset | null;
};

export type HomePageViewModel = {
  officialSponsor: {
    name: string;
    description: string;
    websiteLabel: string;
    websiteUrl: string;
    socialLabel: string;
    socialUrl: string;
    image: CmsMediaAsset | null;
  };
  menuLinks: HomeMenuLink[];
  menuSponsorPanels: HomeSponsorItem[];
  event: {
    title: string;
    description: string;
    meta: string[];
    primaryLabel: string;
    secondaryLabel: string;
    heroImage: CmsMediaAsset | null;
    heroAlt: string;
    sideBannerImage: CmsMediaAsset | null;
    sideBannerAlt: string;
    sideBannerUrl: string;
    latest: EventCard | null;
    upcoming: EventCard[];
  };
  socialProfiles: HomeSocialProfile[];
  sponsors: {
    showcaseTitle: string;
    showcaseSubtitle: string;
    items: HomeSponsorItem[];
    bannerImage: CmsMediaAsset | null;
    bannerUrl: string;
    bannerAlt: string;
  };
  influencers: {
    modalButtonLabel: string;
    modalTitle: string;
    collageImages: CmsMediaAsset[];
    profiles: HomeInfluencerProfile[];
  };
  salesPanels: HomeSalePanel[];
  merch: {
    title: string;
    buttonLabel: string;
    items: Array<{
      id: string;
      title: string;
      image: CmsMediaAsset | null;
    }>;
  };
  footer: {
    brand: string;
    description: string;
    privacyLabel: string;
    contactLabel: string;
    termsLabel: string;
    marquee: Array<{
      id: string;
      label: string;
      image: CmsMediaAsset | null;
      href: string;
    }>;
  };
};

function textFromItem(item: CmsItem, fieldKey: string, fallback = "") {
  return item.fields[fieldKey]?.textValue || fallback;
}

function linkFromItem(item: CmsItem, fieldKey: string, fallback = "#") {
  return item.fields[fieldKey]?.linkUrl || fallback;
}

function labelFromPlatform(platform: string) {
  return platform || "Link";
}

function normalizeIntentLink(intent: "tickets" | "merch") {
  return `/login?intent=${intent}`;
}

export async function getHomePageViewModel(): Promise<HomePageViewModel> {
  const [config, nextEvent, upcomingEvents] = await Promise.all([
    getCmsPageConfig("home"),
    getNextEvent(),
    getUpcomingEvents(5)
  ]);

  const sections = config?.sections || {};
  const menuSection = sections.menu_overlay;
  const eventSection = sections.evento_reciente;
  const socialSection = sections.redes_sociales;
  const sponsorSection = sections.patrocinadores;
  const influencerSection = sections.influencers;
  const salesSection = sections.ventas_destacadas;
  const merchSection = sections.merch_destacado;
  const footerSection = sections.footer;

  const menuLinks = menuSection?.groups.menu_links?.items.map((item) => ({
    id: item.id,
    label: textFromItem(item, "label", item.label),
    href: linkFromItem(item, "url", "#")
  })) || [];

  const sponsorItems =
    sponsorSection?.groups.sponsor_tiles?.items.map((item) => ({
      id: item.id,
      name: textFromItem(item, "name", item.label),
      href: linkFromItem(item, "target_url", "https://example.com"),
      image: item.fields.logo_media?.media || null,
      backgroundColor: textFromItem(item, "background_color", "") || null,
      accentColor: textFromItem(item, "accent_color", "") || null
    })) || [];

  const sponsorModalItem = eventSection?.groups.official_sponsor_modal?.items[0];
  const eventBannerItem = eventSection?.groups.event_side_banner?.items[0];
  const socialItems = socialSection?.groups.social_profiles?.items || [];
  const collageItems = influencerSection?.groups.influencer_collage?.items || [];
  const influencerItems = influencerSection?.groups.influencer_profiles?.items || [];
  const salesItems = salesSection?.groups.sales_panels?.items || [];
  const merchItems = merchSection?.groups.merch_gallery?.items || [];
  const footerItems = footerSection?.groups.footer_marquee?.items || [];

  const meta = [
    nextEvent?.startsAt
      ? new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(nextEvent.startsAt))
      : null,
    nextEvent?.city || null,
    nextEvent?.venueName || null
  ].filter(Boolean) as string[];

  return {
    officialSponsor: {
      name: sponsorModalItem ? textFromItem(sponsorModalItem, "title", sponsorModalItem.label) : "Sponsor principal",
      description:
        sponsorModalItem
          ? textFromItem(sponsorModalItem, "description", "Patrocinador oficial destacado al abrir la pagina.")
          : "Patrocinador oficial destacado al abrir la pagina.",
      websiteLabel: sponsorModalItem ? textFromItem(sponsorModalItem, "website_label", "Ir al sitio") : "Ir al sitio",
      websiteUrl: sponsorModalItem ? linkFromItem(sponsorModalItem, "website_url", "https://example.com") : "https://example.com",
      socialLabel: sponsorModalItem ? textFromItem(sponsorModalItem, "social_label", "Ver red social") : "Ver red social",
      socialUrl: sponsorModalItem ? linkFromItem(sponsorModalItem, "social_url", "https://instagram.com") : "https://instagram.com",
      image: sponsorModalItem?.fields.media?.media || nextEvent?.cover || null
    },
    menuLinks,
    menuSponsorPanels: sponsorItems.slice(0, 3),
    event: {
      title: eventSection?.fields.title?.textValue || nextEvent?.title || "Proximo evento",
      description:
        eventSection?.fields.description?.textValue ||
        nextEvent?.shortDescription ||
        "La seccion principal presenta el evento mas reciente con acceso rapido a boletos.",
      meta: meta.length ? meta : ["Fecha pendiente", "Ciudad pendiente"],
      primaryLabel: eventSection?.fields.primary_cta_label?.textValue || "Ver evento",
      secondaryLabel: eventSection?.fields.secondary_cta_label?.textValue || "Comprar boletos",
      heroImage: nextEvent?.cover || sponsorModalItem?.fields.media?.media || null,
      heroAlt:
        eventSection?.fields.hero_image_alt?.textValue ||
        nextEvent?.cover?.altText ||
        "Imagen principal del evento",
      sideBannerImage: eventBannerItem?.fields.media?.media || null,
      sideBannerAlt: eventSection?.fields.side_banner_alt?.textValue || "Banner vertical del evento",
      sideBannerUrl: eventBannerItem ? linkFromItem(eventBannerItem, "target_url", "https://example.com") : "https://example.com",
      latest: nextEvent,
      upcoming: upcomingEvents
    },
    socialProfiles: socialItems.map((item) => ({
      id: item.id,
      platform: textFromItem(item, "platform", item.label),
      account: textFromItem(item, "account", item.label),
      handle: textFromItem(item, "handle", ""),
      href: linkFromItem(item, "target_url", "#"),
      embedUrl: item.fields.embed_url?.linkUrl || null,
      previewImage: item.fields.preview_media?.media || null
    })),
    sponsors: {
      showcaseTitle: sponsorSection?.fields.title?.textValue || "Marcas aliadas",
      showcaseSubtitle: sponsorSection?.fields.description?.textValue || "Zona de exhibicion principal",
      items: sponsorItems,
      bannerImage: sponsorSection?.groups.sponsor_main_banner?.items[0]?.fields.media?.media || null,
      bannerUrl: sponsorSection?.groups.sponsor_main_banner?.items[0]
        ? linkFromItem(sponsorSection.groups.sponsor_main_banner.items[0], "target_url", "https://example.com")
        : "https://example.com",
      bannerAlt: sponsorSection?.fields.banner_alt?.textValue || "Banner patrocinadores"
    },
    influencers: {
      modalButtonLabel: influencerSection?.fields.modal_button_label?.textValue || "Ver colaboradores",
      modalTitle: influencerSection?.fields.modal_title?.textValue || "Influencers de LODO LAND",
      collageImages: collageItems.map((item) => item.fields.media?.media).filter(Boolean) as CmsMediaAsset[],
      profiles: influencerItems.map((item) => {
        const links = Object.entries(item.fields)
          .filter(([fieldKey, field]) => field.kind === "link" && field.linkUrl && fieldKey !== "cover_media")
          .map(([fieldKey, field]) => ({
            label: labelFromPlatform(fieldKey.replace(/_url$/, "").replace(/_/g, " ")),
            href: field.linkUrl || "#"
          }));

        return {
          id: item.id,
          name: textFromItem(item, "name", item.label),
          role: textFromItem(item, "role", ""),
          description: textFromItem(item, "description", ""),
          image: item.fields.cover_media?.media || null,
          links
        };
      })
    },
    salesPanels: salesItems.map((item) => ({
      id: item.id,
      title: textFromItem(item, "title", item.label),
      subtitle: textFromItem(item, "subtitle", ""),
      price: textFromItem(item, "price", ""),
      image: item.fields.cover_media?.media || null
    })),
    merch: {
      title: merchSection?.fields.title?.textValue || "Productos destacados",
      buttonLabel: merchSection?.fields.catalog_button_label?.textValue || "Ir a merch",
      items: merchItems.map((item) => ({
        id: item.id,
        title: textFromItem(item, "title", item.label),
        image: item.fields.media?.media || null
      }))
    },
    footer: {
      brand: footerSection?.fields.title?.textValue || "LODO LAND",
      description: footerSection?.fields.description?.textValue || "Footer legal y de contacto.",
      privacyLabel: footerSection?.fields.privacy_label?.textValue || "Aviso de privacidad",
      contactLabel: footerSection?.fields.contact_label?.textValue || "Contacto",
      termsLabel: footerSection?.fields.terms_label?.textValue || "Terminos",
      marquee: footerItems.map((item) => ({
        id: item.id,
        label: textFromItem(item, "label", item.label),
        image: item.fields.logo_media?.media || null,
        href: linkFromItem(item, "target_url", "#")
      }))
    }
  };
}

export function getStaticIntentHref(intent: "tickets" | "merch") {
  return normalizeIntentLink(intent);
}
