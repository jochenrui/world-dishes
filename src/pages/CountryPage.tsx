import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getCountry, regionsForCountry } from '../data/countries';
import { dishesForCountry, dishesForCountryRegion } from '../data/dishes';
import type { Category } from '../data/types';
import type { DishFilters } from '../lib/filters';
import { CountryProgressRing } from '../components/CountryProgressRing';
import { Flag } from '../components/Flag';
import { DishGrid } from '../components/DishGrid';
import { FilterBar } from '../components/FilterBar';
import { StickyBar } from '../components/StickyBar';
import { applyFilters, filterByTried } from '../lib/filters';
import { filtersToSearchParams, searchParamsToFilters } from '../lib/filterParams';
import { useProgress } from '../state/ProgressContext';
import { useSession } from '../state/SessionContext';
import pageStyles from './pages.module.css';
import styles from './CollectionPage.module.css';

export function CountryPage() {
  const { countryId = '' } = useParams();
  const country = getCountry(countryId);
  const { triedCount, isTried, isWishlisted } = useProgress();
  const { user } = useSession();

  const regions = useMemo(() => regionsForCountry(countryId), [countryId]);

  // Filters AND the selected region live in the URL query string, so a filtered
  // country view is a shareable, bookmarkable link that survives reload. The shared
  // DishFilters use the same schema as the Popular page; `region` is an extra param
  // validated against THIS country's regions (an unknown/foreign id falls back to
  // "all of the country"). `replace: true` avoids history spam on every keystroke
  // (tradeoff: individual filter tweaks aren't back-able).
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => searchParamsToFilters(searchParams), [searchParams]);
  const regionId = useMemo(() => {
    const raw = searchParams.get('region');
    return raw && regions.some((r) => r.id === raw) ? raw : undefined;
  }, [searchParams, regions]);

  const writeParams = (next: DishFilters, region: string | undefined) => {
    const params = filtersToSearchParams(next);
    if (region) params.set('region', region);
    setSearchParams(params, { replace: true });
  };
  const setFilters = (next: DishFilters) => writeParams(next, regionId);
  const setRegionId = (region: string | undefined) => writeParams(filters, region);

  const countryDishes = useMemo(() => dishesForCountry(countryId), [countryId]);
  const visible = useMemo(
    () =>
      filterByTried(
        applyFilters(dishesForCountryRegion(countryId, regionId), filters),
        filters.triedFilter,
        isTried,
        isWishlisted,
      ),
    [countryId, regionId, filters, isTried, isWishlisted],
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
  const selectedRegion = regionId ? regions.find((r) => r.id === regionId) : undefined;
  const regionSpecificCount = regionId
    ? countryDishes.filter((d) => d.regionId === regionId).length
    : 0;

  return (
    <>
      <Link to="/collection" className={pageStyles.backLink}>
        ← Back to countries
      </Link>

      <div className={styles.detailHead}>
        <span className={styles.detailFlag}>
          <Flag countryId={country.id} width={46} title={country.name} />
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

      <StickyBar>
        <FilterBar
          filters={filters}
          onChange={setFilters}
          resultCount={visible.length}
          availableCategories={availableCategories}
          showTriedFilter={!!user}
        />
      </StickyBar>

      {regionId && selectedRegion && regionSpecificCount === 0 && (
        <p className={styles.regionNote}>
          No {selectedRegion.name}-specific dishes catalogued yet — showing {country.name}'s
          national favourites.
        </p>
      )}

      <DishGrid
        dishes={visible}
        showCountry={false}
        emptyMessage="No dishes match these filters for this selection."
      />
    </>
  );
}
