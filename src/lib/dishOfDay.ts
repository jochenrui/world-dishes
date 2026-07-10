import type { Dish } from '../data/types';

/**
 * Local calendar day as `YYYY-MM-DD`.
 *
 * Uses the LOCAL getFullYear/getMonth/getDate (not UTC/ISO) on purpose: a "day"
 * is the viewer's calendar day, so the featured dish rolls over at the viewer's
 * local midnight rather than at UTC midnight. Month is 0-based, so we +1 and
 * zero-pad both month and day to two digits.
 */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Stable 32-bit FNV-1a hash of a string. Deterministic and dependency-free —
 * no Math.random, no Date. The same string always maps to the same number,
 * across calls and across machines.
 */
function hashString(key: string): number {
  let h = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    // FNV prime multiply via shifts, kept in 32-bit unsigned range.
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}

/**
 * Deterministic "dish of the day" pick: the given `key` (typically a `dayKey`)
 * is hashed to an index into `dishes`. Pure and deterministic — the same key
 * always yields the same dish, and no time/randomness is read inside. Returns
 * null for an empty list.
 */
export function dishOfTheDay(dishes: Dish[], key: string): Dish | null {
  if (dishes.length === 0) return null;
  const index = hashString(key) % dishes.length;
  return dishes[index];
}
