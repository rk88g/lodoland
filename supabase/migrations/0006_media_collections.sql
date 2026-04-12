create type public.media_rotation_mode as enum ('manual', 'random', 'shuffle');

create table public.media_collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  description text,
  is_active boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.media_collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.media_collections (id) on delete cascade,
  media_asset_id uuid not null references public.media_assets (id) on delete cascade,
  label text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  unique (collection_id, media_asset_id)
);

create table public.section_media_bindings (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.cms_sections (id) on delete cascade,
  binding_key text not null,
  collection_id uuid not null references public.media_collections (id) on delete cascade,
  rotation_mode public.media_rotation_mode not null default 'random',
  items_limit integer not null default 12,
  rotate_interval_seconds integer not null default 6,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (section_id, binding_key)
);

create index idx_media_collection_items_collection on public.media_collection_items (collection_id, sort_order);
create index idx_section_media_bindings_section on public.section_media_bindings (section_id);

create trigger set_media_collections_updated_at
before update on public.media_collections
for each row execute procedure public.set_updated_at();

create trigger set_section_media_bindings_updated_at
before update on public.section_media_bindings
for each row execute procedure public.set_updated_at();

alter table public.media_collections enable row level security;
alter table public.media_collection_items enable row level security;
alter table public.section_media_bindings enable row level security;

create policy "media_collections_public_read"
on public.media_collections
for select
to anon, authenticated
using (is_active = true);

create policy "media_collections_admin_all"
on public.media_collections
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "media_collection_items_public_read"
on public.media_collection_items
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.media_collections
    where public.media_collections.id = media_collection_items.collection_id
      and public.media_collections.is_active = true
  )
  and exists (
    select 1
    from public.media_assets
    where public.media_assets.id = media_collection_items.media_asset_id
      and public.media_assets.is_public = true
  )
);

create policy "media_collection_items_admin_all"
on public.media_collection_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "section_media_bindings_public_read"
on public.section_media_bindings
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.cms_sections
    join public.cms_pages on public.cms_pages.id = public.cms_sections.page_id
    where public.cms_sections.id = section_media_bindings.section_id
      and public.cms_sections.is_visible = true
      and public.cms_pages.status = 'published'
  )
  and exists (
    select 1
    from public.media_collections
    where public.media_collections.id = section_media_bindings.collection_id
      and public.media_collections.is_active = true
  )
);

create policy "section_media_bindings_admin_all"
on public.section_media_bindings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
