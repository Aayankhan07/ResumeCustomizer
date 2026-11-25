import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    // Unit and route tests only. Playwright specs live in e2e/ and run with
    // `npm run test:e2e`; vitest must not pick up their *.spec.ts files.
    include: ['tests/**/*.test.{ts,tsx}'],
    exclude: ['node_modules/**', 'e2e/**', '.next/**'],
  },
  resolve: {
    alias: {
      // import.meta.dirname rather than __dirname: Vite's native config loader
      // does not provide the CJS globals.
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
