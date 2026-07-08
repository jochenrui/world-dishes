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

## Authentication

Auth sits behind a single interface (`src/auth/`) with two implementations chosen at startup:

| Env | Provider | Behavior |
| --- | --- | --- |
| `VITE_GOOGLE_CLIENT_ID` **unset** | `MockAuthProvider` | Signs in instantly as a demo user. No network. |
| `VITE_GOOGLE_CLIENT_ID` **set** | `GoogleAuthProvider` | Real Google Identity Services sign-in. |

To enable real Google sign-in, copy `.env.example` to `.env.local`, set your Client ID, and restart the dev server. See `.env.example` for how to obtain one.

> **Security note:** this is a client-only app. The Google identity is decoded in the browser and **not** verified (no signature/`aud`/`exp` check) — it only derives a stable id to key your local data. It gates personalization, not security. Verifying the token requires a backend, which is out of scope for v1.

## Project structure

```
src/
  auth/        AuthProvider interface, mock + Google (GIS) implementations, factory
  data/        Curated dataset (countries, regions, dishes), types, labels, validator
  state/       Session + Progress contexts, reducer, localStorage layer
  components/  AppShell, DishCard, DishGrid, FilterBar, badges, SVG sprite sheet, ...
  pages/       Popular, Collection, Country detail, About
  lib/         Filtering + sorting logic
docs/superpowers/specs/  Design spec
tests/         Vitest unit + component tests
```

The dish dataset is hand-curated (there's no reliable public "popular dishes by country" API). Each dish carries a `fame` weight; a unique global `popularityRank` is derived from it at load. A dev-time validator (`src/data/validate.ts`) checks referential integrity on startup.
