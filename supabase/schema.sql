-- Memory Gardens — Milestone 2 schema (WBS 4.2)
-- Run in the Supabase SQL editor, then fill in .env to switch the app
-- from local-first mode to the shared garden.

create table if not exists public.memories (
  id         uuid primary key default gen_random_uuid(),
  title      text not null check (char_length(title) between 1 and 80),
  body       text not null check (char_length(body) between 1 and 2000),
  author     text not null default 'Anonymous' check (char_length(author) <= 60),
  x          double precision not null check (x between 0 and 4000),
  y          double precision not null check (y between 0 and 3000),
  created_at timestamptz not null default now()
);

alter table public.memories enable row level security;

-- MVP policy: anyone may read the garden and plant memories.
-- Tighten these once auth is introduced.
create policy "Memories are publicly readable"
  on public.memories for select
  using (true);

create policy "Anyone can plant a memory"
  on public.memories for insert
  with check (true);

-- Milestone 2 (WBS 4.4): image uploads
-- Create a public storage bucket named `memory-images` in the dashboard,
-- enforce <= 5MB and jpg/png in frontend validation per Risk #4,
-- then add an `image_path text` column here.
