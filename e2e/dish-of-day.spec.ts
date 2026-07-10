import { test, expect } from '@playwright/test';

const SHOTS = 'e2e/screens';

test('dish of the day shows on Popular and is stable across reloads', async ({ page }) => {
  await page.goto('/');

  const banner = page.getByRole('link').filter({ hasText: 'Dish of the day' });
  await expect(banner).toBeVisible();
  const href = await banner.getAttribute('href');
  expect(href).toMatch(/\/dish\/[^/?#]+/);

  await page.screenshot({ path: `${SHOTS}/popular-dish-of-day.png`, fullPage: false });

  // Deterministic within the same day: same dish after a reload.
  await page.reload();
  await expect(page.getByRole('link').filter({ hasText: 'Dish of the day' })).toHaveAttribute(
    'href',
    href!,
  );

  // The banner links to a real dish page.
  await banner.click();
  await expect(page).toHaveURL(new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
