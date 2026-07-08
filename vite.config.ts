/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from https://<user>.github.io/world-dishes/ in production; root in dev.
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/world-dishes/' : '/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    css: false,
    // Force mock auth in tests regardless of a local .env.local, so the suite is
    // deterministic and never hits real Supabase/OAuth (which can't run in jsdom).
    env: {
      VITE_SUPABASE_URL: '',
      VITE_SUPABASE_ANON_KEY: '',
    },
  },
}));
