import { buildStoragePublicUrl } from "../media";
import { formatEventDateWallClock } from "../date-format";
import { createClient } from "../supabase/server";
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
    startsAt: string | null;
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

type HomeFeaturedEventRow = {
  title: string | null;
  description: string | null;
  primary_cta_label: string | null;
  secondary_cta_label: string | null;
  hero_media_asset_id: string | null;
  side_banner_asset_id: string | null;
  side_banner_url: string | null;
  side_banner_alt: string | null;
  sponsor_name: string | null;
  sponsor_description: string | null;
  sponsor_website_label: string | null;
  sponsor_website_url: string | null;
  sponsor_social_label: string | null;
  sponsor_social_url: string | null;
  sponsor_media_asset_id: string | null;
};

type HomeSponsorRow = {
  id: string;
  name: string;
  website_url: string | null;
  logo_asset_id: string | null;
  accent_color: string | null;
  background_color: string | null;
  menu_label: string | null;
  is_menu_featured: boolean;
  sort_order: number;
  is_active: boolean;
};

type HomeInfluencerRow = {
  id: string;
  display_name: string;
  headline: string | null;
  bio: string | null;
  cover_asset_id: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  sort_order: number;
  is_active: boolean;
};

type HomeSocialCardRow = {
  id: string;
  platform: string;
  account_name: string;
  handle: string | null;
  profile_url: string | null;
  embed_url: string | null;
  preview_asset_id: string | null;
  sort_order: number;
  is_active: boolean;
};

type HomeSalesItemRow = {
  id: string;
  title: string;
  subtitle: string | null;
  price_label: string | null;
  card_media_asset_id: string | null;
  sort_order: number;
  is_active: boolean;
};

type HomeMerchItemRow = {
  id: string;
  title: string;
  card_media_asset_id: string | null;
  sort_order: number;
  is_active: boolean;
};

type MediaAssetLookupRow = {
  id: string;
  bucket: string;
  path: string;
  title: string | null;
  alt_text: string | null;
};

function textFromItem(item: CmsItem, fieldKey: string, fallback = "") {
  return item.fields[fieldKey]?.textValue || fallback;
}

function linkFromItem(item: CmsItem, fieldKey: string, fallback = "#") {
  return item.fields[fieldKey]?.linkUrl || fallback;
}

function normalizeIntentLink(intent: "tickets" | "merch") {
  return `/login?intent=${intent}`;
}

function optimizeMedia(
  asset: CmsMediaAsset | null,
  options: {
    width: number;
    height?: number;
    quality?: number;
    resize?: "cover" | "contain" | "fill";
  }
) {
  if (!asset) {
    return null;
  }

  const params = new URLSearchParams();
  params.set("width", String(options.width));

  if (options.height) {
    params.set("height", String(options.height));
  }

  if (options.quality) {
    params.set("quality", String(options.quality));
  }

  if (options.resize) {
    params.set("resize", options.resize);
  }

  return {
    ...asset,
    url: `${asset.url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/")}?${params.toString()}`
  } satisfies CmsMediaAsset;
}

