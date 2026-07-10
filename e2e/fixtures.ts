import type { Page } from '@playwright/test';

const MOCK_SESSION_KEY = 'world-dishes:mock-session';
const PROGRESS_KEY = 'world-dishes:progress:mock-user-1';

/** Sign in as the mock user before any page load (survives navigations). */
export async function signInMock(page: Page): Promise<void> {
  await page.addInitScript(
    ([k]) => {
      try {
        window.localStorage.setItem(k, '1');
      } catch {
        /* ignore */
      }
    },
    [MOCK_SESSION_KEY],
  );
}

export interface SeedOptions {
  /** How many dishes to mark tried. */
  count?: number;
  /** How many of those to leave without a triedAt (exercises the "undated" bucket). */
  undated?: number;
  /** How many to give a star rating (spreads 3-5). */
  rated?: number;
}

/**
 * Seed a realistic "tried" history by reading real dish ids from the Popular
 * page, spreading their triedAt across the last several months, and writing the
 * progress cache. Returns the ids used. Requires signInMock() first.
 */
export async function seedTried(page: Page, opts: SeedOptions = {}): Promise<string[]> {
  const { count = 24, undated = 3, rated = 10 } = opts;

  await page.goto('/');
  // Collect real dish ids from the rendered cards (links to /dish/:id).
  const ids = await page.$$eval('a[href*="/dish/"]', (as) =>
    Array.from(
      new Set(
        as
          .map((a) => (a.getAttribute('href') || '').match(/\/dish\/([^/?#]+)/)?.[1])
          .filter((x): x is string => Boolean(x)),
      ),
    ),
  );
  const chosen = ids.slice(0, count);

  const now = Date.now();
  const DAY = 86_400_000;
  const entries: Record<string, unknown> = {};
  chosen.forEach((id, i) => {
    const isUndated = i < undated;
    // Spread the rest across ~8 months so the timeline shows several buckets.
    const triedAt = isUndated ? undefined : new Date(now - (i - undated) * 11 * DAY).toISOString();
    const rating = i < undated + rated ? ((i % 3) + 3) : undefined; // 3..5
    entries[id] = { tried: true, ...(triedAt ? { triedAt } : {}), ...(rating ? { rating } : {}) };
  });

  await page.evaluate(
    ([key, blob]) => window.localStorage.setItem(key, blob),
    [PROGRESS_KEY, JSON.stringify({ version: 1, entries })] as const,
  );
  await page.reload();
  return chosen;
}
