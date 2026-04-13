import { isBuildPhase } from "../runtime";
import { createClient } from "../supabase/server";
import { MEDIA_BUCKET } from "../supabase/storage";
import { getSupabaseEnv } from "../supabase/env";

type CmsPageRow = {
  id: string;
  slug: string;
  title: string;
};

type CmsSectionRow = {
  id: string;
  page_id: string;
  section_key: string;
  label: string;
  sort_order: number;
  is_visible: boolean;
};

type CmsFieldRow = {
  id: string;
  section_id?: string;
  item_id?: string;
  field_key: string;
  label: string;
  kind: string;
  text_value: string | null;
  json_value: any;
  boolean_value: boolean | null;
  number_value: number | null;
  link_url: string | null;
  media_asset_id: string | null;
  sort_order: number;
  is_visible: boolean;
};

type CmsGroupRow = {
  id: string;
  section_id: string;
  group_key: string;
  label: string;
  kind: string;
  max_items: number | null;
  sort_order: number;
  is_visible: boolean;
};

type CmsGroupItemRow = {
  id: string;
  group_id: string;
  item_key: string;
  label: string;
  slug: string | null;
  sort_order: number;
  is_visible: boolean;
};

type MediaAssetRow = {
  id: string;
  bucket: string;
  path: string;
  title: string | null;
  alt_text: string | null;
};

export type CmsMediaAsset = {
  id?: string;
  url: string;
  title: string | null;
  altText: string | null;
};

export type CmsFieldValue = {
  id: string;
  fieldKey: string;
  label: string;
  kind: string;
  textValue: string | null;
  jsonValue: any;
  booleanValue: boolean | null;
  numberValue: number | null;
  linkUrl: string | null;
  mediaAssetId: string | null;
  media: CmsMediaAsset | null;
  sortOrder: number;
  isVisible: boolean;
};

export type CmsItem = {
  id: string;
  itemKey: string;
  label: string;
  slug: string | null;
  sortOrder: number;
  isVisible: boolean;
  fields: Record<string, CmsFieldValue>;
};

export type CmsGroup = {
  id: string;
  groupKey: string;
  label: string;
  kind: string;
  maxItems: number | null;
  sortOrder: number;
  isVisible: boolean;
  items: CmsItem[];
};

export type CmsSection = {
  id: string;
  sectionKey: string;
  label: string;
  sortOrder: number;
  isVisible: boolean;
  fields: Record<string, CmsFieldValue>;
  groups: Record<string, CmsGroup>;
};

export type CmsPageConfig = {
  id: string;
  slug: string;
  title: string;
  sections: Record<string, CmsSection>;
};

function buildPublicUrl(path: string, bucket = MEDIA_BUCKET) {
  const { url } = getSupabaseEnv();
  return `${url}/storage/v1/object/public/${bucket}/${path}`;
}

function mapField(row: CmsFieldRow, mediaMap: Map<string, CmsMediaAsset>) {
  return {
    id: row.id,
    fieldKey: row.field_key,
    label: row.label,
    kind: row.kind,
    textValue: row.text_value,
    jsonValue: row.json_value,
    booleanValue: row.boolean_value,
    numberValue: row.number_value,
    linkUrl: row.link_url,
    mediaAssetId: row.media_asset_id,
    media: row.media_asset_id ? mediaMap.get(row.media_asset_id) || null : null,
    sortOrder: row.sort_order,
    isVisible: row.is_visible
  } satisfies CmsFieldValue;
}

