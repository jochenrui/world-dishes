# World Dishes — Design Spec

**Date:** 2026-07-08
**Status:** Draft for review

## 1. Overview

A single-page application for exploring the world's most popular dishes and tracking which ones you've personally tried. Users browse a global "most popular" page, drill into a per-country collection (with region/city sub-filtering for cuisines that vary internally), check off dishes they've eaten, and attach a personal note/rating. A mock Google login gates the personalized progress; it swaps to real Google OIDC by adding an env var later. A third page documents the dataset.

### Goals
- Discover globally popular dishes at a glance.
- Track per-country completion ("tried 4 of 12 Italian dishes").
- Drill down by region/city for large or culinarily-diverse countries.
- Persist tried-state + notes/ratings per logged-in user.
- Mock auth now, real Google OIDC later with zero code changes (just env var).
- Rich, consistent dish visuals via an SVG sprite system with dietary/attribute badges.

### Non-Goals (v1)
- No backend / server. Fully client-side SPA.
- No cross-device sync (localStorage is per-browser).
- No social features (sharing, following).
- No exhaustive dish database — a curated, high-quality starter set.

## 2. Tech Stack
- **React 18 + Vite + TypeScript**
- **React Router** (3 routes)
- State: **React Context + useReducer**, persisted to **localStorage**
- Styling: CSS Modules (or plain CSS + custom properties for theming). No heavy UI lib.
- Testing: **Vitest** + React Testing Library for unit/component; **Playwright** for a light e2e/UX pass.
- No backend. BaaS not used.

## 3. Architecture

### 3.1 Routes / Pages
- `/` — **Popular Dishes**: global ranking of most popular dishes worldwide. Cards with sprite, name, country flag, dietary badges. Filter/sort by dietary base, spice, category. Logged-in users see tried-state on each card.
- `/collection` — **By Country**: list/grid of countries with a progress ring ("6/14 tried"). Selecting a country shows its dishes; countries with `hasRegions` expose a region/city filter (All / Sichuan / Cantonese / ...). Each dish card has a "tried" toggle and a note/rating editor.
- `/about` — **About the Data**: methodology, dataset scope, field definitions, dietary/allergen legend, sources/caveats, counts (computed from the dataset at build/render time).

### 3.2 Auth abstraction
```ts
interface AuthProvider {
  currentUser: User | null;
  signIn(): Promise<User>;
  signOut(): Promise<void>;
  onChange(cb: (u: User | null) => void): () => void;
}
```
- `MockAuthProvider`: returns a canned Google-style user (name, email, avatar) immediately. Active when `VITE_GOOGLE_CLIENT_ID` is absent.
- `GoogleAuthProvider`: uses Google Identity Services (GIS) client-side; decodes the ID token JWT for profile. Active automatically when `VITE_GOOGLE_CLIENT_ID` is set.
- A factory picks the implementation at startup based on env. **This is the only swap needed for real auth.**
- `User { id, name, email, avatarUrl }`. `id` keys the persisted progress.

### 3.3 State & persistence
- `SessionContext`: current user + auth actions.
- `ProgressContext`: `UserProgress` map, actions `toggleTried(dishId)`, `setNote(dishId, note)`, `setRating(dishId, n)`.
- Persistence layer `storage.ts`: reads/writes `localStorage` under key `world-dishes:progress:<userId>`. Debounced writes. Graceful when unauthenticated (progress actions are disabled / prompt login).
- Migration-safe: stored blob carries a `version` field.

## 4. Data Model

