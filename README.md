# 🌍 World Dishes

A single-page app for exploring the world's most popular dishes and tracking the ones you've tried.

- **Popular** — every dish ranked by global fame, with filters for diet, spice, category, and things to avoid (pork / beef / alcohol / allergens).
- **My Collection** — countries grouped by continent, each with a progress ring. Open a country to tick off dishes; large or culinarily-diverse countries (China, India, Italy, France, Spain, USA, Mexico) let you drill down by region.
- **About the Data** — how the dataset was built, a badge/field legend, and honest caveats.

Sign in (mock Google today, real Google when configured) to mark dishes tried, rate them, and add notes. Everything persists in your browser's `localStorage`.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build      # typecheck + production build
npm run preview    # serve the production build
npm run test       # run the Vitest suite
```

## Authentication & data

Auth sits behind a single interface (`src/auth/`) with two implementations chosen at startup:

| Env | Provider | Behavior |
| --- | --- | --- |
| `VITE_SUPABASE_*` **unset** | `MockAuthProvider` | Signs in instantly as a demo user; progress saved only in `localStorage`. No network. |
| `VITE_SUPABASE_*` **set** | `SupabaseAuthProvider` | Real Google sign-in via Supabase (server-verified); progress stored in Postgres, cached locally. |

When Supabase is configured, progress is stored in a `dish_progress` table protected by
Row-Level Security (each user sees only their own rows). The browser keeps a `localStorage`
cache for instant/offline reads, and any progress accrued under the mock login is migrated into
your account the first time you sign in for real.

**To turn it on:** follow [`docs/SETUP-SUPABASE.md`](docs/SETUP-SUPABASE.md) (create a Supabase
project, run the SQL migration, set up a Google OAuth client), then put `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` in `.env.local` (dev) and in the repo's Actions **Variables** (prod).

> The anon key is public by design — data is protected by Postgres RLS, not by hiding the key.

## Project structure

```
src/
  auth/        AuthProvider interface, mock + Supabase implementations, factory
  data/        Curated dataset (countries, regions, dishes), types, labels, validator, progressRepo
  state/       Session + Progress contexts, reducer, localStorage cache + migration flags
  components/  AppShell, DishCard, DishGrid, FilterBar, badges, SVG sprite sheet, ...
  pages/       Popular, Collection, Country detail, About
  lib/         Filtering + sorting logic, Supabase client
supabase/migrations/     SQL migration for the dish_progress table (+ RLS)
docs/SETUP-SUPABASE.md   One-time backend setup guide
docs/superpowers/specs/  Design specs
tests/         Vitest unit + component tests
```

The dish dataset is hand-curated (there's no reliable public "popular dishes by country" API). Each dish carries a `fame` weight; a unique global `popularityRank` is derived from it at load. A dev-time validator (`src/data/validate.ts`) checks referential integrity on startup.
