import { Link } from 'react-router-dom';
import { dishes } from '../data/dishes';
import { getCountry } from '../data/countries';
import { dayKey, dishOfTheDay } from '../lib/dishOfDay';
import { DishSprite } from './DishSprites';
import { Flag } from './Flag';
import styles from './DishOfDay.module.css';

/**
 * Compact "Dish of the day" feature strip for the Popular page. The pick is
 * deterministic by the viewer's local calendar day: everyone sees the same
 * dish on a given day, and it rolls over at local midnight. `new Date()` is
 * read HERE (the lib stays pure); the whole strip links to the dish detail.
 */
export function DishOfDay() {
  const dish = dishOfTheDay(dishes, dayKey(new Date()));
  if (!dish) return null;

  const country = getCountry(dish.countryId);

  return (
    <Link to={`/dish/${dish.id}`} className={styles.banner} aria-label={`Dish of the day: ${dish.name}`}>
      <div className={styles.sprite} aria-hidden="true">
        <DishSprite category={dish.category} size={34} />
      </div>
      <div className={styles.text}>
        <div className={styles.eyebrow}>
          <span aria-hidden="true">🍽️</span> Dish of the day
        </div>
        <div className={styles.name}>{dish.name}</div>
        {country && (
          <div className={styles.origin}>
            <Flag countryId={country.id} width={16} title={country.name} decorative />
            {country.name}
          </div>
        )}
        <p className={styles.desc}>{dish.description}</p>
      </div>
    </Link>
  );
}
