import { test, expect } from '@playwright/test';

const SHOTS = 'e2e/screens';

test('dish page has a safe "where to find it" search link', async ({ page }) => {
  await page.goto('/');
  const href = await page.locator('a[href*="/dish/"]').first().getAttribute('href');
  const dishId = href!.match(/\/dish\/([^/?#]+)/)![1];
  await page.goto(`/dish/${dishId}`);

  const find = page.getByRole('link', { name: /Find .* near you/i });
  await expect(find).toBeVisible();
  const url = await find.getAttribute('href');
  expect(url).toMatch(/^https:\/\/www\.google\.com\/search\?q=/);
  expect(url).toContain('restaurant');
  expect(await find.getAttribute('target')).toBe('_blank');
  expect(await find.getAttribute('rel')).toContain('noopener');

  await find.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOTS}/dish-findlink.png` });
});
