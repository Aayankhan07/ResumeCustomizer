import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * GET /api/cleanup is a service-role endpoint driven by Vercel Cron. It must
 * fail closed when the secret is unset and reject any caller without the
 * exact bearer token.
 */

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  createServiceClient: vi.fn(),
}));

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: () => {
    mocks.createServiceClient();
    return { rpc: (...args: unknown[]) => mocks.rpc(...args) };
  },
}));

const { GET } = await import('@/app/api/cleanup/route');

const SECRET = 'test-cron-secret-value';

function request(authorization?: string): Request {
  const headers: Record<string, string> = {};
  if (authorization !== undefined) headers.Authorization = authorization;
  return new Request('http://localhost/api/cleanup', { headers });
}

let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('CRON_SECRET', SECRET);
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  mocks.rpc.mockImplementation(async (name: string) => {
    if (name === 'cleanup_old_rate_limits') return { data: 12, error: null };
    if (name === 'purge_deleted_transformations') return { data: 3, error: null };
    return { data: null, error: { code: 'UNEXPECTED' } };
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  errorSpy.mockRestore();
});

describe('GET /api/cleanup', () => {
  it('returns 500 NOT_CONFIGURED when CRON_SECRET is unset', async () => {
    vi.stubEnv('CRON_SECRET', '');

    const res = await GET(request(`Bearer ${SECRET}`));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe('NOT_CONFIGURED');
    expect(mocks.createServiceClient).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('returns 401 when the Authorization header is missing', async () => {
    const res = await GET(request());
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe('UNAUTHORIZED');
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('returns 401 for a wrong bearer token', async () => {
    const res = await GET(request('Bearer not-the-secret'));
    expect(res.status).toBe(401);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('returns 401 when the secret is sent without the Bearer scheme', async () => {
    const res = await GET(request(SECRET));
    expect(res.status).toBe(401);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('ignores a secret passed in the query string', async () => {
    const res = await GET(new Request(`http://localhost/api/cleanup?secret=${SECRET}`));
    expect(res.status).toBe(401);
  });

  it('runs both cleanup RPCs with the correct token and returns their counts', async () => {
    const res = await GET(request(`Bearer ${SECRET}`));
    expect(res.status).toBe(200);

    expect(mocks.rpc).toHaveBeenCalledTimes(2);
    expect(mocks.rpc).toHaveBeenNthCalledWith(1, 'cleanup_old_rate_limits');
    expect(mocks.rpc).toHaveBeenNthCalledWith(2, 'purge_deleted_transformations', {
      p_retention_days: 30,
    });

    expect(await res.json()).toEqual({
      success: true,
      deleted_count: 12,
      transformations_purged: 3,
    });
  });

  it('returns 500 and skips the purge when the rate-limit cleanup fails', async () => {
    mocks.rpc.mockResolvedValueOnce({ data: null, error: { code: '42883', message: 'nope' } });

    const res = await GET(request(`Bearer ${SECRET}`));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe('INTERNAL_SERVER_ERROR');
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });

  it('returns 500 when the purge RPC fails', async () => {
    mocks.rpc
      .mockResolvedValueOnce({ data: 1, error: null })
      .mockResolvedValueOnce({ data: null, error: { code: '57014', message: 'timeout' } });

    const res = await GET(request(`Bearer ${SECRET}`));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe('INTERNAL_SERVER_ERROR');
  });
});
