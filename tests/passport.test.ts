import { describe, expect, it } from 'vitest';
import { computePassport } from '../src/lib/passport';
import type { UserProgress } from '../src/data/types';

function entries(ids: string[]): UserProgress['entries'] {
  return Object.fromEntries(ids.map((id) => [id, { tried: true }]));
}

describe('computePassport', () => {
  it('is empty for no progress', () => {
    const d = computePassport({});
    expect(d.triedTotal).toBe(0);
    expect(d.countriesVisited).toBe(0);
    expect(d.stamps).toHaveLength(0);
    expect(d.achievements.every((a) => !a.earned)).toBe(true);
  });

  it('counts tried dishes, countries, and continents', () => {
    const d = computePassport(entries(['jp-sushi', 'it-pizza', 'mx-tacos']));
    expect(d.triedTotal).toBe(3);
    expect(d.countriesVisited).toBe(3); // Japan, Italy, Mexico
    expect(d.continentsVisited).toBe(3); // Asia, Europe, North America
    expect(d.stamps.map((s) => s.countryId).sort()).toEqual(['it', 'jp', 'mx']);
  });

  it('earns First Bite on the first tried dish and clamps progress', () => {
    const d = computePassport(entries(['jp-sushi']));
    const firstBite = d.achievements.find((a) => a.id === 'first-bite')!;
    expect(firstBite.earned).toBe(true);
    const globetrotter = d.achievements.find((a) => a.id === 'globetrotter')!;
    expect(globetrotter.earned).toBe(false);
    expect(globetrotter.current).toBe(1);
    expect(globetrotter.target).toBe(10);
  });

  it('ignores progress entries for unknown dish ids', () => {
    const d = computePassport(entries(['jp-sushi', 'does-not-exist']));
    expect(d.triedTotal).toBe(1);
  });
});
