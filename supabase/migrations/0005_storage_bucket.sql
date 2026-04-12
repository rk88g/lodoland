insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lodoland-media',
  'lodoland-media',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "lodoland_media_public_read" on storage.objects;
drop policy if exists "lodoland_media_admin_insert" on storage.objects;
drop policy if exists "lodoland_media_admin_update" on storage.objects;
drop policy if exists "lodoland_media_admin_delete" on storage.objects;

create policy "lodoland_media_public_read"
on storage.objects
for select
to public
using (bucket_id = 'lodoland-media');

create policy "lodoland_media_admin_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'lodoland-media'
  and public.is_admin()
);

create policy "lodoland_media_admin_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'lodoland-media'
  and public.is_admin()
)
with check (
  bucket_id = 'lodoland-media'
  and public.is_admin()
);

create policy "lodoland_media_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'lodoland-media'
  and public.is_admin()
);
