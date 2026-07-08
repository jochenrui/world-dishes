import type { UserProgress } from '../data/types';

export const PROGRESS_VERSION = 1;

const KEY_PREFIX = 'world-dishes:progress:';
const MIGRATED_PREFIX = 'world-dishes:migrated:';
const MOCK_CONSUMED_KEY = 'world-dishes:mock-consumed';

/** Cache key used by the mock auth session; its data is migrated on first real sign-in. */
export const MOCK_USER_ID = 'mock-user-1';

export function emptyProgress(): UserProgress {
  return { version: PROGRESS_VERSION, entries: {} };
}

function keyFor(userId: string): string {
  return `${KEY_PREFIX}${userId}`;
}

/** Loads progress for a user, recovering gracefully from missing/corrupt data. */
export function loadProgress(userId: string): UserProgress {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<UserProgress>;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      typeof parsed.entries !== 'object' ||
      parsed.entries === null
    ) {
      console.warn('[storage] Corrupt progress, resetting.');
      return emptyProgress();
    }
    // Future migrations keyed on parsed.version would go here.
    return { version: PROGRESS_VERSION, entries: parsed.entries as UserProgress['entries'] };
  } catch (e) {
    console.warn('[storage] Failed to read progress, resetting.', e);
    return emptyProgress();
  }
}

export function saveProgress(userId: string, progress: UserProgress): void {
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(progress));
  } catch (e) {
    console.warn('[storage] Failed to persist progress.', e);
  }
}

export function clearProgress(userId: string): void {
  try {
    localStorage.removeItem(keyFor(userId));
  } catch {
    /* ignore */
  }
}

// ── First-login migration flags ────────────────────────────────────────────

export function isMigrated(userId: string): boolean {
  try {
    return localStorage.getItem(MIGRATED_PREFIX + userId) === '1';
  } catch {
    return false;
  }
}

export function setMigrated(userId: string): void {
  try {
    localStorage.setItem(MIGRATED_PREFIX + userId, '1');
  } catch {
    /* ignore */
  }
}

/** Global marker so the mock blob seeds at most one account on a shared browser. */
export function isMockConsumed(): boolean {
  try {
    return localStorage.getItem(MOCK_CONSUMED_KEY) === '1';
  } catch {
    return false;
  }
}

export function setMockConsumed(): void {
  try {
    localStorage.setItem(MOCK_CONSUMED_KEY, '1');
  } catch {
    /* ignore */
  }
}
