alter table public.media_assets
  add column if not exists is_public boolean not null default false;

alter table public.site_settings
  add column if not exists is_public boolean not null default false;

update public.site_settings
set is_public = true
where setting_key in ('brand_name', 'support_email', 'whatsapp_url', 'instagram_url');

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() in ('admin', 'super_admin'), false)
$$;

alter table public.admin_audit_logs enable row level security;
alter table public.media_assets enable row level security;
alter table public.cms_pages enable row level security;
alter table public.cms_sections enable row level security;
alter table public.cms_section_fields enable row level security;
alter table public.navigation_links enable row level security;
alter table public.site_settings enable row level security;
alter table public.events enable row level security;
alter table public.ticket_types enable row level security;
alter table public.raffles enable row level security;
alter table public.pools enable row level security;
alter table public.products enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_transactions enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "orders_select_own" on public.orders;
drop policy if exists "orders_insert_own" on public.orders;
drop policy if exists "raffle_entries_select_own" on public.raffle_entries;
drop policy if exists "pool_entries_select_own" on public.pool_entries;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_admin_all"
on public.profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin_audit_logs_admin_all"
on public.admin_audit_logs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "media_assets_public_read"
on public.media_assets
for select
to anon, authenticated
using (is_public = true);

create policy "media_assets_admin_all"
on public.media_assets
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "cms_pages_public_read"
on public.cms_pages
for select
to anon, authenticated
using (status = 'published');

create policy "cms_pages_admin_all"
on public.cms_pages
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "cms_sections_public_read"
on public.cms_sections
for select
to anon, authenticated
using (
  is_visible = true
  and exists (
    select 1
    from public.cms_pages
    where cms_pages.id = cms_sections.page_id
      and cms_pages.status = 'published'
  )
);

create policy "cms_sections_admin_all"
on public.cms_sections
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "cms_section_fields_public_read"
on public.cms_section_fields
for select
to anon, authenticated
using (
  is_visible = true
  and exists (
    select 1
    from public.cms_sections
    join public.cms_pages on public.cms_pages.id = public.cms_sections.page_id
    where public.cms_sections.id = cms_section_fields.section_id
      and public.cms_sections.is_visible = true
      and public.cms_pages.status = 'published'
  )
);

create policy "cms_section_fields_admin_all"
on public.cms_section_fields
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "navigation_links_public_read"
on public.navigation_links
for select
to anon, authenticated
using (
  is_visible = true
  and (
    page_id is null
    or exists (
      select 1
      from public.cms_pages
      where public.cms_pages.id = navigation_links.page_id
        and public.cms_pages.status = 'published'
    )
  )
);

create policy "navigation_links_admin_all"
on public.navigation_links
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "site_settings_public_read"
on public.site_settings
for select
to anon, authenticated
using (is_public = true);

create policy "site_settings_admin_all"
on public.site_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "events_public_read"
on public.events
for select
to anon, authenticated
using (status = 'published');

create policy "events_admin_all"
on public.events
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "ticket_types_public_read"
on public.ticket_types
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.events
    where public.events.id = ticket_types.event_id
      and public.events.status = 'published'
  )
);

create policy "ticket_types_admin_all"
on public.ticket_types
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "raffles_public_read"
on public.raffles
for select
to anon, authenticated
using (status = 'published');

create policy "raffles_admin_all"
on public.raffles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "raffle_entries_select_own"
on public.raffle_entries
for select
to authenticated
using (auth.uid() = user_id);

create policy "raffle_entries_admin_all"
on public.raffle_entries
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "pools_public_read"
on public.pools
for select
to anon, authenticated
using (status = 'published');

create policy "pools_admin_all"
on public.pools
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "pool_entries_select_own"
on public.pool_entries
for select
to authenticated
using (auth.uid() = user_id);

create policy "pool_entries_admin_all"
on public.pool_entries
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "products_public_read"
on public.products
for select
to anon, authenticated
using (status = 'published');

create policy "products_admin_all"
on public.products
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "orders_select_own"
on public.orders
for select
to authenticated
using (auth.uid() = user_id);

create policy "orders_admin_all"
on public.orders
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "order_items_select_own"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where public.orders.id = order_items.order_id
      and public.orders.user_id = auth.uid()
  )
);

create policy "order_items_admin_all"
on public.order_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "payment_transactions_select_own"
on public.payment_transactions
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where public.orders.id = payment_transactions.order_id
      and public.orders.user_id = auth.uid()
  )
);

create policy "payment_transactions_admin_all"
on public.payment_transactions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
