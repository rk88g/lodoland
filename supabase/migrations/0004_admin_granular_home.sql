create type public.cms_item_group_kind as enum (
  'sponsor_spotlight',
  'menu_link',
  'menu_ad',
  'banner_ad',
  'social_profile',
  'sponsor_tile',
  'collage_media',
  'influencer_profile',
  'sale_offer',
  'merch_item',
  'footer_logo'
);

create table public.cms_item_groups (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.cms_sections (id) on delete cascade,
  group_key text not null,
  label text not null,
  kind public.cms_item_group_kind not null,
  max_items integer,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (section_id, group_key)
);

create table public.cms_group_items (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.cms_item_groups (id) on delete cascade,
  item_key text not null,
  label text not null,
  slug text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (group_id, item_key)
);

create table public.cms_group_item_fields (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.cms_group_items (id) on delete cascade,
  field_key text not null,
  label text not null,
  kind public.field_kind not null,
  locale text not null default 'es-MX',
  text_value text,
  json_value jsonb,
  boolean_value boolean,
  number_value numeric(12,2),
  link_url text,
  media_asset_id uuid references public.media_assets (id) on delete set null,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (item_id, field_key, locale)
);

create index idx_cms_item_groups_section_id on public.cms_item_groups (section_id);
create index idx_cms_group_items_group_id on public.cms_group_items (group_id);
create index idx_cms_group_item_fields_item_id on public.cms_group_item_fields (item_id);

create trigger set_cms_item_groups_updated_at
before update on public.cms_item_groups
for each row execute procedure public.set_updated_at();

create trigger set_cms_group_items_updated_at
before update on public.cms_group_items
for each row execute procedure public.set_updated_at();

create trigger set_cms_group_item_fields_updated_at
before update on public.cms_group_item_fields
for each row execute procedure public.set_updated_at();

alter table public.cms_item_groups enable row level security;
alter table public.cms_group_items enable row level security;
alter table public.cms_group_item_fields enable row level security;

create policy "cms_item_groups_public_read"
on public.cms_item_groups
for select
to anon, authenticated
using (
  is_visible = true
  and exists (
    select 1
    from public.cms_sections
    join public.cms_pages on public.cms_pages.id = public.cms_sections.page_id
    where public.cms_sections.id = cms_item_groups.section_id
      and public.cms_sections.is_visible = true
      and public.cms_pages.status = 'published'
  )
);

create policy "cms_item_groups_admin_all"
on public.cms_item_groups
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "cms_group_items_public_read"
on public.cms_group_items
for select
to anon, authenticated
using (
  is_visible = true
  and exists (
    select 1
    from public.cms_item_groups
    join public.cms_sections on public.cms_sections.id = public.cms_item_groups.section_id
    join public.cms_pages on public.cms_pages.id = public.cms_sections.page_id
    where public.cms_item_groups.id = cms_group_items.group_id
      and public.cms_item_groups.is_visible = true
      and public.cms_sections.is_visible = true
      and public.cms_pages.status = 'published'
  )
);

create policy "cms_group_items_admin_all"
on public.cms_group_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "cms_group_item_fields_public_read"
on public.cms_group_item_fields
for select
to anon, authenticated
using (
  is_visible = true
  and exists (
    select 1
    from public.cms_group_items
    join public.cms_item_groups on public.cms_item_groups.id = public.cms_group_items.group_id
    join public.cms_sections on public.cms_sections.id = public.cms_item_groups.section_id
    join public.cms_pages on public.cms_pages.id = public.cms_sections.page_id
    where public.cms_group_items.id = cms_group_item_fields.item_id
      and public.cms_group_items.is_visible = true
      and public.cms_item_groups.is_visible = true
      and public.cms_sections.is_visible = true
      and public.cms_pages.status = 'published'
  )
);

create policy "cms_group_item_fields_admin_all"
on public.cms_group_item_fields
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.cms_sections (page_id, section_key, label, sort_order, is_visible)
select public.cms_pages.id, v.section_key, v.label, v.sort_order, true
from public.cms_pages
cross join (
  values
    ('menu_overlay', 'Menu overlay', 0),
    ('footer', 'Footer', 99)
) as v(section_key, label, sort_order)
where public.cms_pages.slug = 'home'
  and not exists (
    select 1
    from public.cms_sections
    where public.cms_sections.page_id = public.cms_pages.id
      and public.cms_sections.section_key = v.section_key
  );

