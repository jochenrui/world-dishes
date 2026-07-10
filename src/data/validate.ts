import { countries, regions } from './countries';
import { rawDishes } from './dishes.raw';
import { localDishes } from './dishes.local';
import { regionalDishes } from './dishes.regional';

/**
 * Dev-time integrity check for the curated dataset. Returns a list of problems
 * (empty when valid). Run in main.tsx during development only.
 */
export function validateDataset(): string[] {
  const errors: string[] = [];
  const countryIds = new Set(countries.map((c) => c.id));
  const regionIds = new Set(regions.map((r) => r.id));
  const regionsByCountry = new Map<string, Set<string>>();
  for (const r of regions) {
    if (!countryIds.has(r.countryId)) {
      errors.push(`Region "${r.id}" references unknown country "${r.countryId}".`);
    }
    if (!regionsByCountry.has(r.countryId)) regionsByCountry.set(r.countryId, new Set());
    regionsByCountry.get(r.countryId)!.add(r.id);
  }

  // Countries flagged hasRegions must actually have regions, and vice versa.
  for (const c of countries) {
    const has = (regionsByCountry.get(c.id)?.size ?? 0) > 0;
    if (c.hasRegions && !has) errors.push(`Country "${c.id}" has hasRegions=true but no regions.`);
    if (!c.hasRegions && has) errors.push(`Country "${c.id}" has regions but hasRegions=false.`);
  }

  const seenDishIds = new Set<string>();
  for (const d of [...rawDishes, ...localDishes, ...regionalDishes]) {
    if (seenDishIds.has(d.id)) errors.push(`Duplicate dish id "${d.id}".`);
    seenDishIds.add(d.id);
    if (!countryIds.has(d.countryId)) {
      errors.push(`Dish "${d.id}" references unknown country "${d.countryId}".`);
    }
    if (d.regionId) {
      if (!regionIds.has(d.regionId)) {
        errors.push(`Dish "${d.id}" references unknown region "${d.regionId}".`);
      } else if (!regionsByCountry.get(d.countryId)?.has(d.regionId)) {
        errors.push(`Dish "${d.id}" region "${d.regionId}" does not belong to country "${d.countryId}".`);
      }
    }
    if (d.fame < 0 || d.fame > 100) errors.push(`Dish "${d.id}" has out-of-range fame ${d.fame}.`);

    // Optional array fields, when present, must be non-empty arrays of non-empty strings.
    const stringArrayFields = ['alsoKnownAs', 'tasteTags'] as const;
    for (const field of stringArrayFields) {
      const value = d[field];
      if (value === undefined) continue;
      if (!Array.isArray(value) || value.length === 0) {
        errors.push(`Dish "${d.id}" ${field} must be a non-empty array when present.`);
      } else if (!value.every((s) => typeof s === 'string' && s.trim().length > 0)) {
        errors.push(`Dish "${d.id}" ${field} must contain only non-empty strings.`);
      }
    }

    // Optional single-string fields, when present, must be non-empty.
    const stringFields = ['pronunciation', 'howEaten'] as const;
    for (const field of stringFields) {
      const value = d[field];
      if (value === undefined) continue;
      if (typeof value !== 'string' || value.trim().length === 0) {
        errors.push(`Dish "${d.id}" ${field} must be a non-empty string when present.`);
      }
    }
  }

  return errors;
}
