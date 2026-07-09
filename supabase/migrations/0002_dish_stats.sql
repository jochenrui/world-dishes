-- Aggregate community stats per dish (how many users tried it, average rating).
-- A plain view runs with the owner's rights and so aggregates ACROSS all users'
-- rows (bypassing the per-user RLS on dish_progress) while exposing ONLY
-- non-personal aggregates — no user_id, no notes. Safe to grant broadly.

create or replace view public.dish_stats as
  select
    dish_id,
    count(*)::int                       as tried_count,
    count(rating)::int                  as rating_count,
    round(avg(rating)::numeric, 1)      as avg_rating
  from public.dish_progress
  group by dish_id;

grant select on public.dish_stats to anon, authenticated;