async function getMediaLookupMap(assetIds: Array<string | null | undefined>) {
  const ids = Array.from(new Set(assetIds.filter(Boolean))) as string[];

  if (!ids.length) {
    return new Map<string, CmsMediaAsset>();
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("media_assets")
    .select("id, bucket, path, title, alt_text")
    .in("id", ids);

  return new Map(
    ((data || []) as MediaAssetLookupRow[]).map((asset) => [
      asset.id,
      {
        id: asset.id,
        bucket: asset.bucket,
        path: asset.path,
        url: buildStoragePublicUrl(asset.path, asset.bucket),
        title: asset.title,
        altText: asset.alt_text
      } satisfies CmsMediaAsset
    ])
  );
}

export async function getHomePageViewModel(): Promise<HomePageViewModel> {
  const supabase = createClient();
  const [config, nextEvent, upcomingEvents] = await Promise.all([
    getCmsPageConfig("home"),
    getNextEvent(),
    getUpcomingEvents(6)
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

  const socialItems = socialSection?.groups.social_profiles?.items || [];
  const collageItems = influencerSection?.groups.influencer_collage?.items || [];
  const salesItems = salesSection?.groups.sales_panels?.items || [];
  const merchItems = merchSection?.groups.merch_gallery?.items || [];
  const [
    { data: featuredEventRowRaw },
    { data: sponsorRowsRaw },
    { data: influencerRowsRaw },
    { data: socialRowsRaw },
    { data: salesRowsRaw },
    { data: merchRowsRaw }
  ] = await Promise.all([
    eventSection
      ? supabase
          .from("home_featured_event")
          .select(
            "title, description, primary_cta_label, secondary_cta_label, hero_media_asset_id, side_banner_asset_id, side_banner_url, side_banner_alt, sponsor_name, sponsor_description, sponsor_website_label, sponsor_website_url, sponsor_social_label, sponsor_social_url, sponsor_media_asset_id"
          )
          .eq("section_id", eventSection.id)
          .eq("is_active", true)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    sponsorSection
      ? supabase
          .from("home_sponsors")
          .select("id, name, website_url, logo_asset_id, accent_color, background_color, menu_label, is_menu_featured, sort_order, is_active")
          .eq("section_id", sponsorSection.id)
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [] }),
    influencerSection
      ? supabase
          .from("home_influencers")
          .select("id, display_name, headline, bio, cover_asset_id, instagram_url, facebook_url, youtube_url, tiktok_url, sort_order, is_active")
          .eq("section_id", influencerSection.id)
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [] }),
    socialSection
      ? supabase
          .from("home_social_cards")
          .select("id, platform, account_name, handle, profile_url, embed_url, preview_asset_id, sort_order, is_active")
          .eq("section_id", socialSection.id)
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [] }),
    salesSection
      ? supabase
          .from("home_sales_items")
          .select("id, title, subtitle, price_label, card_media_asset_id, sort_order, is_active")
          .eq("section_id", salesSection.id)
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [] }),
    merchSection
      ? supabase
          .from("home_merch_items")
          .select("id, title, card_media_asset_id, sort_order, is_active")
          .eq("section_id", merchSection.id)
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [] })
  ]);

  const featuredEventRow = (featuredEventRowRaw || null) as HomeFeaturedEventRow | null;
  const sponsorRows = (sponsorRowsRaw || []) as HomeSponsorRow[];
  const influencerRows = (influencerRowsRaw || []) as HomeInfluencerRow[];
  const socialRows = (socialRowsRaw || []) as HomeSocialCardRow[];
  const salesRows = (salesRowsRaw || []) as HomeSalesItemRow[];
  const merchRows = (merchRowsRaw || []) as HomeMerchItemRow[];

  const mediaMap = await getMediaLookupMap([
    featuredEventRow?.hero_media_asset_id,
    featuredEventRow?.side_banner_asset_id,
    featuredEventRow?.sponsor_media_asset_id,
    ...sponsorRows.map((item) => item.logo_asset_id),
    ...influencerRows.map((item) => item.cover_asset_id),
    ...socialRows.map((item) => item.preview_asset_id),
    ...salesRows.map((item) => item.card_media_asset_id),
    ...merchRows.map((item) => item.card_media_asset_id)
  ]);

  const sponsorItems =
    sponsorRows.map((item) => ({
          id: item.id,
          name: item.name,
          href: item.website_url || "https://example.com",
          image: optimizeMedia(item.logo_asset_id ? mediaMap.get(item.logo_asset_id) || null : null, {
            width: 640,
            height: 400,
            quality: 78,
            resize: "contain"
          }),
          backgroundColor: item.background_color || null,
          accentColor: item.accent_color || null
        }));

  const menuSponsorPanels =
    sponsorRows
      .filter((item) => item.is_menu_featured)
      .slice(0, 3)
      .map((item) => ({
        id: item.id,
        name: item.menu_label || item.name,
        href: item.website_url || "https://example.com",
        image: optimizeMedia(item.logo_asset_id ? mediaMap.get(item.logo_asset_id) || null : null, {
          width: 420,
          height: 320,
          quality: 66,
          resize: "contain"
        }),
        backgroundColor: item.background_color || null,
        accentColor: item.accent_color || null
      }));

  const eventHeroImage = optimizeMedia(featuredEventRow?.hero_media_asset_id ? mediaMap.get(featuredEventRow.hero_media_asset_id) || null : eventSection?.fields.hero_media?.media || null, {
    width: 1920,
    height: 1440,
    quality: 78,
    resize: "cover"
  });

  const meta = [
    formatEventDateWallClock(nextEvent?.startsAt),
    nextEvent?.city || null,
    nextEvent?.venueName || null
  ].filter(Boolean) as string[];

  return {
    officialSponsor: {
      name: featuredEventRow?.sponsor_name || "Sponsor principal",
      description:
        featuredEventRow?.sponsor_description || "Patrocinador oficial destacado al abrir la pagina.",
      websiteLabel: featuredEventRow?.sponsor_website_label || "Ir al sitio",
      websiteUrl: featuredEventRow?.sponsor_website_url || "https://example.com",
      socialLabel: featuredEventRow?.sponsor_social_label || "Ver red social",
      socialUrl: featuredEventRow?.sponsor_social_url || "https://instagram.com",
      image: optimizeMedia(featuredEventRow?.sponsor_media_asset_id ? mediaMap.get(featuredEventRow.sponsor_media_asset_id) || null : null, {
        width: 1280,
        height: 1280,
        quality: 80,
        resize: "cover"
      })
    },
    menuLinks,
    menuSponsorPanels,
    event: {
      title: featuredEventRow?.title || eventSection?.fields.title?.textValue || nextEvent?.title || "Proximo evento",
      description:
        featuredEventRow?.description ||
        eventSection?.fields.description?.textValue ||
        nextEvent?.shortDescription ||
        "La seccion principal presenta el evento mas reciente con acceso rapido a boletos.",
      meta: meta.length ? meta : ["Fecha pendiente", "Ciudad pendiente"],
      startsAt: nextEvent?.startsAt || null,
      primaryLabel: featuredEventRow?.primary_cta_label || eventSection?.fields.primary_cta_label?.textValue || "Ver evento",
      secondaryLabel: featuredEventRow?.secondary_cta_label || eventSection?.fields.secondary_cta_label?.textValue || "Comprar boletos",
      heroImage: eventHeroImage || nextEvent?.cover || null,
      heroAlt:
        eventSection?.fields.hero_image_alt?.textValue ||
        nextEvent?.cover?.altText ||
        "Imagen principal del evento",
      sideBannerImage: optimizeMedia(featuredEventRow?.side_banner_asset_id ? mediaMap.get(featuredEventRow.side_banner_asset_id) || null : null, {
        width: 760,
        height: 1600,
        quality: 80,
        resize: "cover"
      }),
      sideBannerAlt: featuredEventRow?.side_banner_alt || eventSection?.fields.side_banner_alt?.textValue || "Banner vertical del evento",
      sideBannerUrl: featuredEventRow?.side_banner_url || "https://example.com",
      latest: nextEvent,
      upcoming: upcomingEvents.filter((eventItem) => eventItem.id !== nextEvent?.id).slice(0, 5)
    },
    socialProfiles:
      socialRows.length
        ? socialRows.map((item) => ({
            id: item.id,
            platform: item.platform,
            account: item.account_name,
            handle: item.handle || "",
            href: item.profile_url || "#",
            embedUrl: item.embed_url || null,
            previewImage: optimizeMedia(item.preview_asset_id ? mediaMap.get(item.preview_asset_id) || null : null, {
              width: 720,
              height: 1320,
              quality: 74,
              resize: "cover"
            })
          }))
        : socialItems.map((item) => ({
            id: item.id,
            platform: textFromItem(item, "platform", item.label),
            account: textFromItem(item, "account", item.label),
            handle: textFromItem(item, "handle", ""),
            href: linkFromItem(item, "target_url", "#"),
            embedUrl: item.fields.embed_url?.linkUrl || null,
            previewImage: optimizeMedia(item.fields.preview_media?.media || null, {
              width: 720,
              height: 1320,
              quality: 74,
              resize: "cover"
            })
          })),
    sponsors: {
      showcaseTitle: sponsorSection?.fields.title?.textValue || "Marcas aliadas",
      showcaseSubtitle: sponsorSection?.fields.description?.textValue || "Zona de exhibicion principal",
      items: sponsorItems,
      bannerImage: optimizeMedia(sponsorSection?.groups.sponsor_main_banner?.items[0]?.fields.media?.media || null, {
        width: 1680,
        height: 360,
        quality: 78,
        resize: "cover"
      }),
      bannerUrl: sponsorSection?.groups.sponsor_main_banner?.items[0]
        ? linkFromItem(sponsorSection.groups.sponsor_main_banner.items[0], "target_url", "https://example.com")
        : "https://example.com",
      bannerAlt: sponsorSection?.fields.banner_alt?.textValue || "Banner patrocinadores"
    },
    influencers: {
      modalButtonLabel: influencerSection?.fields.modal_button_label?.textValue || "Ver colaboradores",
      modalTitle: influencerSection?.fields.modal_title?.textValue || "Influencers de LODO LAND",
      collageImages: collageItems
        .map((item) => optimizeMedia(item.fields.media?.media || null, { width: 960, height: 960, quality: 72, resize: "cover" }))
        .filter(Boolean) as CmsMediaAsset[],
      profiles:
        influencerRows.map((item) => ({
              id: item.id,
              name: item.display_name,
              role: item.headline || "",
              description: item.bio || "",
              image: optimizeMedia(item.cover_asset_id ? mediaMap.get(item.cover_asset_id) || null : null, {
                width: 720,
                height: 720,
                quality: 74,
                resize: "cover"
              }),
              links: [
                item.instagram_url ? { label: "instagram", href: item.instagram_url } : null,
                item.facebook_url ? { label: "facebook", href: item.facebook_url } : null,
                item.youtube_url ? { label: "youtube", href: item.youtube_url } : null,
                item.tiktok_url ? { label: "tiktok", href: item.tiktok_url } : null
              ].filter(Boolean) as SocialLink[]
            }))
    },
    salesPanels:
      salesRows.length
        ? salesRows.map((item) => ({
            id: item.id,
            title: item.title,
            subtitle: item.subtitle || "",
            price: item.price_label || "",
            image: optimizeMedia(item.card_media_asset_id ? mediaMap.get(item.card_media_asset_id) || null : null, {
              width: 920,
              height: 1440,
              quality: 76,
              resize: "cover"
            })
          }))
        : salesItems.map((item) => ({
            id: item.id,
            title: textFromItem(item, "title", item.label),
            subtitle: textFromItem(item, "subtitle", ""),
            price: textFromItem(item, "price", ""),
            image: optimizeMedia(item.fields.cover_media?.media || null, {
              width: 920,
              height: 1440,
              quality: 76,
              resize: "cover"
            })
          })),
    merch: {
      title: merchSection?.fields.title?.textValue || "Productos destacados",
      buttonLabel: merchSection?.fields.catalog_button_label?.textValue || "Ir a merch",
      items:
        merchRows.length
          ? merchRows.map((item) => ({
              id: item.id,
              title: item.title,
              image: optimizeMedia(item.card_media_asset_id ? mediaMap.get(item.card_media_asset_id) || null : null, {
                width: 880,
                height: 1100,
                quality: 76,
                resize: "cover"
              })
            }))
          : merchItems.map((item) => ({
              id: item.id,
              title: textFromItem(item, "title", item.label),
              image: optimizeMedia(item.fields.media?.media || null, {
                width: 880,
                height: 1100,
                quality: 76,
                resize: "cover"
              })
            }))
    },
    footer: {
      brand: footerSection?.fields.title?.textValue || "LODO LAND",
      description: footerSection?.fields.description?.textValue || "Footer legal y de contacto.",
      privacyLabel: footerSection?.fields.privacy_label?.textValue || "Aviso de privacidad",
      contactLabel: footerSection?.fields.contact_label?.textValue || "Contacto",
      termsLabel: footerSection?.fields.terms_label?.textValue || "Terminos",
      marquee: [
        ...sponsorRows.map((item) => ({
          id: `sponsor-${item.id}`,
          label: item.name,
          image: optimizeMedia(item.logo_asset_id ? mediaMap.get(item.logo_asset_id) || null : null, {
            width: 360,
            height: 160,
            quality: 72,
            resize: "contain"
          }),
          href: item.website_url || "#"
        })),
        ...influencerRows.map((item) => ({
          id: `influencer-${item.id}`,
          label: item.display_name,
          image: optimizeMedia(item.cover_asset_id ? mediaMap.get(item.cover_asset_id) || null : null, {
            width: 360,
            height: 160,
            quality: 72,
            resize: "contain"
          }),
          href:
            item.instagram_url ||
            item.facebook_url ||
            item.youtube_url ||
            item.tiktok_url ||
            "#"
        }))
      ]
    }
  };
}

export function getStaticIntentHref(intent: "tickets" | "merch") {
  return normalizeIntentLink(intent);
}
