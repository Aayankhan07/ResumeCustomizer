import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const getSessionMock = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { getSession: getSessionMock } }),
}));

import { transformResume, ApiError } from '@/lib/api';

/**
 * Every request used to call response.json() before checking response.ok, so
 * a 502 HTML gateway page threw a bare SyntaxError with no `.code` — which the
 * transform hook then reported as a generic UNKNOWN_ERROR.
 */
describe('transformResume', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    getSessionMock.mockResolvedValue({ data: { session: { access_token: 'token' } } });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    getSessionMock.mockReset();
  });

  const args = { resumeText: 'resume text', jobDescriptionText: 'job description' };

  it('throws a structured ApiError for an HTML gateway error page', async () => {
    fetchMock.mockResolvedValue(
      new Response('<html><body>502 Bad Gateway</body></html>', {
        status: 502,
        headers: { 'content-type': 'text/html' },
      })
    );

    await expect(transformResume(args)).rejects.toBeInstanceOf(ApiError);
    await expect(transformResume(args)).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      status: 502,
    });
  });

  it('surfaces the server error code rather than a generic failure', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ success: false, error: 'RATE_LIMITED', reset_at: '2026-01-01T00:00:00Z' }), {
        status: 429,
        headers: { 'content-type': 'application/json' },
      })
    );

    await expect(transformResume(args)).rejects.toMatchObject({
      code: 'RATE_LIMITED',
      status: 429,
      resetAt: '2026-01-01T00:00:00Z',
    });
  });

  it('throws NETWORK_ERROR when the request never completes', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(transformResume(args)).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  });

  it('throws AUTH_FAILED when there is no session', async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });

    await expect(transformResume(args)).rejects.toMatchObject({ code: 'AUTH_FAILED' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns the payload on success and sends an idempotency key', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          persisted: true,
          data: { summary: 'ok' },
          plain_text: 'text',
          transformation_id: 'abc',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )
    );

    const result = await transformResume(args);

    expect(result.transformation_id).toBe('abc');
    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers['X-Idempotency-Key']).toMatch(/^[a-f0-9]{64}$/);
  });

  it('reports persisted:false rather than failing outright', async () => {
    // The LLM call succeeded and was paid for; the result is still returned,
    // but the caller must know it never reached history.
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          persisted: false,
          error: 'DATABASE_SAVE_FAILED',
          data: { summary: 'ok' },
          plain_text: 'text',
          transformation_id: null,
        }),
        { status: 207, headers: { 'content-type': 'application/json' } }
      )
    );

    const result = await transformResume(args);
    expect(result.persisted).toBe(false);
  });
});
