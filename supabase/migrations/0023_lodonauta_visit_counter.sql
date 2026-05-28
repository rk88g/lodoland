drop function if exists public.increment_lodonauta_visit();

create table if not exists public.lodonauta_daily_visits (
  id uuid primary key default gen_random_uuid(),
  visit_date date not null default ((now() at time zone 'America/Mexico_City')::date),
  device_id uuid not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (visit_date, device_id)
);

alter table public.lodonauta_daily_visits enable row level security;

drop policy if exists "lodonauta_daily_visits_admin_all" on public.lodonauta_daily_visits;

create policy "lodonauta_daily_visits_admin_all"
on public.lodonauta_daily_visits
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.increment_lodonauta_visit(visitor_device_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer;
  next_count bigint;
begin
  insert into public.site_settings (
    setting_key,
    label,
    kind,
    number_value,
    is_public
  )
  values (
    'lodonauta_visit_count',
    'Contador de visitas LODONAUTAS',
    'number',
    0,
    true
  )
  on conflict (setting_key) do nothing;

  insert into public.lodonauta_daily_visits (device_id)
  values (visitor_device_id)
  on conflict (visit_date, device_id) do nothing;

  get diagnostics inserted_count = row_count;

  if inserted_count > 0 then
    update public.site_settings
    set
      number_value = coalesce(number_value, 0) + 1,
      updated_at = timezone('utc', now())
    where setting_key = 'lodonauta_visit_count'
    returning number_value::bigint into next_count;
  else
    select coalesce(number_value, 0)::bigint
    into next_count
    from public.site_settings
    where setting_key = 'lodonauta_visit_count';
  end if;

  return coalesce(next_count, 0);
end;
$$;

grant execute on function public.increment_lodonauta_visit(uuid) to anon, authenticated;
