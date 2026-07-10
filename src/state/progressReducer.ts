import type { ProgressEntry, Rating, UserProgress } from '../data/types';

export type ProgressAction =
  | { type: 'load'; progress: UserProgress }
  | { type: 'toggleTried'; dishId: string; now: string }
  | { type: 'toggleWishlist'; dishId: string; now: string }
  | { type: 'setNote'; dishId: string; note: string }
  | { type: 'setRating'; dishId: string; rating: Rating }
  | { type: 'reset' };

function deleteKey(state: UserProgress, dishId: string): UserProgress {
  const next = { ...state.entries };
  delete next[dishId];
  return { ...state, entries: next };
}

function withEntry(
  state: UserProgress,
  dishId: string,
  update: (prev: ProgressEntry) => ProgressEntry,
): UserProgress {
  const prev = state.entries[dishId] ?? { tried: false };
  return { ...state, entries: { ...state.entries, [dishId]: update(prev) } };
}

export function progressReducer(state: UserProgress, action: ProgressAction): UserProgress {
  switch (action.type) {
    case 'load':
      return action.progress;

    case 'toggleTried': {
      const existing = state.entries[action.dishId];
      if (existing?.tried) {
        // Un-trying drops the review fields. Key present IFF (tried || wishlistedAt):
        // if a wishlist intention is set we keep a {tried:false, wishlistedAt} row,
        // otherwise the entry becomes empty and its key is DELETED (maps to a DB
        // delete and can't be resurrected by a later sync).
        if (existing.wishlistedAt) {
          return withEntry(state, action.dishId, () => ({
            tried: false,
            wishlistedAt: existing.wishlistedAt,
          }));
        }
        return deleteKey(state, action.dishId);
      }
      // Marking tried consumes the want-to-try intention (clear wishlistedAt).
      return withEntry(state, action.dishId, (prev) => {
        const { wishlistedAt: _drop, ...rest } = prev;
        return { ...rest, tried: true, triedAt: action.now };
      });
    }

    case 'toggleWishlist': {
      const existing = state.entries[action.dishId];
      if (existing?.wishlistedAt) {
        // Un-wishlisting. Key present IFF (tried || wishlistedAt): keep the rest of
        // the entry if it's tried, otherwise DELETE the now-empty key.
        if (existing.tried) {
          const { wishlistedAt: _drop, ...rest } = existing;
          return withEntry(state, action.dishId, () => rest);
        }
        return deleteKey(state, action.dishId);
      }
      // Add the want-to-try intention; leave tried / other fields untouched.
      return withEntry(state, action.dishId, (prev) => ({
        ...prev,
        wishlistedAt: action.now,
      }));
    }

    case 'setNote':
      return withEntry(state, action.dishId, (prev) => ({
        ...prev,
        tried: true,
        note: action.note,
      }));

    case 'setRating':
      return withEntry(state, action.dishId, (prev) => ({
        ...prev,
        tried: true,
        rating: action.rating,
      }));

    case 'reset':
      return { ...state, entries: {} };

    default:
      return state;
  }
}
