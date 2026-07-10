import { describe, expect, it } from 'vitest';
import { filtersToSearchParams, searchParamsToFilters } from '../src/lib/filterParams';
import { type DishFilters, defaultFilters } from '../src/lib/filters';

function filters(over: Partial<DishFilters> = {}): DishFilters {
  return { ...defaultFilters, ...over };
}

/** Round-trip helper: params serialized then parsed back should deep-equal the input. */
function roundTrip(f: DishFilters): DishFilters {
  return searchParamsToFilters(filtersToSearchParams(f));
}

describe('filterParams', () => {
  describe('round-trip', () => {
    const cases: [string, DishFilters][] = [
      ['defaults', filters()],
      ['search only', filters({ search: 'spicy vegan street' })],
      ['single diet + spice', filters({ diet: ['vegan'], maxSpice: 1 })],
      [
        'the "spicy vegan street food" view',
        filters({
          search: 'street food',
          diet: ['vegan'],
          categories: ['streetfood'],
          maxSpice: 2,
        }),
      ],
      [
        'avoid booleans + allergens',
        filters({
          avoidPork: true,
          avoidBeef: true,
          avoidAlcohol: true,
          avoidAllergens: ['nuts', 'shellfish'],
        }),
      ],
      ['multi diet + multi category', filters({ diet: ['vegan', 'vegetarian'], categories: ['curry', 'soup'] })],
      ['tried filter + sort', filters({ triedFilter: 'wishlist', sort: 'spice' })],
      ['spice zero', filters({ maxSpice: 0 })],
      [
        'everything at once',
        filters({
          search: 'pho',
          diet: ['pescatarian', 'meat'],
          categories: ['noodles', 'seafood'],
          maxSpice: 2,
          avoidPork: true,
          avoidAllergens: ['gluten', 'soy'],
          triedFilter: 'tried',
          sort: 'name',
        }),
      ],
    ];

    for (const [name, f] of cases) {
      it(`preserves "${name}"`, () => {
        expect(roundTrip(f)).toEqual(f);
      });
    }
  });

  describe('serialization omits defaults', () => {
    it('default filters produce empty params', () => {
      expect(filtersToSearchParams(defaultFilters).toString()).toBe('');
    });

    it('only non-default fields appear, compactly', () => {
      const p = filtersToSearchParams(filters({ diet: ['vegan'], maxSpice: 1 }));
      expect(p.get('diet')).toBe('vegan');
      expect(p.get('spice')).toBe('1');
      expect(p.has('q')).toBe(false);
      expect(p.has('sort')).toBe(false);
      expect(p.has('show')).toBe(false);
      expect(p.has('cat')).toBe(false);
      expect(p.has('avoid')).toBe(false);
    });

    it('maxSpice=3 (no limit) is omitted', () => {
      expect(filtersToSearchParams(filters({ maxSpice: 3 })).has('spice')).toBe(false);
    });

    it('combines avoid booleans + allergens into one param', () => {
      const p = filtersToSearchParams(filters({ avoidPork: true, avoidAllergens: ['nuts'] }));
      expect(p.get('avoid')).toBe('pork,nuts');
    });
  });

  describe('garbage / invalid params degrade to defaults without throwing', () => {
    it('unknown diet is dropped', () => {
      const f = searchParamsToFilters(new URLSearchParams('diet=klingon'));
      expect(f.diet).toEqual([]);
    });

    it('bad category is dropped', () => {
      const f = searchParamsToFilters(new URLSearchParams('cat=notacategory'));
      expect(f.categories).toEqual([]);
    });

    it('sort=lol falls back to popularity', () => {
      expect(searchParamsToFilters(new URLSearchParams('sort=lol')).sort).toBe('popularity');
    });

    it('spice=9 clamps to 3 (no limit)', () => {
      expect(searchParamsToFilters(new URLSearchParams('spice=9')).maxSpice).toBe(3);
    });

    it('spice=-4 clamps to 0', () => {
      expect(searchParamsToFilters(new URLSearchParams('spice=-4')).maxSpice).toBe(0);
    });

    it('spice=abc falls back to default 3', () => {
      expect(searchParamsToFilters(new URLSearchParams('spice=abc')).maxSpice).toBe(3);
    });

    it('non-integer spice is rejected (not coerced), falling back to default 3', () => {
      for (const raw of ['1.5', '1abc', '0x2', '1e1', '']) {
        expect(searchParamsToFilters(new URLSearchParams(`spice=${raw}`)).maxSpice).toBe(3);
      }
    });

    it('show=bogus falls back to all', () => {
      expect(searchParamsToFilters(new URLSearchParams('show=bogus')).triedFilter).toBe('all');
    });

    it('a fully garbage URL yields exactly the default filters', () => {
      const f = searchParamsToFilters(
        new URLSearchParams('diet=x&cat=y&spice=99&avoid=z&show=q&sort=lol&junk=1'),
      );
      expect(f).toEqual(defaultFilters);
    });
  });

  describe('comma-list parsing keeps valid items and drops invalid ones', () => {
    it('diet list: valid kept, invalid dropped, order preserved', () => {
      const f = searchParamsToFilters(new URLSearchParams('diet=vegan,klingon,meat'));
      expect(f.diet).toEqual(['vegan', 'meat']);
    });

    it('category list with an invalid item', () => {
      const f = searchParamsToFilters(new URLSearchParams('cat=curry,bogus,soup'));
      expect(f.categories).toEqual(['curry', 'soup']);
    });

    it('avoid list: booleans set, valid allergens kept, junk dropped', () => {
      const f = searchParamsToFilters(new URLSearchParams('avoid=pork,nuts,unicorn,beef'));
      expect(f.avoidPork).toBe(true);
      expect(f.avoidBeef).toBe(true);
      expect(f.avoidAlcohol).toBe(false);
      expect(f.avoidAllergens).toEqual(['nuts']);
    });

    it('empty / whitespace items are ignored', () => {
      const f = searchParamsToFilters(new URLSearchParams('diet=vegan,,%20,vegetarian'));
      expect(f.diet).toEqual(['vegan', 'vegetarian']);
    });
  });
});
