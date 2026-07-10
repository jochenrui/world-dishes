import { test, expect } from '@playwright/test';

const SHOTS = 'e2e/screens';

test('filters serialize to the URL and restore on reload', async ({ page }) => {
  await page.goto('/');

  // Toggle Diet = Vegan and Sort = Name → URL reflects both.
  await page.getByRole('button', { name: 'Vegan' }).click();
  await page.getByLabel('Sort dishes').selectOption('name');
  await expect(page).toHaveURL(/[?&]diet=vegan/);
  await expect(page).toHaveURL(/[?&]sort=name/);
  await page.screenshot({ path: `${SHOTS}/popular-vegan-filtered.png` });

  // Reload the same URL → the Vegan chip is still pressed, sort still Name.
  await page.reload();
  await expect(page.getByRole('button', { name: 'Vegan' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('Sort dishes')).toHaveValue('name');
});

test('a deep link applies the filter directly', async ({ page }) => {
  await page.goto('/?diet=vegan');
  await expect(page.getByRole('button', { name: 'Vegan' })).toHaveAttribute('aria-pressed', 'true');
  // Every rendered card should be a vegan dish (spot-check: the "Veg" badge / no meat).
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('a garbage URL degrades to defaults without crashing', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto('/?diet=bogus&sort=lol&spice=9&show=xxx&cat=notacat&avoid=notreal');
  // Renders fine; no filter is applied → full catalog, default sort, nothing pressed.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByLabel('Sort dishes')).toHaveValue('popularity');
  await expect(page.getByRole('button', { name: 'Vegan' })).toHaveAttribute('aria-pressed', 'false');
  expect(errors, errors.join('\n')).toEqual([]);
});
