alter table public.raffles
  add column if not exists total_numbers integer,
  add column if not exists numbers_start integer not null default 1,
  add column if not exists numbers_end integer,
  add column if not exists number_digits integer not null default 4,
  add column if not exists allow_manual_pick boolean not null default true,
  add column if not exists price_mode text not null default 'fixed_price';

create table if not exists public.raffle_prizes (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid not null references public.raffles (id) on delete cascade,
  title text not null,
  description text,
  media_asset_id uuid references public.media_assets (id) on delete set null,
  estimated_value numeric(12,2),
  currency text not null default 'MXN',
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.raffle_entry_numbers (
  id uuid primary key default gen_random_uuid(),
  raffle_entry_id uuid not null references public.raffle_entries (id) on delete cascade,
  raffle_id uuid not null references public.raffles (id) on delete cascade,
  number_value integer not null,
  assigned_mode text not null default 'manual',
  created_at timestamptz not null default timezone('utc', now()),
  unique (raffle_id, number_value)
);

create index if not exists raffle_prizes_raffle_idx
  on public.raffle_prizes (raffle_id, sort_order);

create index if not exists raffle_entry_numbers_raffle_idx
  on public.raffle_entry_numbers (raffle_id, number_value);

create index if not exists raffle_entry_numbers_entry_idx
  on public.raffle_entry_numbers (raffle_entry_id);
