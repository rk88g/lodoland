alter type public.app_role add value if not exists 'staff';

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() = 'staff', false)
$$;

create or replace function public.is_operator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() in ('staff', 'admin', 'super_admin'), false)
$$;

drop policy if exists "profiles_operator_select" on public.profiles;
create policy "profiles_operator_select"
on public.profiles
for select
to authenticated
using (public.is_operator());

drop policy if exists "admin_audit_logs_operator_all" on public.admin_audit_logs;
create policy "admin_audit_logs_operator_all"
on public.admin_audit_logs
for all
to authenticated
using (public.is_operator())
with check (public.is_operator());

drop policy if exists "events_operator_all" on public.events;
create policy "events_operator_all"
on public.events
for all
to authenticated
using (public.is_operator())
with check (public.is_operator());

drop policy if exists "ticket_types_operator_all" on public.ticket_types;
create policy "ticket_types_operator_all"
on public.ticket_types
for all
to authenticated
using (public.is_operator())
with check (public.is_operator());

drop policy if exists "ticket_lots_operator_all" on public.ticket_lots;
create policy "ticket_lots_operator_all"
on public.ticket_lots
for all
to authenticated
using (public.is_operator())
with check (public.is_operator());

drop policy if exists "issued_tickets_operator_all" on public.issued_tickets;
create policy "issued_tickets_operator_all"
on public.issued_tickets
for all
to authenticated
using (public.is_operator())
with check (public.is_operator());

drop policy if exists "ticket_inventory_movements_operator_all" on public.ticket_inventory_movements;
create policy "ticket_inventory_movements_operator_all"
on public.ticket_inventory_movements
for all
to authenticated
using (public.is_operator())
with check (public.is_operator());

drop policy if exists "orders_operator_all" on public.orders;
create policy "orders_operator_all"
on public.orders
for all
to authenticated
using (public.is_operator())
with check (public.is_operator());

drop policy if exists "order_items_operator_all" on public.order_items;
create policy "order_items_operator_all"
on public.order_items
for all
to authenticated
using (public.is_operator())
with check (public.is_operator());

drop policy if exists "payment_transactions_operator_all" on public.payment_transactions;
create policy "payment_transactions_operator_all"
on public.payment_transactions
for all
to authenticated
using (public.is_operator())
with check (public.is_operator());

drop policy if exists "raffles_operator_all" on public.raffles;
create policy "raffles_operator_all"
on public.raffles
for all
to authenticated
using (public.is_operator())
with check (public.is_operator());

drop policy if exists "raffle_entries_operator_all" on public.raffle_entries;
create policy "raffle_entries_operator_all"
on public.raffle_entries
for all
to authenticated
using (public.is_operator())
with check (public.is_operator());

alter table if exists public.raffle_prizes enable row level security;
drop policy if exists "raffle_prizes_operator_all" on public.raffle_prizes;
create policy "raffle_prizes_operator_all"
on public.raffle_prizes
for all
to authenticated
using (public.is_operator())
with check (public.is_operator());

alter table if exists public.raffle_entry_numbers enable row level security;
drop policy if exists "raffle_entry_numbers_operator_all" on public.raffle_entry_numbers;
create policy "raffle_entry_numbers_operator_all"
on public.raffle_entry_numbers
for all
to authenticated
using (public.is_operator())
with check (public.is_operator());

drop policy if exists "issued_tickets_customer_read_own" on public.issued_tickets;
create policy "issued_tickets_customer_read_own"
on public.issued_tickets
for select
to authenticated
using (
  owner_user_id = auth.uid()
  or lower(coalesce(purchaser_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
);
