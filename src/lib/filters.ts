import type { Allergen, Category, DietBase, Dish } from '../data/types';

export type SortKey = 'popularity' | 'name' | 'spice';

export interface DishFilters {
  diet: DietBase[]; // empty = any
  categories: Category[]; // empty = any
  maxSpice: 0 | 1 | 2 | 3; // 3 = no limit
  avoidPork: boolean;
  avoidBeef: boolean;
  avoidAlcohol: boolean;
  avoidAllergens: Allergen[];
  sort: SortKey;
}

export const defaultFilters: DishFilters = {
  diet: [],
  categories: [],
  maxSpice: 3,
  avoidPork: false,
  avoidBeef: false,
  avoidAlcohol: false,
  avoidAllergens: [],
  sort: 'popularity',
};

export function isFilterActive(f: DishFilters): boolean {
  return (
    f.diet.length > 0 ||
    f.categories.length > 0 ||
    f.maxSpice < 3 ||
    f.avoidPork ||
    f.avoidBeef ||
    f.avoidAlcohol ||
    f.avoidAllergens.length > 0
  );
}

export function applyFilters(dishes: Dish[], f: DishFilters): Dish[] {
  const out = dishes.filter((d) => {
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
