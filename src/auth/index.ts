import type { AuthProvider } from './types';
import { MockAuthProvider } from './mockAuth';
import { SupabaseAuthProvider } from './supabaseAuth';
import { getSupabase } from '../lib/supabaseClient';

export type { AuthProvider, User } from './types';

/**
 * Picks the auth implementation at startup:
 *  - VITE_SUPABASE_* configured -> real Google sign-in via Supabase
 *  - otherwise                  -> mock provider (dev / CI, no credentials needed)
 */
export function createAuthProvider(): AuthProvider {
  const supabase = getSupabase();
  if (supabase) return new SupabaseAuthProvider(supabase);
  return new MockAuthProvider();
}
