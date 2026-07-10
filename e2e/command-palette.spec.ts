import { test, expect } from '@playwright/test';

const SHOTS = 'e2e/screens';

test('Ctrl+K opens palette, searches a dish, Enter navigates', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('input[type=search]');

  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  await dialog.getByRole('combobox').fill('sushi');
  await expect(dialog.getByRole('option').first()).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/command-palette.png` });

  await page.keyboard.press('Enter'); // highlighted (first) result
  await expect(page).toHaveURL(/\/dish\//);
});

test('palette jumps to a country and Esc closes', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('input[type=search]'); // app mounted → hotkey listener attached
  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('combobox').fill('japan');
  await expect(dialog.getByRole('option').first()).toBeVisible();
  // Click the country-tagged result → country collection page.
  const countryOpt = dialog.getByRole('option').filter({ hasText: /Country/ }).first();
  await expect(countryOpt).toBeVisible();
  await countryOpt.click();
  await expect(page).toHaveURL(/\/collection\//);

  // Re-open and Esc closes.
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
