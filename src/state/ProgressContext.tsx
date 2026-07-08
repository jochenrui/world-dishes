import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import type { ReactNode } from 'react';
import type { ProgressEntry, Rating, UserProgress } from '../data/types';
import { emptyProgress, loadProgress, saveProgress } from './storage';
import { progressReducer } from './progressReducer';
import { useSession } from './SessionContext';

interface ProgressValue {
  /** null when signed out — callers should gate write actions on this. */
  isAuthenticated: boolean;
  entries: UserProgress['entries'];
  get: (dishId: string) => ProgressEntry | undefined;
  isTried: (dishId: string) => boolean;
  triedCount: (dishIds: string[]) => number;
  toggleTried: (dishId: string) => void;
  setNote: (dishId: string, note: string) => void;
  setRating: (dishId: string, rating: Rating) => void;
}

const ProgressContext = createContext<ProgressValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const [state, dispatch] = useReducer(progressReducer, emptyProgress());
  const userIdRef = useRef<string | null>(null);

  // Load (or clear) progress whenever the signed-in user changes.
  useEffect(() => {
    userIdRef.current = user?.id ?? null;
    if (user) {
      dispatch({ type: 'load', progress: loadProgress(user.id) });
    } else {
      dispatch({ type: 'reset' });
    }
  }, [user]);

  // Persist on change (debounced), only for the current authenticated user.
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (!user) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveProgress(user.id, state), 200);
    return () => clearTimeout(saveTimer.current);
  }, [state, user]);

  const requireAuth = useCallback((): boolean => {
    if (!userIdRef.current) {
      console.info('[progress] Action ignored — not signed in.');
      return false;
    }
    return true;
  }, []);

  const value = useMemo<ProgressValue>(() => {
    const nowIso = () => new Date().toISOString();
    return {
      isAuthenticated: !!user,
      entries: state.entries,
      get: (dishId) => state.entries[dishId],
      isTried: (dishId) => !!state.entries[dishId]?.tried,
      triedCount: (dishIds) => dishIds.reduce((n, id) => (state.entries[id]?.tried ? n + 1 : n), 0),
      toggleTried: (dishId) => {
        if (requireAuth()) dispatch({ type: 'toggleTried', dishId, now: nowIso() });
      },
      setNote: (dishId, note) => {
        if (requireAuth()) dispatch({ type: 'setNote', dishId, note });
      },
      setRating: (dishId, rating) => {
        if (requireAuth()) dispatch({ type: 'setRating', dishId, rating });
      },
    };
  }, [state.entries, user, requireAuth]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
