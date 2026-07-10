/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Served from https://<user>.github.io/world-dishes/ in production; root in dev.
export default defineConfig(({ mode }) => {
  const base = mode === 'production' ? '/world-dishes/' : '/';

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        // A new deploy ships a new SW that activates on next load, so users are never
        // stranded on a stale precache — critical for a live site.
        registerType: 'autoUpdate',
        // Inject the registration inline at build time; no app-code changes needed.
        injectRegister: 'auto',
        // Keep the SW out of dev entirely so HMR, mock auth, and OAuth are untouched.
        devOptions: { enabled: false },
        // apple-touch-icon lives in public/ and should be precached alongside the shell.
        includeAssets: ['apple-touch-icon.png'],
        manifest: {
          id: base,
          name: 'World Dishes',
          short_name: 'World Dishes',
          description:
            "Explore the world's most popular dishes and track the ones you've tried.",
          lang: 'en',
          // start_url/scope must live under the GitHub Pages subpath in prod ('/' in dev).
          start_url: base,
          scope: base,
          display: 'standalone',
          orientation: 'portrait',
          theme_color: '#c23d29', // terracotta (--c-primary)
          background_color: '#fbf7f0', // cream (--c-bg)
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // Precache the built app shell + hashed assets + icons + manifest. The dish
          // catalog ships inside the JS bundle, so reads work offline for free.
          globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest,woff2}'],
          cleanupOutdatedCaches: true,
          // Offline SPA routing: unmatched navigations fall back to the app shell,
          // which the client-side router then resolves.
          navigateFallback: `${base}index.html`,
          navigateFallbackDenylist: [
            // Never intercept the Supabase PKCE / OAuth return (?code=…, ?error=…) —
            // it must reach the app fresh so detectSessionInUrl can complete sign-in.
            /[?&](code|error)=/,
          ],
          // Same-origin static assets only, cache-first. Gating every rule on
          // `sameOrigin` guarantees Supabase and Google requests are NEVER cached or
          // intercepted — sign-in and DB writes always hit the network.
          runtimeCaching: [
            {
              urlPattern: ({ url, sameOrigin }) =>
                sameOrigin && /\.(?:png|jpg|jpeg|svg|gif|webp|woff2?)$/.test(url.pathname),
              handler: 'CacheFirst',
              options: {
                cacheName: 'wd-static-assets',
                expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './tests/setup.ts',
      css: false,
      // Playwright specs under e2e/ are run by Playwright, not Vitest; excluding them
      // keeps the two runners from colliding (Vitest can't collect a Playwright spec).
      exclude: [...configDefaults.exclude, 'e2e/**'],
      // Force mock auth in tests regardless of a local .env.local, so the suite is
      // deterministic and never hits real Supabase/OAuth (which can't run in jsdom).
      env: {
        VITE_SUPABASE_URL: '',
        VITE_SUPABASE_ANON_KEY: '',
      },
    },
  };
});
