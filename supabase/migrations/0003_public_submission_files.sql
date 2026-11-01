-- Store employer poster/logo uploads in a private Supabase Storage bucket.
alter table public.ad_requests
  add column if not exists attachments jsonb not null default '[]'::jsonb;

alter table public.ad_requests
  drop constraint if exists ad_requests_attachments_check;

alter table public.ad_requests
  add constraint ad_requests_attachments_check
  check (jsonb_typeof(attachments) = 'array' and jsonb_array_length(attachments) <= 3);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'jobsmart-submissions',
  'jobsmart-submissions',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can upload employer submission files" on storage.objects;
create policy "Public can upload employer submission files"
  on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'jobsmart-submissions'
    and (storage.foldername(name))[1] ~ '^JS-[0-9]{4}-[A-F0-9]{8}$'
    and storage.extension(name) = any (array['jpg', 'jpeg', 'png', 'webp', 'pdf'])
  );

drop policy if exists "Admins can view employer submission files" on storage.objects;
create policy "Admins can view employer submission files"
  on storage.objects
  for select to authenticated
  using (
    bucket_id = 'jobsmart-submissions'
    and ((select auth.jwt()) -> 'app_metadata' ->> 'admin_role') in ('admin', 'super_admin')
  );
