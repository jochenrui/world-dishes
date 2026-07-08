import type { AuthProvider } from './types';
import { MockAuthProvider } from './mockAuth';
import { GoogleAuthProvider } from './googleAuth';

export type { AuthProvider, User } from './types';

/**
 * Picks the auth implementation at startup:
 *  - VITE_GOOGLE_CLIENT_ID present  -> real Google Identity Services
 *  - otherwise                      -> mock provider
 */
export function createAuthProvider(): AuthProvider {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  if (clientId && clientId.trim().length > 0) {
    return new GoogleAuthProvider(clientId.trim());
  }
  return new MockAuthProvider();
}
