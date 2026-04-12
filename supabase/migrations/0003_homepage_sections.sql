create type public.social_platform as enum ('facebook', 'instagram', 'tiktok', 'youtube', 'x', 'other');

create table public.home_featured_event (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null unique references public.cms_sections (id) on delete cascade,
  event_id uuid references public.events (id) on delete set null,
  hero_media_asset_id uuid references public.media_assets (id) on delete set null,
  accent_media_asset_id uuid references public.media_assets (id) on delete set null,
  show_countdown boolean not null default true,
  show_ticket_summary boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.home_social_cards (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.cms_sections (id) on delete cascade,
  platform public.social_platform not null,
  account_name text not null,
  handle text,
  profile_url text,
  embed_url text,
  preview_asset_id uuid references public.media_assets (id) on delete set null,
  follower_label text,
  cta_label text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.home_sponsors (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.cms_sections (id) on delete cascade,
  name text not null,
  company_name text,
  website_url text,
  logo_asset_id uuid references public.media_assets (id) on delete set null,
  tier text,
  description text,
  accent_color text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.home_influencers (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.cms_sections (id) on delete cascade,
  display_name text not null,
  handle text,
  platform public.social_platform not null default 'instagram',
  profile_url text,
  avatar_asset_id uuid references public.media_assets (id) on delete set null,
  cover_asset_id uuid references public.media_assets (id) on delete set null,
  headline text,
  bio text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.home_sales_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.cms_sections (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  title text not null,
  badge_text text,
  description text,
  external_url text,
  card_media_asset_id uuid references public.media_assets (id) on delete set null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.home_merch_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.cms_sections (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  title text not null,
  badge_text text,
  description text,
  external_url text,
  card_media_asset_id uuid references public.media_assets (id) on delete set null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index idx_home_social_cards_section_id on public.home_social_cards (section_id);
create index idx_home_sponsors_section_id on public.home_sponsors (section_id);
create index idx_home_influencers_section_id on public.home_influencers (section_id);
create index idx_home_sales_items_section_id on public.home_sales_items (section_id);
create index idx_home_merch_items_section_id on public.home_merch_items (section_id);

create trigger set_home_featured_event_updated_at
before update on public.home_featured_event
for each row execute procedure public.set_updated_at();

create trigger set_home_social_cards_updated_at
before update on public.home_social_cards
for each row execute procedure public.set_updated_at();

create trigger set_home_sponsors_updated_at
before update on public.home_sponsors
for each row execute procedure public.set_updated_at();

create trigger set_home_influencers_updated_at
before update on public.home_influencers
for each row execute procedure public.set_updated_at();

create trigger set_home_sales_items_updated_at
before update on public.home_sales_items
for each row execute procedure public.set_updated_at();

create trigger set_home_merch_items_updated_at
before update on public.home_merch_items
for each row execute procedure public.set_updated_at();

alter table public.home_featured_event enable row level security;
alter table public.home_social_cards enable row level security;
alter table public.home_sponsors enable row level security;
alter table public.home_influencers enable row level security;
alter table public.home_sales_items enable row level security;
alter table public.home_merch_items enable row level security;

create policy "home_featured_event_public_read"
on public.home_featured_event
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.cms_sections
    join public.cms_pages on public.cms_pages.id = public.cms_sections.page_id
    where public.cms_sections.id = home_featured_event.section_id
      and public.cms_sections.is_visible = true
      and public.cms_pages.status = 'published'
  )
);

create policy "home_featured_event_admin_all"
on public.home_featured_event
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "home_social_cards_public_read"
on public.home_social_cards
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.cms_sections
    join public.cms_pages on public.cms_pages.id = public.cms_sections.page_id
    where public.cms_sections.id = home_social_cards.section_id
      and public.cms_sections.is_visible = true
      and public.cms_pages.status = 'published'
  )
);

create policy "home_social_cards_admin_all"
on public.home_social_cards
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "home_sponsors_public_read"
on public.home_sponsors
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.cms_sections
    join public.cms_pages on public.cms_pages.id = public.cms_sections.page_id
    where public.cms_sections.id = home_sponsors.section_id
      and public.cms_sections.is_visible = true
      and public.cms_pages.status = 'published'
  )
);

create policy "home_sponsors_admin_all"
on public.home_sponsors
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "home_influencers_public_read"
on public.home_influencers
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.cms_sections
    join public.cms_pages on public.cms_pages.id = public.cms_sections.page_id
    where public.cms_sections.id = home_influencers.section_id
      and public.cms_sections.is_visible = true
      and public.cms_pages.status = 'published'
  )
);

create policy "home_influencers_admin_all"
on public.home_influencers
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "home_sales_items_public_read"
on public.home_sales_items
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.cms_sections
    join public.cms_pages on public.cms_pages.id = public.cms_sections.page_id
    where public.cms_sections.id = home_sales_items.section_id
      and public.cms_sections.is_visible = true
      and public.cms_pages.status = 'published'
  )
);

create policy "home_sales_items_admin_all"
on public.home_sales_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "home_merch_items_public_read"
on public.home_merch_items
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.cms_sections
    join public.cms_pages on public.cms_pages.id = public.cms_sections.page_id
    where public.cms_sections.id = home_merch_items.section_id
      and public.cms_sections.is_visible = true
      and public.cms_pages.status = 'published'
  )
);

