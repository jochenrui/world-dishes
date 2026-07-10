import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { deriveStats, topNWithOther } from '../lib/deriveStats';
import { BarChart, type BarDatum } from '../components/BarChart';
import { categoryLabels, dietLabels, spiceLabels } from '../data/labels';
import { useProgress } from '../state/ProgressContext';
import { useSession } from '../state/SessionContext';
import pageStyles from './pages.module.css';
import styles from './StatsPage.module.css';

const TOP_CATEGORIES = 10;

export function StatsPage() {
  const { user, signIn } = useSession();
  const { entries } = useProgress();
  const stats = useMemo(() => deriveStats(entries), [entries]);

  const charts = useMemo(() => {
    // Nominal dimensions: keep deriveStats' count-desc order.
    const continent: BarDatum[] = stats.byContinent.map((b) => ({
      label: b.key,
      value: b.count,
    }));

    // ~23 possible categories → top 10 + a single "Other" bar (no rainbow of 23).
    const category: BarDatum[] = topNWithOther(stats.byCategory, TOP_CATEGORIES).map((b) => ({
      label: b.key === 'other' ? 'Other' : categoryLabels[b.key],
      value: b.count,
    }));

    const dietBase: BarDatum[] = stats.byDietBase.map((b) => ({
      label: dietLabels[b.key],
      value: b.count,
    }));

    // Ordinal: spice in natural order 0 → 3.
    const spice: BarDatum[] = [...stats.bySpiceLevel]
      .sort((a, b) => Number(a.key) - Number(b.key))
      .map((b) => ({ label: spiceLabels[Number(b.key)] ?? b.key, value: b.count }));

    // Ordinal: rating in natural order 1 → 5.
    const rating: BarDatum[] = stats.ratingCounts.map((count, i) => ({
      label: `${i + 1}★`,
      value: count,
    }));

    return { continent, category, dietBase, spice, rating };
  }, [stats]);

  return (
    <>
      <div className={pageStyles.hero}>
        <h1 className={pageStyles.title}>Your Tasting Stats</h1>
        <p className={pageStyles.subtitle}>
          A quantified look at your eating — the dishes you&apos;ve tried broken down by continent,
          kind, diet, heat, and how you rated them.
        </p>
      </div>

      {!user ? (
        <div className={styles.gate}>
          <svg
            className={styles.gateMark}
            viewBox="0 0 32 32"
            aria-hidden="true"
            width={52}
            height={52}
          >
            <rect x="4" y="17" width="6" height="11" rx="1.5" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" />
            <rect x="13" y="10" width="6" height="18" rx="1.5" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" />
            <rect x="22" y="4" width="6" height="24" rx="1.5" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" />
          </svg>
          <p>Sign in to see the stats of everything you&apos;ve tasted so far.</p>
          <button type="button" className={styles.gateBtn} onClick={signIn}>
            Sign in with Google
          </button>
        </div>
      ) : stats.totalTried === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyLead}>No tastings to chart yet.</p>
          <p>
            Mark a few dishes as tried and your breakdowns will appear here.{' '}
            <Link to="/" className={styles.emptyLink}>
              Explore popular dishes →
            </Link>
          </p>
        </div>
      ) : (
        <>
          <p className={styles.lead}>
            {stats.totalTried} {stats.totalTried === 1 ? 'dish' : 'dishes'} tried
            {stats.ratedCount > 0 && ` · ${stats.ratedCount} rated`}
          </p>
          <div className={styles.grid}>
            <BarChart title="Dishes tried by continent" data={charts.continent} />
            <BarChart title="Dishes tried by category" data={charts.category} />
            <BarChart title="Dishes tried by diet base" data={charts.dietBase} />
            <BarChart title="Dishes tried by spice level" data={charts.spice} />
            <BarChart title="Your rating distribution" data={charts.rating} />
          </div>
        </>
      )}
    </>
  );
}
