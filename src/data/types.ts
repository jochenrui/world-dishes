export type DietBase = 'vegan' | 'vegetarian' | 'pescatarian' | 'meat';

export type Allergen =
  | 'gluten'
  | 'dairy'
  | 'egg'
  | 'nuts'
  | 'shellfish'
  | 'soy';

export type Category =
  | 'noodles'
  | 'pasta'
  | 'curry'
  | 'grilled'
  | 'roast'
  | 'fried'
  | 'dumpling'
  | 'soup'
  | 'rice'
  | 'bread'
  | 'pizza'
  | 'stew'
  | 'salad'
  | 'dip'
  | 'seafood'
  | 'dessert'
  | 'streetfood'
  | 'taco'
  | 'wrap'
  | 'sandwich'
  | 'beverage'
  | 'pastry'
  | 'pie';

export type Continent =
  | 'Africa'
  | 'Asia'
  | 'Europe'
  | 'North America'
  | 'South America'
  | 'Oceania';

export interface Country {
  id: string;
  name: string;
  /** Emoji flag */
  flag: string;
  continent: Continent;
  hasRegions: boolean;
}

export interface Region {
  id: string;
  countryId: string;
  name: string;
}

export interface Dietary {
  base: DietBase;
  containsPork: boolean;
  containsBeef: boolean;
  containsAlcohol: boolean;
}

export interface Dish {
  id: string;
  name: string;
  localName?: string;
  countryId: string;
  /** undefined = national dish (applies country-wide) */
  regionId?: string;
  category: Category;
  dietary: Dietary;
  allergens: Allergen[];
  spiceLevel: 0 | 1 | 2 | 3;
  /** Global popularity rank (1 = most popular), globally unique. Derived from `fame`. */
  popularityRank: number;
  description: string;
  origin: string;
  /** 3-6 signature ingredients (curated). Optional so the app compiles pre-curation. */
  keyIngredients?: string[];
  /** 1-3 sentence history / cultural significance, curated where a real story exists. */
  history?: string;
}

/**
 * Authored dish record. `fame` (0-100) is a curated popularity weight; the unique
 * global `popularityRank` is derived from it deterministically at load time.
 */
export type RawDish = Omit<Dish, 'popularityRank'> & { fame: number };

export type Rating = 1 | 2 | 3 | 4 | 5;

export interface ProgressEntry {
  tried: boolean;
  note?: string;
  rating?: Rating;
  /** ISO timestamp of when it was marked tried */
  triedAt?: string;
  /** ISO timestamp of when it was added to the want-to-try wishlist */
  wishlistedAt?: string;
}

export interface UserProgress {
  version: number;
  entries: Record<string, ProgressEntry>;
}
