import { useMemo, useState } from 'react';
import { dishes } from '../data/dishes';
import type { Category } from '../data/types';
import { DishGrid } from '../components/DishGrid';
import { FilterBar } from '../components/FilterBar';
import { applyFilters, defaultFilters } from '../lib/filters';
import { useProgress } from '../state/ProgressContext';
import { useSession } from '../state/SessionContext';
import styles from './pages.module.css';

const CATEGORY_ORDER: Category[] = [
  'noodles', 'curry', 'grilled', 'dumpling', 'soup', 'rice', 'bread', 'stew',
  'salad', 'seafood', 'dessert', 'streetfood', 'sandwich', 'beverage', 'pastry',
];

export function PopularPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const { user } = useSession();
  const { triedCount } = useProgress();

  const filtered = useMemo(() => applyFilters(dishes, filters), [filters]);
  const availableCategories = useMemo(() => {
    const present = new Set(dishes.map((d) => d.category));
    return CATEGORY_ORDER.filter((c) => present.has(c));
  }, []);

  const tried = triedCount(dishes.map((d) => d.id));

  return (
    <>
      <div className={styles.hero}>
        <h1 className={styles.title}>The World's Most Popular Dishes</h1>
        <p className={styles.subtitle}>
          {dishes.length} dishes from around the globe — from world-famous classics to the local
          favourites you'd only find by asking a local — ranked by fame. Filter by diet, spice, or
          what you'd rather avoid, then start ticking off the ones you've tasted.
        </p>
        {user && (
          <div className={styles.statline}>
            🍽️ You've tried <span className={styles.statAccent}>{tried}</span> of {dishes.length} dishes
          </div>
        )}
      </div>

      <div className={styles.stickyFilters}>
        <FilterBar
          filters={filters}
          onChange={setFilters}
          resultCount={filtered.length}
          availableCategories={availableCategories}
        />
      </div>

      <DishGrid dishes={filtered} showRank showCountry />
    </>
  );
}
