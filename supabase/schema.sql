-- Memory Gardens — Milestone 2 schema (WBS 4.2)
-- Updated: per-user memories (WBS 4.6)

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 80),
  body text not null check (char_length(body) between 1 and 2000),
  author text not null default 'Anonymous' check (char_length(author) <= 60),
  x double precision not null check (x between 0 and 4000),
  y double precision not null check (y between 0 and 3000),
  image_path text,
  created_at timestamptz not null default now()
);

alter table public.memories enable row level security;

alter table public.memories
add column if not exists image_path text;

-- Per-user ownership column.
alter table public.memories
add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Clear out old test/anonymous rows that predate the user_id column —
-- they have no owner and would block the NOT NULL constraint below.
delete from public.memories where user_id is null;

alter table public.memories
alter column user_id set not null;

-- New rows auto-attribute to whoever is signed in, so the frontend
-- insert code doesn't need to pass user_id explicitly.
alter table public.memories
alter column user_id set default auth.uid();

drop policy if exists "Memories are publicly readable" on public.memories;
drop policy if exists "Anyone can plant a memory" on public.memories;
drop policy if exists "Users can view their own memories" on public.memories;
drop policy if exists "Users can plant their own memories" on public.memories;
drop policy if exists "Public can view memory images" on storage.objects;
drop policy if exists "Public can upload memory images" on storage.objects;

create policy "Users can view their own memories"
  on public.memories
  for select
  using (auth.uid() = user_id);

create policy "Users can plant their own memories"
  on public.memories
  for insert
  with check (auth.uid() = user_id);

-- Milestone 2 (WBS 4.4): image uploads
-- Create a public storage bucket named `memory-images` in the dashboard.
-- Enforce <= 5MB and jpg/png in frontend validation.

create policy "Public can view memory images"
  on storage.objects
  for select
  using (bucket_id = 'memory-images');

create policy "Public can upload memory images"
  on storage.objects
  for insert
  with check (bucket_id = 'memory-images');

-- Milestone 4 — shared vs. private gardens, and admin moderation.
--
-- Every memory now carries its own visibility: shared memories are
-- readable by any signed-in gardener, private ones only by their owner.
-- The frontend's regular Garden view (src/lib/store.ts) always asks for
-- "mine OR shared" explicitly and never relies on RLS alone to hide
-- other people's private memories from that screen. The broader "admins
-- can see everything" policy below exists ONLY to power the /admin
-- panel's cross-user browsing (src/lib/adminStore.ts) — it must not be
-- the thing gating what a signed-in admin sees on their own garden.
alter table public.memories
add column if not exists is_shared boolean not null default true;

drop policy if exists "Users can view their own memories" on public.memories;
drop policy if exists "Anyone can view shared memories" on public.memories;
drop policy if exists "Admins can view all memories" on public.memories;
drop policy if exists "Users can plant their own memories" on public.memories;
drop policy if exists "Admins can plant memories for any user" on public.memories;
drop policy if exists "Admins can delete any memory" on public.memories;

create policy "Users can view their own memories"
  on public.memories
  for select
  using (auth.uid() = user_id);

create policy "Anyone can view shared memories"
  on public.memories
  for select
  using (is_shared = true);

create policy "Admins can view all memories"
  on public.memories
  for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

create policy "Users can plant their own memories"
  on public.memories
  for insert
  with check (auth.uid() = user_id);

-- Needed for the admin panel's "+ Add memory" form, which plants a
-- memory on behalf of a different user_id than the signed-in admin.
create policy "Admins can plant memories for any user"
  on public.memories
  for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

-- Needed for the admin panel's per-memory "Delete" button.
create policy "Admins can delete any memory"
  on public.memories
  for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

-- Milestone 5 — admin / tester roles.
--
-- `role` becomes the single source of truth for who gets elevated
-- access, replacing `is_admin` (left in place, unused, rather than
-- dropped, in case anything else still reads it). 'admin' can do
-- everything 'tester' can, plus manage users from /admin. 'tester'
-- only unlocks the production health-check page at /tests.
alter table public.profiles
add column if not exists role text check (role in ('admin', 'tester'));

update public.profiles set role = 'admin' where is_admin = true and role is null;

alter table public.profiles enable row level security;

drop policy if exists "Profiles are readable by signed-in users" on public.profiles;
drop policy if exists "Admins can update any profile" on public.profiles;

-- The admin panel's user list (src/lib/adminStore.ts) lists every
-- gardener, not just the signed-in one, so every signed-in user needs
-- read access to the whole table (this matches the access the app
-- already depended on before RLS was made explicit here).
create policy "Profiles are readable by signed-in users"
  on public.profiles
  for select
  using (auth.role() = 'authenticated');

create policy "Admins can update any profile"
  on public.profiles
  for update
  using (
    exists (
      select 1 from public.profiles as admin_check
      where admin_check.id = auth.uid() and admin_check.role = 'admin'
    )
  );

-- Re-point the memories admin policies at `role` instead of the
-- retired `is_admin` flag, so there's one source of truth.
drop policy if exists "Admins can view all memories" on public.memories;
drop policy if exists "Admins can plant memories for any user" on public.memories;
drop policy if exists "Admins can delete any memory" on public.memories;

create policy "Admins can view all memories"
  on public.memories
  for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can plant memories for any user"
  on public.memories
  for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can delete any memory"
  on public.memories
  for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );