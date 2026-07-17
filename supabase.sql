-- =============================================================================
--  Kamolbek CV — Supabase schema
--  Supabase → SQL Editor → New query → paste all of this → RUN.
--  Safe to re-run: every statement is idempotent.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. SITE CONTENT
--    The whole site is one JSON document in one row (id = 1). It's a personal
--    CV, not a multi-tenant app — a normalised schema would buy nothing and
--    cost a migration every time the admin panel grows a field.
-- -----------------------------------------------------------------------------
create table if not exists public.site_data (
  id         smallint primary key default 1,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  -- Hard guarantee there is never a second row to disagree with.
  constraint site_data_single_row check (id = 1)
);

alter table public.site_data enable row level security;

-- Anyone (logged out visitors) may READ the published site.
drop policy if exists "site_data public read" on public.site_data;
create policy "site_data public read"
  on public.site_data for select
  to anon, authenticated
  using (true);

-- Only a signed-in user may WRITE. You are the only account that will exist,
-- so this is effectively "only Kamolbek".
drop policy if exists "site_data admin write" on public.site_data;
create policy "site_data admin write"
  on public.site_data for insert
  to authenticated
  with check (true);

drop policy if exists "site_data admin update" on public.site_data;
create policy "site_data admin update"
  on public.site_data for update
  to authenticated
  using (true)
  with check (true);

-- Deliberately no DELETE policy: the row must always exist.

-- Seed the row so the first read returns something instead of null.
insert into public.site_data (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;


-- -----------------------------------------------------------------------------
-- 2. MEDIA STORAGE
--    Photos, music and background videos. Public read so <img>/<audio>/<video>
--    can hit them with no token; writes restricted to the admin.
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', true, 52428800)          -- 50 MB per file
on conflict (id) do update
  set public = true, file_size_limit = 52428800;

drop policy if exists "media public read" on storage.objects;
create policy "media public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media')
  with check (bucket_id = 'media');

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');


-- -----------------------------------------------------------------------------
-- 3. CHECK IT WORKED
-- -----------------------------------------------------------------------------
-- select id, jsonb_pretty(data), updated_at from public.site_data;
-- select id, public, file_size_limit from storage.buckets where id = 'media';
