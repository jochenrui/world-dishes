import { defineConfig, devices } from '@playwright/test';

/**
 * E2E / UX-verification config. Auto-starts the Vite dev server (mock auth, no
 * secrets needed) and drives it in Chromium. Used to screenshot-verify every
 * frontend change. Screenshots land in e2e/screens/ (gitignored).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  reporter: [['list']],
  outputDir: './e2e/.artifacts',
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 1280, height: 900 },
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
