import { describe, expect, it } from 'vitest';
import { validateDataset } from '../src/data/validate';
import { dishes, dishesForCountryRegion } from '../src/data/dishes';
import { applyFilters, defaultFilters } from '../src/lib/filters';

describe('dataset', () => {
  it('passes integrity validation', () => {
    expect(validateDataset()).toEqual([]);
  });

  it('assigns globally-unique, contiguous popularity ranks', () => {
    const ranks = dishes.map((d) => d.popularityRank).sort((a, b) => a - b);
    expect(new Set(ranks).size).toBe(dishes.length);
    expect(ranks[0]).toBe(1);
    expect(ranks[ranks.length - 1]).toBe(dishes.length);
  });

  it('region view includes national + region dishes', () => {
    // China has regional dishes; ensure a specific region also surfaces region-less ones if any.
    const all = dishesForCountryRegion('cn');
    const sichuan = dishesForCountryRegion('cn', 'cn-sichuan');
    expect(sichuan.every((d) => d.regionId === 'cn-sichuan' || d.regionId === undefined)).toBe(true);
    expect(sichuan.length).toBeLessThanOrEqual(all.length);
    expect(sichuan.length).toBeGreaterThan(0);
  });
});

describe('applyFilters', () => {
  it('avoid-pork removes pork dishes', () => {
    const out = applyFilters(dishes, { ...defaultFilters, avoidPork: true });
    expect(out.some((d) => d.dietary.containsPork)).toBe(false);
  });

  it('diet filter keeps only matching base', () => {
    const out = applyFilters(dishes, { ...defaultFilters, diet: ['vegan'] });
    expect(out.every((d) => d.dietary.base === 'vegan')).toBe(true);
    expect(out.length).toBeGreaterThan(0);
  });

  it('avoid-allergen excludes matching dishes', () => {
    const out = applyFilters(dishes, { ...defaultFilters, avoidAllergens: ['gluten'] });
    expect(out.some((d) => d.allergens.includes('gluten'))).toBe(false);
  });

  it('sorts by name when requested', () => {
    const out = applyFilters(dishes, { ...defaultFilters, sort: 'name' });
    const names = out.map((d) => d.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
});
