import type { Country, Region } from './types';

export const countries: Country[] = [
  // Asia
  { id: 'jp', name: 'Japan', flag: '🇯🇵', continent: 'Asia', hasRegions: true },
  { id: 'cn', name: 'China', flag: '🇨🇳', continent: 'Asia', hasRegions: true },
  { id: 'in', name: 'India', flag: '🇮🇳', continent: 'Asia', hasRegions: true },
  { id: 'th', name: 'Thailand', flag: '🇹🇭', continent: 'Asia', hasRegions: true },
  { id: 'vn', name: 'Vietnam', flag: '🇻🇳', continent: 'Asia', hasRegions: true },
  { id: 'kr', name: 'South Korea', flag: '🇰🇷', continent: 'Asia', hasRegions: true },
  { id: 'id', name: 'Indonesia', flag: '🇮🇩', continent: 'Asia', hasRegions: true },
  { id: 'my', name: 'Malaysia', flag: '🇲🇾', continent: 'Asia', hasRegions: false },
  { id: 'tr', name: 'Turkey', flag: '🇹🇷', continent: 'Asia', hasRegions: true },
  { id: 'lb', name: 'Lebanon', flag: '🇱🇧', continent: 'Asia', hasRegions: false },
  { id: 'ir', name: 'Iran', flag: '🇮🇷', continent: 'Asia', hasRegions: false },

  // Europe
  { id: 'it', name: 'Italy', flag: '🇮🇹', continent: 'Europe', hasRegions: true },
  { id: 'fr', name: 'France', flag: '🇫🇷', continent: 'Europe', hasRegions: true },
  { id: 'es', name: 'Spain', flag: '🇪🇸', continent: 'Europe', hasRegions: true },
  { id: 'gr', name: 'Greece', flag: '🇬🇷', continent: 'Europe', hasRegions: false },
  { id: 'de', name: 'Germany', flag: '🇩🇪', continent: 'Europe', hasRegions: true },
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
  { id: 'ca', name: 'Canada', flag: '🇨🇦', continent: 'North America', hasRegions: true },
  { id: 'cu', name: 'Cuba', flag: '🇨🇺', continent: 'North America', hasRegions: false },
  { id: 'jm', name: 'Jamaica', flag: '🇯🇲', continent: 'North America', hasRegions: false },

  // South America
  { id: 'br', name: 'Brazil', flag: '🇧🇷', continent: 'South America', hasRegions: true },
  { id: 'ar', name: 'Argentina', flag: '🇦🇷', continent: 'South America', hasRegions: false },
  { id: 'pe', name: 'Peru', flag: '🇵🇪', continent: 'South America', hasRegions: true },
  { id: 'co', name: 'Colombia', flag: '🇨🇴', continent: 'South America', hasRegions: false },

  // Oceania
  { id: 'au', name: 'Australia', flag: '🇦🇺', continent: 'Oceania', hasRegions: false },
];

