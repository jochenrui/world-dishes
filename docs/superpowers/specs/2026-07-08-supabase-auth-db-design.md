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
- Good UX: instant reads from a local cache; existing local (mock-era) progress migrates into the account **once** on first real sign-in.
- Mock auth still works with no credentials, so local dev and CI need no secrets.

### Non-Goals (v1)
- No custom backend server.
- No realtime sync / websockets.
- **No true last-write-wins conflict resolution and no offline write queue.** The server is authoritative once signed in (see §5). Offline edits to already-synced dishes are best-effort and may be lost on the next load; this is documented, not fixed, in v1.
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
- `signIn()` → `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } })`. Using the full current URL returns the user to the page they signed in from (deep links preserved), not just the base path.
- `signOut()` → `supabase.auth.signOut()`.
- `onChange(cb)` → subscribes via `supabase.auth.onAuthStateChange` and emits the current user immediately. **Event mapping:** `INITIAL_SESSION` / `SIGNED_IN` / `TOKEN_REFRESHED` / `USER_UPDATED` → mapped user; `SIGNED_OUT` → `null`. The returned unsubscribe calls `data.subscription.unsubscribe()`. This stays the single source of truth, consistent with the callback-driven interface.
- User mapping: `{ id: session.user.id (uuid), name: user_metadata.full_name ?? email, email, avatarUrl: user_metadata.avatar_url ?? '' }`.
- **Important:** because `TOKEN_REFRESHED`/`USER_UPDATED` fire periodically and produce a *new* `User` object each time, downstream consumers must key off `user.id`, not object identity (see §5).

The old client-side GIS implementation (`src/auth/googleAuth.ts`) is **removed** — it was explicitly cosmetic/unverified and is fully superseded. `VITE_GOOGLE_CLIENT_ID` is retired (Google client config now lives in the Supabase dashboard).

### 3.2 Factory (`src/auth/index.ts`)
- `VITE_SUPABASE_URL` **and** `VITE_SUPABASE_ANON_KEY` present → `SupabaseAuthProvider`.
- otherwise → `MockAuthProvider` (unchanged; keeps dev + CI credential-free).

### 3.3 Session lifecycle
`SessionProvider` gains an `initializing` boolean, **exposed through the session context value**. Supabase restores the session asynchronously (and parses the OAuth redirect `?code=` on return — see §8), so during that window the UI shows a neutral/loading auth state rather than flashing "signed out". `initializing` flips to false on the first `onAuthStateChange` emission (which includes `INITIAL_SESSION`). `detectSessionInUrl`, `persistSession`, and `autoRefreshToken` are enabled on the client.

`ProgressContext` **must consume `initializing`**: it does not treat "no user" as signed-out and does not run its load/merge until `initializing` is false, and consumers gate their loading UI on it (avoids the S6 signed-out flash and a spurious null-user load).

## 4. Database

### 4.1 Schema — `supabase/migrations/0001_dish_progress.sql`
```sql
create table public.dish_progress (
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

create policy "select own" on public.dish_progress
  for select using (auth.uid() = user_id);
create policy "insert own" on public.dish_progress
  for insert with check (auth.uid() = user_id);
create policy "update own" on public.dish_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own" on public.dish_progress
  for delete using (auth.uid() = user_id);

-- Keep updated_at fresh on every write (audit column; not used for merge in v1).
create extension if not exists moddatetime schema extensions;
create trigger dish_progress_moddatetime
  before update on public.dish_progress
  for each row execute procedure extensions.moddatetime(updated_at);
```
- Composite PK `(user_id, dish_id)` makes upserts natural (`onConflict: 'user_id,dish_id'`).
- `dish_id` is `text` (matches our string ids) with **no FK** to a dishes table (dishes live in code). Orphaned rows for removed dishes are simply ignored by the client (same rule as today).
- `note` is length-capped **server-side** (`<= 2000`) in addition to the client cap, because the anon key + a valid JWT means any signed-in user can write directly to PostgREST — a client-only cap is trivially bypassed (S5). Consider a per-user row cap as a later hardening step.
- `updated_at` is maintained by the `moddatetime` trigger as an audit/debug column. **v1 does not consult it for conflict resolution** (server is authoritative — see §5); it exists so a future LWW upgrade is a non-breaking change.
- **Rule for any future table:** enable RLS on creation — an anon-key-reachable table without RLS is world-readable.

