import type { Dish } from './types';
import { rawDishes } from './dishes.raw';
import { localDishes } from './dishes.local';
import { regionalDishes } from './dishes.regional';

/** World-famous + locally-famous + region-specific dishes, combined into one pool. */
export const allRawDishes = [...rawDishes, ...localDishes, ...regionalDishes];

/**
 * Derive globally-unique popularity ranks from the authored `fame` weights.
 * Sort by fame desc, then name asc as a stable tiebreaker, then assign 1..N.
 * Because local dishes' fame sits below the world-famous tier, they rank after them.
 */
export const dishes: Dish[] = [...allRawDishes]
  .sort((a, b) => b.fame - a.fame || a.name.localeCompare(b.name))
  .map(({ fame: _fame, ...dish }, i) => ({ ...dish, popularityRank: i + 1 }));

const dishById = new Map(dishes.map((d) => [d.id, d]));

export function getDish(id: string): Dish | undefined {
  return dishById.get(id);
}

/** All dishes for a country, ordered by global popularity. */
export function dishesForCountry(countryId: string): Dish[] {
  return dishes.filter((d) => d.countryId === countryId);
}

/**
 * Dishes visible for a country + region selection.
 *  - regionId undefined -> all dishes for the country
 *  - regionId set        -> that region's dishes plus national (region-less) dishes
 */
export function dishesForCountryRegion(countryId: string, regionId?: string): Dish[] {
  const all = dishesForCountry(countryId);
  if (!regionId) return all;
  return all.filter((d) => d.regionId === regionId || d.regionId === undefined);
}

export const dishIds: Set<string> = new Set(dishes.map((d) => d.id));

/** Ignores progress entries for dishes no longer in the dataset. */
export function knownDishIds(ids: string[]): string[] {
  return ids.filter((id) => dishIds.has(id));
}
