create or replace function public.increment_lodonauta_visit()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
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

  update public.site_settings
  set
    number_value = coalesce(number_value, 0) + 1,
    updated_at = timezone('utc', now())
  where setting_key = 'lodonauta_visit_count'
  returning number_value::bigint into next_count;

  return coalesce(next_count, 1);
end;
$$;

grant execute on function public.increment_lodonauta_visit() to anon, authenticated;
