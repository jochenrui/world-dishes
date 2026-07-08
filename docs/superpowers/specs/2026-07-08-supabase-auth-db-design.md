# World Dishes — Real Auth + Database (Supabase) Design Spec

**Date:** 2026-07-08
**Status:** Draft for review
**Supersedes (partially):** the client-only auth + localStorage-only decisions in `2026-07-08-world-dishes-design.md` §3.2–§3.3.

## 1. Overview

Replace the mock / cosmetic-client-side Google login and localStorage-only persistence with **real, server-verified Google OAuth and a Postgres database**, using **Supabase** as the backend-as-a-service. The frontend remains a static SPA on GitHub Pages — Supabase is reached directly from the browser, so there is no server for us to host or maintain.

### Goals
- Real Google sign-in with **server-side token verification** (no more cosmetic client-side JWT decode).
- Per-user progress (tried / note / rating) stored in Postgres, isolated per user via Row-Level Security.
- Keep the app deployable on GitHub Pages (static).
- Preserve a good UX: instant reads from a local cache, offline tolerance, and **no data loss** — existing local (mock-era) progress migrates into the account on first real sign-in.
- Mock auth still works with no credentials, so local dev and CI need no secrets.

### Non-Goals (v1)
- No custom backend server.
- No realtime sync / websockets (last-write-wins across devices is fine).
- No admin UI, no server-side rendering.
- Dishes stay static in code — they are **not** moved into the DB.

## 2. Architecture

```
Browser SPA (GitHub Pages, static)
  ├─ @supabase/supabase-js
  │     ├─ auth: signInWithOAuth('google')  ──redirect──> Google ──> Supabase /auth/v1/callback
  │     │        (Supabase verifies the Google token, issues a Supabase session JWT)
  │     └─ postgREST: dish_progress table (JWT sent as bearer; RLS enforces auth.uid() = user_id)
  └─ localStorage: per-user progress cache (instant + offline reads)
```

- The **anon key** is shipped in the client bundle. This is expected and safe: it only permits operations allowed by RLS policies. Data isolation is enforced by Postgres RLS, not by hiding the key.
- Dish content remains in `src/data/` (versioned in code). The DB stores only `dish_progress`.

## 3. Auth

### 3.1 Provider
New `SupabaseAuthProvider` implementing the existing `AuthProvider` interface (`src/auth/types.ts`):
- `mode`: `'google'`.
- `signIn()` → `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: <absolute app URL> } })`. `redirectTo` is `window.location.origin + import.meta.env.BASE_URL` (e.g. `https://jochenrui.github.io/world-dishes/`).
- `signOut()` → `supabase.auth.signOut()`.
- `onChange(cb)` → subscribes to `supabase.auth.onAuthStateChange` and immediately emits the current session; returns an unsubscribe. This stays the single source of truth, consistent with the callback-driven interface.
- User mapping: `{ id: session.user.id (uuid), name: user_metadata.full_name ?? email, email, avatarUrl: user_metadata.avatar_url ?? '' }`.

The old client-side GIS implementation (`src/auth/googleAuth.ts`) is **removed** — it was explicitly cosmetic/unverified and is fully superseded. `VITE_GOOGLE_CLIENT_ID` is retired (Google client config now lives in the Supabase dashboard).

### 3.2 Factory (`src/auth/index.ts`)
- `VITE_SUPABASE_URL` **and** `VITE_SUPABASE_ANON_KEY` present → `SupabaseAuthProvider`.
- otherwise → `MockAuthProvider` (unchanged; keeps dev + CI credential-free).

### 3.3 Session lifecycle
`SessionProvider` gains an `initializing` boolean. Supabase restores the session asynchronously (and parses the OAuth redirect hash/query on return), so during that window the UI shows a neutral/loading auth state rather than flashing "signed out". `detectSessionInUrl` and `persistSession` are enabled on the client. After a redirect back, supabase-js consumes the URL fragment and fires `onAuthStateChange('SIGNED_IN')`.

## 4. Database

### 4.1 Schema — `supabase/migrations/0001_dish_progress.sql`
```sql
create table public.dish_progress (
  user_id    uuid not null references auth.users on delete cascade,
  dish_id    text not null,
  tried      boolean not null default true,
  note       text,
  rating     smallint check (rating between 1 and 5),
  tried_at   timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, dish_id)
);

alter table public.dish_progress enable row level security;

create policy "select own" on public.dish_progress
  for select using (auth.uid() = user_id);
create policy "insert own" on public.dish_progress
  for insert with check (auth.uid() = user_id);
create policy "update own" on public.dish_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own" on public.dish_progress
  for delete using (auth.uid() = user_id);
```
- Composite PK `(user_id, dish_id)` makes upserts natural (`on conflict (user_id, dish_id)`).
- `dish_id` is `text` (matches our string ids) with **no FK** to a dishes table (dishes live in code). Orphaned rows for removed dishes are simply ignored by the client (same rule as today).
- `note` capped client-side (~2000 chars); no server length constraint in v1.

