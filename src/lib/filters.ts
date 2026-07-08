import type { Allergen, Category, DietBase, Dish } from '../data/types';
import { getCountry } from '../data/countries';
import { categoryLabels } from '../data/labels';

export type SortKey = 'popularity' | 'name' | 'spice';
export type TriedFilter = 'all' | 'tried' | 'untried';

export interface DishFilters {
  search: string;
  diet: DietBase[]; // empty = any
  categories: Category[]; // empty = any
  maxSpice: 0 | 1 | 2 | 3; // 3 = no limit
  avoidPork: boolean;
  avoidBeef: boolean;
  avoidAlcohol: boolean;
  avoidAllergens: Allergen[];
  /** Applied by the page (needs progress state), not by applyFilters. */
  triedFilter: TriedFilter;
  sort: SortKey;
}

export const defaultFilters: DishFilters = {
  search: '',
  diet: [],
  categories: [],
  maxSpice: 3,
  avoidPork: false,
  avoidBeef: false,
  avoidAlcohol: false,
  avoidAllergens: [],
  triedFilter: 'all',
  sort: 'popularity',
};

export function isFilterActive(f: DishFilters): boolean {
  return (
    f.search.trim().length > 0 ||
    f.diet.length > 0 ||
    f.categories.length > 0 ||
    f.maxSpice < 3 ||
    f.avoidPork ||
    f.avoidBeef ||
    f.avoidAlcohol ||
    f.avoidAllergens.length > 0 ||
    f.triedFilter !== 'all'
  );
}

function matchesSearch(d: Dish, q: string): boolean {
  const hay = [
    d.name,
    d.localName ?? '',
    getCountry(d.countryId)?.name ?? '',
    categoryLabels[d.category],
    d.origin,
  ]
    .join(' ')
    .toLowerCase();
  return q.split(/\s+/).every((term) => hay.includes(term));
}

export function applyFilters(dishes: Dish[], f: DishFilters): Dish[] {
  const q = f.search.trim().toLowerCase();
  const out = dishes.filter((d) => {
    if (q && !matchesSearch(d, q)) return false;
    if (f.diet.length && !f.diet.includes(d.dietary.base)) return false;
    if (f.categories.length && !f.categories.includes(d.category)) return false;
    if (d.spiceLevel > f.maxSpice) return false;
    if (f.avoidPork && d.dietary.containsPork) return false;
    if (f.avoidBeef && d.dietary.containsBeef) return false;
    if (f.avoidAlcohol && d.dietary.containsAlcohol) return false;
    if (f.avoidAllergens.some((a) => d.allergens.includes(a))) return false;
    return true;
  });

  switch (f.sort) {
    case 'name':
      out.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'spice':
      out.sort((a, b) => b.spiceLevel - a.spiceLevel || a.popularityRank - b.popularityRank);
      break;
    case 'popularity':
    default:
      out.sort((a, b) => a.popularityRank - b.popularityRank);
  }
  return out;
}

export function toggleInArray<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
}

/** Applied in the page, where per-user progress is available. */
export function filterByTried(
  dishes: Dish[],
  mode: TriedFilter,
  isTried: (dishId: string) => boolean,
): Dish[] {
  if (mode === 'all') return dishes;
  return dishes.filter((d) => isTried(d.id) === (mode === 'tried'));
}
