-- World Dishes — per-user progress table.
-- Dishes themselves live in the app code; this table stores only what each user
-- has tried, plus their note and rating. Isolation is enforced by RLS.

create table if not exists public.dish_progress (
  user_id    uuid not null references auth.users on delete cascade,
  dish_id    text not null,
  tried      boolean not null default true,
  note       text check (char_length(note) <= 2000),
  rating     smallint check (rating between 1 and 5),
  tried_at   timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, dish_id)
);

alter table public.dish_progress enable row level security;

-- Each user can only see and modify their own rows. Unauthenticated (anon)
-- requests have auth.uid() = null and therefore match nothing.
create policy "select own" on public.dish_progress
  for select using (auth.uid() = user_id);
create policy "insert own" on public.dish_progress
  for insert with check (auth.uid() = user_id);
create policy "update own" on public.dish_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own" on public.dish_progress
  for delete using (auth.uid() = user_id);

-- Keep updated_at fresh on UPDATE (audit column; not used for conflict resolution in v1).
create extension if not exists moddatetime schema extensions;
create trigger dish_progress_moddatetime
  before update on public.dish_progress
  for each row execute procedure extensions.moddatetime(updated_at);
