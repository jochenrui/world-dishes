import { describe, expect, it } from 'vitest';
import { deriveStats } from '../src/lib/deriveStats';
import type { Dish, ProgressEntry, UserProgress } from '../src/data/types';

/** Minimal synthetic dish; `jp` keeps a real countryId so continent lookup resolves. */
function dish(id: string, over: Partial<Dish> = {}): Dish {
  return {
    id,
    name: id,
    countryId: 'jp',
    category: 'noodles',
    dietary: { base: 'meat', containsPork: false, containsBeef: false, containsAlcohol: false },
    allergens: [],
    spiceLevel: 0,
    popularityRank: 1,
    description: '',
    origin: '',
    ...over,
  };
}

function progress(map: Record<string, ProgressEntry>): UserProgress['entries'] {
  return map;
}

describe('deriveStats', () => {
  it('is empty for no progress', () => {
    const s = deriveStats({}, [dish('a')]);
    expect(s.totalTried).toBe(0);
    expect(s.timeline).toHaveLength(0);
    expect(s.undated).toHaveLength(0);
    expect(s.ratedCount).toBe(0);
    expect(s.ratingCounts).toEqual([0, 0, 0, 0, 0]);
  });

  it('groups by month, most-recent month first', () => {
    const list = [dish('a'), dish('b'), dish('c')];
    const s = deriveStats(
      progress({
        a: { tried: true, triedAt: '2026-05-10T12:00:00.000Z' },
        b: { tried: true, triedAt: '2026-07-01T09:00:00.000Z' },
        c: { tried: true, triedAt: '2026-07-20T18:00:00.000Z' },
      }),
      list,
    );
    expect(s.timeline.map((m) => m.key)).toEqual(['2026-07', '2026-05']);
    expect(s.timeline[0].label).toBe('July 2026');
    expect(s.timeline[1].label).toBe('May 2026');
    // Within July, most-recent triedAt first (c before b).
    expect(s.timeline[0].dishes.map((d) => d.dish.id)).toEqual(['c', 'b']);
    expect(s.timeline[0].dishes).toHaveLength(2);
  });

  it('routes tried-but-undated dishes to the undated bucket, never a month', () => {
    const list = [dish('a'), dish('b')];
    const s = deriveStats(
      progress({
        a: { tried: true, triedAt: '2026-07-01T09:00:00.000Z' },
        b: { tried: true }, // no triedAt
      }),
      list,
    );
    expect(s.timeline).toHaveLength(1);
    expect(s.undated.map((d) => d.id)).toEqual(['b']);
    // Undated dish must not leak into any month bucket.
    expect(s.timeline.flatMap((m) => m.dishes.map((d) => d.dish.id))).toEqual(['a']);
    expect(s.totalTried).toBe(2);
  });

  it('treats an unparseable triedAt as undated', () => {
    const s = deriveStats(
      progress({ a: { tried: true, triedAt: 'not-a-date' } }),
      [dish('a')],
    );
    expect(s.timeline).toHaveLength(0);
    expect(s.undated.map((d) => d.id)).toEqual(['a']);
  });

  it('ignores progress entries for unknown dish ids', () => {
    const s = deriveStats(
      progress({
        a: { tried: true, triedAt: '2026-07-01T09:00:00.000Z' },
        ghost: { tried: true, triedAt: '2026-07-01T09:00:00.000Z' },
      }),
      [dish('a')],
    );
    expect(s.totalTried).toBe(1);
    expect(s.timeline[0].dishes).toHaveLength(1);
  });

  it('only counts dishes that are actually tried', () => {
    const s = deriveStats(
      progress({ a: { tried: true }, b: { tried: false } }),
      [dish('a'), dish('b')],
    );
    expect(s.totalTried).toBe(1);
  });

  it('builds a rating distribution over 1..5', () => {
    const list = [dish('a'), dish('b'), dish('c'), dish('d')];
    const s = deriveStats(
      progress({
        a: { tried: true, rating: 5 },
        b: { tried: true, rating: 5 },
        c: { tried: true, rating: 2 },
        d: { tried: true }, // unrated
      }),
      list,
    );
    expect(s.ratingCounts).toEqual([0, 1, 0, 0, 2]);
    expect(s.ratedCount).toBe(3);
  });

  it('aggregates categorical breakdowns, sorted count-desc', () => {
    const list = [
      dish('a', { category: 'dessert', dietary: { base: 'vegan', containsPork: false, containsBeef: false, containsAlcohol: false }, spiceLevel: 0 }),
      dish('b', { category: 'dessert', spiceLevel: 3 }),
      dish('c', { category: 'noodles', spiceLevel: 3 }),
    ];
    const s = deriveStats(
      progress({ a: { tried: true }, b: { tried: true }, c: { tried: true } }),
      list,
    );
    expect(s.byCategory[0]).toEqual({ key: 'dessert', count: 2 });
    expect(s.byContinent).toEqual([{ key: 'Asia', count: 3 }]); // all countryId 'jp'
    expect(s.bySpiceLevel).toContainEqual({ key: '3', count: 2 });
    expect(s.byDietBase.map((b) => b.key).sort()).toEqual(['meat', 'vegan']);
  });

  it('works against the real dish dataset by default', () => {
    const s = deriveStats({ 'jp-sushi': { tried: true, triedAt: '2026-07-01T09:00:00.000Z' } });
    expect(s.totalTried).toBe(1);
    expect(s.timeline[0].dishes[0].dish.id).toBe('jp-sushi');
  });
});
