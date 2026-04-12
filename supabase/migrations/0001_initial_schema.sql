create extension if not exists "pgcrypto";

create type public.app_role as enum ('customer', 'admin', 'super_admin');
create type public.publish_status as enum ('draft', 'published', 'archived');
create type public.order_status as enum ('draft', 'pending_payment', 'paid', 'failed', 'cancelled', 'refunded');
create type public.payment_status as enum ('pending', 'authorized', 'paid', 'failed', 'refunded');
create type public.sellable_type as enum ('ticket', 'raffle_entry', 'pool_entry', 'product', 'promotion');
create type public.field_kind as enum ('text', 'textarea', 'richtext', 'image', 'link', 'color', 'number', 'boolean', 'json');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  role public.app_role not null default 'customer',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles (id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  summary text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  path text not null,
  alt_text text,
  title text,
  mime_type text,
  width integer,
  height integer,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  status public.publish_status not null default 'draft',
  seo_title text,
  seo_description text,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.cms_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.cms_pages (id) on delete cascade,
  section_key text not null,
  label text not null,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (page_id, section_key)
);

create table public.cms_section_fields (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.cms_sections (id) on delete cascade,
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
  unique (section_id, field_key, locale)
);

create table public.navigation_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  target text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  page_id uuid references public.cms_pages (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  label text not null,
  kind public.field_kind not null,
  locale text not null default 'es-MX',
  text_value text,
  json_value jsonb,
  boolean_value boolean,
  number_value numeric(12,2),
  media_asset_id uuid references public.media_assets (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text,
  description text,
  cover_asset_id uuid references public.media_assets (id) on delete set null,
  venue_name text,
  venue_address text,
  city text,
  starts_at timestamptz,
  ends_at timestamptz,
  sales_start_at timestamptz,
  sales_end_at timestamptz,
  capacity integer,
  status public.publish_status not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  description text,
  sku text,
  price numeric(12,2) not null,
  currency text not null default 'MXN',
  quantity_total integer,
  quantity_sold integer not null default 0,
  sale_starts_at timestamptz,
  sale_ends_at timestamptz,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.raffles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  cover_asset_id uuid references public.media_assets (id) on delete set null,
  prize_description text,
  entry_price numeric(12,2) not null,
  currency text not null default 'MXN',
  max_entries integer,
  entries_sold integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  draw_at timestamptz,
  status public.publish_status not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.raffle_entries (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid not null references public.raffles (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  order_item_id uuid,
  quantity integer not null default 1,
  unit_price numeric(12,2) not null,
  status payment_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now())
);

create table public.pools (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  cover_asset_id uuid references public.media_assets (id) on delete set null,
  rules text,
  entry_price numeric(12,2) not null,
  currency text not null default 'MXN',
  starts_at timestamptz,
  closes_at timestamptz,
  resolves_at timestamptz,
  status public.publish_status not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.pool_entries (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  order_item_id uuid,
  picks jsonb not null default '{}'::jsonb,
  unit_price numeric(12,2) not null,
  status payment_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now())
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  cover_asset_id uuid references public.media_assets (id) on delete set null,
  kind text not null default 'promotion',
  price numeric(12,2) not null,
  compare_at_price numeric(12,2),
  currency text not null default 'MXN',
  inventory_count integer,
  status public.publish_status not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete restrict,
  status public.order_status not null default 'draft',
  currency text not null default 'MXN',
  subtotal numeric(12,2) not null default 0,
  discount_total numeric(12,2) not null default 0,
  tax_total numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  customer_name text,
  customer_email text,
  customer_phone text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  item_type public.sellable_type not null,
  reference_id uuid not null,
  title_snapshot text not null,
  unit_price numeric(12,2) not null,
  quantity integer not null default 1,
  line_total numeric(12,2) not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider text not null,
  provider_reference text,
  amount numeric(12,2) not null,
  currency text not null default 'MXN',
  status public.payment_status not null default 'pending',
  raw_payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.raffle_entries
  add constraint raffle_entries_order_item_id_fkey
  foreign key (order_item_id) references public.order_items (id) on delete set null;

alter table public.pool_entries
  add constraint pool_entries_order_item_id_fkey
  foreign key (order_item_id) references public.order_items (id) on delete set null;

create index idx_cms_sections_page_id on public.cms_sections (page_id);
create index idx_cms_fields_section_id on public.cms_section_fields (section_id);
create index idx_events_status on public.events (status);
create index idx_raffles_status on public.raffles (status);
create index idx_pools_status on public.pools (status);
create index idx_products_status on public.products (status);
create index idx_orders_user_id on public.orders (user_id);
create index idx_order_items_order_id on public.order_items (order_id);
create index idx_payment_transactions_order_id on public.payment_transactions (order_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;

  return new;
end;
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create trigger set_cms_pages_updated_at
before update on public.cms_pages
for each row execute procedure public.set_updated_at();

create trigger set_cms_sections_updated_at
before update on public.cms_sections
for each row execute procedure public.set_updated_at();

create trigger set_cms_section_fields_updated_at
before update on public.cms_section_fields
for each row execute procedure public.set_updated_at();

create trigger set_navigation_links_updated_at
before update on public.navigation_links
for each row execute procedure public.set_updated_at();

create trigger set_site_settings_updated_at
before update on public.site_settings
for each row execute procedure public.set_updated_at();

create trigger set_events_updated_at
before update on public.events
for each row execute procedure public.set_updated_at();

create trigger set_ticket_types_updated_at
before update on public.ticket_types
for each row execute procedure public.set_updated_at();

create trigger set_raffles_updated_at
before update on public.raffles
for each row execute procedure public.set_updated_at();

create trigger set_pools_updated_at
before update on public.pools
for each row execute procedure public.set_updated_at();

create trigger set_products_updated_at
before update on public.products
for each row execute procedure public.set_updated_at();

create trigger set_orders_updated_at
before update on public.orders
for each row execute procedure public.set_updated_at();

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.raffle_entries enable row level security;
alter table public.pool_entries enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "orders_select_own"
on public.orders
for select
to authenticated
using (auth.uid() = user_id);

create policy "orders_insert_own"
on public.orders
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "raffle_entries_select_own"
on public.raffle_entries
for select
to authenticated
using (auth.uid() = user_id);

create policy "pool_entries_select_own"
on public.pool_entries
for select
to authenticated
using (auth.uid() = user_id);

insert into public.cms_pages (slug, title, description, status, seo_title, seo_description)
values
  ('home', 'Inicio', 'Landing principal de LODO LAND', 'published', 'LODO LAND', 'Eventos, rifas, quinielas y promociones'),
  ('login', 'Login', 'Pantalla de acceso', 'published', 'Iniciar sesion', 'Accede a tu cuenta'),
  ('profile', 'Perfil', 'Perfil del usuario', 'published', 'Mi perfil', 'Compra y consulta tus accesos'),
  ('admin', 'Admin', 'Panel administrativo', 'draft', 'Panel administrador', 'Administra contenido y ventas');

insert into public.site_settings (setting_key, label, kind, text_value)
values
  ('brand_name', 'Nombre de marca', 'text', 'LODO LAND'),
  ('support_email', 'Correo de soporte', 'text', 'hola@lodoland.mx'),
  ('whatsapp_url', 'WhatsApp', 'link', 'https://wa.me/'),
  ('instagram_url', 'Instagram', 'link', 'https://instagram.com/');
