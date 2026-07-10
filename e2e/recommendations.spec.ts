import { test, expect } from '@playwright/test';

const SHOTS = 'e2e/screens';

test('dish page recommends similar dishes, disjoint from "more from country"', async ({ page }) => {
  // Grab a real dish id from the grid, then open it.
  await page.goto('/');
  const href = await page.locator('a[href*="/dish/"]').first().getAttribute('href');
  const dishId = href!.match(/\/dish\/([^/?#]+)/)![1];
  await page.goto(`/dish/${dishId}`);

  // "You might also like" renders with at least one card.
  const rec = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'You might also like' }) });
  await expect(rec).toBeVisible();
  const recLinks = await rec.locator('a[href*="/dish/"]').evaluateAll((as) =>
    as.map((a) => (a.getAttribute('href') || '').match(/\/dish\/([^/?#]+)/)?.[1]).filter(Boolean),
  );
  expect(recLinks.length).toBeGreaterThan(0);
  expect(recLinks.length).toBeLessThanOrEqual(6);

  // Never recommends the current dish.
  expect(recLinks).not.toContain(dishId);
  await expect(page.locator(`a[href$="/dish/${dishId}"]`)).toHaveCount(0);

  // Disjoint from the "More from {country}" section (no duplicate suggestions).
  const related = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: /^More from / }) });
  if (await related.count()) {
    const relLinks = await related.locator('a[href*="/dish/"]').evaluateAll((as) =>
      as.map((a) => (a.getAttribute('href') || '').match(/\/dish\/([^/?#]+)/)?.[1]).filter(Boolean),
    );
    const overlap = recLinks.filter((id) => relLinks.includes(id));
    expect(overlap, `overlap: ${overlap.join(',')}`).toEqual([]);
  }

  await rec.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOTS}/dish-recommendations.png`, fullPage: true });
});