create policy "home_merch_items_admin_all"
on public.home_merch_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.cms_sections (page_id, section_key, label, sort_order, is_visible)
select public.cms_pages.id, v.section_key, v.label, v.sort_order, true
from public.cms_pages
cross join (
  values
    ('evento_reciente', 'Evento reciente', 1),
    ('redes_sociales', 'Redes sociales', 2),
    ('patrocinadores', 'Patrocinadores', 3),
    ('influencers', 'Influencers', 4),
    ('ventas_destacadas', 'Ventas destacadas', 5),
    ('merch_destacado', 'Merch destacado', 6)
) as v(section_key, label, sort_order)
where public.cms_pages.slug = 'home'
  and not exists (
    select 1
    from public.cms_sections
    where public.cms_sections.page_id = public.cms_pages.id
      and public.cms_sections.section_key = v.section_key
  );

insert into public.navigation_links (label, href, sort_order, is_visible, page_id)
select v.label, v.href, v.sort_order, true, public.cms_pages.id
from public.cms_pages
cross join (
  values
    ('Evento', '#evento', 1),
    ('Redes', '#redes', 2),
    ('Patrocinadores', '#patrocinadores', 3),
    ('Influencers', '#influencers', 4),
    ('Ventas', '#ventas', 5),
    ('Merch', '#merch', 6)
) as v(label, href, sort_order)
where public.cms_pages.slug = 'home'
  and not exists (
    select 1
    from public.navigation_links
    where public.navigation_links.page_id = public.cms_pages.id
      and public.navigation_links.href = v.href
  );

insert into public.navigation_links (label, href, sort_order, is_visible, page_id)
select 'Mi cuenta', '/login', 7, true, null
where not exists (
  select 1
  from public.navigation_links
  where href = '/login'
);

insert into public.cms_section_fields (section_id, field_key, label, kind, text_value, sort_order)
select public.cms_sections.id, v.field_key, v.label, v.kind::public.field_kind, v.text_value, v.sort_order
from public.cms_sections
join public.cms_pages on public.cms_pages.id = public.cms_sections.page_id
join (
  values
    ('evento_reciente', 'menu_label', 'Menu label', 'text', 'Evento', 1),
    ('evento_reciente', 'eyebrow', 'Eyebrow', 'text', 'Evento mas reciente', 2),
    ('evento_reciente', 'title', 'Titulo', 'text', 'El Proximo Golpe De Lodo', 3),
    ('evento_reciente', 'description', 'Descripcion', 'textarea', 'La seccion principal presenta el evento mas reciente con acceso rapido a boletos, fases y activaciones.', 4),
    ('evento_reciente', 'primary_cta_label', 'Boton primario', 'text', 'Ver evento', 5),
    ('evento_reciente', 'secondary_cta_label', 'Boton secundario', 'text', 'Comprar boletos', 6),
    ('redes_sociales', 'menu_label', 'Menu label', 'text', 'Redes', 1),
    ('redes_sociales', 'eyebrow', 'Eyebrow', 'text', 'Social hub', 2),
    ('redes_sociales', 'title', 'Titulo', 'text', 'Facebook E Instagram Como Mini Escaparates', 3),
    ('redes_sociales', 'description', 'Descripcion', 'textarea', 'Seccion para mini previews, embeds, handles y llamadas a la accion hacia redes oficiales.', 4),
    ('patrocinadores', 'menu_label', 'Menu label', 'text', 'Patrocinadores', 1),
    ('patrocinadores', 'eyebrow', 'Eyebrow', 'text', 'Partners', 2),
    ('patrocinadores', 'title', 'Titulo', 'text', 'Patrocinadores Con Peso Propio', 3),
    ('patrocinadores', 'description', 'Descripcion', 'textarea', 'Area para logos, categorias, links y presentacion de marcas aliadas.', 4),
    ('influencers', 'menu_label', 'Menu label', 'text', 'Influencers', 1),
    ('influencers', 'eyebrow', 'Eyebrow', 'text', 'Creators', 2),
    ('influencers', 'title', 'Titulo', 'text', 'Influencers, Canales Y Colaboraciones', 3),
    ('influencers', 'description', 'Descripcion', 'textarea', 'Zona para destacar perfiles, handles, canales y colaboraciones especiales.', 4),
    ('ventas_destacadas', 'menu_label', 'Menu label', 'text', 'Ventas', 1),
    ('ventas_destacadas', 'eyebrow', 'Eyebrow', 'text', 'Ventas online', 2),
    ('ventas_destacadas', 'title', 'Titulo', 'text', 'Promos, Combos Y Drops Comerciales', 3),
    ('ventas_destacadas', 'description', 'Descripcion', 'textarea', 'Cards para promociones, rifas, quinielas o accesos especiales.', 4),
    ('merch_destacado', 'menu_label', 'Menu label', 'text', 'Merch', 1),
    ('merch_destacado', 'eyebrow', 'Eyebrow', 'text', 'Store', 2),
    ('merch_destacado', 'title', 'Titulo', 'text', 'Merch Que Se Sienta Como Coleccion', 3),
    ('merch_destacado', 'description', 'Descripcion', 'textarea', 'Cards de merch, drops y bundles con visual editorial.', 4),
    ('merch_destacado', 'primary_cta_label', 'Boton primario', 'text', 'Ver mi cuenta', 5),
    ('merch_destacado', 'secondary_cta_label', 'Boton secundario', 'text', 'Iniciar sesion', 6)
) as v(section_key, field_key, label, kind, text_value, sort_order)
  on v.section_key = public.cms_sections.section_key
where public.cms_pages.slug = 'home'
  and not exists (
    select 1
    from public.cms_section_fields
    where public.cms_section_fields.section_id = public.cms_sections.id
      and public.cms_section_fields.field_key = v.field_key
      and public.cms_section_fields.locale = 'es-MX'
  );
