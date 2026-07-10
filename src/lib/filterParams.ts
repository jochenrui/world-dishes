import type { Allergen, Category, DietBase } from '../data/types';
import { allergenLabels, categoryLabels, dietLabels } from '../data/labels';
import {
  type DishFilters,
  type SortKey,
  defaultFilters,
  isTriedFilter,
} from './filters';

/**
 * URL <-> DishFilters serialization for shareable / bookmarkable filtered views.
 *
 * Param schema (every field OMITTED when at its default, so a clean view is `?`):
 *   q      search text            (any string; omitted when '')
 *   diet   comma list of DietBase e.g. `vegan,vegetarian`
 *   cat    comma list of Category e.g. `curry,streetfood`
 *   spice  maxSpice 0..2          (omitted when 3 = "no limit")
 *   avoid  comma list of tokens   `pork`,`beef`,`alcohol` + Allergen ids, e.g. `pork,nuts`
 *   show   triedFilter            (omitted when 'all')
 *   sort   SortKey                (omitted when 'popularity')
 *
 * Parsing is strict: every value is validated against the known enums and anything
 * invalid is dropped, so a hand-edited / garbage URL degrades to defaults for the
 * bad parts rather than producing a broken filter state or throwing.
 */

// Validation sources derived from the label records so they stay in sync with the enums.
const DIET_VALUES = new Set<DietBase>(Object.keys(dietLabels) as DietBase[]);
const CATEGORY_VALUES = new Set<Category>(Object.keys(categoryLabels) as Category[]);
const ALLERGEN_VALUES = new Set<Allergen>(Object.keys(allergenLabels) as Allergen[]);
const SORT_VALUES = new Set<SortKey>(['popularity', 'name', 'spice']);

const AVOID_PORK = 'pork';
const AVOID_BEEF = 'beef';
const AVOID_ALCOHOL = 'alcohol';

// The `avoid` param multiplexes these literal tokens with Allergen ids, so the two
// namespaces MUST stay disjoint — otherwise an allergen id equal to a token would
// misroute (e.g. an allergen "pork" would flip avoidPork). Guard against a future
// data change silently breaking that (dev-only; stripped in prod builds).
if (import.meta.env?.DEV) {
  for (const token of [AVOID_PORK, AVOID_BEEF, AVOID_ALCOHOL]) {
    if (ALLERGEN_VALUES.has(token as Allergen)) {
      throw new Error(`[filterParams] Allergen id "${token}" collides with an avoid token.`);
    }
  }
}

function isDiet(v: string): v is DietBase {
  return DIET_VALUES.has(v as DietBase);
}
function isCategory(v: string): v is Category {
  return CATEGORY_VALUES.has(v as Category);
}
function isAllergen(v: string): v is Allergen {
  return ALLERGEN_VALUES.has(v as Allergen);
}
function isSort(v: string): v is SortKey {
  return SORT_VALUES.has(v as SortKey);
}

/** Split a comma param, trim/drop empties, keep only items passing `valid` (order preserved). */
function parseList<T extends string>(raw: string | null, valid: (v: string) => v is T): T[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is T => s.length > 0 && valid(s));
}

export function filtersToSearchParams(f: DishFilters): URLSearchParams {
  const p = new URLSearchParams();

  if (f.search !== '') p.set('q', f.search);
  if (f.diet.length) p.set('diet', f.diet.join(','));
  if (f.categories.length) p.set('cat', f.categories.join(','));
  if (f.maxSpice < 3) p.set('spice', String(f.maxSpice));

  // Combine the three avoid booleans + allergens into one compact, reversible list.
  const avoid: string[] = [];
  if (f.avoidPork) avoid.push(AVOID_PORK);
  if (f.avoidBeef) avoid.push(AVOID_BEEF);
  if (f.avoidAlcohol) avoid.push(AVOID_ALCOHOL);
  for (const a of f.avoidAllergens) avoid.push(a);
  if (avoid.length) p.set('avoid', avoid.join(','));

  if (f.triedFilter !== 'all') p.set('show', f.triedFilter);
  if (f.sort !== 'popularity') p.set('sort', f.sort);

  return p;
}

export function searchParamsToFilters(params: URLSearchParams): DishFilters {
  const search = params.get('q') ?? defaultFilters.search;

  const diet = parseList(params.get('diet'), isDiet);
  const categories = parseList(params.get('cat'), isCategory);

  // spice: integer only, clamp to 0..3, fall back to default (3) on garbage/missing.
  // Reject non-integers (e.g. "1.5", "1abc") rather than silently coercing them.
  let maxSpice: DishFilters['maxSpice'] = defaultFilters.maxSpice;
  const rawSpice = params.get('spice');
  if (rawSpice !== null && /^-?\d+$/.test(rawSpice.trim())) {
    const n = Number.parseInt(rawSpice, 10);
    maxSpice = Math.min(3, Math.max(0, n)) as DishFilters['maxSpice'];
  }

  // avoid: split the combined list into the booleans + validated allergens.
  const rawAvoid = (params.get('avoid') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const avoidPork = rawAvoid.includes(AVOID_PORK);
  const avoidBeef = rawAvoid.includes(AVOID_BEEF);
  const avoidAlcohol = rawAvoid.includes(AVOID_ALCOHOL);
  const avoidAllergens = rawAvoid.filter(isAllergen);

  const rawShow = params.get('show');
  const triedFilter =
    rawShow !== null && isTriedFilter(rawShow) ? rawShow : defaultFilters.triedFilter;

  const rawSort = params.get('sort');
  const sort = rawSort !== null && isSort(rawSort) ? rawSort : defaultFilters.sort;

  return {
    search,
    diet,
    categories,
    maxSpice,
    avoidPork,
    avoidBeef,
    avoidAlcohol,
    avoidAllergens,
    triedFilter,
    sort,
  };
}
