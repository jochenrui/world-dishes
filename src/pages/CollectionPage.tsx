import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { countries } from '../data/countries';
import { dishesForCountry } from '../data/dishes';
import type { Continent, Country } from '../data/types';
import { CountryProgressRing } from '../components/CountryProgressRing';
import { Flag } from '../components/Flag';
import { useProgress } from '../state/ProgressContext';
import { useSession } from '../state/SessionContext';
import pageStyles from './pages.module.css';
import styles from './CollectionPage.module.css';

const CONTINENT_ORDER: Continent[] = [
  'Asia', 'Europe', 'Africa', 'North America', 'South America', 'Oceania',
];

function CountryCard({ country }: { country: Country }) {
  const { triedCount } = useProgress();
  const dishIds = useMemo(() => dishesForCountry(country.id).map((d) => d.id), [country.id]);
  const tried = triedCount(dishIds);

  return (
    <Link to={`/collection/${country.id}`} className={styles.card}>
      <span className={styles.flag}>
        <Flag countryId={country.id} width={34} title={country.name} decorative />
      </span>
      <div className={styles.info}>
        <div className={styles.name}>{country.name}</div>
        <div className={styles.meta}>{dishIds.length} popular dishes</div>
        {country.hasRegions && <span className={styles.regionTag}>Regional</span>}
      </div>
      <CountryProgressRing tried={tried} total={dishIds.length} />
    </Link>
  );
}

export function CollectionPage() {
  const { user } = useSession();

  const byContinent = useMemo(() => {
    const map = new Map<Continent, Country[]>();
    for (const c of countries) {
      if (!map.has(c.continent)) map.set(c.continent, []);
      map.get(c.continent)!.push(c);
    }
    for (const list of map.values()) list.sort((a, b) => a.name.localeCompare(b.name));
    return map;
  }, []);

  return (
    <>
      <div className={pageStyles.hero}>
        <h1 className={pageStyles.title}>My Collection</h1>
        <p className={pageStyles.subtitle}>
          Track which of each country's most popular dishes you've tried. Pick a country to see
          its dishes — some large or diverse countries let you drill down by region.
        </p>
      </div>

      {!user && (
        <div className={styles.signInBanner}>
          <span aria-hidden="true">👋</span> Sign in with Google (mock) to start checking off dishes
          and saving notes. You can
          still browse everything without signing in.
        </div>
      )}

      {CONTINENT_ORDER.map((continent) => {
        const list = byContinent.get(continent);
        if (!list || list.length === 0) return null;
        return (
          <section key={continent} className={styles.continent}>
            <h2 className={styles.continentTitle}>{continent}</h2>
            <div className={styles.grid}>
              {list.map((c) => (
                <CountryCard key={c.id} country={c} />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