export async function getCmsPageConfig(pageSlug: string): Promise<CmsPageConfig | null> {
  if (isBuildPhase()) {
    return null;
  }

  const supabase = createClient();
  const { data: page } = await supabase
    .from("cms_pages")
    .select("id, slug, title")
    .eq("slug", pageSlug)
    .maybeSingle();

  if (!page) {
    return null;
  }

  const typedPage = page as CmsPageRow;

  const { data: sections } = await supabase
    .from("cms_sections")
    .select("id, page_id, section_key, label, sort_order, is_visible")
    .eq("page_id", typedPage.id)
    .order("sort_order", { ascending: true });

  const typedSections = (sections || []) as CmsSectionRow[];

  if (!typedSections.length) {
    return {
      id: typedPage.id,
      slug: typedPage.slug,
      title: typedPage.title,
      sections: {}
    };
  }

  const sectionIds = typedSections.map((section) => section.id);

  const [{ data: sectionFields }, { data: groups }] = await Promise.all([
    supabase
      .from("cms_section_fields")
      .select("id, section_id, field_key, label, kind, text_value, json_value, boolean_value, number_value, link_url, media_asset_id, sort_order, is_visible")
      .in("section_id", sectionIds)
      .order("sort_order", { ascending: true }),
    supabase
      .from("cms_item_groups")
      .select("id, section_id, group_key, label, kind, max_items, sort_order, is_visible")
      .in("section_id", sectionIds)
      .order("sort_order", { ascending: true })
  ]);

  const typedSectionFields = (sectionFields || []) as CmsFieldRow[];
  const typedGroups = (groups || []) as CmsGroupRow[];
  const groupIds = typedGroups.map((group) => group.id);

  const [{ data: items }, { data: itemFields }] = await Promise.all([
    groupIds.length
      ? supabase
          .from("cms_group_items")
          .select("id, group_id, item_key, label, slug, sort_order, is_visible")
          .in("group_id", groupIds)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [] as CmsGroupItemRow[] }),
    groupIds.length
      ? supabase
          .from("cms_group_item_fields")
          .select("id, item_id, field_key, label, kind, text_value, json_value, boolean_value, number_value, link_url, media_asset_id, sort_order, is_visible")
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [] as CmsFieldRow[] })
  ]);

  const typedItems = (items || []) as CmsGroupItemRow[];
  const typedItemFields = (itemFields || []).filter((field) =>
    typedItems.some((item) => item.id === (field as CmsFieldRow).item_id)
  ) as CmsFieldRow[];

  const mediaAssetIds = Array.from(
    new Set(
      [...typedSectionFields, ...typedItemFields]
        .map((field) => field.media_asset_id)
        .filter(Boolean)
    )
  ) as string[];

  const { data: mediaAssets } = mediaAssetIds.length
    ? await supabase
        .from("media_assets")
        .select("id, bucket, path, title, alt_text")
        .in("id", mediaAssetIds)
    : { data: [] as MediaAssetRow[] };

  const mediaMap = new Map(
    ((mediaAssets || []) as MediaAssetRow[]).map((asset) => [
      asset.id,
      {
        id: asset.id,
        url: buildPublicUrl(asset.path, asset.bucket),
        title: asset.title,
        altText: asset.alt_text
      } satisfies CmsMediaAsset
    ])
  );

  const itemsByGroup = new Map<string, CmsItem[]>();
  const itemFieldsByItem = new Map<string, Record<string, CmsFieldValue>>();

  typedItems.forEach((item) => {
    itemFieldsByItem.set(item.id, {});
  });

  typedItemFields.forEach((field) => {
    const target = field.item_id ? itemFieldsByItem.get(field.item_id) : null;

    if (target) {
      target[field.field_key] = mapField(field, mediaMap);
    }
  });

  typedItems.forEach((item) => {
    const existing = itemsByGroup.get(item.group_id) || [];
    existing.push({
      id: item.id,
      itemKey: item.item_key,
      label: item.label,
      slug: item.slug,
      sortOrder: item.sort_order,
      isVisible: item.is_visible,
      fields: itemFieldsByItem.get(item.id) || {}
    });
    itemsByGroup.set(item.group_id, existing);
  });

  const groupsBySection = new Map<string, Record<string, CmsGroup>>();

  typedGroups.forEach((group) => {
    const existing = groupsBySection.get(group.section_id) || {};
    existing[group.group_key] = {
      id: group.id,
      groupKey: group.group_key,
      label: group.label,
      kind: group.kind,
      maxItems: group.max_items,
      sortOrder: group.sort_order,
      isVisible: group.is_visible,
      items: itemsByGroup.get(group.id) || []
    };
    groupsBySection.set(group.section_id, existing);
  });

  const sectionFieldMaps = new Map<string, Record<string, CmsFieldValue>>();

  typedSectionFields.forEach((field) => {
    if (!field.section_id) {
      return;
    }

    const existing = sectionFieldMaps.get(field.section_id) || {};
    existing[field.field_key] = mapField(field, mediaMap);
    sectionFieldMaps.set(field.section_id, existing);
  });

  const sectionsMap = typedSections.reduce<Record<string, CmsSection>>((accumulator, section) => {
    accumulator[section.section_key] = {
      id: section.id,
      sectionKey: section.section_key,
      label: section.label,
      sortOrder: section.sort_order,
      isVisible: section.is_visible,
      fields: sectionFieldMaps.get(section.id) || {},
      groups: groupsBySection.get(section.id) || {}
    };
    return accumulator;
  }, {});

  return {
    id: typedPage.id,
    slug: typedPage.slug,
    title: typedPage.title,
    sections: sectionsMap
  };
}
