alter table public.raffle_entries
  add column if not exists created_by_user_id uuid references public.profiles (id) on delete set null,
  add column if not exists purchaser_name text,
  add column if not exists purchaser_email text,
  add column if not exists purchaser_phone text;

create table if not exists public.raffle_number_reservations (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid not null references public.raffles (id) on delete cascade,
  reserved_for_user_id uuid references public.profiles (id) on delete set null,
  created_by_user_id uuid references public.profiles (id) on delete set null,
  purchaser_name text,
  purchaser_email text,
  purchaser_phone text,
  number_value integer not null,
  quantity_group uuid not null default gen_random_uuid(),
  selection_mode text not null default 'manual',
  status text not null default 'reserved',
  expires_at timestamptz not null,
  converted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (raffle_id, number_value)
);

create index if not exists raffle_number_reservations_raffle_idx
  on public.raffle_number_reservations (raffle_id, status, expires_at);

create index if not exists raffle_number_reservations_user_idx
  on public.raffle_number_reservations (reserved_for_user_id, status, expires_at);
