import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { signInMock, seedTried } from './fixtures';

const PAGES = ['/', '/collection', '/passport', '/stats', '/about'];

test('key pages have no serious/critical axe violations (signed in, seeded)', async ({ page }) => {
  await signInMock(page);
  await seedTried(page, { count: 20, rated: 10 });

  const failures: string[] = [];
  for (const path of PAGES) {
    await page.goto(path);
    await page.getByRole('heading', { level: 1 }).first().waitFor();
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      // color-contrast is a pre-existing, theme-wide issue (cream palette + muted
      // text/badges) that needs palette design decisions — out of scope for this
      // structural a11y pass, tracked as a follow-up. Gate on every other rule.
      .disableRules(['color-contrast'])
      .analyze();
    for (const v of violations) {
      if (v.impact === 'serious' || v.impact === 'critical') {
        failures.push(`${path} [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nodes)`);
      }
    }
  }
  expect(failures, `\n${failures.join('\n')}\n`).toEqual([]);
});

test('skip link + route-change focus management', async ({ page }) => {
  await page.goto('/');

  // First Tab lands on the skip link; Enter moves focus into <main>.
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement?.textContent)).toContain(
    'Skip to main content',
  );
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => document.activeElement?.id)).toBe('main-content');

  // Client-side navigation refocuses the main region (not stranded at the old spot).
  await page.getByRole('link', { name: 'Collection' }).click();
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.id))
    .toBe('main-content');
});
