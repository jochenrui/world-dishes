import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { signInMock, seedTried } from './fixtures';

const SHOTS = 'e2e/screens';

test('share card renders and exports produce valid files', async ({ page }) => {
  await signInMock(page);
  await seedTried(page, { count: 18, undated: 2, rated: 8 });
  await page.goto('/passport');

  // The live share-card canvas preview should be present and drawn.
  const canvas = page.locator('canvas').first();
  await expect(canvas).toBeVisible();
  await canvas.screenshot({ path: `${SHOTS}/share-card.png` });

  // Export JSON → capture the download and validate its shape.
  const [jsonDl] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /export json/i }).click(),
  ]);
  const jsonPath = await jsonDl.path();
  const parsed = JSON.parse(readFileSync(jsonPath, 'utf8'));
  expect(parsed.app).toBe('World Dishes');
  expect(typeof parsed.exportedAt).toBe('string');
  expect(parsed.count).toBeGreaterThan(0);
  expect(Array.isArray(parsed.dishes)).toBe(true);
  expect(parsed.dishes[0]).toHaveProperty('name');
  expect(parsed.dishes[0]).toHaveProperty('tried');

  // Export CSV → header + at least one data row.
  const [csvDl] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /export csv/i }).click(),
  ]);
  const csv = readFileSync(await csvDl.path(), 'utf8').trim().split('\n');
  expect(csv[0].toLowerCase()).toContain('name');
  expect(csv.length).toBeGreaterThan(1);

  // Download PNG → real PNG signature (proves toBlob didn't throw under CSP).
  const [pngDl] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /download png/i }).click(),
  ]);
  const bytes = readFileSync(await pngDl.path());
  expect([...bytes.subarray(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]); // \x89PNG
});
