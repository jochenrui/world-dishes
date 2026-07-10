import { test, expect } from '@playwright/test';

const SHOTS = 'e2e/screens';

test('dish detail renders the new optional fields', async ({ page }) => {
  await page.goto('/dish/th-padthai');
  await expect(page.getByRole('heading', { level: 1, name: /Pad Thai/ })).toBeVisible();
  await expect(page.getByText(/pad-TYE/i)).toBeVisible(); // pronunciation
  await expect(page.getByText(/Also known as/i)).toBeVisible(); // alsoKnownAs
  await expect(page.getByText(/How it's eaten/i)).toBeVisible(); // howEaten
  await expect(page.getByText('Taste', { exact: true })).toBeVisible(); // tasteTags label
  await page.screenshot({ path: `${SHOTS}/dish-detail-fields.png`, fullPage: false });
});
