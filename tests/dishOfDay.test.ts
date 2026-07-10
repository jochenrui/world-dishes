import { describe, expect, it } from 'vitest';
import { dayKey, dishOfTheDay } from '../src/lib/dishOfDay';
import type { Dish } from '../src/data/types';

/** Minimal synthetic dish. */
function dish(id: string): Dish {
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
  };
}

const pool = Array.from({ length: 20 }, (_, i) => dish(`d${i}`));

describe('dayKey', () => {
  it('formats a local date as zero-padded YYYY-MM-DD', () => {
    // Local Date constructor: month is 0-based, so 2 => March, day 5.
    expect(dayKey(new Date(2026, 2, 5))).toBe('2026-03-05');
  });

  it('zero-pads single-digit month and day', () => {
    expect(dayKey(new Date(2026, 0, 1))).toBe('2026-01-01');
  });

  it('keeps two-digit month and day intact', () => {
    expect(dayKey(new Date(2026, 11, 25))).toBe('2026-12-25');
  });
});

describe('dishOfTheDay', () => {
  it('is deterministic: same key yields the same dish across calls', () => {
    const a = dishOfTheDay(pool, '2026-07-10');
    const b = dishOfTheDay(pool, '2026-07-10');
    expect(a).not.toBeNull();
    expect(a).toBe(b);
  });

  it('spreads different keys across different dishes (not all identical)', () => {
    const keys = Array.from({ length: 60 }, (_, i) => dayKey(new Date(2026, 0, 1 + i)));
    const picked = new Set(keys.map((k) => dishOfTheDay(pool, k)?.id));
    // A good spread hits several distinct dishes, not just one.
    expect(picked.size).toBeGreaterThan(1);
  });

  it('returns null for an empty list', () => {
    expect(dishOfTheDay([], '2026-07-10')).toBeNull();
  });

  it('always returns a dish from the provided list', () => {
    const ids = new Set(pool.map((d) => d.id));
    for (let i = 0; i < 30; i++) {
      const key = dayKey(new Date(2026, 5, 1 + i));
      const chosen = dishOfTheDay(pool, key);
      expect(chosen).not.toBeNull();
      expect(ids.has(chosen!.id)).toBe(true);
    }
  });
});
