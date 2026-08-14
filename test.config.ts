import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      // import.meta.dirname rather than __dirname: Vite's native config loader
      // does not provide the CJS globals.
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
