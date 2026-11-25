// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * src/proxy.ts (Next 16's renamed middleware): session refresh plus route
 * gating. Protected routes bounce anonymous visitors to /login with the
 * destination preserved; auth pages bounce signed-in users onward, honouring
 * only same-origin relative ?redirect= values.
 */

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  createServerClient: vi.fn(),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: (...args: unknown[]) => {
    mocks.createServerClient(...args);
    return { auth: { getUser: mocks.getUser } };
  },
}));

vi.mock('@/lib/env', () => ({
  getClientEnv: () => ({
    NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
  }),
}));

const { proxy, config } = await import('@/proxy');

const ORIGIN = 'http://localhost:3000';

function signedIn() {
  mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
}

function signedOut() {
  mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
}

async function run(path: string) {
  return proxy(new NextRequest(new URL(path, ORIGIN)));
}

function location(res: Response): string | null {
  return res.headers.get('location');
}

let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  signedOut();
});

afterEach(() => {
  errorSpy.mockRestore();
});

describe('proxy: protected routes', () => {
  it('redirects an anonymous /dashboard visit to /login?redirect=%2Fdashboard', async () => {
    const res = await run('/dashboard');
    expect(res.status).toBe(307);
    expect(location(res)).toBe(`${ORIGIN}/login?redirect=%2Fdashboard`);
  });

  it('preserves the query string of the original destination', async () => {
    const res = await run('/transform?role=Data%20Engineer');
    // The original search is kept verbatim (still percent-encoded) and then
    // encoded once more as the redirect value.
    expect(location(res)).toBe(`${ORIGIN}/login?redirect=%2Ftransform%3Frole%3DData%2520Engineer`);
    const target = new URL(location(res)!).searchParams.get('redirect');
    expect(target).toBe('/transform?role=Data%20Engineer');
  });

  it.each(['/transform', '/profile', '/dashboard/abc'])('gates %s', async (path) => {
    const res = await run(path);
    expect(location(res)).toMatch(/\/login\?redirect=/);
  });

  it('treats a Supabase error as signed out rather than throwing', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'jwt expired' } });
    const res = await run('/dashboard');
    expect(location(res)).toBe(`${ORIGIN}/login?redirect=%2Fdashboard`);
  });

  it('treats a thrown getUser as signed out and still renders public pages', async () => {
    mocks.getUser.mockRejectedValue(new Error('network down'));
    const res = await run('/');
    expect(res.status).toBe(200);
    expect(location(res)).toBeNull();
  });

  it('lets a signed-in user through to a protected route', async () => {
    signedIn();
    const res = await run('/dashboard');
    expect(location(res)).toBeNull();
    expect(res.headers.get('x-middleware-next')).toBe('1');
  });
});

describe('proxy: auth pages', () => {
  it('lets anonymous visitors see /login', async () => {
    const res = await run('/login');
    expect(location(res)).toBeNull();
  });

  it('sends a signed-in /login visit to /dashboard', async () => {
    signedIn();
    const res = await run('/login');
    expect(location(res)).toBe(`${ORIGIN}/dashboard`);
  });

  it('sends a signed-in /signup visit to /dashboard', async () => {
    signedIn();
    const res = await run('/signup');
    expect(location(res)).toBe(`${ORIGIN}/dashboard`);
  });

  it('honours a same-origin ?redirect=', async () => {
    signedIn();
    const res = await run('/login?redirect=/transform');
    expect(location(res)).toBe(`${ORIGIN}/transform`);
  });

  it('honours an encoded ?redirect= carrying its own query', async () => {
    signedIn();
    const res = await run('/login?redirect=%2Ftransform%3Frole%3DPM');
    expect(location(res)).toBe(`${ORIGIN}/transform?role=PM`);
  });

  it.each([
    ['protocol-relative', '//evil.com'],
    ['encoded protocol-relative', '%2F%2Fevil.com'],
    ['backslash', '/%5Cevil.com'],
    ['absolute URL', 'https://evil.com/'],
    ['relative without slash', 'evil.com'],
  ])('ignores an unsafe %s redirect', async (_label, value) => {
    signedIn();
    const res = await run(`/login?redirect=${value}`);
    expect(location(res)).toBe(`${ORIGIN}/dashboard`);
    expect(new URL(location(res)!).host).toBe('localhost:3000');
  });

  // Regression: the URL parser strips ASCII tab/newline, so "/%09/evil.com"
  // passed the old prefix checks and then resolved to //evil.com.
  it('ignores a tab-smuggled protocol-relative redirect (/%09/evil.com)', async () => {
    signedIn();
    const res = await run('/login?redirect=/%09/evil.com');
    expect(new URL(location(res)!).host).toBe('localhost:3000');
  });
});

describe('proxy: config', () => {
  it('does not run on static assets', () => {
    const [pattern] = config.matcher;
    const re = new RegExp(`^${pattern}$`);
    expect(re.test('/_next/static/chunk.js')).toBe(false);
    expect(re.test('/logo.svg')).toBe(false);
    expect(re.test('/dashboard')).toBe(true);
  });

  it('builds the Supabase client from validated env', async () => {
    await run('/');
    expect(mocks.createServerClient).toHaveBeenCalledWith(
      'https://project.supabase.co',
      'anon-key',
      expect.objectContaining({ cookies: expect.any(Object) })
    );
  });
});
