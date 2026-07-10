import type { Dish } from '../data/types';
import { getCountry } from '../data/countries';

/**
 * Multi-signal similarity between two dishes, computed purely over existing dish
 * fields (no curated graph, no network). Higher = more alike.
 *
 * Weights (tuned so that cuisine/category dominate, with dietary + palate as
 * secondary nudges and ingredient/allergen overlap as fine-grained tie-shapers):
 *   - same category ...................... +3    (strongest single signal — form of the dish)
 *   - same continent ..................... +2    (cuisine neighbourhood)
 *   -   + same country ................... +1    (stacks on continent → 3 total for same country)
 *   - same dietary.base .................. +1.5  (vegan/vegetarian/pescatarian/meat)
 *   - spice within 1 level ............... +1
 *   -   + exactly equal spice ............ +0.5  (stacks → 1.5 for identical spice)
 *   - each shared allergen ............... +0.25
 *   - each shared key ingredient ......... +0.5  (case-insensitive)
 *
 * Pure and deterministic: depends only on the two dishes' fields.
 */
export function scoreSimilarity(a: Dish, b: Dish): number {
  let score = 0;

  if (a.category === b.category) score += 3;

  const contA = getCountry(a.countryId)?.continent;
  const contB = getCountry(b.countryId)?.continent;
  if (contA && contB && contA === contB) {
    score += 2;
    if (a.countryId === b.countryId) score += 1;
  }

  if (a.dietary.base === b.dietary.base) score += 1.5;

  const spiceDiff = Math.abs(a.spiceLevel - b.spiceLevel);
  if (spiceDiff <= 1) {
    score += 1;
    if (spiceDiff === 0) score += 0.5;
  }

  const allergensB = new Set(b.allergens);
  for (const al of a.allergens) {
    if (allergensB.has(al)) score += 0.25;
  }

  if (a.keyIngredients && b.keyIngredients) {
    const ingB = new Set(b.keyIngredients.map((i) => i.toLowerCase()));
    for (const ing of a.keyIngredients) {
      if (ingB.has(ing.toLowerCase())) score += 0.5;
    }
  }

  return score;
}

/**
 * Rank the `all` pool by similarity to `dish` and return the top `k`.
 *
 * - Excludes `dish` itself and anything in `excludeIds`.
 * - Only dishes with a strictly positive score are eligible.
 * - Sorted by score desc, tie-broken by `popularityRank` asc (deterministic).
 *
 * Pure: no side effects, stable output for stable input.
 */
export function similarDishes(
  dish: Dish,
  all: Dish[],
  k: number,
  excludeIds?: Set<string>,
): Dish[] {
  const scored: { dish: Dish; score: number }[] = [];
  for (const candidate of all) {
    if (candidate.id === dish.id) continue;
    if (excludeIds?.has(candidate.id)) continue;
    const score = scoreSimilarity(dish, candidate);
    if (score > 0) scored.push({ dish: candidate, score });
  }

  scored.sort((a, b) => b.score - a.score || a.dish.popularityRank - b.dish.popularityRank);

  return scored.slice(0, k).map((s) => s.dish);
}