```ts
type DietBase = 'vegan' | 'vegetarian' | 'pescatarian' | 'meat';
type Allergen = 'gluten' | 'dairy' | 'egg' | 'nuts' | 'shellfish' | 'soy';
type Category =
  | 'noodles' | 'curry' | 'grilled' | 'dumpling' | 'soup' | 'rice'
  | 'bread' | 'stew' | 'salad' | 'seafood' | 'dessert' | 'streetfood'
  | 'sandwich' | 'beverage' | 'pastry';

interface Country { id: string; name: string; flag: string; continent: string; hasRegions: boolean; }
interface Region { id: string; countryId: string; name: string; kind: 'city' | 'area'; }

interface Dish {
  id: string;
  name: string;
  localName?: string;
  countryId: string;
  regionId?: string;          // undefined = national / applies country-wide
  category: Category;
  dietary: {
    base: DietBase;
    containsPork: boolean;
    containsBeef: boolean;
    containsAlcohol: boolean;
  };
  allergens: Allergen[];
  spiceLevel: 0 | 1 | 2 | 3;
  popularityRank: number;     // global rank; also used for per-country ordering
  description: string;
  origin: string;
}

interface UserProgress {
  version: number;
  entries: Record<string /*dishId*/, { tried: boolean; note?: string; rating?: 1|2|3|4|5; triedAt?: string }>;
}
```

- **Dataset scope v1:** ~35 countries across all continents, ~180 dishes. Region breakdown for ~7 diverse/large countries (e.g. China, India, Italy, Mexico, Spain, USA, France). Stored as typed JSON/TS modules in `src/data/`.
- Data validated at load with a lightweight runtime check (dev-only) to catch bad references (dish → country/region).

## 5. SVG Sprite System

Two layers, all inline SVG (no network), theme-aware via `currentColor`:
1. **Category symbol sheet** (`src/assets/sprites/dishes.svg`, `<symbol>` per category, ~15 icons): noodles, curry, grilled, dumpling, soup, rice, bread, stew, salad, seafood, dessert, streetfood, sandwich, beverage, pastry. A dish renders its category symbol as its illustration.
2. **Attribute badges** (small icon set): diet base (vegan/vegetarian/pescatarian/meat), contains-pork, contains-beef, contains-alcohol, spice level (0–3 chili pips), allergen dots (gluten/dairy/egg/nuts/shellfish/soy).

Rationale: consistent, offline, lightweight, and scalable to more dishes without per-dish artwork. Badges encode the researched, travel-relevant info (religious/cultural flags + allergens + spice) rather than scattered ad-hoc labels.

## 6. Component Inventory
- `AppShell` (nav, login button, route outlet)
- `LoginButton` / `UserMenu`
- `DishCard` (sprite + name + flag + badges + tried toggle)
- `DishBadges` (renders diet/flags/spice/allergens)
- `DishSprite` (references symbol sheet)
- `FilterBar` (diet/category/spice/sort)
- `CountryGrid` + `CountryProgressRing`
- `RegionFilter` (only when `hasRegions`)
- `NoteEditor` (note textarea + star rating, save/cancel)
- `AboutData` (legend + stats)
- Contexts/providers, `storage.ts`, `auth/*`

## 7. Error Handling & Edge Cases
- Unauthenticated user toggling "tried" → inline prompt to sign in (action disabled, not silently dropped).
- Corrupt/absent localStorage → reset to empty progress, log once, no crash.
- Dish referencing missing country/region → dev-time validation error; prod skips gracefully.
- Empty filter results → friendly empty state.
- Real GIS script fails to load → fall back to mock with a visible notice (dev only).

## 8. Testing
- **Unit:** reducer logic (toggle/note/rating), storage read/write + corruption recovery, auth factory selection, data-integrity validator.
- **Component:** DishCard tried toggle, FilterBar filtering, RegionFilter visibility, NoteEditor save.
- **E2E / UX (Playwright):** login (mock) → browse popular → open a country → filter region → check off dish → add note → reload → state persisted. This run also feeds the UI/UX review pass.

## 9. Milestones
1. Scaffold Vite+TS+Router, app shell, routing, theming.
2. Curated dataset + types + validator.
3. SVG sprite sheet + badges + DishCard.
4. Popular page + filters.
5. Collection page + country/region + progress rings.
6. Auth abstraction (mock) + session + progress persistence + note/rating.
7. About page.
8. Tests + Playwright UX review + fixes.

## 10. Future / Deferred
- Real Google OIDC (drop in `VITE_GOOGLE_CLIENT_ID`).
- Backend + cross-device sync.
- Larger dataset, dish photos via API (hybrid), i18n, PWA/offline.
