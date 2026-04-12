create type public.promotion_kind as enum (
  'raffle',
  'pool',
  'direct_sale',
  'trip',
  'giveaway',
  'sweepstake',
  'campaign',
  'other'
);

create type public.ticket_instance_status as enum (
  'available',
  'reserved',
  'sold',
  'issued',
  'courtesy',
  'checked_in',
  'cancelled',
  'refunded'
);

create type public.ticket_inventory_reason as enum (
  'initial_load',
  'sale',
  'courtesy',
  'reserve',
  'release',
  'cancel',
  'refund',
  'manual_adjustment',
  'check_in'
);

create type public.inventory_movement_reason as enum (
  'initial_load',
  'sale',
  'return',
  'manual_adjustment',
  'damage',
  'restock',
  'reservation',
  'release'
);

create type public.financial_entry_kind as enum ('income', 'expense', 'adjustment');
create type public.campaign_channel as enum ('intranet_banner', 'inbox', 'email', 'sms', 'whatsapp');

create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  description text,
  parent_id uuid references public.product_categories (id) on delete set null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text unique,
  label text not null,
  size text,
  color text,
  material text,
  weight_grams integer,
  price numeric(12,2),
  compare_at_price numeric(12,2),
  cost numeric(12,2),
  inventory_count integer not null default 0,
  low_stock_threshold integer,
  is_default boolean not null default false,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.product_variant_assets (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  media_asset_id uuid not null references public.media_assets (id) on delete cascade,
  label text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.product_inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  order_item_id uuid references public.order_items (id) on delete set null,
  reason public.inventory_movement_reason not null,
  quantity_delta integer not null,
  note text,
  actor_user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.ticket_lots (
  id uuid primary key default gen_random_uuid(),
  ticket_type_id uuid not null references public.ticket_types (id) on delete cascade,
  label text not null,
  description text,
  inventory_total integer not null default 0,
  courtesy_total integer not null default 0,
  sold_count integer not null default 0,
  reserved_count integer not null default 0,
  courtesy_count integer not null default 0,
  sequence_prefix text,
  sale_starts_at timestamptz,
  sale_ends_at timestamptz,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.issued_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_type_id uuid not null references public.ticket_types (id) on delete restrict,
  ticket_lot_id uuid references public.ticket_lots (id) on delete set null,
  order_id uuid references public.orders (id) on delete set null,
  order_item_id uuid references public.order_items (id) on delete set null,
  owner_user_id uuid references public.profiles (id) on delete set null,
  purchaser_name text,
  purchaser_email text,
  purchaser_phone text,
  ticket_code text not null unique,
  qr_payload text,
  status public.ticket_instance_status not null default 'available',
  courtesy_granted_by uuid references public.profiles (id) on delete set null,
  issued_at timestamptz,
  checked_in_at timestamptz,
  cancelled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.ticket_inventory_movements (
  id uuid primary key default gen_random_uuid(),
  ticket_lot_id uuid not null references public.ticket_lots (id) on delete cascade,
  issued_ticket_id uuid references public.issued_tickets (id) on delete set null,
  order_item_id uuid references public.order_items (id) on delete set null,
  reason public.ticket_inventory_reason not null,
  quantity_delta integer not null,
  note text,
  actor_user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text,
  description text,
  kind public.promotion_kind not null,
  cover_asset_id uuid references public.media_assets (id) on delete set null,
  status public.publish_status not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  sales_start_at timestamptz,
  sales_end_at timestamptz,
  featured_on_home boolean not null default false,
  customer_visible boolean not null default true,
  requires_login boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.promotion_feature_slots (
  id uuid primary key default gen_random_uuid(),
  slot_number integer not null check (slot_number between 1 and 4),
  promotion_id uuid not null references public.promotions (id) on delete cascade,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (slot_number)
);

create table public.promotion_offers (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.promotions (id) on delete cascade,
  label text not null,
  sku text,
  description text,
  price numeric(12,2) not null,
  compare_at_price numeric(12,2),
  currency text not null default 'MXN',
  inventory_total integer,
  inventory_sold integer not null default 0,
  max_per_customer integer,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.promotion_prizes (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.promotions (id) on delete cascade,
  title text not null,
  description text,
  media_asset_id uuid references public.media_assets (id) on delete set null,
  estimated_value numeric(12,2),
  currency text not null default 'MXN',
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.promotion_raffle_configs (
  promotion_id uuid primary key references public.promotions (id) on delete cascade,
  total_numbers integer not null,
  numbers_start integer not null default 1,
  numbers_end integer not null,
  number_digits integer not null default 4,
  allow_manual_pick boolean not null default true,
  draw_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  check (numbers_end >= numbers_start)
);

create table public.promotion_raffle_numbers (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.promotions (id) on delete cascade,
  number_value integer not null,
  order_item_id uuid references public.order_items (id) on delete set null,
  reserved_by_user_id uuid references public.profiles (id) on delete set null,
  sold_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (promotion_id, number_value)
);

create table public.promotion_pool_configs (
  promotion_id uuid primary key references public.promotions (id) on delete cascade,
  rules text,
  closes_at timestamptz,
  resolves_at timestamptz,
  max_entries integer,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.customer_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  body text,
  cover_asset_id uuid references public.media_assets (id) on delete set null,
  channel public.campaign_channel not null default 'intranet_banner',
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.customer_campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.customer_campaigns (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (campaign_id, user_id)
);

create table public.financial_categories (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  kind public.financial_entry_kind not null,
  parent_id uuid references public.financial_categories (id) on delete set null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  is_system boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.financial_entries (
  id uuid primary key default gen_random_uuid(),
  kind public.financial_entry_kind not null,
  category_id uuid references public.financial_categories (id) on delete set null,
  event_id uuid references public.events (id) on delete set null,
  promotion_id uuid references public.promotions (id) on delete set null,
  product_id uuid references public.products (id) on delete set null,
  ticket_lot_id uuid references public.ticket_lots (id) on delete set null,
  order_id uuid references public.orders (id) on delete set null,
  payment_transaction_id uuid references public.payment_transactions (id) on delete set null,
  amount numeric(12,2) not null,
  currency text not null default 'MXN',
  reference_label text,
  note text,
  occurred_at timestamptz not null default timezone('utc', now()),
  actor_user_id uuid references public.profiles (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index idx_product_variants_product_id on public.product_variants (product_id);
create index idx_product_inventory_movements_variant_id on public.product_inventory_movements (variant_id);
create index idx_ticket_lots_ticket_type_id on public.ticket_lots (ticket_type_id);
create index idx_issued_tickets_owner_user_id on public.issued_tickets (owner_user_id);
create index idx_issued_tickets_order_id on public.issued_tickets (order_id);
create index idx_ticket_inventory_movements_lot_id on public.ticket_inventory_movements (ticket_lot_id);
create index idx_promotions_kind_status on public.promotions (kind, status);
create index idx_promotion_offers_promotion_id on public.promotion_offers (promotion_id);
create index idx_promotion_raffle_numbers_promotion_id on public.promotion_raffle_numbers (promotion_id);
create index idx_customer_campaign_recipients_user_id on public.customer_campaign_recipients (user_id);
create index idx_financial_entries_occurred_at on public.financial_entries (occurred_at desc);
create index idx_financial_entries_event_id on public.financial_entries (event_id);
create index idx_financial_entries_promotion_id on public.financial_entries (promotion_id);

create trigger set_product_categories_updated_at
before update on public.product_categories
for each row execute procedure public.set_updated_at();

create trigger set_product_variants_updated_at
before update on public.product_variants
for each row execute procedure public.set_updated_at();

create trigger set_ticket_lots_updated_at
before update on public.ticket_lots
for each row execute procedure public.set_updated_at();

create trigger set_issued_tickets_updated_at
before update on public.issued_tickets
for each row execute procedure public.set_updated_at();

create trigger set_promotions_updated_at
before update on public.promotions
for each row execute procedure public.set_updated_at();

create trigger set_promotion_feature_slots_updated_at
before update on public.promotion_feature_slots
for each row execute procedure public.set_updated_at();

create trigger set_promotion_offers_updated_at
before update on public.promotion_offers
for each row execute procedure public.set_updated_at();

create trigger set_customer_campaigns_updated_at
before update on public.customer_campaigns
for each row execute procedure public.set_updated_at();

create trigger set_financial_categories_updated_at
before update on public.financial_categories
for each row execute procedure public.set_updated_at();

create trigger set_financial_entries_updated_at
before update on public.financial_entries
for each row execute procedure public.set_updated_at();

alter table public.product_categories enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_variant_assets enable row level security;
alter table public.product_inventory_movements enable row level security;
alter table public.ticket_lots enable row level security;
alter table public.issued_tickets enable row level security;
alter table public.ticket_inventory_movements enable row level security;
alter table public.promotions enable row level security;
alter table public.promotion_feature_slots enable row level security;
alter table public.promotion_offers enable row level security;
alter table public.promotion_prizes enable row level security;
alter table public.promotion_raffle_configs enable row level security;
alter table public.promotion_raffle_numbers enable row level security;
alter table public.promotion_pool_configs enable row level security;
alter table public.customer_campaigns enable row level security;
alter table public.customer_campaign_recipients enable row level security;
alter table public.financial_categories enable row level security;
alter table public.financial_entries enable row level security;

create policy "product_categories_admin_all"
on public.product_categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "product_variants_admin_all"
on public.product_variants
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "product_variant_assets_admin_all"
on public.product_variant_assets
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "product_inventory_movements_admin_all"
on public.product_inventory_movements
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "ticket_lots_admin_all"
on public.ticket_lots
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "issued_tickets_admin_all"
on public.issued_tickets
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "ticket_inventory_movements_admin_all"
on public.ticket_inventory_movements
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "promotions_public_read"
on public.promotions
for select
to anon, authenticated
using (status = 'published' and customer_visible = true);

create policy "promotions_admin_all"
on public.promotions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "promotion_feature_slots_public_read"
on public.promotion_feature_slots
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.promotions
    where public.promotions.id = promotion_feature_slots.promotion_id
      and public.promotions.status = 'published'
      and public.promotions.customer_visible = true
  )
);

create policy "promotion_feature_slots_admin_all"
on public.promotion_feature_slots
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "promotion_offers_public_read"
on public.promotion_offers
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.promotions
    where public.promotions.id = promotion_offers.promotion_id
      and public.promotions.status = 'published'
      and public.promotions.customer_visible = true
  )
);

create policy "promotion_offers_admin_all"
on public.promotion_offers
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "promotion_prizes_admin_all"
on public.promotion_prizes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "promotion_raffle_configs_admin_all"
on public.promotion_raffle_configs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "promotion_raffle_numbers_admin_all"
on public.promotion_raffle_numbers
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "promotion_pool_configs_admin_all"
on public.promotion_pool_configs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "customer_campaigns_admin_all"
on public.customer_campaigns
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "customer_campaign_recipients_admin_all"
on public.customer_campaign_recipients
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "financial_categories_admin_all"
on public.financial_categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "financial_entries_admin_all"
on public.financial_entries
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
