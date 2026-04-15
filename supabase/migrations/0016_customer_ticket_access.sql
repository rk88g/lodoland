create policy "issued_tickets_customer_read_own"
on public.issued_tickets
for select
to authenticated
using (
  owner_user_id = auth.uid()
  or lower(coalesce(purchaser_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
);
