alter table if exists public.raffle_number_reservations enable row level security;

drop policy if exists "raffle_number_reservations_operator_all" on public.raffle_number_reservations;
create policy "raffle_number_reservations_operator_all"
on public.raffle_number_reservations
for all
to authenticated
using (public.is_operator())
with check (public.is_operator());

drop policy if exists "raffle_number_reservations_authenticated_select" on public.raffle_number_reservations;
create policy "raffle_number_reservations_authenticated_select"
on public.raffle_number_reservations
for select
to authenticated
using (true);

drop policy if exists "raffle_number_reservations_customer_insert_own" on public.raffle_number_reservations;
create policy "raffle_number_reservations_customer_insert_own"
on public.raffle_number_reservations
for insert
to authenticated
with check (
  reserved_for_user_id = auth.uid()
  and coalesce(created_by_user_id, auth.uid()) = auth.uid()
);

drop policy if exists "raffle_number_reservations_customer_update_own" on public.raffle_number_reservations;
create policy "raffle_number_reservations_customer_update_own"
on public.raffle_number_reservations
for update
to authenticated
using (reserved_for_user_id = auth.uid())
with check (reserved_for_user_id = auth.uid());

drop policy if exists "raffle_number_reservations_customer_delete_expired" on public.raffle_number_reservations;
create policy "raffle_number_reservations_customer_delete_expired"
on public.raffle_number_reservations
for delete
to authenticated
using (
  status = 'reserved'
  and expires_at < timezone('utc', now())
);
