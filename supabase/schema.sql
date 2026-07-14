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