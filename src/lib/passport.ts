import { dishes } from '../data/dishes';
import { countries } from '../data/countries';
import type { Continent, UserProgress } from '../data/types';

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  current: number;
  target: number;
  earned: boolean;
}

export interface CountryStamp {
  countryId: string;
  name: string;
  flagId: string;
  continent: Continent;
  tried: number;
  total: number;
  complete: boolean;
}

export interface PassportData {
  triedTotal: number;
  dishTotal: number;
  countriesVisited: number;
  countriesTotal: number;
  continentsVisited: number;
  continentsTotal: number;
  countriesCompleted: number;
  stamps: CountryStamp[];
  achievements: Achievement[];
}

const CONTINENTS_TOTAL = new Set(countries.map((c) => c.continent)).size;

function achievement(
  id: string,
  icon: string,
  title: string,
  description: string,
  current: number,
  target: number,
): Achievement {
  return { id, icon, title, description, current: Math.min(current, target), target, earned: current >= target };
}

/** Pure: derive passport stats, stamps, and achievements from progress entries. */
export function computePassport(entries: UserProgress['entries']): PassportData {
  const tried = dishes.filter((d) => entries[d.id]?.tried);
  const triedTotal = tried.length;

  const triedByCountry = new Map<string, number>();
  const totalByCountry = new Map<string, number>();
  for (const d of dishes) totalByCountry.set(d.countryId, (totalByCountry.get(d.countryId) ?? 0) + 1);
  for (const d of tried) triedByCountry.set(d.countryId, (triedByCountry.get(d.countryId) ?? 0) + 1);

  const stamps: CountryStamp[] = countries
    .filter((c) => (triedByCountry.get(c.id) ?? 0) > 0)
    .map((c) => {
      const t = triedByCountry.get(c.id) ?? 0;
      const total = totalByCountry.get(c.id) ?? 0;
      return {
        countryId: c.id,
        name: c.name,
        flagId: c.id,
        continent: c.continent,
        tried: t,
        total,
        complete: total > 0 && t >= total,
      };
    })
    .sort((a, b) => Number(b.complete) - Number(a.complete) || b.tried - a.tried || a.name.localeCompare(b.name));

  const countriesVisited = stamps.length;
  const countriesCompleted = stamps.filter((s) => s.complete).length;
  const continentsVisited = new Set(stamps.map((s) => s.continent)).size;

  const countBy = (pred: (d: (typeof tried)[number]) => boolean) => tried.filter(pred).length;
  const spicy = countBy((d) => d.spiceLevel === 3);
  const desserts = countBy((d) => d.category === 'dessert');
  const plant = countBy((d) => d.dietary.base === 'vegan' || d.dietary.base === 'vegetarian');
  const street = countBy((d) => d.category === 'streetfood');

  const achievements: Achievement[] = [
    achievement('first-bite', '🍽️', 'First Bite', 'Try your first dish', triedTotal, 1),
    achievement('globetrotter', '🧭', 'Globetrotter', 'Try dishes from 10 countries', countriesVisited, 10),
    achievement('around-the-world', '🌍', 'Around the World', 'Try a dish on every continent', continentsVisited, CONTINENTS_TOTAL),
    achievement('completionist', '🏅', 'Completionist', 'Finish every dish of one country', countriesCompleted, 1),
    achievement('fire-eater', '🌶️', 'Fire Eater', 'Try 5 fiery (level 3) dishes', spicy, 5),
    achievement('sweet-tooth', '🍰', 'Sweet Tooth', 'Try 5 desserts', desserts, 5),
    achievement('plant-curious', '🌱', 'Plant Curious', 'Try 10 vegan or vegetarian dishes', plant, 10),
    achievement('street-food', '🥡', 'Street Food Fan', 'Try 8 street foods', street, 8),
    achievement('century-club', '💯', 'Century Club', 'Try 100 dishes', triedTotal, 100),
  ];

  return {
    triedTotal,
    dishTotal: dishes.length,
    countriesVisited,
    countriesTotal: countries.length,
    continentsVisited,
    continentsTotal: CONTINENTS_TOTAL,
    countriesCompleted,
    stamps,
    achievements,
  };
}
