import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import type { ReactNode } from 'react';
import type { ProgressEntry, Rating, UserProgress } from '../data/types';
import {
  MOCK_USER_ID,
  PROGRESS_VERSION,
  clearProgress,
  emptyProgress,
  isMigrated,
  isMockConsumed,
  loadProgress,
  saveProgress,
  setMigrated,
  setMockConsumed,
} from './storage';
import { progressReducer } from './progressReducer';
import { useSession } from './SessionContext';
import { getSupabase } from '../lib/supabaseClient';
import {
  deleteEntry,
  entriesToMigrate,
  fetchAll,
  migrateInsert,
  overlayPending,
  upsertEntry,
} from '../data/progressRepo';

interface ProgressValue {
  isAuthenticated: boolean;
  entries: UserProgress['entries'];
  get: (dishId: string) => ProgressEntry | undefined;
  isTried: (dishId: string) => boolean;
  isWishlisted: (dishId: string) => boolean;
  triedCount: (dishIds: string[]) => number;
  toggleTried: (dishId: string) => void;
  toggleWishlist: (dishId: string) => void;
  setNote: (dishId: string, note: string) => void;
  setRating: (dishId: string, rating: Rating) => void;
}

const ProgressContext = createContext<ProgressValue | null>(null);

const WRITE_DEBOUNCE_MS = 400;

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user, initializing } = useSession();
  const [state, dispatch] = useReducer(progressReducer, emptyProgress());

  const clientRef = useRef(getSupabase());
  const userIdRef = useRef<string | null>(null);
  const entriesRef = useRef(state.entries);
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const chainsRef = useRef(new Map<string, Promise<void>>());
  const pendingRef = useRef(new Set<string>()); // dishes with an unconfirmed write

  // Mirror the latest entries so deferred writes read the final value.
  useEffect(() => {
    entriesRef.current = state.entries;
  }, [state.entries]);

  // Load / sync whenever the signed-in user id changes (NOT on token-refresh
  // object identity changes) and only after auth has initialized.
  useEffect(() => {
    if (initializing) return;
    const client = clientRef.current;
    const uid = user?.id ?? null;
    userIdRef.current = uid;

    // Cancel any pending writes from the previous user.
    for (const t of timersRef.current.values()) clearTimeout(t);
    timersRef.current.clear();
    chainsRef.current.clear();
    pendingRef.current.clear();

    if (!uid) {
      dispatch({ type: 'reset' });
      return;
    }

    // Instant paint from cache.
    dispatch({ type: 'load', progress: loadProgress(uid) });

    if (!client) return; // mock mode: local-only, no server

    const reqUserId = uid;
    let cancelled = false;
    (async () => {
      try {
        if (!isMigrated(reqUserId)) {
          const own = entriesToMigrate(loadProgress(reqUserId).entries);
          let toMigrate = { ...own };
          let usedMock = false;
          if (!isMockConsumed()) {
            const mock = entriesToMigrate(loadProgress(MOCK_USER_ID).entries);
            if (Object.keys(mock).length) {
              toMigrate = { ...mock, ...toMigrate };
              usedMock = true;
            }
          }
          if (Object.keys(toMigrate).length) await migrateInsert(client, reqUserId, toMigrate);
          setMigrated(reqUserId);
          if (usedMock) {
            setMockConsumed();
            clearProgress(MOCK_USER_ID);
          }
        }

        const server = await fetchAll(client, reqUserId);
        // Guard: bail if the user changed/signed out while we were fetching.
        if (cancelled || userIdRef.current !== reqUserId) return;
        const merged = overlayPending(server, entriesRef.current, pendingRef.current);
        dispatch({ type: 'load', progress: { version: PROGRESS_VERSION, entries: merged } });
      } catch (e) {
        console.warn('[progress] initial sync failed; using local cache.', e);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, initializing]);

  // Persist the in-memory state to the per-user cache (debounced).
  useEffect(() => {
    const uid = userIdRef.current;
    if (!uid) return;
    const t = setTimeout(() => saveProgress(uid, state), 200);
    return () => clearTimeout(t);
  }, [state]);

  // Per-dish coalesced + serialized write-through to the server.
  const scheduleWrite = (dishId: string) => {
    const client = clientRef.current;
    if (!client) return; // mock mode persists via the cache effect only
    pendingRef.current.add(dishId);
    const timers = timersRef.current;
    const existing = timers.get(dishId);
    if (existing) clearTimeout(existing);
    timers.set(
      dishId,
      setTimeout(() => {
        timers.delete(dishId);
        const reqUserId = userIdRef.current;
        if (!reqUserId) {
          pendingRef.current.delete(dishId);
          return;
        }
        const entry = entriesRef.current[dishId];
        const prev = chainsRef.current.get(dishId) ?? Promise.resolve();
        const next = prev
          .then(async () => {
            if (userIdRef.current !== reqUserId) return;
            if (entry) await upsertEntry(client, reqUserId, dishId, entry);
            else await deleteEntry(client, reqUserId, dishId);
          })
          .catch((e) => console.warn('[progress] write failed for', dishId, e))
          .finally(() => {
            // Settled only if no newer write was queued for this dish.
            if (!timers.has(dishId)) pendingRef.current.delete(dishId);
          });
        chainsRef.current.set(dishId, next);
      }, WRITE_DEBOUNCE_MS),
    );
  };

  const value = useMemo<ProgressValue>(() => {
    const nowIso = () => new Date().toISOString();
    const canWrite = () => !!userIdRef.current;
    return {
      isAuthenticated: !!user,
      entries: state.entries,
      get: (dishId) => state.entries[dishId],
      isTried: (dishId) => !!state.entries[dishId]?.tried,
      isWishlisted: (dishId) => !!state.entries[dishId]?.wishlistedAt,
      triedCount: (dishIds) => dishIds.reduce((n, id) => (state.entries[id]?.tried ? n + 1 : n), 0),
      toggleTried: (dishId) => {
        if (!canWrite()) return;
        dispatch({ type: 'toggleTried', dishId, now: nowIso() });
        scheduleWrite(dishId);
      },
      toggleWishlist: (dishId) => {
        if (!canWrite()) return;
        dispatch({ type: 'toggleWishlist', dishId, now: nowIso() });
        scheduleWrite(dishId);
      },
      setNote: (dishId, note) => {
        if (!canWrite()) return;
        dispatch({ type: 'setNote', dishId, note });
        scheduleWrite(dishId);
      },
      setRating: (dishId, rating) => {
        if (!canWrite()) return;
        dispatch({ type: 'setRating', dishId, rating });
        scheduleWrite(dishId);
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.entries, user]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