### 4.2 Repository — `src/data/progressRepo.ts`
Pure-ish mapping + thin async CRUD over the Supabase client:
- `rowToEntry(row) → { dishId, entry: ProgressEntry }` and `entryToRow(userId, dishId, entry)` — **pure, unit-tested**.
- `fetchAll(client, userId): Promise<UserProgress['entries']>`
- `upsertEntry(client, userId, dishId, entry): Promise<void>` (`upsert(..., { onConflict: 'user_id,dish_id' })`)
- `deleteEntry(client, userId, dishId): Promise<void>` — used when un-trying (which deletes the entry, see §5.0).
- `migrateInsert(client, userId, entries): Promise<void>` — bulk `upsert(rows, { onConflict: 'user_id,dish_id', ignoreDuplicates: true })` so migration **never clobbers** an existing server row.

## 5. Persistence & Sync Flow

The server is the **single source of truth** once signed in. The localStorage cache is a read accelerator (instant paint + offline reads), never a write buffer that gets replayed. Migration and steady-state are **two separate code paths** — conflating them was the root defect (S1).

### 5.0 Reducer change (removes the tombstone that caused S1)
`progressReducer` is changed so that **un-trying deletes the entry key** (`delete entries[dishId]`) rather than storing `{ tried: false }`. Consequences: `isTried` is unchanged (absent key = not tried); write-through can map "key present → upsert, key absent → delete" unambiguously; and there are no `{tried:false}` tombstones to be re-uploaded. (The existing reducer test that asserted `{tried:false}` is updated to assert key removal.)

### 5.1 Steady state (signed in, per account)
1. **Load — runs only when `user.id` changes** (not on every `user` object / token refresh):
   a. Capture `reqUserId = user.id`.
   b. Hydrate state from the localStorage cache for `reqUserId` (instant paint).
   c. Run **first-login migration if not yet done** for this account (§5.2), then `fetchAll(reqUserId)`.
   d. **Guard:** if `userIdRef.current !== reqUserId` when the async work resolves, **discard** the result (the user changed/signed out mid-flight — prevents S2 cross-user leak).
   e. **Apply with pending-overlay (prevents the initial-fetch clobber):** the server snapshot becomes the new base, but any `dishId` that has a **pending (unconfirmed) local write** in the per-dish write-through map (§5.1.2b) is overlaid from current local state (upsert → keep local entry, delete → keep it absent). So an edit the user makes *during* the fetch window is preserved, not reverted, without blocking writes. Dishes with no pending write take the server value. The merged result is written to state + cache.
2. **Mutation** (`toggleTried` / `setNote` / `setRating`), only allowed once `initializing` is false and a user is present:
   a. Optimistic update to state + cache.
   b. Per-`dishId` **coalesced + serialized** write-through: a short debounce per dish collapses rapid edits to a single terminal operation computed from the final state — `upsert` if the key is present, `delete` if absent — and each dish's writes are chained (await the previous) so a `try→untry` burst can't land out of order (S4).
   c. Offline / failed write: the change stays in the in-memory state + cache for the session but is **not** guaranteed to survive the next load (server-authoritative). Documented limitation, not a bug (§Non-Goals).
3. **Sign-out / user change:** clear pending per-dish timers and mark in-flight writes/loads stale (via the `reqUserId` guard), then clear in-memory state. The per-user cache is left intact on disk.

