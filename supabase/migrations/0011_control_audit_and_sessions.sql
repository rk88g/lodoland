create table if not exists public.collaborator_login_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles (id) on delete set null,
  email text,
  role public.app_role,
  auth_provider text not null default 'password',
  host text,
  request_path text,
  ip_address text,
  city text,
  region text,
  country text,
  device_type text,
  browser_name text,
  os_name text,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_collaborator_login_logs_actor on public.collaborator_login_logs (actor_user_id);
create index if not exists idx_collaborator_login_logs_created_at on public.collaborator_login_logs (created_at desc);

alter table public.collaborator_login_logs enable row level security;

drop policy if exists "collaborator_login_logs_admin_all" on public.collaborator_login_logs;

create policy "collaborator_login_logs_admin_all"
on public.collaborator_login_logs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
