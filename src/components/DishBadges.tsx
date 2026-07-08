import type { Dish } from '../data/types';
import type { CSSProperties } from 'react';
import {
  allergenGlyph,
  allergenLabels,
  dietColorVar,
  dietInkVar,
  dietLabels,
  dietShort,
  spiceLabels,
} from '../data/labels';
import styles from './DishBadges.module.css';

interface Props {
  dish: Dish;
  /** 'full' shows everything; 'compact' hides the allergen row (used on dense cards). */
  variant?: 'full' | 'compact';
}

export function DietPill({ dish }: { dish: Dish }) {
  const { base } = dish.dietary;
  const style = {
    '--pill-c': dietColorVar[base],
    '--pill-ink': dietInkVar[base],
  } as CSSProperties;
  return (
    <span className={styles.dietPill} style={style} title={dietLabels[base]}>
      <span className={styles.dietDot} aria-hidden="true" />
      {dietShort[base]}
    </span>
  );
}

export function SpiceMeter({ level }: { level: 0 | 1 | 2 | 3 }) {
  if (level === 0) return null;
  return (
    <span className={styles.spice} title={spiceLabels[level]} aria-label={spiceLabels[level]}>
      {Array.from({ length: level }).map((_, i) => (
        <span key={i} aria-hidden="true">
          🌶️
        </span>
      ))}
      <span className={styles.spiceLabel}>{spiceLabels[level]}</span>
    </span>
  );
}

export function DishBadges({ dish, variant = 'full' }: Props) {
  const { dietary, allergens, spiceLevel } = dish;
  const flags: string[] = [];
  if (dietary.containsPork) flags.push('🐷 Pork');
  if (dietary.containsBeef) flags.push('🐄 Beef');
  if (dietary.containsAlcohol) flags.push('🍷 Alcohol');

  return (
    <div className={styles.badges}>
      <DietPill dish={dish} />
      {flags.map((f) => (
        <span key={f} className={styles.flag}>
          {f}
        </span>
      ))}
      <SpiceMeter level={spiceLevel} />
      {variant === 'full' && (
        <span className={styles.allergens}>
          {allergens.length === 0 ? (
            <span className={styles.allergenNone}>Allergen-free</span>
          ) : (
            <>
              <span className={styles.allergenTag}>Contains</span>
              {allergens.map((a) => (
                <span
                  key={a}
                  className={styles.allergen}
                  title={allergenLabels[a]}
                  aria-label={allergenLabels[a]}
                >
                  <span aria-hidden="true">{allergenGlyph[a]}</span>
                  <span className={styles.allergenName}>{allergenLabels[a]}</span>
                </span>
              ))}
            </>
          )}
        </span>
      )}
    </div>
  );
}
