import { dishes as allDishes } from '../data/dishes';
import { getCountry } from '../data/countries';
import type {
  Category,
  Continent,
  DietBase,
  Dish,
  Rating,
  UserProgress,
} from '../data/types';

/** A single tried dish with the timestamp it was tried at. */
export interface TimelineEntry {
  dish: Dish;
  triedAt: string;
}

/** A calendar-month bucket of tried dishes, most-recent dish first. */
export interface MonthBucket {
  /** 'YYYY-MM' */
  key: string;
  /** Human label, e.g. "July 2026" (locale-independent). */
  label: string;
  dishes: TimelineEntry[];
}

/** A `{ key, count }` pair for a categorical breakdown, sorted count-desc. */
export interface CountBucket<K extends string = string> {
  key: K;
  count: number;
}

export interface DerivedStats {
  /** Total tried dishes that still exist in the dataset. */
  totalTried: number;
  /** Month buckets, most-recent month first; dishes within a month most-recent first. */
  timeline: MonthBucket[];
  /** Tried dishes with no `triedAt` (mock-era / migrated rows). Never mixed into a month. */
  undated: Dish[];
  byContinent: CountBucket<Continent>[];
  byCategory: CountBucket<Category>[];
  byDietBase: CountBucket<DietBase>[];
  bySpiceLevel: CountBucket<string>[];
  /** Rating distribution: index 0 = ratings of 1, … index 4 = ratings of 5. */
  ratingCounts: [number, number, number, number, number];
  /** Number of tried dishes that carry a rating. */
  ratedCount: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Parse an ISO timestamp into a deterministic `{ key: 'YYYY-MM', label: 'Month YYYY' }`. */
function monthOf(iso: string): { key: string; label: string } | null {
  const d = new Date(iso);
  const t = d.getTime();
  if (Number.isNaN(t)) return null;
  // triedAt is stored as a UTC ISO string (`toISOString()`), so read it back in
  // UTC — otherwise a timestamp near a month boundary buckets into a different
  // month depending on the viewer's timezone.
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth(); // 0-11
  const key = `${year}-${String(month + 1).padStart(2, '0')}`;
  return { key, label: `${MONTH_NAMES[month]} ${year}` };
}

/** Build a count-desc `{ key, count }` list from a Map, tie-broken by key asc. */
function toBuckets<K extends string>(counts: Map<K, number>): CountBucket<K>[] {
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

/**
 * Pure aggregator complementary to `computePassport`: turns raw progress entries into a
 * chronological timeline plus reusable numeric breakdowns. No React, no I/O, fully testable.
 * Only dishes that still exist in `dishList` and are marked tried are counted.
 */
export function deriveStats(
  entries: UserProgress['entries'],
  dishList: Dish[] = allDishes,
): DerivedStats {
  const tried = dishList.filter((d) => entries[d.id]?.tried);

  const byContinent = new Map<Continent, number>();
  const byCategory = new Map<Category, number>();
  const byDietBase = new Map<DietBase, number>();
  const bySpiceLevel = new Map<string, number>();
  const ratingCounts: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  let ratedCount = 0;

  const monthBuckets = new Map<string, MonthBucket>();
  const undated: Dish[] = [];

  const inc = <K>(m: Map<K, number>, k: K) => m.set(k, (m.get(k) ?? 0) + 1);

  for (const dish of tried) {
    const entry = entries[dish.id];

    inc(byCategory, dish.category);
    inc(byDietBase, dish.dietary.base);
    inc(bySpiceLevel, String(dish.spiceLevel));
    const continent = getCountry(dish.countryId)?.continent;
    if (continent) inc(byContinent, continent);

    const rating = entry?.rating as Rating | undefined;
    if (rating != null) {
      ratingCounts[rating - 1] += 1;
      ratedCount += 1;
    }

    const month = entry?.triedAt ? monthOf(entry.triedAt) : null;
    if (!entry?.triedAt || !month) {
      undated.push(dish);
      continue;
    }
    let bucket = monthBuckets.get(month.key);
    if (!bucket) {
      bucket = { key: month.key, label: month.label, dishes: [] };
      monthBuckets.set(month.key, bucket);
    }
    bucket.dishes.push({ dish, triedAt: entry.triedAt });
  }

  // Most-recent month first; within a month, most-recent triedAt first.
  const timeline = [...monthBuckets.values()].sort((a, b) => b.key.localeCompare(a.key));
  for (const bucket of timeline) {
    bucket.dishes.sort((a, b) => b.triedAt.localeCompare(a.triedAt));
  }

  return {
    totalTried: tried.length,
    timeline,
    undated,
    byContinent: toBuckets(byContinent),
    byCategory: toBuckets(byCategory),
    byDietBase: toBuckets(byDietBase),
    bySpiceLevel: toBuckets(bySpiceLevel),
    ratingCounts,
    ratedCount,
  };
}
