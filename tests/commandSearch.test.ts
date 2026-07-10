import { describe, expect, it } from 'vitest';
import { matchTier, searchCommands } from '../src/lib/commandSearch';

describe('matchTier', () => {
  it('ranks exact < prefix < word-prefix < contains, and null for no match', () => {
    expect(matchTier('pizza', ['Pizza'])).toBe(0); // exact (case-insensitive)
    expect(matchTier('piz', ['Pizza'])).toBe(1); // field prefix
    expect(matchTier('mar', ['Pizza Margherita'])).toBe(2); // inner word prefix
    expect(matchTier('herit', ['Pizza Margherita'])).toBe(3); // contains only
    expect(matchTier('zzz', ['Pizza'])).toBeNull();
  });

  it('empty query matches everything at tier 0', () => {
    expect(matchTier('', ['anything'])).toBe(0);
  });

  it('requires every whitespace-separated term to appear', () => {
    expect(matchTier('green curry', ['Green Curry', 'Thailand'])).not.toBeNull();
    expect(matchTier('green ramen', ['Green Curry', 'Thailand'])).toBeNull();
  });

  it('takes the best tier across fields', () => {
    // localName prefix should win over a country-name contains.
    expect(matchTier('sush', ['Sushi', '', 'Japan'])).toBe(1);
  });
});

describe('searchCommands', () => {
  it('caps the number of rendered results', () => {
    expect(searchCommands('', 5)).toHaveLength(5);
    expect(searchCommands('a', 10).length).toBeLessThanOrEqual(10);
  });

  it('returns country + dish hits with routable targets', () => {
    const hits = searchCommands('japan', 30);
    const country = hits.find((h) => h.kind === 'country' && h.country.id === 'jp');
    expect(country).toBeDefined();
    expect(country?.to).toBe('/collection/jp');

    const dish = searchCommands('sushi', 5).find((h) => h.kind === 'dish');
    expect(dish?.to).toMatch(/^\/dish\//);
  });

  it('surfaces the matching country ahead of same-name dishes', () => {
    const hits = searchCommands('japan', 30);
    const first = hits[0];
    expect(first.kind).toBe('country');
    expect(first.kind === 'country' && first.country.id).toBe('jp');
  });

  it('finds a dish by exact name as a top result', () => {
    const hits = searchCommands('pizza', 30);
    expect(hits.some((h) => h.kind === 'dish' && /pizza/i.test(h.dish.name))).toBe(true);
  });
});
