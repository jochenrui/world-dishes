import type { AuthProvider, User } from './types';

const GIS_SRC = 'https://accounts.google.com/gsi/client';
const GOOGLE_SESSION_KEY = 'world-dishes:google-session';

interface GoogleCredentialResponse {
  credential: string;
}

/** Minimal shape of the JWT payload we read (all cosmetic — unverified). */
interface GoogleJwtPayload {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: {
            client_id: string;
            callback: (r: GoogleCredentialResponse) => void;
            auto_select?: boolean;
          }): void;
          prompt(): void;
          disableAutoSelect(): void;
        };
      };
    };
  }
}

function decodeJwt(token: string): GoogleJwtPayload | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as GoogleJwtPayload;
  } catch {
    return null;
  }
}

function toUser(payload: GoogleJwtPayload): User {
  return {
    id: payload.sub,
    name: payload.name ?? payload.email ?? 'Google User',
    email: payload.email ?? '',
    avatarUrl: payload.picture ?? '',
  };
}

/**
 * Real Google Identity Services sign-in — active when VITE_GOOGLE_CLIENT_ID is set.
 *
 * IMPORTANT: identity is decoded client-side and NOT verified (no signature/aud/exp
 * check). It only derives a stable user id (`sub`) to key personalization. This is
 * not authentication in a security sense; add a backend to verify the token.
 */
export class GoogleAuthProvider implements AuthProvider {
  readonly mode = 'google' as const;
  currentUser: User | null = null;
  private listeners = new Set<(u: User | null) => void>();
  private ready: Promise<void>;

  constructor(private clientId: string) {
    // Restore a cached session immediately (so reloads don't flash signed-out).
    try {
      const cached = localStorage.getItem(GOOGLE_SESSION_KEY);
      if (cached) this.currentUser = JSON.parse(cached) as User;
    } catch {
      /* ignore */
    }
    this.ready = this.loadScript();
  }

  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) return resolve();
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
      const onLoad = () => {
        window.google!.accounts.id.initialize({
          client_id: this.clientId,
          callback: (r) => this.handleCredential(r),
          auto_select: true,
        });
        resolve();
      };
      if (existing) {
        existing.addEventListener('load', onLoad);
        existing.addEventListener('error', () => reject(new Error('GIS failed to load')));
        return;
      }
      const script = document.createElement('script');
      script.src = GIS_SRC;
      script.async = true;
      script.defer = true;
      script.onload = onLoad;
      script.onerror = () => reject(new Error('GIS failed to load'));
      document.head.appendChild(script);
    });
  }

  private handleCredential(r: GoogleCredentialResponse): void {
    const payload = decodeJwt(r.credential);
    if (!payload) return;
    this.currentUser = toUser(payload);
    try {
      localStorage.setItem(GOOGLE_SESSION_KEY, JSON.stringify(this.currentUser));
    } catch {
      /* ignore */
    }
    this.emit();
  }

  signIn(): void {
    this.ready
      .then(() => window.google?.accounts.id.prompt())
      .catch((e) => console.error('[auth] Google sign-in unavailable:', e));
  }

  signOut(): void {
    this.currentUser = null;
    try {
      localStorage.removeItem(GOOGLE_SESSION_KEY);
      window.google?.accounts.id.disableAutoSelect();
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
