alter table public.home_featured_event
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists primary_cta_label text,
  add column if not exists secondary_cta_label text,
  add column if not exists side_banner_asset_id uuid,
  add column if not exists side_banner_url text,
  add column if not exists side_banner_alt text,
  add column if not exists sponsor_name text,
  add column if not exists sponsor_description text,
  add column if not exists sponsor_website_label text,
  add column if not exists sponsor_website_url text,
  add column if not exists sponsor_social_label text,
  add column if not exists sponsor_social_url text,
  add column if not exists sponsor_media_asset_id uuid;

alter table public.home_sponsors
  add column if not exists background_color text,
  add column if not exists menu_label text,
  add column if not exists is_menu_featured boolean default false not null;

alter table public.home_influencers
  add column if not exists instagram_url text,
  add column if not exists facebook_url text,
  add column if not exists youtube_url text,
  add column if not exists tiktok_url text;

alter table public.home_sales_items
  add column if not exists subtitle text,
  add column if not exists price_label text;

create index if not exists idx_home_featured_event_section_active
  on public.home_featured_event(section_id, is_active);

create index if not exists idx_home_sponsors_section_active
  on public.home_sponsors(section_id, is_active, sort_order);

create index if not exists idx_home_influencers_section_active
  on public.home_influencers(section_id, is_active, sort_order);

create index if not exists idx_home_social_cards_section_active
  on public.home_social_cards(section_id, is_active, sort_order);

create index if not exists idx_home_sales_items_section_active
  on public.home_sales_items(section_id, is_active, sort_order);

create index if not exists idx_home_merch_items_section_active
  on public.home_merch_items(section_id, is_active, sort_order);

with
home_page as (
  select id
  from public.cms_pages
  where slug = 'home'
  limit 1
),
event_section as (
  select id
  from public.cms_sections
  where page_id = (select id from home_page)
    and section_key = 'evento_reciente'
  limit 1
),
event_fields as (
  select field_key, text_value, link_url, media_asset_id
  from public.cms_section_fields
  where section_id = (select id from event_section)
),
official_group as (
  select g.id
  from public.cms_item_groups g
  where g.section_id = (select id from event_section)
    and g.group_key = 'official_sponsor_modal'
  limit 1
),
official_item as (
  select i.id, i.label
  from public.cms_group_items i
  where i.group_id = (select id from official_group)
  order by i.sort_order asc
  limit 1
),
official_fields as (
  select field_key, text_value, link_url, media_asset_id
  from public.cms_group_item_fields
  where item_id = (select id from official_item)
),
banner_group as (
  select g.id
  from public.cms_item_groups g
  where g.section_id = (select id from event_section)
    and g.group_key = 'event_side_banner'
  limit 1
),
banner_item as (
  select i.id
  from public.cms_group_items i
  where i.group_id = (select id from banner_group)
  order by i.sort_order asc
  limit 1
),
banner_fields as (
  select field_key, text_value, link_url, media_asset_id
  from public.cms_group_item_fields
  where item_id = (select id from banner_item)
)
insert into public.home_featured_event (
  section_id,
  event_id,
  hero_media_asset_id,
  title,
  description,
  primary_cta_label,
  secondary_cta_label,
  side_banner_asset_id,
  side_banner_url,
  side_banner_alt,
  sponsor_name,
  sponsor_description,
  sponsor_website_label,
  sponsor_website_url,
  sponsor_social_label,
  sponsor_social_url,
  sponsor_media_asset_id,
  is_active
)
select
  (select id from event_section),
  null,
  (select media_asset_id from event_fields where field_key = 'hero_media' limit 1),
  (select text_value from event_fields where field_key = 'title' limit 1),
  (select text_value from event_fields where field_key = 'description' limit 1),
  (select text_value from event_fields where field_key = 'primary_cta_label' limit 1),
  (select text_value from event_fields where field_key = 'secondary_cta_label' limit 1),
  (select media_asset_id from banner_fields where field_key = 'media' limit 1),
  (select link_url from banner_fields where field_key = 'target_url' limit 1),
  (select text_value from event_fields where field_key = 'side_banner_alt' limit 1),
  coalesce((select text_value from official_fields where field_key = 'title' limit 1), (select label from official_item)),
  (select text_value from official_fields where field_key = 'description' limit 1),
  (select text_value from official_fields where field_key = 'website_label' limit 1),
  (select link_url from official_fields where field_key = 'website_url' limit 1),
  (select text_value from official_fields where field_key = 'social_label' limit 1),
  (select link_url from official_fields where field_key = 'social_url' limit 1),
  (select media_asset_id from official_fields where field_key = 'media' limit 1),
  true
