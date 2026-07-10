import { describe, expect, it } from 'vitest';
import { scoreSimilarity, similarDishes } from '../src/lib/recommend';
import type { Dish } from '../src/data/types';

/** Minimal synthetic dish; real countryIds so continent lookup resolves. */
function dish(id: string, over: Partial<Dish> = {}): Dish {
  return {
    id,
    name: id,
    countryId: 'jp', // Asia
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

describe('scoreSimilarity', () => {
  it('is symmetric and rewards shared fields', () => {
    const a = dish('a', { category: 'curry', spiceLevel: 2 });
    const b = dish('b', { category: 'curry', spiceLevel: 2 });
    // same category (+3), same continent+country jp (+3), same diet meat (+1.5),
    // spice equal (+1.5) = 9
    expect(scoreSimilarity(a, b)).toBe(9);
    expect(scoreSimilarity(a, b)).toBe(scoreSimilarity(b, a));
  });

  it('counts shared allergens and key ingredients case-insensitively', () => {
    const a = dish('a', { allergens: ['gluten', 'egg'], keyIngredients: ['Egg', 'Flour'] });
    const b = dish('b', {
      allergens: ['gluten', 'soy'],
      keyIngredients: ['egg', 'water'],
    });
    // category+continent+country+diet+spice = 3+3+1.5+1.5 = 9
    // shared allergen gluten (+0.25) + shared ingredient egg (+0.5) = 9.75
    expect(scoreSimilarity(a, b)).toBe(9.75);
  });

  it('gives partial spice credit within one level', () => {
    const a = dish('a', { spiceLevel: 1 });
    const b = dish('b', { spiceLevel: 2 });
    const c = dish('c', { spiceLevel: 3 });
    expect(scoreSimilarity(a, b)).toBeGreaterThan(scoreSimilarity(a, c));
  });
});

describe('similarDishes', () => {
  const base = dish('base', { category: 'curry', countryId: 'in', spiceLevel: 2 }); // Asia

  it('excludes the dish itself', () => {
    const result = similarDishes(base, [base, dish('other', { category: 'curry' })], 5);
    expect(result.map((d) => d.id)).not.toContain('base');
  });

  it('honors excludeIds', () => {
    const skip = dish('skip', { category: 'curry', countryId: 'in' });
    const keep = dish('keep', { category: 'curry', countryId: 'in' });
    const result = similarDishes(base, [skip, keep], 5, new Set(['skip']));
    expect(result.map((d) => d.id)).toEqual(['keep']);
  });

  it('ranks a category+continent+diet match above a category-only match', () => {
    const strong = dish('strong', { category: 'curry', countryId: 'th' }); // Asia, same diet meat
    const weak = dish('weak', {
      category: 'curry',
      countryId: 'fr', // Europe, different continent
      dietary: { base: 'vegan', containsPork: false, containsBeef: false, containsAlcohol: false },
      spiceLevel: 0,
    });
    const result = similarDishes(base, [weak, strong], 5);
    expect(result.map((d) => d.id)).toEqual(['strong', 'weak']);
  });

  it('tie-breaks deterministically by popularityRank asc', () => {
    const a = dish('a', { category: 'curry', countryId: 'in', spiceLevel: 2, popularityRank: 20 });
    const b = dish('b', { category: 'curry', countryId: 'in', spiceLevel: 2, popularityRank: 5 });
    // identical fields → identical score → lower popularityRank wins
    const result = similarDishes(base, [a, b], 5);
    expect(result.map((d) => d.id)).toEqual(['b', 'a']);
  });

  it('respects the k limit', () => {
    const pool = Array.from({ length: 10 }, (_, i) =>
      dish(`d${i}`, { category: 'curry', countryId: 'in', popularityRank: i + 1 }),
    );
    expect(similarDishes(base, pool, 3)).toHaveLength(3);
  });

  it('omits score-0 dishes', () => {
    // Different category, different continent, different diet, spice far apart → score 0.
    const nothing = dish('nothing', {
      category: 'dessert',
      countryId: 'fr', // Europe
      dietary: { base: 'vegan', containsPork: false, containsBeef: false, containsAlcohol: false },
      spiceLevel: 0,
    });
    const spicyBase = dish('spicy-base', {
      category: 'curry',
      countryId: 'in',
      dietary: { base: 'meat', containsPork: false, containsBeef: false, containsAlcohol: false },
      spiceLevel: 3,
    });
    const result = similarDishes(spicyBase, [nothing], 5);
    expect(result).toHaveLength(0);
  });
});
