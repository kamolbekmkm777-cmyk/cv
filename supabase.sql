-- =============================================================================
--  Kamolbek CV — Supabase schema
--  Supabase → SQL Editor → New query → paste all of this → RUN.
--  Safe to re-run: every statement is idempotent.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. WHO IS ALLOWED TO WRITE
--    The old policies said `to authenticated with check (true)` — i.e. ANY
--    logged-in user. That is only safe if no stranger can ever get an account,
--    and on a live Supabase project signups are open by default, so anyone on
--    the internet could register and overwrite the whole site.
--
--    Writes are now pinned to an explicit allow-list instead. The seed below
--    grabs whoever already exists (you), so re-running this on your project
--    keeps you in and locks everybody else out.
-- -----------------------------------------------------------------------------
create table if not exists public.app_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  added_at   timestamptz not null default now()
);

alter table public.app_admins enable row level security;
-- Nobody reads or writes this table from the browser; only SQL Editor touches
-- it. With RLS on and no policy, every client request is denied by default.

-- Seed: every account that exists right now becomes an admin. On a project
-- with just your account, that is exactly you.
insert into public.app_admins (user_id)
select id from auth.users
on conflict (user_id) do nothing;

-- The single test every write policy runs.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.app_admins a where a.user_id = auth.uid());
$$;


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

-- Only an account on the admin allow-list may WRITE.
drop policy if exists "site_data admin write" on public.site_data;
create policy "site_data admin write"
  on public.site_data for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "site_data admin update" on public.site_data;
create policy "site_data admin update"
  on public.site_data for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Deliberately no DELETE policy: the row must always exist.

-- Seed the row so the first read returns something instead of null.
insert into public.site_data (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;


-- -----------------------------------------------------------------------------
-- 2. MEDIA STORAGE
--    Photos, music and images. Public read so <img>/<audio> can hit them with
--    no token; writes restricted to the admin allow-list.
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
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.is_admin());


-- -----------------------------------------------------------------------------
-- 3. CHECK IT WORKED
-- -----------------------------------------------------------------------------
-- Admin ro'yxatida kim bor (faqat siz bo'lishi kerak):
--   select a.user_id, u.email from public.app_admins a join auth.users u on u.id = a.user_id;
--
-- Sayt hujjati va media bucket holati:
--   select id, jsonb_pretty(data), updated_at from public.site_data;
--   select id, public, file_size_limit from storage.buckets where id = 'media';
--
-- MUHIM, ikkinchi qulf: Supabase panelida ro'yxatdan o'tishni ham yoping —
--   Authentication → Sign In / Providers → Email → "Allow new users to sign up" OFF.
-- Yuqoridagi qoidalar o'zi yetarli, lekin ikkita mustaqil to'siq har doim yaxshi.
