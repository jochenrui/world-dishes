import { getCountry, getRegion } from '../data/countries';
import type { Dish } from '../data/types';
import { useProgress } from '../state/ProgressContext';
import { useSession } from '../state/SessionContext';
import { DishBadges } from './DishBadges';
import { DishSprite } from './DishSprites';
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
  const { isTried, toggleTried } = useProgress();
  const tried = isTried(dish.id);
  const country = getCountry(dish.countryId);
  const region = dish.regionId ? getRegion(dish.regionId) : undefined;

  const onToggle = () => {
    if (!user) {
      signIn();
      return;
    }
    toggleTried(dish.id);
  };

  return (
    <article className={`${styles.card} ${tried ? styles.tried : ''}`}>
      <div className={styles.header}>
        <div className={styles.sprite}>
          <DishSprite category={dish.category} size={34} />
        </div>
        <div className={styles.titleWrap}>
          {showRank && <div className={styles.rank}>#{dish.popularityRank} worldwide</div>}
          <h3 className={styles.name}>{dish.name}</h3>
          {dish.localName && <div className={styles.localName}>{dish.localName}</div>}
          {showCountry && country && (
            <div className={styles.origin}>
              <span className={styles.flag}>{country.flag}</span>
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
          aria-pressed={tried}
        >
          <span className={styles.check} aria-hidden="true">
            {tried ? '✓' : '＋'}
          </span>
          {tried ? "I've tried this" : 'Mark as tried'}
        </button>
        {!user && <div className={styles.signInHint}>Sign in to track & review</div>}
        {user && tried && <NoteEditor dishId={dish.id} />}
      </div>
    </article>
  );
}