### 4.2 Repository — `src/data/progressRepo.ts`
Pure-ish mapping + thin async CRUD over the Supabase client:
- `rowToEntry(row) → { dishId, entry: ProgressEntry }` and `entryToRow(userId, dishId, entry)` — **pure, unit-tested**.
- `fetchAll(client, userId): Promise<UserProgress['entries']>`
- `upsertEntry(client, userId, dishId, entry): Promise<void>` (`upsert ... onConflict: 'user_id,dish_id'`)
- `deleteEntry(client, userId, dishId): Promise<void>` (used when un-trying, which clears the entry)

## 5. Persistence & Sync Flow

`ProgressContext` becomes cache-first with server as source of truth:

1. **On sign-in (user id changes):**
   a. Immediately hydrate state from the localStorage cache for that user id (instant paint / offline).
   b. `fetchAll` from Supabase.
   c. **Merge** (see 5.1); write the merged result to state + cache.
2. **On mutation** (`toggleTried` / `setNote` / `setRating`):
   a. Optimistically update state + cache now.
   b. Debounced write-through to Supabase (`upsertEntry`, or `deleteEntry` on un-try).
   c. If the write fails (offline), the entry remains in the cache and is re-uploaded by the merge step on the next successful load. (v1: no explicit dirty-queue; the merge is the recovery path.)
3. **On sign-out:** clear in-memory state (cache is left intact, keyed per user).

### 5.1 Merge / migration rule (single code path)
Given `local` (cache/mock-era entries) and `server` maps:
- Start from `server`.
- For every `dishId` present in `local` but **absent** in `server`, upload the local entry to the DB and include it. (This is the mock→real migration *and* multi-device backfill.)
- Where both have an entry, **server wins** (authoritative), and the local cache is overwritten.
- Mock-era data lives under the `mock-user-1` cache key; on first real sign-in we also read that blob (if present) as an additional `local` source to migrate, then mark it migrated so it isn't re-applied.

## 6. Config & Client

- `src/lib/supabaseClient.ts`: reads `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`; exports `getSupabase(): SupabaseClient | null` (null when unconfigured). Client options: `auth: { persistSession: true, detectSessionInUrl: true, autoRefreshToken: true }`.
- `.env.example` + `README.md`: replace `VITE_GOOGLE_CLIENT_ID` with the two Supabase vars.
- **Deploy:** the GitHub Actions build injects `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from repo **Variables** (`vars.*`). Both are public-safe, so repo Variables (not Secrets) are acceptable; the workflow tolerates them being unset (build still succeeds → mock mode).

## 7. Manual setup (documented in `docs/SETUP-SUPABASE.md`)
1. Create a Supabase project; copy Project URL + anon key.
2. SQL editor → run `0001_dish_progress.sql`.
3. Google Cloud → create an OAuth **Web** client; Authorized redirect URI = `https://<project-ref>.supabase.co/auth/v1/callback`.
4. Supabase → Auth → Providers → Google: paste client id + secret; enable.
5. Supabase → Auth → URL config: Site URL = `https://jochenrui.github.io/world-dishes/`; add the same to Redirect URLs (plus `http://localhost:5173` for dev).
6. Add `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` to `.env.local` (dev) and to GitHub repo Variables (prod).

## 8. Error Handling & Edge Cases
- No creds → mock provider (dev/CI). Creds present but offline → cache reads; writes retry via next merge.
- RLS denies cross-user access at the DB; the anon key alone grants nothing beyond policy.
- Un-trying deletes the row (mirrors current "clear entry" reducer behavior).
- OAuth redirect returns to the Pages base path; the existing `404.html` SPA fallback + `detectSessionInUrl` handle deep-return.
- Rating constrained 1–5 at DB and in types; note capped client-side.
- Signed-out users browse freely; write actions prompt sign-in (unchanged).

## 9. Testing
- **Unit:** `rowToEntry` / `entryToRow` round-trip; merge/migration rule (server-precedence + local-backfill) with table-driven cases. These are pure and need no network.
- Existing suite keeps passing on the mock path (no creds in CI).
- Supabase network calls are not unit-tested in v1 (thin wrappers); the mapping/merge logic that carries the real risk is isolated and tested.

## 10. Milestones
1. Add dependency, `supabaseClient.ts`, env plumbing, `.env.example`/README.
2. `SupabaseAuthProvider` + factory + `SessionProvider` initializing state; remove GIS provider.
3. Migration SQL + `progressRepo.ts` + mapping tests.
4. Rewire `ProgressContext` to cache-first + server + merge/migration.
5. `docs/SETUP-SUPABASE.md`; wire GH Actions Variables into the build.
6. Tests, build, deploy.

## 11. Future / Deferred
- Realtime cross-device sync; explicit offline dirty-queue with retry/backoff.
- Server-side `note` length + profanity constraints; soft-delete/history.
- Moving dish content into the DB with an admin/editing surface.
