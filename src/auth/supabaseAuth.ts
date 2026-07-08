import type { SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import type { AuthProvider, User } from './types';

function toUser(u: SupabaseUser): User {
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  const name = (meta.full_name as string) || (meta.name as string) || u.email || 'Signed-in user';
  return {
    id: u.id,
    name,
    email: u.email ?? '',
    avatarUrl: (meta.avatar_url as string) || (meta.picture as string) || '',
  };
}

/**
 * Real Google sign-in via Supabase. Supabase verifies the Google token server-side
 * and issues its own session; identity is trustworthy (unlike the old client-side
 * GIS decode). Active when VITE_SUPABASE_* are configured.
 *
 * onChange relies on Supabase's onAuthStateChange, which emits INITIAL_SESSION once
 * the persisted session is restored (async) — that first emission is what lets the
 * app leave its "initializing" state without flashing signed-out.
 */
export class SupabaseAuthProvider implements AuthProvider {
  readonly mode = 'google' as const;
  currentUser: User | null = null;

  constructor(private client: SupabaseClient) {}

  signIn(): void {
    // Return to the exact page the user signed in from (deep links preserved).
    this.client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href },
    });
  }

  signOut(): void {
    void this.client.auth.signOut();
  }

  onChange(cb: (user: User | null) => void): () => void {
    const { data } = this.client.auth.onAuthStateChange((_event, session) => {
      this.currentUser = session?.user ? toUser(session.user) : null;
      cb(this.currentUser);
    });
    return () => data.subscription.unsubscribe();
  }
}
