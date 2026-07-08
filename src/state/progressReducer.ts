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

    case 'toggleTried':
      return withEntry(state, action.dishId, (prev) => {
        if (prev.tried) {
          // Un-trying clears the whole entry (note, rating, timestamp).
          return { tried: false };
        }
        return { ...prev, tried: true, triedAt: action.now };
      });

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
