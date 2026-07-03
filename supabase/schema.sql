-- Memory Gardens — Milestone 2 schema (WBS 4.2)

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

drop policy if exists "Memories are publicly readable" on public.memories;
drop policy if exists "Anyone can plant a memory" on public.memories;
drop policy if exists "Public can view memory images" on storage.objects;
drop policy if exists "Public can upload memory images" on storage.objects;

create policy "Memories are publicly readable"
  on public.memories
  for select
  using (true);

create policy "Anyone can plant a memory"
  on public.memories
  for insert
  with check (true);

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

