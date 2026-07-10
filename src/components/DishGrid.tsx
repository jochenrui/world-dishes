import type { ReactNode } from 'react';
import type { Dish } from '../data/types';
import { DishCard } from './DishCard';
import styles from './DishGrid.module.css';

interface Props {
  dishes: Dish[];
  showRank?: boolean;
  showCountry?: boolean;
  emptyMessage?: ReactNode;
  /** Optional CTA rendered under the empty-state message (e.g. "Clear search"). */
  emptyAction?: ReactNode;
}

export function DishGrid({ dishes, showRank, showCountry, emptyMessage, emptyAction }: Props) {
  if (dishes.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyEmoji} aria-hidden="true">
          🍽️
        </span>
        <p className={styles.emptyText}>
          {emptyMessage ?? 'No dishes match these filters. Try loosening them.'}
        </p>
        {emptyAction}
      </div>
    );
  }
  return (
    <div className={styles.grid}>
      {dishes.map((d) => (
        <DishCard key={d.id} dish={d} showRank={showRank} showCountry={showCountry} />
      ))}
    </div>
  );
}
