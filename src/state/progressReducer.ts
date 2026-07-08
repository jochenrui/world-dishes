import type { ProgressEntry, Rating, UserProgress } from '../data/types';

export type ProgressAction =
  | { type: 'load'; progress: UserProgress }
  | { type: 'toggleTried'; dishId: string; now: string }
  | { type: 'setNote'; dishId: string; note: string }
  | { type: 'setRating'; dishId: string; rating: Rating }
  | { type: 'reset' };

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
        // Un-trying deletes the entry entirely (no {tried:false} tombstone) so it
        // maps cleanly to a DB delete and can't be resurrected by a later sync.
        const next = { ...state.entries };
        delete next[action.dishId];
        return { ...state, entries: next };
      }
      return withEntry(state, action.dishId, (prev) => ({
        ...prev,
        tried: true,
        triedAt: action.now,
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
