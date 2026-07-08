import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

/**
 * Returns a singleton Supabase client, or null when the app is unconfigured
 * (no VITE_SUPABASE_* env). Null => the app falls back to mock auth + local-only
 * storage, so local dev and CI need no credentials.
 *
 * The anon key is intentionally shipped in the client bundle; data isolation is
 * enforced by Postgres Row-Level Security, not by hiding the key.
 */
export function getSupabase(): SupabaseClient | null {
  if (client) return client;
  if (!url || !anonKey) return null;
  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      autoRefreshToken: true,
      flowType: 'pkce',
    },
  });
  return client;
}

export const isSupabaseConfigured = Boolean(url && anonKey);
