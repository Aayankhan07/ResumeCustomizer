import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * The prerender escape hatch in env.ts must be narrow: it exists so a clean
 * checkout can run `next build` without a .env file, and must never mask a
 * genuinely misconfigured deployment at runtime.
 */
describe('getClientEnv', () => {
  const original = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...original };
  });

  it('throws at runtime when public env vars are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PHASE;

    const { getClientEnv } = await import('@/lib/env');
    expect(() => getClientEnv()).toThrow(/Invalid public environment/);
  });

  it('returns placeholders during a production build instead of failing it', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    process.env.NEXT_PHASE = 'phase-production-build';

    const { getClientEnv } = await import('@/lib/env');
    expect(getClientEnv().NEXT_PUBLIC_SUPABASE_URL).toContain('placeholder');
  });

  it('does not cache placeholders, so a later real call still throws', async () => {
    process.env.NEXT_PHASE = 'phase-production-build';
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { getClientEnv } = await import('@/lib/env');
    getClientEnv();

    delete process.env.NEXT_PHASE;
    expect(() => getClientEnv()).toThrow(/Invalid public environment/);
  });

  it('returns real values when configured', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    delete process.env.NEXT_PHASE;

    const { getClientEnv } = await import('@/lib/env');
    expect(getClientEnv()).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
    });
  });

  it('rejects a malformed URL', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'not-a-url';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    delete process.env.NEXT_PHASE;

    const { getClientEnv } = await import('@/lib/env');
    expect(() => getClientEnv()).toThrow(/valid URL/);
  });
});

describe('getServerEnv', () => {
  const original = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...original };
  });

  it('throws at runtime when server secrets are missing', async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.GROQ_API_KEY;
    delete process.env.NEXT_PHASE;

    const { getServerEnv } = await import('@/lib/env');
    expect(() => getServerEnv()).toThrow(/Invalid server environment/);
  });
});