where (select id from event_section) is not null
  and not exists (
    select 1
    from public.home_featured_event existing
    where existing.section_id = (select id from event_section)
  );

with
home_page as (
  select id
  from public.cms_pages
  where slug = 'home'
  limit 1
),
sponsor_section as (
  select id
  from public.cms_sections
  where page_id = (select id from home_page)
    and section_key = 'patrocinadores'
  limit 1
),
sponsor_group as (
  select id
  from public.cms_item_groups
  where section_id = (select id from sponsor_section)
    and group_key = 'sponsor_tiles'
  limit 1
),
sponsor_items as (
  select id, label, sort_order, is_visible
  from public.cms_group_items
  where group_id = (select id from sponsor_group)
),
sponsor_fields as (
  select item_id, field_key, text_value, link_url, media_asset_id
  from public.cms_group_item_fields
  where item_id in (select id from sponsor_items)
)
insert into public.home_sponsors (
  section_id,
  name,
  company_name,
  website_url,
  logo_asset_id,
  tier,
  description,
  accent_color,
  background_color,
  menu_label,
  is_menu_featured,
  sort_order,
  is_active
)
select
  (select id from sponsor_section),
  coalesce(name_field.text_value, item.label),
  null,
  target_field.link_url,
  logo_field.media_asset_id,
  null,
  null,
  accent_field.text_value,
  background_field.text_value,
  coalesce(name_field.text_value, item.label),
  case when item.sort_order <= 3 then true else false end,
  item.sort_order,
  item.is_visible
from sponsor_items item
left join sponsor_fields name_field
  on name_field.item_id = item.id
 and name_field.field_key = 'name'
left join sponsor_fields target_field
  on target_field.item_id = item.id
 and target_field.field_key = 'target_url'
left join sponsor_fields logo_field
  on logo_field.item_id = item.id
 and logo_field.field_key = 'logo_media'
left join sponsor_fields accent_field
  on accent_field.item_id = item.id
 and accent_field.field_key = 'accent_color'
left join sponsor_fields background_field
  on background_field.item_id = item.id
 and background_field.field_key = 'background_color'
where (select id from sponsor_section) is not null
  and not exists (
    select 1
    from public.home_sponsors existing
    where existing.section_id = (select id from sponsor_section)
  );

with
home_page as (
  select id
  from public.cms_pages
  where slug = 'home'
  limit 1
),
influencer_section as (
  select id
  from public.cms_sections
  where page_id = (select id from home_page)
    and section_key = 'influencers'
  limit 1
),
influencer_group as (
  select id
  from public.cms_item_groups
  where section_id = (select id from influencer_section)
    and group_key = 'influencer_profiles'
  limit 1
),
influencer_items as (
  select id, label, sort_order, is_visible
  from public.cms_group_items
  where group_id = (select id from influencer_group)
),
influencer_fields as (
  select item_id, field_key, text_value, link_url, media_asset_id
  from public.cms_group_item_fields
  where item_id in (select id from influencer_items)
)
insert into public.home_influencers (
  section_id,
  display_name,
  handle,
  platform,
  profile_url,
  avatar_asset_id,
  cover_asset_id,
  headline,
  bio,
  instagram_url,
  facebook_url,
  youtube_url,
  tiktok_url,
  sort_order,
  is_active
)
select
  (select id from influencer_section),
  coalesce(name_field.text_value, item.label),
  null,
  'instagram'::public.social_platform,
  instagram_field.link_url,
  null,
  cover_field.media_asset_id,
  role_field.text_value,
  description_field.text_value,
  instagram_field.link_url,
  facebook_field.link_url,
  youtube_field.link_url,
  tiktok_field.link_url,
  item.sort_order,
  item.is_visible
from influencer_items item
left join influencer_fields name_field
  on name_field.item_id = item.id
 and name_field.field_key = 'name'
left join influencer_fields role_field
  on role_field.item_id = item.id
 and role_field.field_key = 'role'
left join influencer_fields description_field
  on description_field.item_id = item.id
 and description_field.field_key = 'description'
left join influencer_fields cover_field
  on cover_field.item_id = item.id
 and cover_field.field_key = 'cover_media'
left join influencer_fields instagram_field
  on instagram_field.item_id = item.id
 and instagram_field.field_key = 'instagram_url'
