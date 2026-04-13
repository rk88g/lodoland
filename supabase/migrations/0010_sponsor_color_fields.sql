insert into public.cms_group_item_fields (item_id, field_key, label, kind, text_value, sort_order)
select public.cms_group_items.id, v.field_key, v.label, 'text'::public.field_kind, v.text_value, v.sort_order
from public.cms_group_items
join public.cms_item_groups on public.cms_item_groups.id = public.cms_group_items.group_id
join (
  values
    ('monster', 'background_color', 'Color base', '#1f2937', 10),
    ('monster', 'accent_color', 'Color acento', '#f59e0b', 11),
    ('fox', 'background_color', 'Color base', '#111827', 10),
    ('fox', 'accent_color', 'Color acento', '#fb7185', 11),
    ('oakley', 'background_color', 'Color base', '#0f172a', 10),
    ('oakley', 'accent_color', 'Color acento', '#60a5fa', 11),
    ('canam', 'background_color', 'Color base', '#111827', 10),
    ('canam', 'accent_color', 'Color acento', '#22c55e', 11)
) as v(item_key, field_key, label, text_value, sort_order)
  on v.item_key = public.cms_group_items.item_key
where public.cms_item_groups.group_key = 'sponsor_tiles'
  and not exists (
    select 1
    from public.cms_group_item_fields
    where public.cms_group_item_fields.item_id = public.cms_group_items.id
      and public.cms_group_item_fields.field_key = v.field_key
      and public.cms_group_item_fields.locale = 'es-MX'
  );
