export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface AuthProvider {
  readonly mode: 'mock' | 'google';
  currentUser: User | null;
  /** Trigger sign-in. For GIS this shows the One-Tap prompt. */
  signIn(mountEl?: HTMLElement): void;
  signOut(): void;
  /** Primary source of truth. Fires immediately with current state, then on changes. Returns unsubscribe. */
  onChange(cb: (user: User | null) => void): () => void;
}
