import type { AuthProvider, User } from './types';

const MOCK_SESSION_KEY = 'world-dishes:mock-session';

const MOCK_USER: User = {
  id: 'mock-user-1',
  name: 'Ada Traveler',
  email: 'ada.traveler@example.com',
  // Inline SVG avatar (no network) — a simple globe monogram.
  avatarUrl:
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72">
        <rect width="72" height="72" rx="36" fill="#d1462f"/>
        <text x="36" y="47" font-family="system-ui" font-size="34" fill="#fff" text-anchor="middle">A</text>
      </svg>`,
    ),
};

/**
 * Fake auth used until VITE_GOOGLE_CLIENT_ID is provided. Persists a "signed in"
 * flag so the mock session survives reloads, matching real-auth behaviour.
 */
export class MockAuthProvider implements AuthProvider {
  readonly mode = 'mock' as const;
  currentUser: User | null = null;
  private listeners = new Set<(u: User | null) => void>();

  constructor() {
    try {
      if (localStorage.getItem(MOCK_SESSION_KEY) === '1') {
        this.currentUser = MOCK_USER;
      }
    } catch {
      /* localStorage unavailable — stay signed out */
    }
  }

  signIn(): void {
    this.currentUser = MOCK_USER;
    try {
      localStorage.setItem(MOCK_SESSION_KEY, '1');
    } catch {
      /* ignore */
    }
    this.emit();
  }

  signOut(): void {
    this.currentUser = null;
    try {
      localStorage.removeItem(MOCK_SESSION_KEY);
    } catch {
      /* ignore */
    }
    this.emit();
  }

  onChange(cb: (u: User | null) => void): () => void {
    this.listeners.add(cb);
    cb(this.currentUser);
    return () => this.listeners.delete(cb);
  }

  private emit(): void {
    for (const cb of this.listeners) cb(this.currentUser);
  }
}
