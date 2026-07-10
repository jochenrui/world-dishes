import { test, expect } from '@playwright/test';
import { signInMock, seedTried } from './fixtures';

const SHOTS = 'e2e/screens';

/**
 * Baseline UX smoke: signs in (mock), seeds a realistic tried-history, and
 * screenshots the main surfaces full-page. Re-run after a frontend change to
 * eyeball the result. Not asserting pixels — these are verification captures
 * plus a few "did it render / not crash" checks.
 */
test('capture main surfaces', async ({ page }) => {
  await signInMock(page);
  await seedTried(page, { count: 24, undated: 3, rated: 10 });

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/popular.png`, fullPage: false });

  await page.goto('/collection');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/collection.png`, fullPage: false });

  await page.goto('/passport');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/passport.png`, fullPage: true });

  await page.goto('/about');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/about.png`, fullPage: false });

  // No uncaught console errors on the main flow.
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/');
  expect(errors, errors.join('\n')).toEqual([]);
});
