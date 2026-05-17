create table if not exists public.raffle27_settings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique default 'listado27mayo2026',
  title text not null default 'Rifa 27 Mayo 2026',
  whatsapp_number text not null default '+523315457641',
  ticket_price numeric not null default 350,
  transfer_instructions text not null default 'Solicita por WhatsApp la cuenta bancaria para completar tu transferencia y envia tu comprobante.',
  countdown_ends_at timestamptz not null default '2026-05-27T12:00:00-06:00'::timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.raffle27_settings (slug)
values ('listado27mayo2026')
on conflict (slug) do nothing;

create table if not exists public.raffle27_numbers (
  number_value integer primary key,
  status text not null default 'available' check (status in ('available', 'held', 'sold', 'cancelled')),
  held_by_device_id text,
  held_at timestamptz,
  hold_expires_at timestamptz,
  sold_to_device_id text,
  sold_to_name text,
  sold_to_phone text,
  sold_amount numeric,
  sold_at timestamptz,
  payment_date timestamptz,
  created_by_user_id uuid references public.profiles (id) on delete set null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.raffle27_numbers (number_value)
select series_number
from generate_series(1, 1500) as series_number
on conflict (number_value) do nothing;

create table if not exists public.raffle27_visitors (
  device_id text primary key,
  lucky_number integer references public.raffle27_numbers (number_value) on delete set null,
  locked_until timestamptz not null,
  last_shifted_from integer,
  last_seen_at timestamptz not null default timezone('utc', now()),
  visit_count integer not null default 0,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.raffle27_logs (
  id uuid primary key default gen_random_uuid(),
  device_id text,
  lucky_number integer,
  action text not null,
  message text,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists raffle27_numbers_status_idx
  on public.raffle27_numbers (status, hold_expires_at, sold_at);

create index if not exists raffle27_numbers_held_device_idx
  on public.raffle27_numbers (held_by_device_id, hold_expires_at);

create index if not exists raffle27_logs_created_idx
  on public.raffle27_logs (created_at desc);

alter table public.raffle27_settings enable row level security;
alter table public.raffle27_numbers enable row level security;
alter table public.raffle27_visitors enable row level security;
alter table public.raffle27_logs enable row level security;

drop policy if exists raffle27_settings_public_read on public.raffle27_settings;
create policy raffle27_settings_public_read
  on public.raffle27_settings
  for select
  using (true);

drop policy if exists raffle27_settings_admin_manage on public.raffle27_settings;
create policy raffle27_settings_admin_manage
  on public.raffle27_settings
  for all
  using (coalesce(public.current_app_role() in ('admin', 'super_admin'), false))
  with check (coalesce(public.current_app_role() in ('admin', 'super_admin'), false));

drop policy if exists raffle27_numbers_public_read on public.raffle27_numbers;
create policy raffle27_numbers_public_read
  on public.raffle27_numbers
  for select
  using (true);

drop policy if exists raffle27_numbers_public_write on public.raffle27_numbers;
create policy raffle27_numbers_public_write
  on public.raffle27_numbers
  for insert
  with check (true);

drop policy if exists raffle27_numbers_public_update on public.raffle27_numbers;
create policy raffle27_numbers_public_update
  on public.raffle27_numbers
  for update
  using (true)
  with check (true);

drop policy if exists raffle27_visitors_public_read on public.raffle27_visitors;
create policy raffle27_visitors_public_read
  on public.raffle27_visitors
  for select
  using (true);

drop policy if exists raffle27_visitors_public_write on public.raffle27_visitors;
create policy raffle27_visitors_public_write
  on public.raffle27_visitors
  for insert
  with check (true);

drop policy if exists raffle27_visitors_public_update on public.raffle27_visitors;
create policy raffle27_visitors_public_update
  on public.raffle27_visitors
  for update
  using (true)
  with check (true);

drop policy if exists raffle27_logs_public_read on public.raffle27_logs;
create policy raffle27_logs_public_read
  on public.raffle27_logs
  for select
  using (true);

drop policy if exists raffle27_logs_public_insert on public.raffle27_logs;
create policy raffle27_logs_public_insert
  on public.raffle27_logs
  for insert
  with check (true);
