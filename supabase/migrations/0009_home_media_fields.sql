insert into public.cms_group_item_fields (item_id, field_key, label, kind, sort_order)
select public.cms_group_items.id, v.field_key, v.label, v.kind::public.field_kind, v.sort_order
from public.cms_group_items
join public.cms_item_groups on public.cms_item_groups.id = public.cms_group_items.group_id
join (
  values
    ('square_ad', 'media', 'Imagen anuncio', 'image', 3),
    ('rect_ad', 'media', 'Imagen anuncio', 'image', 3),
    ('official_sponsor', 'media', 'Imagen sponsor', 'image', 7),
    ('event_banner', 'media', 'Imagen banner', 'image', 3),
    ('facebook_profile', 'embed_url', 'URL embed', 'link', 5),
    ('facebook_profile', 'preview_media', 'Imagen preview', 'image', 6),
    ('instagram_profile', 'embed_url', 'URL embed', 'link', 5),
    ('instagram_profile', 'preview_media', 'Imagen preview', 'image', 6),
    ('monster', 'logo_media', 'Logo sponsor', 'image', 3),
    ('fox', 'logo_media', 'Logo sponsor', 'image', 3),
    ('oakley', 'logo_media', 'Logo sponsor', 'image', 3),
    ('canam', 'logo_media', 'Logo sponsor', 'image', 3),
    ('main_banner', 'media', 'Imagen banner', 'image', 3),
    ('collage_1', 'media', 'Imagen collage', 'image', 2),
    ('collage_2', 'media', 'Imagen collage', 'image', 2),
    ('collage_3', 'media', 'Imagen collage', 'image', 2),
    ('ana_torque', 'cover_media', 'Imagen influencer', 'image', 5),
    ('rafa_mud', 'cover_media', 'Imagen influencer', 'image', 5),
    ('jess_nitro', 'cover_media', 'Imagen influencer', 'image', 5),
    ('tickets', 'cover_media', 'Imagen panel', 'image', 4),
    ('raffles', 'cover_media', 'Imagen panel', 'image', 4),
    ('pools', 'cover_media', 'Imagen panel', 'image', 4),
    ('promos', 'cover_media', 'Imagen panel', 'image', 4),
    ('jersey', 'media', 'Imagen merch', 'image', 3),
    ('cap', 'media', 'Imagen merch', 'image', 3),
    ('kit', 'media', 'Imagen merch', 'image', 3),
    ('monster_logo', 'logo_media', 'Imagen footer', 'image', 2),
    ('monster_logo', 'target_url', 'Link footer', 'link', 3),
    ('fox_logo', 'logo_media', 'Imagen footer', 'image', 2),
    ('fox_logo', 'target_url', 'Link footer', 'link', 3),
    ('oakley_logo', 'logo_media', 'Imagen footer', 'image', 2),
    ('oakley_logo', 'target_url', 'Link footer', 'link', 3),
    ('ana_logo', 'logo_media', 'Imagen footer', 'image', 2),
    ('ana_logo', 'target_url', 'Link footer', 'link', 3)
) as v(item_key, field_key, label, kind, sort_order)
  on v.item_key = public.cms_group_items.item_key
where not exists (
  select 1
  from public.cms_group_item_fields
  where public.cms_group_item_fields.item_id = public.cms_group_items.id
    and public.cms_group_item_fields.field_key = v.field_key
    and public.cms_group_item_fields.locale = 'es-MX'
);
