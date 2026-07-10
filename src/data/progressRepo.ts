import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProgressEntry, Rating, UserProgress } from './types';

const TABLE = 'dish_progress';

export interface DishProgressRow {
  user_id: string;
  dish_id: string;
  tried: boolean;
  note: string | null;
  rating: number | null;
  tried_at: string | null;
  wishlisted_at: string | null;
}

type Entries = UserProgress['entries'];

// ── Pure mapping / merge helpers (unit-tested, no network) ─────────────────

export function rowToEntry(row: DishProgressRow): { dishId: string; entry: ProgressEntry } {
  const entry: ProgressEntry = { tried: row.tried };
  if (row.note != null) entry.note = row.note;
  if (row.rating != null) entry.rating = row.rating as Rating;
  if (row.tried_at != null) entry.triedAt = row.tried_at;
  // Note: entry.tried may be false here — a wishlist-only row is legitimate.
  if (row.wishlisted_at != null) entry.wishlistedAt = row.wishlisted_at;
  return { dishId: row.dish_id, entry };
}

export function entryToRow(userId: string, dishId: string, entry: ProgressEntry): DishProgressRow {
  return {
    user_id: userId,
    dish_id: dishId,
    tried: entry.tried,
    note: entry.note ?? null,
    rating: entry.rating ?? null,
    tried_at: entry.triedAt ?? null,
    wishlisted_at: entry.wishlistedAt ?? null,
  };
}

export function rowsToEntries(rows: DishProgressRow[]): Entries {
  const out: Entries = {};
  for (const row of rows) {
    const { dishId, entry } = rowToEntry(row);
    out[dishId] = entry;
  }
  return out;
}

/**
 * Entries eligible for first-login migration: genuinely-tried ones AND want-to-try
 * wishlist intentions (a legitimate `{tried:false, wishlistedAt}` row). Excludes any
 * empty / pure `{tried:false}` tombstone that might linger in an old cache
 * (guards against resurrecting a deleted dish).
 */
export function entriesToMigrate(local: Entries): Entries {
  const out: Entries = {};
  for (const [dishId, entry] of Object.entries(local)) {
    if (entry && (entry.tried === true || entry.wishlistedAt != null)) out[dishId] = entry;
  }
  return out;
}

/**
 * Steady-state apply: the server snapshot is authoritative, EXCEPT for dishes with
 * an in-flight local write (pending), which are overlaid from local state so an edit
 * made during the fetch window isn't reverted.
 */
export function overlayPending(server: Entries, local: Entries, pending: Set<string>): Entries {
  const merged: Entries = { ...server };
  for (const dishId of pending) {
    const localEntry = local[dishId];
    if (localEntry) merged[dishId] = localEntry;
    else delete merged[dishId]; // pending delete
  }
  return merged;
}

// ── Async CRUD (thin wrappers over Supabase) ───────────────────────────────

export async function fetchAll(client: SupabaseClient, userId: string): Promise<Entries> {
  const { data, error } = await client
    .from(TABLE)
    .select('user_id, dish_id, tried, note, rating, tried_at, wishlisted_at')
    .eq('user_id', userId);
  if (error) throw error;
  return rowsToEntries((data ?? []) as DishProgressRow[]);
}

export async function upsertEntry(
  client: SupabaseClient,
  userId: string,
  dishId: string,
  entry: ProgressEntry,
): Promise<void> {
  const { error } = await client
    .from(TABLE)
    .upsert(entryToRow(userId, dishId, entry), { onConflict: 'user_id,dish_id' });
  if (error) throw error;
}

export async function deleteEntry(
  client: SupabaseClient,
  userId: string,
  dishId: string,
): Promise<void> {
  const { error } = await client.from(TABLE).delete().eq('user_id', userId).eq('dish_id', dishId);
  if (error) throw error;
}

export interface DishStats {
  triedCount: number;
  ratingCount: number;
  avgRating: number | null;
  wishlistCount: number;
}

/** Raw `dish_stats` view row (all columns nullable from the aggregate). */
export interface DishStatsRow {
  tried_count: number | null;
  rating_count: number | null;
  avg_rating: number | string | null;
  wishlist_count: number | null;
}

/** Pure row→DishStats mapping (unit-tested, no network). Nulls → 0 / null avg. */
export function toDishStats(row: DishStatsRow): DishStats {
  return {
    triedCount: row.tried_count ?? 0,
    ratingCount: row.rating_count ?? 0,
    avgRating: row.avg_rating != null ? Number(row.avg_rating) : null,
    wishlistCount: row.wishlist_count ?? 0,
  };
}

/** Aggregate community stats for one dish (null if unavailable / none yet). */
export async function fetchDishStats(
  client: SupabaseClient,
  dishId: string,
): Promise<DishStats | null> {
  const { data, error } = await client
    .from('dish_stats')
    .select('tried_count, rating_count, avg_rating, wishlist_count')
    .eq('dish_id', dishId)
    .maybeSingle();
  if (error || !data) return null;
  return toDishStats(data as DishStatsRow);
}

/** Bulk insert-if-absent for migration — never clobbers an existing server row. */
export async function migrateInsert(
  client: SupabaseClient,
  userId: string,
  entries: Entries,
): Promise<void> {
  const rows = Object.entries(entries).map(([dishId, entry]) => entryToRow(userId, dishId, entry));
  if (rows.length === 0) return;
  const { error } = await client
    .from(TABLE)
    .upsert(rows, { onConflict: 'user_id,dish_id', ignoreDuplicates: true });
  if (error) throw error;
}
