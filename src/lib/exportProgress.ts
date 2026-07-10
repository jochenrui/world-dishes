import type { Country, Dish, UserProgress } from '../data/types';

/** One flat, serializable row per tried/wishlisted dish that still maps to a real dish. */
export interface ExportRow {
  dishId: string;
  name: string;
  country: string;
  category: string;
  tried: boolean;
  triedAt: string;
  wishlisted: boolean;
  wishlistedAt: string;
  rating: number | '';
  note: string;
}

/** Header of the JSON export document. */
export interface ExportDoc {
  app: 'World Dishes';
  exportedAt: string;
  count: number;
  dishes: ExportRow[];
}

const CSV_COLUMNS: readonly (keyof ExportRow)[] = [
  'dishId',
  'name',
  'country',
  'category',
  'tried',
  'triedAt',
  'wishlisted',
  'wishlistedAt',
  'rating',
  'note',
];

/**
 * Flatten progress entries into stable, plain export rows. Entries whose dish no
 * longer exists (orphans) are skipped. Sorted by country name, then dish name.
 */
export function toExportRows(
  entries: UserProgress['entries'],
  dishes: Dish[],
  countries: Country[],
): ExportRow[] {
  const dishById = new Map(dishes.map((d) => [d.id, d]));
  const countryById = new Map(countries.map((c) => [c.id, c]));

  const rows: ExportRow[] = [];
  for (const [dishId, entry] of Object.entries(entries)) {
    if (!entry.tried && !entry.wishlistedAt) continue; // neither tried nor wishlisted → no row
    const dish = dishById.get(dishId);
    if (!dish) continue; // orphan: dish removed from the dataset
    const country = countryById.get(dish.countryId);
    rows.push({
      dishId,
      name: dish.name,
      country: country?.name ?? dish.countryId,
      category: dish.category,
      tried: !!entry.tried,
      triedAt: entry.triedAt ?? '',
      wishlisted: !!entry.wishlistedAt,
      wishlistedAt: entry.wishlistedAt ?? '',
      rating: entry.rating ?? '',
      note: entry.note ?? '',
    });
  }

  return rows.sort(
    (a, b) => a.country.localeCompare(b.country) || a.name.localeCompare(b.name),
  );
}

/** Pretty-printed JSON document. `exportedAt` is passed in to keep this pure/testable. */
export function toJson(rows: ExportRow[], exportedAt: string): string {
  const doc: ExportDoc = {
    app: 'World Dishes',
    exportedAt,
    count: rows.length,
    dishes: rows,
  };
  return JSON.stringify(doc, null, 2);
}

/**
 * RFC-4180-style escaping: wrap in quotes if the field has a comma, quote, CR or LF.
 * Also neutralizes CSV/formula injection: a field starting with = + - @ (or tab/CR)
 * is prefixed with a single quote so a shared export can't execute as a formula when
 * opened in Excel/Sheets. Only `note` is user-authored, but we guard every field.
 */
function csvField(value: string | number | boolean): string {
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** CSV string with a header row and proper escaping. Rows joined with CRLF. */
export function toCsv(rows: ExportRow[]): string {
  const lines: string[] = [CSV_COLUMNS.join(',')];
  for (const row of rows) {
    lines.push(CSV_COLUMNS.map((col) => csvField(row[col])).join(','));
  }
  return lines.join('\r\n');
}