insert into public.cms_section_fields (section_id, field_key, label, kind, text_value, sort_order)
select public.cms_sections.id, v.field_key, v.label, v.kind::public.field_kind, v.text_value, v.sort_order
from public.cms_sections
join public.cms_pages on public.cms_pages.id = public.cms_sections.page_id
join (
  values
    ('menu_overlay', 'title', 'Titulo', 'text', 'Explora LODO LAND', 1),
    ('menu_overlay', 'description', 'Descripcion', 'textarea', 'Menu fullscreen con rutas y publicidad configurable.', 2),
    ('menu_overlay', 'trigger_label', 'Boton menu', 'text', 'Explorar', 3),
    ('menu_overlay', 'square_ad_alt', 'Alt anuncio cuadrado', 'text', 'Banner cuadrado del menu', 4),
    ('menu_overlay', 'rect_ad_alt', 'Alt anuncio rectangular', 'text', 'Banner rectangular del menu', 5),
    ('evento_reciente', 'hero_image_alt', 'Alt imagen evento', 'text', 'ALT del flyer o imagen principal del evento reciente', 10),
    ('evento_reciente', 'side_banner_alt', 'Alt banner vertical', 'text', 'Banner vertical publicitario con link configurable', 11),
    ('evento_reciente', 'sponsor_modal_title', 'Titulo modal sponsor', 'text', 'Patrocinador oficial', 12),
    ('evento_reciente', 'sponsor_modal_description', 'Descripcion modal sponsor', 'textarea', 'Modal de apertura para destacar patrocinador oficial con imagen, web y red social.', 13),
    ('redes_sociales', 'mobile_expectation_text', 'Texto movil', 'textarea', 'En movil, las redes se muestran como recuadros apilados con expectativa visual.', 10),
    ('patrocinadores', 'banner_alt', 'Alt banner horizontal', 'text', 'Banner horizontal principal de patrocinadores', 10),
    ('influencers', 'modal_button_label', 'Boton modal', 'text', 'Ver colaboradores', 10),
    ('influencers', 'modal_title', 'Titulo modal', 'text', 'Influencers de LODO LAND', 11),
    ('ventas_destacadas', 'purchase_hint', 'Texto compra', 'textarea', 'Si el usuario no ha iniciado sesion, va a login. Si ya tiene sesion, abre flujo de compra.', 10),
    ('merch_destacado', 'catalog_button_label', 'Boton catalogo', 'text', 'Ver catalogo', 10),
    ('footer', 'title', 'Titulo footer', 'text', 'LODO LAND', 1),
    ('footer', 'description', 'Descripcion footer', 'textarea', 'Footer preparado para aviso de privacidad, contacto y datos legales.', 2),
    ('footer', 'privacy_label', 'Label privacidad', 'text', 'Aviso de privacidad', 3),
    ('footer', 'contact_label', 'Label contacto', 'text', 'Contacto', 4),
    ('footer', 'terms_label', 'Label terminos', 'text', 'Terminos', 5)
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

insert into public.cms_item_groups (section_id, group_key, label, kind, max_items, sort_order, is_visible)
select public.cms_sections.id, v.group_key, v.label, v.kind::public.cms_item_group_kind, v.max_items, v.sort_order, true
from public.cms_sections
join public.cms_pages on public.cms_pages.id = public.cms_sections.page_id
join (
  values
    ('menu_overlay', 'menu_links', 'Links del menu', 'menu_link', 12, 1),
    ('menu_overlay', 'menu_ads', 'Anuncios del menu', 'menu_ad', 2, 2),
    ('evento_reciente', 'official_sponsor_modal', 'Sponsor oficial del modal', 'sponsor_spotlight', 1, 1),
    ('evento_reciente', 'event_side_banner', 'Banner lateral del evento', 'banner_ad', 1, 2),
    ('redes_sociales', 'social_profiles', 'Perfiles sociales', 'social_profile', 4, 1),
    ('patrocinadores', 'sponsor_tiles', 'Mosaico de patrocinadores', 'sponsor_tile', 100, 1),
    ('patrocinadores', 'sponsor_main_banner', 'Banner principal patrocinadores', 'banner_ad', 1, 2),
    ('influencers', 'influencer_collage', 'Fotos collage', 'collage_media', 30, 1),
    ('influencers', 'influencer_profiles', 'Perfiles influencers', 'influencer_profile', 100, 2),
    ('ventas_destacadas', 'sales_panels', 'Paneles de ventas', 'sale_offer', 20, 1),
    ('merch_destacado', 'merch_gallery', 'Merch principal', 'merch_item', 20, 1),
    ('footer', 'footer_marquee', 'Cinta de logos footer', 'footer_logo', 100, 1)
) as v(section_key, group_key, label, kind, max_items, sort_order)
  on v.section_key = public.cms_sections.section_key
where public.cms_pages.slug = 'home'
  and not exists (
    select 1
    from public.cms_item_groups
    where public.cms_item_groups.section_id = public.cms_sections.id
      and public.cms_item_groups.group_key = v.group_key
  );

insert into public.cms_group_items (group_id, item_key, label, sort_order, is_visible)
select public.cms_item_groups.id, v.item_key, v.label, v.sort_order, true
from public.cms_item_groups
join (
  values
    ('menu_links', 'evento', 'Evento reciente', 1),
    ('menu_links', 'redes', 'Redes sociales', 2),
    ('menu_links', 'patrocinadores', 'Patrocinadores', 3),
    ('menu_links', 'influencers', 'Influencers', 4),
    ('menu_links', 'ventas', 'Ventas', 5),
    ('menu_links', 'merch', 'Merch', 6),
    ('menu_links', 'mi_cuenta', 'Mi cuenta', 7),
    ('menu_ads', 'square_ad', 'Banner cuadrado', 1),
    ('menu_ads', 'rect_ad', 'Banner rectangular', 2),
    ('official_sponsor_modal', 'official_sponsor', 'Sponsor oficial', 1),
    ('event_side_banner', 'event_banner', 'Banner vertical evento', 1),
    ('social_profiles', 'facebook_profile', 'Facebook oficial', 1),
    ('social_profiles', 'instagram_profile', 'Instagram oficial', 2),
    ('sponsor_tiles', 'monster', 'Monster Energy', 1),
    ('sponsor_tiles', 'fox', 'Fox Racing', 2),
    ('sponsor_tiles', 'oakley', 'Oakley', 3),
    ('sponsor_tiles', 'canam', 'Can-Am', 4),
    ('sponsor_main_banner', 'main_banner', 'Banner principal', 1),
    ('influencer_collage', 'collage_1', 'Foto collage 1', 1),
    ('influencer_collage', 'collage_2', 'Foto collage 2', 2),
    ('influencer_collage', 'collage_3', 'Foto collage 3', 3),
    ('influencer_profiles', 'ana_torque', 'Ana Torque', 1),
    ('influencer_profiles', 'rafa_mud', 'Rafa Mud', 2),
    ('influencer_profiles', 'jess_nitro', 'Jess Nitro', 3),
    ('sales_panels', 'tickets', 'Boletos', 1),
    ('sales_panels', 'raffles', 'Rifas', 2),
    ('sales_panels', 'pools', 'Quinielas', 3),
    ('sales_panels', 'promos', 'Promociones', 4),
    ('merch_gallery', 'jersey', 'Jersey oficial', 1),
    ('merch_gallery', 'cap', 'Gorra track', 2),
    ('merch_gallery', 'kit', 'Kit rider', 3),
    ('footer_marquee', 'monster_logo', 'Monster', 1),
    ('footer_marquee', 'fox_logo', 'Fox', 2),
    ('footer_marquee', 'oakley_logo', 'Oakley', 3),
    ('footer_marquee', 'ana_logo', 'Ana Torque', 4)
) as v(group_key, item_key, label, sort_order)
  on v.group_key = public.cms_item_groups.group_key
where not exists (
  select 1
  from public.cms_group_items
  where public.cms_group_items.group_id = public.cms_item_groups.id
    and public.cms_group_items.item_key = v.item_key
);

insert into public.cms_group_item_fields (item_id, field_key, label, kind, text_value, link_url, sort_order)
select public.cms_group_items.id, v.field_key, v.label, v.kind::public.field_kind, v.text_value, v.link_url, v.sort_order
from public.cms_group_items
join public.cms_item_groups on public.cms_item_groups.id = public.cms_group_items.group_id
join (
  values
    ('evento', 'label', 'Texto menu', 'text', 'Evento reciente', null, 1),
    ('evento', 'url', 'URL menu', 'link', null, '#evento', 2),
    ('redes', 'label', 'Texto menu', 'text', 'Redes sociales', null, 1),
    ('redes', 'url', 'URL menu', 'link', null, '#redes', 2),
    ('patrocinadores', 'label', 'Texto menu', 'text', 'Patrocinadores', null, 1),
    ('patrocinadores', 'url', 'URL menu', 'link', null, '#patrocinadores', 2),
    ('influencers', 'label', 'Texto menu', 'text', 'Influencers', null, 1),
    ('influencers', 'url', 'URL menu', 'link', null, '#influencers', 2),
    ('ventas', 'label', 'Texto menu', 'text', 'Ventas', null, 1),
    ('ventas', 'url', 'URL menu', 'link', null, '#ventas', 2),
    ('merch', 'label', 'Texto menu', 'text', 'Merch', null, 1),
    ('merch', 'url', 'URL menu', 'link', null, '#merch', 2),
    ('mi_cuenta', 'label', 'Texto menu', 'text', 'Mi cuenta', null, 1),
    ('mi_cuenta', 'url', 'URL menu', 'link', null, '/login', 2),
    ('square_ad', 'title', 'Titulo anuncio', 'text', 'Banner cuadrado', null, 1),
    ('square_ad', 'target_url', 'Link anuncio', 'link', null, 'https://example.com', 2),
    ('rect_ad', 'title', 'Titulo anuncio', 'text', 'Banner rectangular', null, 1),
    ('rect_ad', 'target_url', 'Link anuncio', 'link', null, 'https://example.com', 2),
    ('official_sponsor', 'title', 'Titulo sponsor', 'text', 'Sponsor Principal', null, 1),
    ('official_sponsor', 'description', 'Descripcion sponsor', 'textarea', 'Patrocinador oficial destacado al abrir la pagina.', null, 2),
    ('official_sponsor', 'website_label', 'Boton sitio', 'text', 'Ir al sitio', null, 3),
    ('official_sponsor', 'website_url', 'Link sitio', 'link', null, 'https://example.com', 4),
    ('official_sponsor', 'social_label', 'Boton red social', 'text', 'Ver red social', null, 5),
    ('official_sponsor', 'social_url', 'Link red social', 'link', null, 'https://instagram.com', 6),
    ('event_banner', 'title', 'Titulo banner', 'text', 'Banner vertical', null, 1),
    ('event_banner', 'target_url', 'Link banner', 'link', null, 'https://example.com', 2),
    ('facebook_profile', 'platform', 'Plataforma', 'text', 'Facebook', null, 1),
    ('facebook_profile', 'account', 'Cuenta', 'text', 'LODO LAND GDL', null, 2),
    ('facebook_profile', 'handle', 'Handle', 'text', '@lodolandgdl', null, 3),
    ('facebook_profile', 'target_url', 'Link social', 'link', null, 'https://facebook.com/lodolandgdl', 4),
    ('instagram_profile', 'platform', 'Plataforma', 'text', 'Instagram', null, 1),
    ('instagram_profile', 'account', 'Cuenta', 'text', 'LODO LAND GDL', null, 2),
    ('instagram_profile', 'handle', 'Handle', 'text', '@lodolandgdl', null, 3),
    ('instagram_profile', 'target_url', 'Link social', 'link', null, 'https://instagram.com/lodolandgdl', 4),
    ('monster', 'name', 'Nombre sponsor', 'text', 'Monster Energy', null, 1),
    ('monster', 'target_url', 'Link sponsor', 'link', null, 'https://example.com', 2),
    ('fox', 'name', 'Nombre sponsor', 'text', 'Fox Racing', null, 1),
    ('fox', 'target_url', 'Link sponsor', 'link', null, 'https://example.com', 2),
    ('oakley', 'name', 'Nombre sponsor', 'text', 'Oakley', null, 1),
    ('oakley', 'target_url', 'Link sponsor', 'link', null, 'https://example.com', 2),
    ('canam', 'name', 'Nombre sponsor', 'text', 'Can-Am', null, 1),
    ('canam', 'target_url', 'Link sponsor', 'link', null, 'https://example.com', 2),
    ('main_banner', 'title', 'Titulo banner', 'text', 'Banner principal horizontal', null, 1),
    ('main_banner', 'target_url', 'Link banner', 'link', null, 'https://example.com', 2),
    ('collage_1', 'alt_text', 'Alt collage', 'text', 'Foto collage 1', null, 1),
    ('collage_2', 'alt_text', 'Alt collage', 'text', 'Foto collage 2', null, 1),
    ('collage_3', 'alt_text', 'Alt collage', 'text', 'Foto collage 3', null, 1),
    ('ana_torque', 'name', 'Nombre influencer', 'text', 'Ana Torque', null, 1),
    ('ana_torque', 'role', 'Rol influencer', 'text', 'Embajadora de pista', null, 2),
    ('ana_torque', 'description', 'Descripcion influencer', 'textarea', 'Contenido de backstage y activaciones con marcas.', null, 3),
    ('ana_torque', 'instagram_url', 'Instagram', 'link', null, 'https://instagram.com', 4),
    ('rafa_mud', 'name', 'Nombre influencer', 'text', 'Rafa Mud', null, 1),
    ('rafa_mud', 'role', 'Rol influencer', 'text', 'Creator de carreras', null, 2),
    ('rafa_mud', 'description', 'Descripcion influencer', 'textarea', 'Cobertura de recorridos y entrevistas.', null, 3),
    ('rafa_mud', 'youtube_url', 'YouTube', 'link', null, 'https://youtube.com', 4),
    ('jess_nitro', 'name', 'Nombre influencer', 'text', 'Jess Nitro', null, 1),
    ('jess_nitro', 'role', 'Rol influencer', 'text', 'Host de experiencias', null, 2),
    ('jess_nitro', 'description', 'Descripcion influencer', 'textarea', 'Moda, merch y experiencias premium.', null, 3),
    ('jess_nitro', 'instagram_url', 'Instagram', 'link', null, 'https://instagram.com', 4),
    ('tickets', 'title', 'Titulo oferta', 'text', 'Boletos', null, 1),
    ('tickets', 'subtitle', 'Subtitulo oferta', 'text', 'General, VIP y preventa', null, 2),
    ('tickets', 'price', 'Precio oferta', 'text', 'Desde $399 MXN', null, 3),
    ('raffles', 'title', 'Titulo oferta', 'text', 'Rifas', null, 1),
    ('raffles', 'subtitle', 'Subtitulo oferta', 'text', 'Numeros especiales y premios', null, 2),
    ('raffles', 'price', 'Precio oferta', 'text', 'Desde $99 MXN', null, 3),
    ('pools', 'title', 'Titulo oferta', 'text', 'Quinielas', null, 1),
    ('pools', 'subtitle', 'Subtitulo oferta', 'text', 'Entradas y picks', null, 2),
    ('pools', 'price', 'Precio oferta', 'text', 'Desde $149 MXN', null, 3),
    ('promos', 'title', 'Titulo oferta', 'text', 'Promociones', null, 1),
    ('promos', 'subtitle', 'Subtitulo oferta', 'text', 'Combos y drops online', null, 2),
    ('promos', 'price', 'Precio oferta', 'text', 'Edicion limitada', null, 3),
    ('jersey', 'title', 'Titulo merch', 'text', 'Jersey oficial', null, 1),
    ('jersey', 'target_url', 'Link merch', 'link', null, '/login', 2),
    ('cap', 'title', 'Titulo merch', 'text', 'Gorra track', null, 1),
    ('cap', 'target_url', 'Link merch', 'link', null, '/login', 2),
    ('kit', 'title', 'Titulo merch', 'text', 'Kit rider', null, 1),
    ('kit', 'target_url', 'Link merch', 'link', null, '/login', 2),
    ('monster_logo', 'label', 'Texto footer', 'text', 'Monster', null, 1),
    ('fox_logo', 'label', 'Texto footer', 'text', 'Fox', null, 1),
    ('oakley_logo', 'label', 'Texto footer', 'text', 'Oakley', null, 1),
    ('ana_logo', 'label', 'Texto footer', 'text', 'Ana Torque', null, 1)
) as v(item_key, field_key, label, kind, text_value, link_url, sort_order)
  on v.item_key = public.cms_group_items.item_key
where not exists (
  select 1
  from public.cms_group_item_fields
  where public.cms_group_item_fields.item_id = public.cms_group_items.id
    and public.cms_group_item_fields.field_key = v.field_key
    and public.cms_group_item_fields.locale = 'es-MX'
);