export const regions: Region[] = [
  // Japan
  { id: 'jp-kanto', countryId: 'jp', name: 'Kanto (Tokyo & the East)' },
  { id: 'jp-kansai', countryId: 'jp', name: 'Kansai (Osaka & Kyoto)' },
  { id: 'jp-hokkaido', countryId: 'jp', name: 'Hokkaido & the North (Tohoku)' },
  { id: 'jp-kyushu', countryId: 'jp', name: 'Kyushu' },
  { id: 'jp-okinawa', countryId: 'jp', name: 'Okinawa (Ryukyu)' },
  // China
  { id: 'cn-sichuan', countryId: 'cn', name: 'Sichuan' },
  { id: 'cn-canton', countryId: 'cn', name: 'Cantonese (Guangdong)' },
  { id: 'cn-north', countryId: 'cn', name: 'Northern China' },
  { id: 'cn-east', countryId: 'cn', name: 'Eastern China (Shanghai & Jiangnan)' },
  // India
  { id: 'in-north', countryId: 'in', name: 'North India' },
  { id: 'in-south', countryId: 'in', name: 'South India' },
  { id: 'in-west', countryId: 'in', name: 'Western India (Gujarat, Maharashtra & Goa)' },
  { id: 'in-east', countryId: 'in', name: 'Eastern India (Bengal)' },
  // Thailand
  { id: 'th-central', countryId: 'th', name: 'Central Thailand (Bangkok)' },
  { id: 'th-isan', countryId: 'th', name: 'Northeastern (Isan)' },
  { id: 'th-north', countryId: 'th', name: 'Northern (Lanna)' },
  { id: 'th-south', countryId: 'th', name: 'Southern Thailand' },
  // Vietnam
  { id: 'vn-north', countryId: 'vn', name: 'Northern Vietnam (Hanoi)' },
  { id: 'vn-central', countryId: 'vn', name: 'Central Vietnam (Huế/Hội An)' },
  { id: 'vn-south', countryId: 'vn', name: 'Southern Vietnam (Saigon)' },
  // South Korea
  { id: 'kr-seoul', countryId: 'kr', name: 'Seoul & Central' },
  { id: 'kr-jeolla', countryId: 'kr', name: 'Jeolla (Southwest)' },
  { id: 'kr-gyeongsang', countryId: 'kr', name: 'Gyeongsang (Busan & Southeast)' },
  // Indonesia
  { id: 'id-java', countryId: 'id', name: 'Java' },
  { id: 'id-sumatra', countryId: 'id', name: 'Sumatra (Padang & the West)' },
  { id: 'id-bali', countryId: 'id', name: 'Bali & the Eastern Islands' },
  // Turkey
  { id: 'tr-marmara', countryId: 'tr', name: 'Istanbul & Marmara' },
  { id: 'tr-aegean', countryId: 'tr', name: 'Aegean & the Coast' },
  { id: 'tr-southeast', countryId: 'tr', name: 'Southeastern Anatolia (Gaziantep)' },
  { id: 'tr-central', countryId: 'tr', name: 'Central Anatolia' },
  // Italy
  { id: 'it-north', countryId: 'it', name: 'Northern Italy' },
  { id: 'it-central', countryId: 'it', name: 'Central Italy' },
  { id: 'it-south', countryId: 'it', name: 'Southern Italy' },
  // France
  { id: 'fr-provence', countryId: 'fr', name: 'Provence & the South' },
  { id: 'fr-north', countryId: 'fr', name: 'Paris & Northern France' },
  { id: 'fr-east', countryId: 'fr', name: 'Burgundy & Eastern France' },
  // Spain
  { id: 'es-valencia', countryId: 'es', name: 'Valencia & the East' },
  { id: 'es-andalucia', countryId: 'es', name: 'Andalucía' },
  { id: 'es-north', countryId: 'es', name: 'Basque Country & the North' },
  // Germany
  { id: 'de-south', countryId: 'de', name: 'Bavaria & the South (Swabia)' },
  { id: 'de-west', countryId: 'de', name: 'Rhineland & the West' },
  { id: 'de-north', countryId: 'de', name: 'Berlin, the North & East' },
  // United States
  { id: 'us-south', countryId: 'us', name: 'The South' },
  { id: 'us-northeast', countryId: 'us', name: 'Northeast' },
  { id: 'us-southwest', countryId: 'us', name: 'Southwest / Tex-Mex' },
  { id: 'us-west', countryId: 'us', name: 'California & the West Coast' },
  // Mexico
  { id: 'mx-central', countryId: 'mx', name: 'Central Mexico' },
  { id: 'mx-west', countryId: 'mx', name: 'Western Mexico (Jalisco & Michoacán)' },
  { id: 'mx-yucatan', countryId: 'mx', name: 'Yucatán & the Southeast' },
  { id: 'mx-oaxaca', countryId: 'mx', name: 'Oaxaca & the Pacific South' },
  // Canada
  { id: 'ca-quebec', countryId: 'ca', name: 'Québec (French Canada)' },
  { id: 'ca-atlantic', countryId: 'ca', name: 'Atlantic Canada' },
  // Brazil
  { id: 'br-bahia', countryId: 'br', name: 'Bahia & the Northeast' },
  { id: 'br-southeast', countryId: 'br', name: 'Southeast (Rio, São Paulo & Minas)' },
  { id: 'br-south', countryId: 'br', name: 'The South (Gaúcho Country)' },
  { id: 'br-amazon', countryId: 'br', name: 'The Amazon & North' },
  // Peru
  { id: 'pe-coast', countryId: 'pe', name: 'The Coast (Lima & the Pacific)' },
  { id: 'pe-andes', countryId: 'pe', name: 'The Andean Highlands (Sierra)' },
  { id: 'pe-amazon', countryId: 'pe', name: 'The Amazon (Selva)' },
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
