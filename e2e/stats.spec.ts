import { test, expect } from '@playwright/test';
import { signInMock, seedTried } from './fixtures';

const SHOTS = 'e2e/screens';

test('stats dashboard renders charts for a seeded history', async ({ page }) => {
  await signInMock(page);
  await seedTried(page, { count: 30, undated: 2, rated: 16 });

  // Nav link exists and routes to /stats.
  await page.goto('/');
  await page.getByRole('link', { name: 'Stats' }).click();
  await expect(page).toHaveURL(/\/stats$/);

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  // Five single-series charts (continent, category, diet, spice, rating), each an
  // accessible role="img" SVG.
  const charts = page.locator('svg[role="img"]');
  await expect(charts.first()).toBeVisible();
  expect(await charts.count()).toBeGreaterThanOrEqual(5);

  await page.screenshot({ path: `${SHOTS}/stats.png`, fullPage: true });

  // No uncaught errors on the page.
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.reload();
  expect(errors, errors.join('\n')).toEqual([]);
});

test('stats gates behind sign-in when signed out', async ({ page }) => {
  await page.goto('/stats');
  // Gated: no charts render, and a sign-in prompt is shown (there are two — the
  // header button and the gate — so assert at least one).
  await expect(page.locator('svg[role="img"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /sign in/i }).first()).toBeVisible();
});
