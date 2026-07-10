import { test, expect } from '@playwright/test';
import { signInMock } from './fixtures';

const SHOTS = 'e2e/screens';
const PROGRESS_KEY = 'world-dishes:progress:mock-user-1';

/** The persisted progress entry for a dish (mock cache is written debounced, ~200ms). */
function progressEntry(page: import('@playwright/test').Page, dishId: string) {
  return page.evaluate(
    ([key, id]) => {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      try {
        return (JSON.parse(raw).entries?.[id] as Record<string, unknown> | undefined) ?? null;
      } catch {
        return null;
      }
    },
    [PROGRESS_KEY, dishId] as const,
  );
}

/**
 * Behavioral verification of the want-to-try / wishlist layer:
 * add on the detail page → it persists + appears under the "Want to try" filter →
 * marking it tried consumes the intention (toggle disappears, drops out of the filter).
 * Waits for the debounced cache flush before each hard reload (avoids a test race).
 */
test('wishlist: add on detail, appears in filter, mark-tried consumes it', async ({ page }) => {
  await signInMock(page);
  await page.goto('/');
  await page.screenshot({ path: `${SHOTS}/popular-signedin.png` });

  // Grab a real dish id from the grid — NOT the "Dish of the day" banner (which is
  // the first /dish/ link on the page and would duplicate its href in later locators).
  const hrefs = await page
    .locator('a[href*="/dish/"]')
    .evaluateAll((as) => as.map((a) => a.getAttribute('href') || ''));
  const bannerHref = hrefs[0];
  const gridHref = hrefs.find((h) => h && h !== bannerHref)!;
  const dishId = gridHref.match(/\/dish\/([^/?#]+)/)![1];

  // Detail page → add to wishlist.
  await page.goto(`/dish/${dishId}`);
  const wish = page.getByRole('button', { name: 'Want to try' }).first();
  await expect(wish).toBeVisible();
  await wish.click();
  await expect(page.getByRole('button', { name: 'On your want-to-try list' })).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/dish-wishlisted.png` });

  // Wait for the debounced cache write to land before the reload below.
  await expect
    .poll(async () => Object.keys((await progressEntry(page, dishId)) ?? {}))
    .toContain('wishlistedAt');

  // Popular → "Want to try" filter (first such button = the SHOW segment, above the grid).
  await page.goto('/');
  await page.getByRole('button', { name: 'Want to try' }).first().click();
  await expect(page.locator(`a[href*="/dish/${dishId}"]`)).toBeVisible();
  await expect(page.getByText('1 dishes')).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/popular-wishlist.png` });

  // Mark tried on the detail page (main panel button = first "Mark as tried").
  await page.goto(`/dish/${dishId}`);
  await page.getByRole('button', { name: 'Mark as tried' }).first().click();
  await expect(page.getByRole('button', { name: "I've tried this" })).toBeVisible();

  // Persisted state: tried, wishlist intention cleared (reducer clears it on mark-tried).
  await expect.poll(async () => (await progressEntry(page, dishId))?.tried).toBe(true);
  await expect
    .poll(async () => Object.keys((await progressEntry(page, dishId)) ?? {}))
    .not.toContain('wishlistedAt');

  // …and it's gone from the wishlist filter after a reload.
  await page.goto('/');
  await page.getByRole('button', { name: 'Want to try' }).first().click();
  await expect(page.locator(`a[href*="/dish/${dishId}"]`)).toHaveCount(0);
});
