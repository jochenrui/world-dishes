import { describe, expect, it } from 'vitest';
import { toCsv, toExportRows, toJson } from '../src/lib/exportProgress';
import type { Country, Dish, ProgressEntry, UserProgress } from '../src/data/types';

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

const countries: Country[] = [
  { id: 'jp', name: 'Japan', flag: '🇯🇵', continent: 'Asia', hasRegions: false },
  { id: 'it', name: 'Italy', flag: '🇮🇹', continent: 'Europe', hasRegions: false },
];

function progress(map: Record<string, ProgressEntry>): UserProgress['entries'] {
  return map;
}

describe('toExportRows', () => {
  it('is empty for no progress', () => {
    expect(toExportRows({}, [dish('a')], countries)).toEqual([]);
  });

  it('skips orphan entries whose dish no longer exists', () => {
    const rows = toExportRows(
      progress({
        real: { tried: true },
        ghost: { tried: true },
      }),
      [dish('real')],
      countries,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].dishId).toBe('real');
  });

  it('skips entries that are neither tried nor wishlisted', () => {
    const rows = toExportRows(
      progress({
        kept: { tried: true },
        empty: { tried: false }, // un-marked / note-less tombstone → no row
      }),
      [dish('kept'), dish('empty')],
      countries,
    );
    expect(rows.map((r) => r.dishId)).toEqual(['kept']);
  });

  it('sorts by country then name', () => {
    const dishes = [
      dish('z-sushi', { name: 'Sushi', countryId: 'jp' }),
      dish('a-pizza', { name: 'Pizza', countryId: 'it' }),
      dish('a-ramen', { name: 'Ramen', countryId: 'jp' }),
    ];
    const rows = toExportRows(
      progress({ 'z-sushi': { tried: true }, 'a-pizza': { tried: true }, 'a-ramen': { tried: true } }),
      dishes,
      countries,
    );
    expect(rows.map((r) => `${r.country}/${r.name}`)).toEqual([
      'Italy/Pizza',
      'Japan/Ramen',
      'Japan/Sushi',
    ]);
  });

  it('emits a wishlist-only row with empty tried/rating fields', () => {
    const rows = toExportRows(
      progress({ a: { tried: false, wishlistedAt: '2026-01-02T00:00:00.000Z' } }),
      [dish('a', { name: 'Ramen' })],
      countries,
    );
    expect(rows[0]).toMatchObject({
      dishId: 'a',
      tried: false,
      wishlisted: true,
      wishlistedAt: '2026-01-02T00:00:00.000Z',
      triedAt: '',
      rating: '',
      note: '',
    });
  });
});

describe('toJson', () => {
  it('wraps rows in a header with the passed-in exportedAt and count', () => {
    const rows = toExportRows(progress({ a: { tried: true } }), [dish('a')], countries);
    const doc = JSON.parse(toJson(rows, '2026-07-10T00:00:00.000Z'));
    expect(doc).toMatchObject({
      app: 'World Dishes',
      exportedAt: '2026-07-10T00:00:00.000Z',
      count: 1,
    });
    expect(doc.dishes).toHaveLength(1);
  });
});

describe('toCsv', () => {
  it('produces just a header for the empty case', () => {
    expect(toCsv([])).toBe(
      'dishId,name,country,category,tried,triedAt,wishlisted,wishlistedAt,rating,note',
    );
  });

  it('escapes a note containing a comma, quote and newline', () => {
    const rows = toExportRows(
      progress({ a: { tried: true, rating: 5, note: 'Tasty, "great"\nwould eat again' } }),
      [dish('a', { name: 'Ramen', countryId: 'jp' })],
      countries,
    );
    const csv = toCsv(rows);
    const [, dataLine] = csv.split('\r\n');
    // The note field must be wrapped in quotes with the inner quote doubled;
    // the embedded newline stays inside the quoted field.
    expect(csv).toContain('"Tasty, ""great""\nwould eat again"');
    expect(dataLine.startsWith('a,Ramen,Japan,noodles,true,,false,,5,')).toBe(true);
  });

  it('neutralizes formula injection in a note (leading = + - @)', () => {
    const rows = toExportRows(
      progress({ a: { tried: true, note: '=HYPERLINK("http://evil","x")' } }),
      [dish('a', { name: 'Ramen' })],
      countries,
    );
    const line = toCsv(rows).split('\r\n')[1];
    // Prefixed with a single quote so a spreadsheet won't evaluate it; still quoted
    // because it contains a comma.
    expect(line).toContain(`"'=HYPERLINK(""http://evil"",""x"")"`);
  });

  it('renders booleans as true/false and missing values as empty', () => {
    const rows = toExportRows(
      progress({ a: { tried: false, wishlistedAt: '2026-01-02T00:00:00.000Z' } }),
      [dish('a', { name: 'Ramen' })],
      countries,
    );
    const line = toCsv(rows).split('\r\n')[1];
    expect(line).toBe('a,Ramen,Japan,noodles,false,,true,2026-01-02T00:00:00.000Z,,');
  });
});
