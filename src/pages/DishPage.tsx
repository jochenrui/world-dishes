import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { dishes, getDish, dishesForCountry } from '../data/dishes';
import { getCountry, getRegion } from '../data/countries';
import { categoryLabels } from '../data/labels';
import { DishBadges } from '../components/DishBadges';
import { DishGrid } from '../components/DishGrid';
import { DishSprite } from '../components/DishSprites';
import { Flag } from '../components/Flag';
import { NoteEditor } from '../components/NoteEditor';
import { useProgress } from '../state/ProgressContext';
import { useSession } from '../state/SessionContext';
import { getSupabase } from '../lib/supabaseClient';
import { fetchDishStats, type DishStats } from '../data/progressRepo';
import pageStyles from './pages.module.css';
import collStyles from './CollectionPage.module.css';
import styles from './DishPage.module.css';

export function DishPage() {
  const { dishId = '' } = useParams();
  const dish = getDish(dishId);
  const { user, signIn } = useSession();
  const { isTried, toggleTried, get } = useProgress();

  const related = useMemo(
    () => (dish ? dishesForCountry(dish.countryId).filter((d) => d.id !== dish.id).slice(0, 6) : []),
    [dish],
  );
  const similar = useMemo(
    () =>
      dish
        ? dishes
            .filter((d) => d.category === dish.category && d.countryId !== dish.countryId)
            .slice(0, 6)
        : [],
    [dish],
  );

  const [stats, setStats] = useState<DishStats | null>(null);
  useEffect(() => {
    const client = getSupabase();
    if (!client || !dish) {
      setStats(null);
      return;
    }
    let cancelled = false;
    fetchDishStats(client, dish.id).then((s) => {
      if (!cancelled) setStats(s);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dishId]);

  if (!dish) {
    return (
      <>
        <Link to="/" className={pageStyles.backLink}>
          ← All dishes
        </Link>
        <div className={collStyles.notFound}>
          <span className={collStyles.notFoundEmoji} aria-hidden="true">
            🍽️
          </span>
          <p>We don't have that dish yet.</p>
          <Link to="/" className={collStyles.regionChip}>
            Browse all dishes
          </Link>
        </div>
      </>
    );
  }

  const country = getCountry(dish.countryId);
  const region = dish.regionId ? getRegion(dish.regionId) : undefined;
  const tried = isTried(dish.id);
  const entry = get(dish.id);
  const hasReview = !!(entry?.rating || entry?.note);

  const onToggle = () => {
    if (!user) {
      signIn();
      return;
    }
    if (tried && hasReview) {
      const ok = window.confirm(
        `Un-mark "${dish.name}" as tried? This also removes your rating and note.`,
      );
      if (!ok) return;
    }
    toggleTried(dish.id);
  };

  return (
    <>
      <Link to="/" className={pageStyles.backLink}>
        ← All dishes
      </Link>

      <div className={styles.hero}>
        <div className={styles.spriteTile}>
          <DishSprite category={dish.category} size={60} />
        </div>
        <div className={styles.headInfo}>
          <div className={styles.rank}>#{dish.popularityRank} most popular worldwide</div>
          <h1 className={styles.name}>{dish.name}</h1>
          {dish.localName && <div className={styles.localName}>{dish.localName}</div>}
          {country && (
            <Link to={`/collection/${country.id}`} className={styles.origin}>
              <Flag countryId={country.id} width={22} title={country.name} />
              {country.name}
              {region && ` · ${region.name}`}
            </Link>
          )}
        </div>
      </div>

      <div className={styles.panel}>
        <p className={styles.description}>{dish.description}</p>

        {dish.keyIngredients && dish.keyIngredients.length > 0 && (
          <div className={styles.ingredients}>
            <span className={styles.ingredientsLabel}>Key ingredients</span>
            <div className={styles.ingredientChips}>
              {dish.keyIngredients.map((ing) => (
                <span key={ing} className={styles.ingredientChip}>
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className={styles.originNote}>
          <strong>Origin:</strong> {dish.origin}
        </p>

        <div className={styles.badgesRow}>
          <DishBadges dish={dish} variant="full" />
        </div>

        {stats && stats.triedCount > 0 && (
          <div className={styles.stats}>
            <span>
              🍽️ {stats.triedCount} {stats.triedCount === 1 ? 'person has' : 'people have'} tried
              this
            </span>
            {stats.avgRating != null && (
              <span className={styles.statsRating}>
                ★ {stats.avgRating}
                <span className={styles.statsMuted}> ({stats.ratingCount})</span>
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          className={`${styles.tryBtn} ${tried ? styles.tryBtnOn : ''}`}
          onClick={onToggle}
          aria-pressed={user ? tried : undefined}
        >
          <span aria-hidden="true">{!user ? '🔒' : tried ? '✓' : '＋'}</span>
          {!user ? 'Sign in to track' : tried ? "I've tried this" : 'Mark as tried'}
        </button>

        {user && tried && <NoteEditor dishId={dish.id} />}
      </div>

      {related.length > 0 && country && (
        <section className={styles.related}>
          <div className={styles.relatedHead}>
            <h2 className={styles.relatedTitle}>More from {country.name}</h2>
            <Link to={`/collection/${country.id}`} className={styles.relatedLink}>
              See all →
            </Link>
          </div>
          <DishGrid dishes={related} showCountry={false} />
        </section>
      )}

      {similar.length > 0 && (
        <section className={styles.related}>
          <div className={styles.relatedHead}>
            <h2 className={styles.relatedTitle}>
              More {categoryLabels[dish.category].toLowerCase()} from around the world
            </h2>
          </div>
          <DishGrid dishes={similar} showCountry />
        </section>
      )}
    </>
  );
}