left join influencer_fields facebook_field
  on facebook_field.item_id = item.id
 and facebook_field.field_key = 'facebook_url'
left join influencer_fields youtube_field
  on youtube_field.item_id = item.id
 and youtube_field.field_key = 'youtube_url'
left join influencer_fields tiktok_field
  on tiktok_field.item_id = item.id
 and tiktok_field.field_key = 'tiktok_url'
where (select id from influencer_section) is not null
  and not exists (
    select 1
    from public.home_influencers existing
    where existing.section_id = (select id from influencer_section)
  );

alter table public.home_featured_event enable row level security;
alter table public.home_social_cards enable row level security;
alter table public.home_sponsors enable row level security;
alter table public.home_influencers enable row level security;
alter table public.home_sales_items enable row level security;
alter table public.home_merch_items enable row level security;

drop policy if exists "home_featured_event public select" on public.home_featured_event;
create policy "home_featured_event public select"
  on public.home_featured_event
  for select
  using (
    is_active = true
    or public.current_app_role() in ('admin'::public.app_role, 'super_admin'::public.app_role)
  );

drop policy if exists "home_featured_event admin manage" on public.home_featured_event;
create policy "home_featured_event admin manage"
  on public.home_featured_event
  for all
  using (public.current_app_role() in ('admin'::public.app_role, 'super_admin'::public.app_role))
  with check (public.current_app_role() in ('admin'::public.app_role, 'super_admin'::public.app_role));

drop policy if exists "home_social_cards public select" on public.home_social_cards;
create policy "home_social_cards public select"
  on public.home_social_cards
  for select
  using (
    is_active = true
    or public.current_app_role() in ('admin'::public.app_role, 'super_admin'::public.app_role)
  );

drop policy if exists "home_social_cards admin manage" on public.home_social_cards;
create policy "home_social_cards admin manage"
  on public.home_social_cards
  for all
  using (public.current_app_role() in ('admin'::public.app_role, 'super_admin'::public.app_role))
  with check (public.current_app_role() in ('admin'::public.app_role, 'super_admin'::public.app_role));

drop policy if exists "home_sponsors public select" on public.home_sponsors;
create policy "home_sponsors public select"
  on public.home_sponsors
  for select
  using (
    is_active = true
    or public.current_app_role() in ('admin'::public.app_role, 'super_admin'::public.app_role)
  );

drop policy if exists "home_sponsors admin manage" on public.home_sponsors;
create policy "home_sponsors admin manage"
  on public.home_sponsors
  for all
  using (public.current_app_role() in ('admin'::public.app_role, 'super_admin'::public.app_role))
  with check (public.current_app_role() in ('admin'::public.app_role, 'super_admin'::public.app_role));

drop policy if exists "home_influencers public select" on public.home_influencers;
create policy "home_influencers public select"
  on public.home_influencers
  for select
  using (
    is_active = true
    or public.current_app_role() in ('admin'::public.app_role, 'super_admin'::public.app_role)
  );

drop policy if exists "home_influencers admin manage" on public.home_influencers;
create policy "home_influencers admin manage"
  on public.home_influencers
  for all
  using (public.current_app_role() in ('admin'::public.app_role, 'super_admin'::public.app_role))
  with check (public.current_app_role() in ('admin'::public.app_role, 'super_admin'::public.app_role));

drop policy if exists "home_sales_items public select" on public.home_sales_items;
create policy "home_sales_items public select"
  on public.home_sales_items
  for select
  using (
    is_active = true
    or public.current_app_role() in ('admin'::public.app_role, 'super_admin'::public.app_role)
  );

drop policy if exists "home_sales_items admin manage" on public.home_sales_items;
create policy "home_sales_items admin manage"
  on public.home_sales_items
  for all
  using (public.current_app_role() in ('admin'::public.app_role, 'super_admin'::public.app_role))
  with check (public.current_app_role() in ('admin'::public.app_role, 'super_admin'::public.app_role));

drop policy if exists "home_merch_items public select" on public.home_merch_items;
create policy "home_merch_items public select"
  on public.home_merch_items
  for select
  using (
    is_active = true
    or public.current_app_role() in ('admin'::public.app_role, 'super_admin'::public.app_role)
  );

drop policy if exists "home_merch_items admin manage" on public.home_merch_items;
create policy "home_merch_items admin manage"
  on public.home_merch_items
  for all
  using (public.current_app_role() in ('admin'::public.app_role, 'super_admin'::public.app_role))
  with check (public.current_app_role() in ('admin'::public.app_role, 'super_admin'::public.app_role));
