// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * GET /auth/callback: OAuth / email-link landing. It must surface provider
 * errors and failed code exchanges instead of pretending login worked, and
 * only forward to same-origin relative `next` paths.
 */

const mocks = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { exchangeCodeForSession: mocks.exchangeCodeForSession },
  }),
}));

const { GET } = await import('@/app/auth/callback/route');

const ORIGIN = 'http://localhost:3000';

async function callback(qs: string) {
  const res = await GET(new Request(`${ORIGIN}/auth/callback${qs}`));
  return { status: res.status, location: res.headers.get('location') };
}

let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  mocks.exchangeCodeForSession.mockResolvedValue({ data: {}, error: null });
});

afterEach(() => {
  errorSpy.mockRestore();
});

describe('GET /auth/callback', () => {
  it('redirects to /dashboard after a successful exchange with no next', async () => {
    const { status, location } = await callback('?code=abc');
    expect(status).toBe(307);
    expect(location).toBe(`${ORIGIN}/dashboard`);
    expect(mocks.exchangeCodeForSession).toHaveBeenCalledWith('abc');
  });

  it('forwards to a same-origin relative next', async () => {
    const { location } = await callback(
      `?code=abc&next=${encodeURIComponent('/transform?role=PM')}`
    );
    expect(location).toBe(`${ORIGIN}/transform?role=PM`);
  });

  it.each([
    ['protocol-relative', '//evil.com'],
    ['backslash', '/\\evil.com'],
    ['absolute https', 'https://evil.com/x'],
    ['javascript scheme', 'javascript:alert(1)'],
    ['bare host', 'evil.com'],
  ])('falls back to /dashboard for a %s next', async (_label, next) => {
    const { location } = await callback(`?code=abc&next=${encodeURIComponent(next)}`);
    expect(location).toBe(`${ORIGIN}/dashboard`);
    expect(new URL(location!).host).toBe('localhost:3000');
  });

  it('redirects to /login?error=oauth_denied on a provider error, without exchanging', async () => {
    const { location } = await callback(
      '?error=access_denied&error_description=User%20denied&code=abc'
    );
    expect(location).toBe(`${ORIGIN}/login?error=oauth_denied`);
    expect(mocks.exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it('redirects to /login?error=auth_failed when there is no code', async () => {
    const { location } = await callback('');
    expect(location).toBe(`${ORIGIN}/login?error=auth_failed`);
    expect(mocks.exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it('redirects to /login?error=auth_failed when the exchange returns an error', async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({
      data: null,
      error: { message: 'invalid flow state' },
    });
    const { location } = await callback('?code=expired&next=/transform');
    expect(location).toBe(`${ORIGIN}/login?error=auth_failed`);
  });

  it('redirects to /login?error=auth_failed when the exchange throws', async () => {
    mocks.exchangeCodeForSession.mockRejectedValue(new Error('network'));
    const { location } = await callback('?code=abc');
    expect(location).toBe(`${ORIGIN}/login?error=auth_failed`);
  });
});
