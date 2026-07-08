import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCountry, regionsForCountry } from '../data/countries';
import { dishesForCountry, dishesForCountryRegion } from '../data/dishes';
import type { Category } from '../data/types';
import { CountryProgressRing } from '../components/CountryProgressRing';
import { DishGrid } from '../components/DishGrid';
import { FilterBar } from '../components/FilterBar';
import { applyFilters, defaultFilters, filterByTried } from '../lib/filters';
import { useProgress } from '../state/ProgressContext';
import { useSession } from '../state/SessionContext';
import pageStyles from './pages.module.css';
import styles from './CollectionPage.module.css';

export function CountryPage() {
  const { countryId = '' } = useParams();
  const country = getCountry(countryId);
  const [regionId, setRegionId] = useState<string | undefined>(undefined);
  const [filters, setFilters] = useState(defaultFilters);
  const { triedCount, isTried } = useProgress();
  const { user } = useSession();

  const regions = useMemo(() => regionsForCountry(countryId), [countryId]);
  const countryDishes = useMemo(() => dishesForCountry(countryId), [countryId]);
  const visible = useMemo(
    () =>
      filterByTried(
        applyFilters(dishesForCountryRegion(countryId, regionId), filters),
        filters.triedFilter,
        isTried,
      ),
    [countryId, regionId, filters, isTried],
  );
  const availableCategories = useMemo(() => {
    const present = new Set(countryDishes.map((d) => d.category));
    return ([...present] as Category[]).sort();
  }, [countryDishes]);

  if (!country) {
    return (
      <>
        <Link to="/collection" className={pageStyles.backLink}>
          ← Back to countries
        </Link>
        <div className={styles.notFound}>
          <span className={styles.notFoundEmoji} aria-hidden="true">
            🗺️
          </span>
          <p>We don't have that country yet.</p>
          <Link to="/collection" className={styles.regionChip}>
            Browse all countries
          </Link>
        </div>
      </>
    );
  }

  const tried = triedCount(countryDishes.map((d) => d.id));

  return (
    <>
      <Link to="/collection" className={pageStyles.backLink}>
        ← Back to countries
      </Link>

      <div className={styles.detailHead}>
        <span className={styles.detailFlag} aria-hidden="true">
          {country.flag}
        </span>
        <div style={{ flex: 1 }}>
          <h1 className={styles.detailTitle}>{country.name}</h1>
          <div className={styles.detailMeta}>
            {country.continent} · {countryDishes.length} popular dishes
          </div>
        </div>
        <CountryProgressRing tried={tried} total={countryDishes.length} size={58} />
      </div>

      {country.hasRegions && regions.length > 0 && (
        <div className={styles.regions}>
          <span className={styles.regionLabel}>Region</span>
          <button
            type="button"
            className={`${styles.regionChip} ${regionId === undefined ? styles.regionChipOn : ''}`}
            aria-pressed={regionId === undefined}
            onClick={() => setRegionId(undefined)}
          >
            All of {country.name}
          </button>
          {regions.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`${styles.regionChip} ${regionId === r.id ? styles.regionChipOn : ''}`}
              aria-pressed={regionId === r.id}
              onClick={() => setRegionId(r.id)}
            >
              {r.name}
            </button>
          ))}
        </div>
      )}

      <div className={pageStyles.stickyFilters}>
        <FilterBar
          filters={filters}
          onChange={setFilters}
          resultCount={visible.length}
          availableCategories={availableCategories}
          showTriedFilter={!!user}
        />
      </div>

      <DishGrid
        dishes={visible}
        showCountry={false}
        emptyMessage="No dishes match these filters for this selection."
      />
    </>
  );
}
