-- Run this once in the Supabase project's SQL Editor to create the storage
-- bucket that holds photos of completed Documented Coaching forms.
--
-- Public bucket, open insert policy — matches the rest of the app's
-- no-auth-yet stance (see supabase/schema.sql). Tighten once leaders sign in
-- individually.

insert into storage.buckets (id, name, public)
values ('coaching-forms', 'coaching-forms', true)
on conflict (id) do nothing;

drop policy if exists "public read coaching forms" on storage.objects;
create policy "public read coaching forms"
on storage.objects for select
using (bucket_id = 'coaching-forms');

drop policy if exists "public upload coaching forms" on storage.objects;
create policy "public upload coaching forms"
on storage.objects for insert
with check (bucket_id = 'coaching-forms');
