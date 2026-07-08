import type { UserProgress } from '../data/types';

export const PROGRESS_VERSION = 1;

const KEY_PREFIX = 'world-dishes:progress:';

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
