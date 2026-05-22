drop policy if exists "ticket_lots_public_read" on public.ticket_lots;
create policy "ticket_lots_public_read"
on public.ticket_lots
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.ticket_types
    join public.events on public.events.id = public.ticket_types.event_id
    where public.ticket_types.id = ticket_lots.ticket_type_id
      and public.ticket_types.is_active = true
      and public.events.status = 'published'::public.publish_status
  )
);

create or replace function public.purchase_customer_ticket_from_lot(
  p_ticket_type_id uuid,
  p_ticket_lot_id uuid,
  p_quantity integer,
  p_site_url text
)
returns table (
  issued_ticket_id uuid,
  ticket_code text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_user_email text := auth.jwt() ->> 'email';
  v_profile public.profiles%rowtype;
  v_ticket_type public.ticket_types%rowtype;
  v_lot public.ticket_lots%rowtype;
  v_event public.events%rowtype;
  v_lot_available integer;
  v_type_available integer;
  v_quantity integer := greatest(1, least(coalesce(p_quantity, 1), 6));
  v_subtotal numeric;
  v_order_id uuid := gen_random_uuid();
  v_order_item_id uuid := gen_random_uuid();
  v_ticket_id uuid;
  v_hash text;
  v_code text;
  v_index integer;
  v_customer_name text;
  v_site_url text := regexp_replace(coalesce(nullif(p_site_url, ''), 'https://lodoland.mx'), '/+$', '');
begin
  if v_user_id is null then
    raise exception 'Debes iniciar sesion para comprar tickets.';
  end if;

  select *
  into v_profile
  from public.profiles
  where id = v_user_id;

  select *
  into v_ticket_type
  from public.ticket_types
  where id = p_ticket_type_id
  for update;

  if not found or coalesce(v_ticket_type.is_active, false) is false then
    raise exception 'Ese tipo de ticket no esta disponible.';
  end if;

  select *
  into v_event
  from public.events
  where id = v_ticket_type.event_id;

  if not found or v_event.status <> 'published'::public.publish_status then
    raise exception 'El evento no esta disponible para venta de tickets.';
  end if;

  if p_ticket_lot_id is not null then
    select *
    into v_lot
    from public.ticket_lots
    where id = p_ticket_lot_id
      and ticket_type_id = p_ticket_type_id
    for update;
  else
    select *
    into v_lot
    from public.ticket_lots
    where ticket_type_id = p_ticket_type_id
      and coalesce(is_active, false) is true
      and greatest(coalesce(inventory_total, 0) - coalesce(sold_count, 0) - coalesce(reserved_count, 0), 0) >= v_quantity
    order by sale_starts_at nulls first, created_at asc
    limit 1
    for update;
  end if;

  if not found or coalesce(v_lot.is_active, false) is false then
    raise exception 'Ese drop no esta disponible.';
  end if;

  v_lot_available := greatest(coalesce(v_lot.inventory_total, 0) - coalesce(v_lot.sold_count, 0) - coalesce(v_lot.reserved_count, 0), 0);
  if v_lot_available < v_quantity then
    raise exception 'El drop no tiene stock suficiente.';
  end if;

  if v_ticket_type.quantity_total is not null then
    v_type_available := greatest(coalesce(v_ticket_type.quantity_total, 0) - coalesce(v_ticket_type.quantity_sold, 0), 0);
    if v_type_available < v_quantity then
      raise exception 'Ese tipo de ticket ya no tiene capacidad suficiente.';
    end if;
  end if;

  v_subtotal := coalesce(v_ticket_type.price, 0) * v_quantity;
  v_customer_name := nullif(trim(concat_ws(' ', v_profile.first_name, v_profile.last_name)), '');

  insert into public.orders (
    id,
    user_id,
    status,
    currency,
    subtotal,
    total,
    customer_name,
    customer_email,
    customer_phone,
    notes,
    metadata
  )
  values (
    v_order_id,
    v_user_id,
    'pending_payment',
    v_ticket_type.currency,
    v_subtotal,
    v_subtotal,
    v_customer_name,
    coalesce(v_user_email, v_profile.email),
    v_profile.phone,
    'Compra directa desde intranet de cliente',
    jsonb_build_object(
      'saleOrigin', 'customer_intranet',
      'ticketTypeId', p_ticket_type_id,
      'ticketLotId', v_lot.id,
      'quantity', v_quantity
    )
  );

  insert into public.order_items (
    id,
    order_id,
    item_type,
    reference_id,
    title_snapshot,
    unit_price,
    quantity,
    line_total,
    metadata
  )
  values (
    v_order_item_id,
    v_order_id,
    'ticket',
    p_ticket_type_id,
    v_ticket_type.name,
    v_ticket_type.price,
    v_quantity,
    v_subtotal,
    jsonb_build_object('ticketLotId', v_lot.id)
  );

  insert into public.payment_transactions (
    order_id,
    provider,
    provider_reference,
    amount,
    currency,
    status,
    raw_payload,
    processed_at
  )
  values (
    v_order_id,
    'customer_intranet',
    concat('CLIENT-', extract(epoch from clock_timestamp())::bigint),
    v_subtotal,
    v_ticket_type.currency,
    'pending',
    jsonb_build_object(
      'ticketTypeId', p_ticket_type_id,
      'ticketLotId', v_lot.id,
      'quantity', v_quantity
    ),
    null
  );

  for v_index in 1..v_quantity loop
    v_ticket_id := gen_random_uuid();
    v_code := concat(
      coalesce(nullif(v_lot.sequence_prefix, ''), 'LLT'),
      '-',
      right((extract(epoch from clock_timestamp())::bigint)::text, 8),
      '-',
      lpad(v_index::text, 2, '0'),
      '-',
      upper(left(replace(v_ticket_id::text, '-', ''), 8))
    );
    v_hash := encode(digest(concat(v_ticket_id::text, ':', v_code, ':', v_ticket_type.event_id::text, ':', v_lot.id::text), 'sha256'), 'hex');

    insert into public.issued_tickets (
      id,
      ticket_type_id,
      ticket_lot_id,
      order_id,
      order_item_id,
      owner_user_id,
      purchaser_name,
      purchaser_email,
      purchaser_phone,
      ticket_code,
      qr_payload,
      status,
      issued_at,
      metadata
    )
    values (
      v_ticket_id,
      p_ticket_type_id,
      v_lot.id,
      v_order_id,
      v_order_item_id,
      v_user_id,
      v_customer_name,
      coalesce(v_user_email, v_profile.email),
      v_profile.phone,
      v_code,
      concat(v_site_url, '/staff/tickets/', v_ticket_id::text, '?token=', v_hash),
      'reserved',
      null,
      jsonb_build_object(
        'hash', v_hash,
        'saleOrigin', 'customer_intranet'
      )
    );

    issued_ticket_id := v_ticket_id;
    ticket_code := v_code;
    return next;
  end loop;

  update public.ticket_lots
  set reserved_count = coalesce(reserved_count, 0) + v_quantity
  where id = v_lot.id;

  insert into public.ticket_inventory_movements (
    ticket_lot_id,
    order_item_id,
    reason,
    quantity_delta,
    note,
    actor_user_id
  )
  values (
    v_lot.id,
    v_order_item_id,
    'sale',
    -v_quantity,
    'Apartado pendiente de pago desde intranet de cliente',
    v_user_id
  );
end;
$$;

grant execute on function public.purchase_customer_ticket_from_lot(uuid, uuid, integer, text) to authenticated;
