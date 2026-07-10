-- World Dishes — "want-to-try" wishlist layer.
-- Adds a third state beside tried/untried: a dish can be wishlisted (want-to-try)
-- without being tried. A row now persists when the dish is tried OR wishlisted, so
-- a `tried=false, wishlisted_at=<ts>` row is legitimate (not a tombstone).
-- Additive + idempotent: nullable column, no backfill.

alter table public.dish_progress
  add column if not exists wishlisted_at timestamptz;

-- Recompute dish_stats: wishlist-only rows (tried=false) are now possible, so the
-- tried_count must count only genuinely-tried rows (not count(*)). Also expose a
-- wishlist_count. Keeps the ::int casts and the anon/authenticated grant from 0002.
create or replace view public.dish_stats as
  select
    dish_id,
    count(*) filter (where tried)::int              as tried_count,
    count(rating)::int                              as rating_count,
    round(avg(rating)::numeric, 1)                  as avg_rating,
    count(*) filter (where wishlisted_at is not null)::int as wishlist_count
  from public.dish_progress
  group by dish_id;

grant select on public.dish_stats to anon, authenticated;

-- RLS on dish_progress is table-wide (policies gate all columns), so the new
-- wishlisted_at column is covered by the existing "own row" policies from 0001 —
-- no policy change is required.
