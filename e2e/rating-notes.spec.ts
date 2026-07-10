import { test, expect } from '@playwright/test';
import { signInMock } from './fixtures';

const PROGRESS_KEY = 'world-dishes:progress:mock-user-1';
const SHOTS = 'e2e/screens';

function entryOf(page: import('@playwright/test').Page, id: string) {
  return page.evaluate(
    ([k, i]) => {
      const raw = window.localStorage.getItem(k);
      if (!raw) return null;
      try {
        return (JSON.parse(raw).entries?.[i] as Record<string, unknown> | undefined) ?? null;
      } catch {
        return null;
      }
    },
    [PROGRESS_KEY, id] as const,
  );
}

test('rating set + clear (key survives), note saves on change', async ({ page }) => {
  await signInMock(page);
  await page.goto('/');
  const hrefs = await page
    .locator('a[href*="/dish/"]')
    .evaluateAll((as) => as.map((a) => a.getAttribute('href') || ''));
  const bannerId = hrefs[0].match(/\/dish\/([^/?#]+)/)![1];
  const dishId = hrefs.find((h) => h && !h.includes(bannerId))!.match(/\/dish\/([^/?#]+)/)![1];

  await page.goto(`/dish/${dishId}`);
  await page.getByRole('button', { name: 'Mark as tried' }).first().click();

  // Rate 4 → persisted.
  await page.getByRole('radio', { name: '4 stars' }).click();
  await expect.poll(async () => (await entryOf(page, dishId))?.rating).toBe(4);
  await page.screenshot({ path: `${SHOTS}/note-rated.png` });

  // Clear rating → rating gone but the entry (tried) survives.
  await page.getByRole('button', { name: 'Clear rating' }).click();
  await expect.poll(async () => (await entryOf(page, dishId))?.rating ?? null).toBe(null);
  await expect.poll(async () => (await entryOf(page, dishId))?.tried).toBe(true);

  // Note saves as you type (not just on blur).
  await page.getByRole('textbox', { name: 'Note or review' }).fill('had it in Rome');
  await expect.poll(async () => (await entryOf(page, dishId))?.note).toBe('had it in Rome');
});

test('search-only empty state shows contextual copy + clear', async ({ page }) => {
  await page.goto('/?q=zzzznotarealdish');
  await expect(page.getByText(/No dishes match/i)).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/search-empty.png` });
  await page.getByRole('button', { name: /Clear search/i }).click();
  await expect(page.locator('a[href*="/dish/"]').first()).toBeVisible();
});
