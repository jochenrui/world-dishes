import { test, expect } from '@playwright/test';

const SHOTS = 'e2e/screens';

test('first-run welcome shows, dismisses, and stays dismissed', async ({ page }) => {
  await page.goto('/'); // fresh context: signed out, not welcomed
  const banner = page.getByText(/Welcome to World Dishes/i);
  await expect(banner).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/welcome.png`, clip: { x: 60, y: 250, width: 1160, height: 130 } });

  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(banner).toHaveCount(0);

  await page.reload();
  await expect(page.getByText(/Welcome to World Dishes/i)).toHaveCount(0); // persisted
});
