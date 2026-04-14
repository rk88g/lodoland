import { buildStorageImageUrl, buildStoragePublicUrl } from "../media";
import { isBuildPhase } from "../runtime";
import { createClient } from "../supabase/server";

type MediaAssetRow = {
  id: string;
  bucket: string;
  path: string;
  title: string | null;
  alt_text: string | null;
  is_public?: boolean | null;
};

export type EventCard = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  venueName: string | null;
  city: string | null;
  startsAt: string | null;
  cover?: {
    url: string;
    title: string | null;
    altText: string | null;
  } | null;
};

export type AvatarPreset = {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  backgroundColor: string | null;
  accentColor: string | null;
  mediaUrl: string | null;
};

export type MediaAssetSummary = {
  id: string;
  title: string | null;
  path: string;
  altText: string | null;
  bucket: string;
  isPublic: boolean;
  publicUrl: string;
};

export type MediaCollectionSummary = {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  isActive: boolean;
};

export type SectionBindingSummary = {
  id: string;
  bindingKey: string;
  itemsLimit: number;
  rotateIntervalSeconds: number;
  rotationMode: string;
  sectionKey: string;
  pageSlug: string;
  collectionLabel: string;
};

async function resolveMediaAsset(
  mediaAssetId: string | null | undefined
): Promise<EventCard["cover"] | null> {
  if (!mediaAssetId) {
    return null;
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("media_assets")
    .select("id, bucket, path, title, alt_text")
    .eq("id", mediaAssetId)
    .maybeSingle();

  const asset = data as MediaAssetRow | null;

  if (!asset) {
    return null;
  }

  return {
    url: buildStorageImageUrl(asset.path, asset.bucket, {
      width: 1680,
      quality: 76,
      resize: "cover"
    }),
    title: asset.title,
    altText: asset.alt_text
  };
}

export async function getNextEvent() {
  if (isBuildPhase()) {
    return null;
  }

  const supabase = createClient();
  const nowIso = new Date().toISOString();
  const { data } = await supabase
    .from("events")
    .select("id, slug, title, short_description, venue_name, city, starts_at, cover_asset_id")
    .eq("status", "published")
    .gte("starts_at", nowIso)
    .order("starts_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    shortDescription: data.short_description,
    venueName: data.venue_name,
    city: data.city,
    startsAt: data.starts_at,
    cover: await resolveMediaAsset(data.cover_asset_id)
  } satisfies EventCard;
}

export async function getUpcomingEvents(limit = 5) {
  if (isBuildPhase()) {
    return [];
  }

  const supabase = createClient();
  const nowIso = new Date().toISOString();
  const { data } = await supabase
    .from("events")
    .select("id, slug, title, short_description, venue_name, city, starts_at, cover_asset_id")
    .eq("status", "published")
    .gte("starts_at", nowIso)
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (!data?.length) {
    return [];
  }

  const coverIds = Array.from(new Set(data.map((event) => event.cover_asset_id).filter(Boolean)));
  const coverMap = new Map<string, EventCard["cover"] | null>();

  if (coverIds.length) {
    const { data: coverAssets } = await supabase
      .from("media_assets")
      .select("id, bucket, path, title, alt_text")
      .in("id", coverIds);

    ((coverAssets || []) as MediaAssetRow[]).forEach((asset) => {
      coverMap.set(asset.id, {
        url: buildStorageImageUrl(asset.path, asset.bucket, {
          width: 1400,
          quality: 74,
          resize: "cover"
        }),
        title: asset.title,
        altText: asset.alt_text
      });
    });
  }

  return data.map(
    (event) =>
      ({
        id: event.id,
        slug: event.slug,
        title: event.title,
        shortDescription: event.short_description,
        venueName: event.venue_name,
        city: event.city,
        startsAt: event.starts_at,
        cover: event.cover_asset_id ? coverMap.get(event.cover_asset_id) || null : null
      }) satisfies EventCard
  );
}

export async function getAvatarPresets() {
  if (isBuildPhase()) {
    return [];
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("avatar_presets")
    .select("id, slug, label, description, background_color, accent_color, media_asset_id")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (!data?.length) {
    return [];
  }

  return Promise.all(
    data.map(async (preset) => {
      const media = await resolveMediaAsset(preset.media_asset_id);

      return {
        id: preset.id,
        slug: preset.slug,
        label: preset.label,
        description: preset.description,
        backgroundColor: preset.background_color,
        accentColor: preset.accent_color,
        mediaUrl: media?.url || null
      } satisfies AvatarPreset;
    })
  );
}

export async function getMediaAssets(limit = 18) {
  if (isBuildPhase()) {
    return [];
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("media_assets")
    .select("id, title, path, alt_text, bucket, is_public")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data || []).map(
    (asset) =>
      ({
        id: asset.id,
        title: asset.title,
        path: asset.path,
        altText: asset.alt_text,
        bucket: asset.bucket,
        isPublic: asset.is_public ?? false,
        publicUrl: buildStoragePublicUrl(asset.path, asset.bucket)
      }) satisfies MediaAssetSummary
  );
}

export async function getMediaAssetsByPrefix(prefix: string, limit = 200) {
  if (isBuildPhase()) {
    return [];
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("media_assets")
    .select("id, title, path, alt_text, bucket, is_public")
    .like("path", `${prefix}%`)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data || []).map(
    (asset) =>
      ({
        id: asset.id,
        title: asset.title,
        path: asset.path,
        altText: asset.alt_text,
        bucket: asset.bucket,
        isPublic: asset.is_public ?? false,
        publicUrl: buildStoragePublicUrl(asset.path, asset.bucket)
      }) satisfies MediaAssetSummary
  );
}

export async function getMediaCollections(limit = 12) {
  if (isBuildPhase()) {
    return [];
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("media_collections")
    .select("id, slug, label, description, is_active")
    .order("updated_at", { ascending: false })
    .limit(limit);

  return (data || []).map(
    (collection) =>
      ({
        id: collection.id,
        slug: collection.slug,
        label: collection.label,
        description: collection.description,
        isActive: collection.is_active
      }) satisfies MediaCollectionSummary
  );
}

export async function getSectionBindings(limit = 12) {
  if (isBuildPhase()) {
    return [];
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("section_media_bindings")
    .select("id, binding_key, items_limit, rotate_interval_seconds, rotation_mode, section_id, collection_id")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (!data?.length) {
    return [];
  }

  const sectionIds = Array.from(new Set(data.map((binding) => binding.section_id)));
  const collectionIds = Array.from(new Set(data.map((binding) => binding.collection_id)));

  const [{ data: sections }, { data: collections }] = await Promise.all([
    supabase
      .from("cms_sections")
      .select("id, section_key, page_id")
      .in("id", sectionIds),
    supabase
      .from("media_collections")
      .select("id, label")
      .in("id", collectionIds)
  ]);

  const pageIds = Array.from(new Set((sections || []).map((section) => section.page_id)));
  const { data: pages } = await supabase.from("cms_pages").select("id, slug").in("id", pageIds);

  const sectionMap = new Map((sections || []).map((section) => [section.id, section]));
  const pageMap = new Map((pages || []).map((page) => [page.id, page]));
  const collectionMap = new Map((collections || []).map((collection) => [collection.id, collection]));

  return data.map((binding) => {
    const section = sectionMap.get(binding.section_id);
    const page = section ? pageMap.get(section.page_id) : null;
    const collection = collectionMap.get(binding.collection_id);

    return {
      id: binding.id,
      bindingKey: binding.binding_key,
      itemsLimit: binding.items_limit,
      rotateIntervalSeconds: binding.rotate_interval_seconds,
      rotationMode: binding.rotation_mode,
      sectionKey: section?.section_key || "sin-seccion",
      pageSlug: page?.slug || "sin-pagina",
      collectionLabel: collection?.label || "Sin colección"
    } satisfies SectionBindingSummary;
  });
}
