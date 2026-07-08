import type { Country, Region } from './types';

export const countries: Country[] = [
  // Asia
  { id: 'jp', name: 'Japan', flag: '🇯🇵', continent: 'Asia', hasRegions: false },
  { id: 'cn', name: 'China', flag: '🇨🇳', continent: 'Asia', hasRegions: true },
  { id: 'in', name: 'India', flag: '🇮🇳', continent: 'Asia', hasRegions: true },
  { id: 'th', name: 'Thailand', flag: '🇹🇭', continent: 'Asia', hasRegions: false },
  { id: 'vn', name: 'Vietnam', flag: '🇻🇳', continent: 'Asia', hasRegions: false },
  { id: 'kr', name: 'South Korea', flag: '🇰🇷', continent: 'Asia', hasRegions: false },
  { id: 'id', name: 'Indonesia', flag: '🇮🇩', continent: 'Asia', hasRegions: false },
  { id: 'my', name: 'Malaysia', flag: '🇲🇾', continent: 'Asia', hasRegions: false },
  { id: 'tr', name: 'Turkey', flag: '🇹🇷', continent: 'Asia', hasRegions: false },
  { id: 'lb', name: 'Lebanon', flag: '🇱🇧', continent: 'Asia', hasRegions: false },
  { id: 'ir', name: 'Iran', flag: '🇮🇷', continent: 'Asia', hasRegions: false },

  // Europe
  { id: 'it', name: 'Italy', flag: '🇮🇹', continent: 'Europe', hasRegions: true },
  { id: 'fr', name: 'France', flag: '🇫🇷', continent: 'Europe', hasRegions: true },
  { id: 'es', name: 'Spain', flag: '🇪🇸', continent: 'Europe', hasRegions: true },
  { id: 'gr', name: 'Greece', flag: '🇬🇷', continent: 'Europe', hasRegions: false },
  { id: 'de', name: 'Germany', flag: '🇩🇪', continent: 'Europe', hasRegions: false },
  { id: 'gb', name: 'United Kingdom', flag: '🇬🇧', continent: 'Europe', hasRegions: false },
  { id: 'pt', name: 'Portugal', flag: '🇵🇹', continent: 'Europe', hasRegions: false },
  { id: 'pl', name: 'Poland', flag: '🇵🇱', continent: 'Europe', hasRegions: false },
  { id: 'ru', name: 'Russia', flag: '🇷🇺', continent: 'Europe', hasRegions: false },

  // Africa
  { id: 'ma', name: 'Morocco', flag: '🇲🇦', continent: 'Africa', hasRegions: false },
  { id: 'et', name: 'Ethiopia', flag: '🇪🇹', continent: 'Africa', hasRegions: false },
  { id: 'ng', name: 'Nigeria', flag: '🇳🇬', continent: 'Africa', hasRegions: false },
  { id: 'eg', name: 'Egypt', flag: '🇪🇬', continent: 'Africa', hasRegions: false },
  { id: 'za', name: 'South Africa', flag: '🇿🇦', continent: 'Africa', hasRegions: false },

  // North America
  { id: 'us', name: 'United States', flag: '🇺🇸', continent: 'North America', hasRegions: true },
  { id: 'mx', name: 'Mexico', flag: '🇲🇽', continent: 'North America', hasRegions: true },
  { id: 'ca', name: 'Canada', flag: '🇨🇦', continent: 'North America', hasRegions: false },
  { id: 'cu', name: 'Cuba', flag: '🇨🇺', continent: 'North America', hasRegions: false },
  { id: 'jm', name: 'Jamaica', flag: '🇯🇲', continent: 'North America', hasRegions: false },

  // South America
  { id: 'br', name: 'Brazil', flag: '🇧🇷', continent: 'South America', hasRegions: false },
  { id: 'ar', name: 'Argentina', flag: '🇦🇷', continent: 'South America', hasRegions: false },
  { id: 'pe', name: 'Peru', flag: '🇵🇪', continent: 'South America', hasRegions: false },
  { id: 'co', name: 'Colombia', flag: '🇨🇴', continent: 'South America', hasRegions: false },

  // Oceania
  { id: 'au', name: 'Australia', flag: '🇦🇺', continent: 'Oceania', hasRegions: false },
];

export const regions: Region[] = [
  // China
  { id: 'cn-sichuan', countryId: 'cn', name: 'Sichuan' },
  { id: 'cn-canton', countryId: 'cn', name: 'Cantonese (Guangdong)' },
  { id: 'cn-north', countryId: 'cn', name: 'Northern China' },
  // India
  { id: 'in-north', countryId: 'in', name: 'North India' },
  { id: 'in-south', countryId: 'in', name: 'South India' },
  // Italy
  { id: 'it-north', countryId: 'it', name: 'Northern Italy' },
  { id: 'it-south', countryId: 'it', name: 'Southern Italy' },
  // France
  { id: 'fr-provence', countryId: 'fr', name: 'Provence & South' },
  { id: 'fr-north', countryId: 'fr', name: 'Northern France' },
  // Spain
  { id: 'es-valencia', countryId: 'es', name: 'Valencia & East' },
  { id: 'es-andalucia', countryId: 'es', name: 'Andalucía' },
  // USA
  { id: 'us-south', countryId: 'us', name: 'The South' },
  { id: 'us-northeast', countryId: 'us', name: 'Northeast' },
  { id: 'us-southwest', countryId: 'us', name: 'Southwest / Tex-Mex' },
  // Mexico
  { id: 'mx-central', countryId: 'mx', name: 'Central Mexico' },
  { id: 'mx-yucatan', countryId: 'mx', name: 'Yucatán & South' },
];

const countryById = new Map(countries.map((c) => [c.id, c]));
const regionById = new Map(regions.map((r) => [r.id, r]));

export function getCountry(id: string): Country | undefined {
  return countryById.get(id);
}

export function getRegion(id: string): Region | undefined {
  return regionById.get(id);
}

export function regionsForCountry(countryId: string): Region[] {
  return regions.filter((r) => r.countryId === countryId);
}
