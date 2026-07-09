import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCountry, getRegion } from '../data/countries';
import type { Dish } from '../data/types';
import { useProgress } from '../state/ProgressContext';
import { useSession } from '../state/SessionContext';
import { DishBadges } from './DishBadges';
import { DishSprite } from './DishSprites';
import { Flag } from './Flag';
import { NoteEditor } from './NoteEditor';
import styles from './DishCard.module.css';

interface Props {
  dish: Dish;
  showRank?: boolean;
  /** Show the origin country line (hidden on the collection page where it's redundant). */
  showCountry?: boolean;
}

export function DishCard({ dish, showRank = false, showCountry = true }: Props) {
  const { user, signIn } = useSession();
  const { isTried, toggleTried, get } = useProgress();
  const tried = isTried(dish.id);
  const entry = get(dish.id);
  const hasReview = !!(entry?.rating || entry?.note);
  const [editing, setEditing] = useState(false);
  const country = getCountry(dish.countryId);
  const region = dish.regionId ? getRegion(dish.regionId) : undefined;

  // Collapse the editor whenever the dish is un-tried.
  useEffect(() => {
    if (!tried) setEditing(false);
  }, [tried]);

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
    <article className={`${styles.card} ${tried ? styles.tried : ''}`}>
      <div className={styles.header}>
        <Link to={`/dish/${dish.id}`} className={styles.sprite} aria-label={`View ${dish.name}`}>
          <DishSprite category={dish.category} size={34} />
        </Link>
        <div className={styles.titleWrap}>
          {showRank && <div className={styles.rank}>#{dish.popularityRank} worldwide</div>}
          <h3 className={styles.name}>
            <Link to={`/dish/${dish.id}`} className={styles.nameLink}>
              {dish.name}
            </Link>
          </h3>
          {dish.localName && <div className={styles.localName}>{dish.localName}</div>}
          {showCountry && country && (
            <div className={styles.origin}>
              <Flag countryId={country.id} width={18} title={country.name} />
              {country.name}
              {region && ` · ${region.name}`}
            </div>
          )}
        </div>
      </div>

      <div className={styles.body}>
        <p className={styles.desc}>{dish.description}</p>
        <DishBadges dish={dish} />
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={`${styles.tryBtn} ${tried ? styles.tryBtnOn : ''}`}
          onClick={onToggle}
          aria-pressed={user ? tried : undefined}
        >
          <span className={styles.check} aria-hidden="true">
            {!user ? '🔒' : tried ? '✓' : '＋'}
          </span>
          {!user ? 'Sign in to track' : tried ? "I've tried this" : 'Mark as tried'}
        </button>

        {user && tried && !editing && (
          <button
            type="button"
            className={styles.reviewToggle}
            onClick={() => setEditing(true)}
            aria-expanded={false}
          >
            {hasReview ? (
              <span className={styles.reviewSummary}>
                {entry?.rating != null && (
                  <span className={styles.summaryStars} aria-hidden="true">
                    {'★'.repeat(entry.rating)}
                    {'☆'.repeat(5 - entry.rating)}
                  </span>
                )}
                {entry?.note ? (
                  <span className={styles.summaryNote}>{entry.note}</span>
                ) : (
                  <span className={styles.summaryNote}>Add a note…</span>
                )}
                <span className={styles.summaryEdit}>Edit</span>
              </span>
            ) : (
              <span className={styles.reviewAdd}>＋ Write a review</span>
            )}
          </button>
        )}

        {user && tried && editing && (
          <div>
            <NoteEditor dishId={dish.id} />
            <button
              type="button"
              className={styles.reviewDone}
              onClick={() => setEditing(false)}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
