import { useMemo } from 'react';
import { countries, regions } from '../data/countries';
import { dishes } from '../data/dishes';
import type { Category, DietBase } from '../data/types';
import {
  allergenGlyph,
  allergenLabels,
  categoryLabels,
  dietColorVar,
  dietLabels,
} from '../data/labels';
import type { Allergen } from '../data/types';
import pageStyles from './pages.module.css';
import styles from './AboutPage.module.css';

const DIET_ORDER: DietBase[] = ['vegan', 'vegetarian', 'pescatarian', 'meat'];
const ALLERGENS: Allergen[] = ['gluten', 'dairy', 'egg', 'nuts', 'shellfish', 'soy'];

export function AboutPage() {
  const stats = useMemo(() => {
    const dietCounts = {} as Record<DietBase, number>;
    for (const d of DIET_ORDER) dietCounts[d] = 0;
    const catCounts = new Map<Category, number>();
    let spicy = 0;
    for (const dish of dishes) {
      dietCounts[dish.dietary.base]++;
      catCounts.set(dish.category, (catCounts.get(dish.category) ?? 0) + 1);
      if (dish.spiceLevel >= 2) spicy++;
    }
    const topCats = [...catCounts.entries()].sort((a, b) => b[1] - a[1]);
    return { dietCounts, topCats, spicy };
  }, []);

  const maxCat = stats.topCats[0]?.[1] ?? 1;
  const regionalCountries = countries.filter((c) => c.hasRegions).length;

  return (
    <>
      <div className={pageStyles.hero}>
        <h1 className={pageStyles.title}>About the Data</h1>
        <p className={pageStyles.subtitle}>
          How this dataset was put together, what each field means, and the honest caveats.
        </p>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statNum}>{dishes.length}</div>
          <div className={styles.statLabel}>dishes</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statNum}>{countries.length}</div>
          <div className={styles.statLabel}>countries</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statNum}>{regions.length}</div>
          <div className={styles.statLabel}>regions ({regionalCountries} countries)</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statNum}>{stats.spicy}</div>
          <div className={styles.statLabel}>medium+ spicy dishes</div>
        </div>
      </div>

      <div className={styles.prose}>
        <h2>Where the data comes from</h2>
        <p>
          There's no reliable public API for "the most popular dishes of each country," so this
          dataset is <strong>hand-curated</strong>. It spans two tiers: <strong>world-famous</strong>{' '}
          classics that travel across borders, and <strong>locally-famous</strong> dishes — home
          cooking, street snacks, breakfast staples and regional specialties that a tourist "top 10"
          usually misses. The local tier was researched region-by-region and independently reviewed
          for dietary and attribution accuracy. Each dish is annotated with dietary information, an
          origin note, and a popularity weight (<code>fame</code>); the global ranking on the Popular
          page is derived from that weight, with world-famous dishes ranking above local ones.
        </p>

        <div className={styles.callout}>
          This is an illustrative starter dataset, not an authoritative culinary reference.
          "Popularity" is subjective, dishes cross borders, and regional boundaries are fuzzy.
          Treat rankings as a fun starting point, not gospel.
        </div>

        <h2>Diet base breakdown</h2>
        <div className={styles.bars}>
          {DIET_ORDER.map((d) => {
            const count = stats.dietCounts[d];
            return (
              <div key={d} className={styles.bar}>
                <span className={styles.barLabel}>{dietLabels[d]}</span>
                <span className={styles.barTrack}>
                  <span
                    className={styles.barFill}
                    style={{
                      width: `${(count / dishes.length) * 100}%`,
                      background: dietColorVar[d],
                    }}
                  />
                </span>
                <span className={styles.barCount}>{count}</span>
              </div>
            );
          })}
        </div>

        <h2>Dishes by category</h2>
        <div className={styles.bars}>
          {stats.topCats.map(([cat, count]) => (
            <div key={cat} className={styles.bar}>
              <span className={styles.barLabel}>{categoryLabels[cat]}</span>
              <span className={styles.barTrack}>
                <span
                  className={styles.barFill}
                  style={{ width: `${(count / maxCat) * 100}%`, background: 'var(--c-primary)' }}
                />
              </span>
              <span className={styles.barCount}>{count}</span>
            </div>
          ))}
        </div>

        <h2>Field & badge legend</h2>
        <p>
          <strong>Diet base</strong> — the strictest category a dish fits:
        </p>
        <div className={styles.legendGrid}>
          {DIET_ORDER.map((d) => (
            <div key={d} className={styles.legendItem}>
              <span
                className={styles.dietChip}
                style={{ background: dietColorVar[d] }}
                aria-hidden="true"
              />
              {dietLabels[d]}
            </div>
          ))}
        </div>

        <p>
          <strong>Cultural / religious flags</strong> — surfaced because they matter to many
          travellers: 🐷 contains pork, 🐄 contains beef, 🍷 contains alcohol.
        </p>

        <p>
          <strong>Spice level</strong> — 0 (none) to 3 (hot), shown as 🌶️ chillies.
        </p>

        <p>
          <strong>Allergens</strong> — common allergens present in a typical preparation:
        </p>
        <div className={styles.legendGrid}>
          {ALLERGENS.map((a) => (
            <div key={a} className={styles.legendItem}>
              <span className={styles.legendGlyph} aria-hidden="true">
                {allergenGlyph[a]}
              </span>
              {allergenLabels[a]}
            </div>
          ))}
        </div>

        <h2>Your data & privacy</h2>
        <p>
          The dishes you tick off, your ratings and notes are stored only in this browser's{' '}
          <code>localStorage</code>, keyed to your signed-in account id. Nothing is sent to a
          server. Sign-in is currently a <strong>mock</strong> — real Google sign-in activates
          when a <code>VITE_GOOGLE_CLIENT_ID</code> is configured, though even then the identity is
          used purely to key your local data (it is not verified server-side).
        </p>
      </div>
    </>
  );
}
