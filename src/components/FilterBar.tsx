import { useState } from 'react';
import type { Allergen, Category, DietBase } from '../data/types';
import { allergenLabels, categoryLabels, dietLabels, spiceLabels } from '../data/labels';
import {
  type DishFilters,
  type SortKey,
  type TriedFilter,
  defaultFilters,
  isFilterActive,
  toggleInArray,
} from '../lib/filters';
import styles from './FilterBar.module.css';

interface Props {
  filters: DishFilters;
  onChange: (f: DishFilters) => void;
  resultCount: number;
  /** Categories present in the current dataset slice (keeps the list relevant). */
  availableCategories: Category[];
  /** Show the Tried / Not-tried control (only when signed in). */
  showTriedFilter?: boolean;
}

const TRIED_OPTIONS: { key: TriedFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'untried', label: 'Not tried' },
  { key: 'tried', label: 'Tried' },
  { key: 'wishlist', label: 'Want to try' },
];

const DIETS: DietBase[] = ['vegan', 'vegetarian', 'pescatarian', 'meat'];
const ALLERGENS: Allergen[] = ['gluten', 'dairy', 'egg', 'nuts', 'shellfish', 'soy'];
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'popularity', label: 'Most popular' },
  { key: 'name', label: 'Name (A–Z)' },
  { key: 'spice', label: 'Spiciest' },
];

export function FilterBar({
  filters,
  onChange,
  resultCount,
  availableCategories,
  showTriedFilter = false,
}: Props) {
  const [showMore, setShowMore] = useState(false);
  const set = (patch: Partial<DishFilters>) => onChange({ ...filters, ...patch });

  return (
    <div className={styles.bar}>
      <div className={styles.searchRow}>
        <span className={styles.searchIcon} aria-hidden="true">
          🔍
        </span>
        <input
          className={styles.search}
          type="search"
          value={filters.search}
          placeholder="Search dishes — name, country, category…"
          aria-label="Search dishes"
          onChange={(e) => set({ search: e.target.value })}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.group}>
          <span className={styles.label}>Diet</span>
          {DIETS.map((d) => (
            <button
              key={d}
              type="button"
              className={`${styles.chip} ${filters.diet.includes(d) ? styles.chipOn : ''}`}
              aria-pressed={filters.diet.includes(d)}
              onClick={() => set({ diet: toggleInArray(filters.diet, d) })}
            >
              {dietLabels[d]}
            </button>
          ))}
        </div>

        <div className={styles.group}>
          <span className={styles.label}>Max spice</span>
          <input
            className={styles.range}
            type="range"
            min={0}
            max={3}
            value={filters.maxSpice}
            aria-label="Maximum spice level"
            onChange={(e) => set({ maxSpice: Number(e.target.value) as DishFilters['maxSpice'] })}
          />
          <span className={styles.count}>
            {filters.maxSpice === 3 ? 'Any' : `≤ ${spiceLabels[filters.maxSpice]}`}
          </span>
        </div>

        <div className={styles.group}>
          <span className={styles.label}>Sort</span>
          <select
            className={styles.select}
            value={filters.sort}
            aria-label="Sort dishes"
            onChange={(e) => set({ sort: e.target.value as SortKey })}
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {showTriedFilter && (
          <div className={styles.group}>
            <span className={styles.label}>Show</span>
            {TRIED_OPTIONS.map((o) => (
              <button
                key={o.key}
                type="button"
                className={`${styles.chip} ${filters.triedFilter === o.key ? styles.chipOn : ''}`}
                aria-pressed={filters.triedFilter === o.key}
                onClick={() => set({ triedFilter: o.key })}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}

        <div className={styles.spacer} />
        <span className={styles.count}>{resultCount} dishes</span>
        <button type="button" className={styles.detailsToggle} onClick={() => setShowMore((v) => !v)}>
          {showMore ? 'Fewer filters' : 'More filters'}
        </button>
        {isFilterActive(filters) && (
          <button
            type="button"
            className={styles.reset}
            onClick={() => onChange({ ...defaultFilters, sort: filters.sort })}
          >
            Clear
          </button>
        )}
      </div>

      {showMore && (
        <>
          <div className={styles.row}>
            <div className={styles.group}>
              <span className={styles.label}>Category</span>
              {availableCategories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.chip} ${filters.categories.includes(c) ? styles.chipOn : ''}`}
                  aria-pressed={filters.categories.includes(c)}
                  onClick={() => set({ categories: toggleInArray(filters.categories, c) })}
                >
                  {categoryLabels[c]}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.group}>
              <span className={styles.label}>Avoid</span>
              <button
                type="button"
                className={`${styles.chip} ${filters.avoidPork ? styles.chipAvoidOn : ''}`}
                aria-pressed={filters.avoidPork}
                onClick={() => set({ avoidPork: !filters.avoidPork })}
              >
                🐷 Pork
              </button>
              <button
                type="button"
                className={`${styles.chip} ${filters.avoidBeef ? styles.chipAvoidOn : ''}`}
                aria-pressed={filters.avoidBeef}
                onClick={() => set({ avoidBeef: !filters.avoidBeef })}
              >
                🐄 Beef
              </button>
              <button
                type="button"
                className={`${styles.chip} ${filters.avoidAlcohol ? styles.chipAvoidOn : ''}`}
                aria-pressed={filters.avoidAlcohol}
                onClick={() => set({ avoidAlcohol: !filters.avoidAlcohol })}
              >
                🍷 Alcohol
              </button>
              {ALLERGENS.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`${styles.chip} ${filters.avoidAllergens.includes(a) ? styles.chipAvoidOn : ''}`}
                  aria-pressed={filters.avoidAllergens.includes(a)}
                  onClick={() => set({ avoidAllergens: toggleInArray(filters.avoidAllergens, a) })}
                >
                  {allergenLabels[a]}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
