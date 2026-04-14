insert into public.cms_section_fields (
  section_id,
  field_key,
  label,
  kind,
  sort_order,
  is_visible
)
select
  s.id,
  'hero_media',
  'Imagen principal evento',
  'image',
  9,
  true
from public.cms_sections s
where s.section_key = 'evento_reciente'
  and not exists (
    select 1
    from public.cms_section_fields f
    where f.section_id = s.id
      and f.field_key = 'hero_media'
      and f.locale = 'es-MX'
  );
