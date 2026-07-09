# World Dishes — status & roadmap

A working hand-off doc so this can be picked up on any machine. Last updated 2026-07-09.

**Live:** https://jochenrui.github.io/world-dishes/ · **Deploy:** push to `main` → GitHub Actions builds + publishes to Pages.

## Continue on a new machine
```bash
git clone https://github.com/jochenrui/world-dishes.git
cd world-dishes && npm install && npm run dev        # http://localhost:5173
npm run build   # tsc -b + vite build      npm run test   # vitest (34 tests)
```
- Runs fully in **mock mode** with no config (mock login, localStorage). For real Google login + DB + community stats, create `.env.local` with `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — see `docs/SETUP-SUPABASE.md`. `.env.local` is gitignored, so it does NOT sync between machines; recreate it (values are also stored as repo Actions Variables for CI).
- Supabase migrations live in `supabase/migrations/` (`0001` progress table + RLS, `0002` dish_stats view). Run them in the Supabase SQL editor.

## What's built
- **Pages:** Popular (search + filters), Collection (countries by continent, progress rings), Country detail (region drill-down), Dish detail (`/dish/:id`), Culinary Passport (stamps + achievements), About.
- **Dataset:** 473 dishes / 35 countries. Three tiers in separate files: `dishes.raw.ts` (world-famous), `dishes.local.ts` (locally-famous), `dishes.regional.ts` (region must-eats). Per dish: dietary base + pork/beef/alcohol flags, allergens, spice, category (23-set), `keyIngredients`, `origin`, optional `history`, and a `fame` weight → derived global `popularityRank`.
- **Regions:** 17 countries have regions (59 total) in `countries.ts`; region view = region-specific + national dishes; sparse regions show a "national favourites" note.
- **Icons:** cohesive two-tone SVG set, one per category (`DishSprites.tsx`). Real SVG country flags (`Flag.tsx`, `country-flag-icons`).
- **Auth/data:** mock ↔ Supabase (Google OAuth, Postgres + RLS) behind one `AuthProvider`; progress cached in localStorage; community "tried"/rating aggregates via the `dish_stats` view.

## How the data was built (pipeline)
Curation was done with batches of research subagents (by region) that emit JSON maps, reviewed by a second "culinary reviewer" agent, then applied to the `.ts` data files with small Node scripts. Those apply scripts were throwaway (ran from a scratch dir) — not in the repo — but the pattern is: agent → JSON → validate against enums/ids → rewrite the dish lines → `tsc`/tests/`validateDataset`. See `docs/planning/regions/` for the region decisions and `research/svg-spec.md` for the icon spec.

## Popularity = curated, not measured
`fame` (0–100) is hand-assigned (world-famous ~70–98, local ~20–62, regional ~25–55); `popularityRank` is derived by sorting on it. Deliberately subjective. Possible future: blend in real community "tried" counts (`dish_stats`).

## Backlog (prioritized — see research/ for detail)
Feature research (`research/features-backlog-r2.json`), top picks not yet built:
1. **Tasting timeline** — chronological "food diary" from the already-stored `tried_at`. High value / low effort (data exists, mostly a view). Build a `deriveStats(entries, dishes)` module Stats + Share can reuse.
2. **Want-to-try / wishlist** — the retention loop. Needs an additive `want_to_try` column; **caveat:** redefine the "un-try deletes the row" rule + migration tombstone filter before anything depends on it.
3. **Stats dashboard** — charts by continent/category/diet/spice (reuses timeline aggregation).
4. **Export / share progress** — JSON/CSV + a canvas "passport" share card.
5. World-map choropleth (bundled SVG), recommendations ("because you tried X"), dish-of-the-day.

Detail-page ideas not yet built (`research/detail-info-research.md`): community stats ✅ done; key ingredients ✅ done; still open — "how & where it's eaten", taste-profile tags, pronunciation, "also known as".

Open UI/UX polish (`research/ui-review-r2.json`, `ux-review-r2.json`): About page left-confined on desktop; allergen icons inconsistent between card pills and the AVOID filter; notes save only on blur; star rating can't be cleared; misleading empty-state copy for pure searches; no grid/stamp/achievement animation; OS-emoji 🌍 logo; grilled glyph legibility.

Data gaps: some regions are intentionally sparse (no region-specific dish yet — e.g. most of Japan's, all of Korea's); S/W Europe + Americas got fewer `history` blurbs than other regions (under-coverage, easy to top up).