### 5.2 First-login migration (once per account)
Guarded by a persisted per-account flag `world-dishes:migrated:<userId>`:
- If the flag is set, skip entirely.
- Otherwise gather **local `tried` entries** from (a) the mock-era cache (`mock-user-1` key) **only if the global marker `world-dishes:mock-consumed` is unset**, and (b) any pre-existing cache under this user id, then `migrateInsert` them with `ignoreDuplicates: true` (never clobbers a server row).
- On success: set the per-account flag, and if the mock blob was consumed, **set `world-dishes:mock-consumed` and delete the `mock-user-1` blob**. This prevents a shared browser from seeding the same mock data into a second account.
- Because it runs **once per account** and uses insert-if-absent, it can never resurrect a row the user later deletes (S1) — after migration, steady-state never backfills from the cache.

### 5.3 Why this fixes the review findings
- **S1 (delete resurrection):** deletes are authoritative online; steady-state load *replaces* the cache; migration is once-only + insert-if-absent → nothing re-creates a deleted row.
- **S2 (async leak/clobber/refresh storm):** load keyed on `user.id`; `reqUserId` guard drops stale resolutions; timers cleared on user change; and the **pending-overlay** (§5.1.1e) preserves edits made during the initial fetch window so the server snapshot never reverts an in-flight optimistic write.
- **S3 (LWW):** claim dropped; server authoritative; `updated_at` kept as audit only.
- **S4 (ordering):** per-dish coalescing + serialization.

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
- No creds → mock provider (dev/CI). Creds present but offline → cache reads; writes are best-effort for the session (§5.1.2c).
- RLS denies cross-user access at the DB; the anon key alone grants nothing beyond policy. Note length is capped **server-side** (§4.1) since the write surface is public to any signed-in user.
- Un-trying deletes the row and the local key (§5.0).
- **OAuth return (corrected reasoning):** supabase-js v2 uses **PKCE**, so Google redirects back to `redirectTo` with a `?code=` query. `redirectTo` is the current app URL under the Pages base (`https://jochenrui.github.io/world-dishes/…`), which serves the real `index.html` (HTTP 200) — the `404.html` fallback is **not** involved. The `code_verifier` persisted in same-origin `localStorage` survives the round-trip, and `detectSessionInUrl` completes the exchange. The hard requirement is that Supabase's **Site URL + Redirect allowlist match exactly (including trailing slash)**, and that `http://localhost:5173` (dev) is allowlisted (§7).
- Rating constrained 1–5 at DB and in types; note capped at both layers.
- Signed-out users browse freely; write actions prompt sign-in (unchanged). During `initializing`, the UI shows a neutral auth state, not signed-out (§3.3).

## 9. Testing
- **Unit — mapping:** `rowToEntry` / `entryToRow` round-trip (incl. null note/rating, tried_at).
- **Unit — reducer:** un-try now **removes the key** (updated assertion); note/rating still imply tried.
- **Unit — migration selection:** the pure function that picks which local entries to migrate must:
  - include `tried` entries absent from the server,
  - **exclude** any `{tried:false}`-style/empty entries (guards the S1 tombstone case even if one sneaks in from an old cache),
  - and be a no-op when the migrated flag is set.
- **Unit — cross-device delete:** a table-driven case asserting that steady-state load (server replaces cache) does **not** re-create a dish the server no longer has, even when the local cache still contains it.
- Existing suite keeps passing on the mock path (no creds in CI); Supabase network wrappers are not unit-tested (thin), but the risk-bearing pure logic above is.

## 10. Milestones
1. Add dependency, `supabaseClient.ts`, env plumbing, `.env.example`/README.
2. `SupabaseAuthProvider` + factory + `SessionProvider` initializing state; remove GIS provider.
3. Migration SQL (table + RLS + note CHECK + moddatetime trigger) + `progressRepo.ts` + mapping tests.
4. Reducer change (un-try deletes key); rewire `ProgressContext` to server-authoritative steady state + once-only migration + async guards; consume `initializing`.
5. `docs/SETUP-SUPABASE.md`; wire GH Actions Variables into the build.
6. Tests, build, deploy.

## 11. Future / Deferred
- Realtime cross-device sync; explicit offline dirty-queue with retry/backoff.
- Server-side `note` length + profanity constraints; soft-delete/history.
- Moving dish content into the DB with an admin/editing surface.
