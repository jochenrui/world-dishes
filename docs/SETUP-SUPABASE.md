# Setup: real Google login + database (Supabase)

The app runs fine with **no** setup — it uses a mock login and stores progress in your
browser. To turn on **real Google sign-in** and a **shared database**, do the following
one-time steps. Nothing here requires changing app code.

Your production URL is assumed to be `https://jochenrui.github.io/world-dishes/`. Adjust if
you deploy elsewhere. Note the **trailing slash** — it matters for the OAuth allowlist.

---

## 1. Create a Supabase project
1. Sign in at <https://supabase.com> → **New project**.
2. Once it's provisioned, go to **Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API keys → `anon` `public`** → `VITE_SUPABASE_ANON_KEY`
   (The anon key is safe to expose publicly; Row-Level Security protects the data.)

## 2. Create the database table
1. Open **SQL Editor** in the Supabase dashboard.
2. Paste the contents of [`supabase/migrations/0001_dish_progress.sql`](../supabase/migrations/0001_dish_progress.sql) and **Run**.
3. Confirm under **Table Editor** that `dish_progress` exists and shows the shield icon (RLS enabled).

## 3. Create a Google OAuth client
1. Go to <https://console.cloud.google.com/apis/credentials> (create/select a project).
2. **Create Credentials → OAuth client ID → Web application**.
3. Under **Authorized redirect URIs**, add your Supabase auth callback:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   (Find `<your-project-ref>` in your Supabase Project URL.)
4. Save, then copy the **Client ID** and **Client secret**.
   - You may need to configure the OAuth consent screen first (External, add your email as a test user).

## 4. Wire Google into Supabase
1. Supabase dashboard → **Authentication → Providers → Google** → enable.
2. Paste the **Client ID** and **Client secret** from step 3. Save.

## 5. Set the redirect allowlist (exact match, incl. trailing slash)
Supabase dashboard → **Authentication → URL Configuration**:
- **Site URL:** `https://jochenrui.github.io/world-dishes/`
- **Redirect URLs:** add both
  ```
  https://jochenrui.github.io/world-dishes/
  http://localhost:5173/
  ```
  (The second lets sign-in work during local development.)

## 6. Provide the env vars
**Local development** — create `.env.local` (see `.env.example`):
```
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```
Restart `npm run dev`.

**Production (GitHub Pages)** — add them as repository **Variables** (not Secrets — both are
public-safe), so the GitHub Actions build includes them:
- GitHub repo → **Settings → Secrets and variables → Actions → Variables → New repository variable**
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Re-run the deploy workflow (or push) to rebuild with them.

---

## How it behaves
- **No env vars:** mock login, progress saved only in the browser (`localStorage`).
- **Env vars set:** real Google sign-in; progress saved to Postgres and readable across your
  devices. Any progress you accumulated under the mock login is migrated into your account the
  first time you sign in for real.

## Security notes
- Data isolation is enforced by **Row-Level Security** — every policy scopes rows to
  `auth.uid() = user_id`. The anon key alone grants nothing beyond those policies.
- **Any future table** you add must have RLS enabled, or it becomes world-readable via the anon key.
