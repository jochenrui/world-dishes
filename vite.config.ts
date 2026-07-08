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
  },
}));
