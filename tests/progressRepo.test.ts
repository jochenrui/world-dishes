import { describe, expect, it } from 'vitest';
import {
  entriesToMigrate,
  entryToRow,
  overlayPending,
  rowToEntry,
  rowsToEntries,
  toDishStats,
} from '../src/data/progressRepo';
import type { ProgressEntry } from '../src/data/types';

describe('progressRepo mapping', () => {
  it('round-trips a full entry (incl. wishlistedAt) through row and back', () => {
    const entry: ProgressEntry = {
      tried: true,
      note: 'great',
      rating: 4,
      triedAt: '2026-07-08T00:00:00.000Z',
      wishlistedAt: '2026-07-07T00:00:00.000Z',
    };
    const row = entryToRow('u1', 'jp-sushi', entry);
    expect(row).toEqual({
      user_id: 'u1',
      dish_id: 'jp-sushi',
      tried: true,
      note: 'great',
      rating: 4,
      tried_at: '2026-07-08T00:00:00.000Z',
      wishlisted_at: '2026-07-07T00:00:00.000Z',
    });
    expect(rowToEntry(row)).toEqual({ dishId: 'jp-sushi', entry });
  });

  it('round-trips a wishlist-only (tried:false) row', () => {
    const entry: ProgressEntry = { tried: false, wishlistedAt: '2026-07-07T00:00:00.000Z' };
    const row = entryToRow('u1', 'th-padthai', entry);
    expect(row).toEqual({
      user_id: 'u1',
      dish_id: 'th-padthai',
      tried: false,
      note: null,
      rating: null,
      tried_at: null,
      wishlisted_at: '2026-07-07T00:00:00.000Z',
    });
    expect(rowToEntry(row)).toEqual({ dishId: 'th-padthai', entry });
  });

  it('maps null note/rating/tried_at/wishlisted_at to absent fields', () => {
    const { entry } = rowToEntry({
      user_id: 'u1',
      dish_id: 'it-pizza',
      tried: true,
      note: null,
      rating: null,
      tried_at: null,
      wishlisted_at: null,
    });
    expect(entry).toEqual({ tried: true });
  });

  it('rowsToEntries builds a keyed map', () => {
    const entries = rowsToEntries([
      { user_id: 'u1', dish_id: 'a', tried: true, note: null, rating: null, tried_at: null, wishlisted_at: null },
      { user_id: 'u1', dish_id: 'b', tried: true, note: 'x', rating: 3, tried_at: null, wishlisted_at: null },
    ]);
    expect(Object.keys(entries)).toEqual(['a', 'b']);
    expect(entries.b).toEqual({ tried: true, note: 'x', rating: 3 });
  });
});

describe('toDishStats (community stats mapping)', () => {
  it('maps a full row incl. wishlist_count', () => {
    expect(
      toDishStats({ tried_count: 12, rating_count: 8, avg_rating: 4.2, wishlist_count: 5 }),
    ).toEqual({ triedCount: 12, ratingCount: 8, avgRating: 4.2, wishlistCount: 5 });
  });

  it('coerces a string avg_rating (numeric from the view) to a number', () => {
    expect(
      toDishStats({ tried_count: 3, rating_count: 2, avg_rating: '3.5', wishlist_count: 1 }),
    ).toEqual({ triedCount: 3, ratingCount: 2, avgRating: 3.5, wishlistCount: 1 });
  });

  it('maps null counts to 0 and null avg_rating to null', () => {
    expect(
      toDishStats({ tried_count: null, rating_count: null, avg_rating: null, wishlist_count: null }),
    ).toEqual({ triedCount: 0, ratingCount: 0, avgRating: null, wishlistCount: 0 });
  });

  it('handles a wishlist-only dish (no tries/ratings yet)', () => {
    expect(
      toDishStats({ tried_count: 0, rating_count: 0, avg_rating: null, wishlist_count: 7 }),
    ).toEqual({ triedCount: 0, ratingCount: 0, avgRating: null, wishlistCount: 7 });
  });
});

describe('entriesToMigrate', () => {
  it('includes tried AND wishlist-only entries, excludes {tried:false} tombstones', () => {
    const out = entriesToMigrate({
      'a': { tried: true, rating: 5 },
      'b': { tried: false } as ProgressEntry, // legacy tombstone
      'c': { tried: true },
      'd': { tried: false, wishlistedAt: '2026-07-07T00:00:00.000Z' }, // wishlist-only intention
    });
    expect(Object.keys(out).sort()).toEqual(['a', 'c', 'd']);
  });

  it('is empty for empty input', () => {
    expect(entriesToMigrate({})).toEqual({});
  });
});

describe('overlayPending (steady-state apply)', () => {
  it('does NOT resurrect a dish deleted on another device (server-authoritative)', () => {
    const server = { 'a': { tried: true } };
    const localCache = { 'a': { tried: true }, 'b': { tried: true } }; // b deleted elsewhere
    const merged = overlayPending(server, localCache, new Set()); // no pending writes
    expect('b' in merged).toBe(false);
    expect(merged).toEqual({ 'a': { tried: true } });
  });

  it('preserves an in-flight optimistic upsert made during the fetch', () => {
    const server = { 'a': { tried: true } };
    const local = { 'a': { tried: true }, 'x': { tried: true, note: 'just added' } };
    const merged = overlayPending(server, local, new Set(['x']));
    expect(merged.x).toEqual({ tried: true, note: 'just added' });
  });

  it('preserves an in-flight optimistic delete made during the fetch', () => {
    const server = { 'a': { tried: true }, 'y': { tried: true } };
    const local = { 'a': { tried: true } }; // y removed locally, delete pending
    const merged = overlayPending(server, local, new Set(['y']));
    expect('y' in merged).toBe(false);
  });
});
