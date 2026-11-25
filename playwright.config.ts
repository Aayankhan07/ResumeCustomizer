import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

/**
 * Browser smoke tests for the public, signed-out surface of the app.
 *
 * Run with `npm run test:e2e` (first time: `npx playwright install chromium`).
 * The dev server is started on port 3100 so it does not collide with a
 * developer's own `npm run dev` on 3000.
 *
 * No real Supabase project is required: when neither the shell nor a
 * .env.local provides the NEXT_PUBLIC_* vars, the server gets placeholder
 * values (the proxy treats the failed session refresh as "signed out"), which
 * is all the signed-out pages need. Placeholders are only injected when no
 * .env.local exists, because Next's env loading never overrides a variable
 * that is already set in process.env.
 */
const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

const placeholderEnv: Record<string, string> = existsSync('.env.local')
  ? {}
  : {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321',
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'e2e-placeholder-anon-key',
    };

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60_000,
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { ...placeholderEnv, NEXT_TELEMETRY_DISABLED: '1' },
  },
});
