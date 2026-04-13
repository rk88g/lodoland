create table if not exists public.avatar_presets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  description text,
  media_asset_id uuid references public.media_assets (id) on delete set null,
  background_color text,
  accent_color text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles
  add column if not exists avatar_preset_id uuid references public.avatar_presets (id) on delete set null;

create trigger set_avatar_presets_updated_at
before update on public.avatar_presets
for each row execute procedure public.set_updated_at();

alter table public.avatar_presets enable row level security;

create policy "avatar_presets_public_read"
on public.avatar_presets
for select
to anon, authenticated
using (is_active = true);

create policy "avatar_presets_admin_all"
on public.avatar_presets
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.avatar_presets (slug, label, description, background_color, accent_color, sort_order)
values
  ('mud-core', 'Mud Core', 'Avatar base para intranet.', '#1f2937', '#7dd3fc', 1),
  ('dust-line', 'Dust Line', 'Avatar neutro para acceso general.', '#111827', '#f59e0b', 2),
  ('night-track', 'Night Track', 'Avatar oscuro para perfiles activos.', '#0f172a', '#22c55e', 3),
  ('storm-grid', 'Storm Grid', 'Avatar frio con alto contraste.', '#172554', '#38bdf8', 4),
  ('sun-flare', 'Sun Flare', 'Avatar claro para perfil visible.', '#f8fafc', '#fb7185', 5),
  ('sand-code', 'Sand Code', 'Avatar claro con tono arena.', '#f3f4f6', '#d97706', 6)
on conflict (slug) do nothing;
