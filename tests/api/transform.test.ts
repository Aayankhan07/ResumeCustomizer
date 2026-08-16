import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validTransformOutput } from '../fixtures/transformOutput';

/**
 * Route-level tests for POST /api/transform.
 *
 * The route had no test coverage, which is how a prompt that never requested
 * the `meta` object shipped: every transform in production returned 422 and
 * nothing caught it. These exercise the route's decision points — auth, rate
 * limiting, validation, model failure, persistence — with the collaborators
 * mocked, so they run in milliseconds and need no network or database.
 */

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  insert: vi.fn(),
  checkRateLimit: vi.fn(),
  callGroq: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: mocks.getUser },
    from: () => ({
      insert: (row: unknown) => {
        mocks.insert(row);
        return { select: () => ({ single: async () => ({ data: { id: 'txn-1' }, error: null }) }) };
      },
    }),
  }),
}));

vi.mock('@/lib/rateLimit', () => ({ checkRateLimit: mocks.checkRateLimit }));
vi.mock('@/lib/groq', () => ({ callGroqWithFallback: mocks.callGroq }));

const { POST } = await import('@/app/api/transform/route');

const VALID_BODY = {
  resume_text: 'Aayan Khan. Frontend developer. '.repeat(12),
  job_description_text: 'Senior Frontend Engineer at Northwind. React and TypeScript. '.repeat(8),
  optimization_mode: 'description' as const,
};

function request(body: unknown = VALID_BODY): Request {
  return new Request('http://localhost/api/transform', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
  mocks.checkRateLimit.mockResolvedValue({
    allowed: true,
    remaining: 9,
    resetAt: new Date(Date.now() + 3600000),
  });
  mocks.callGroq.mockResolvedValue({
    data: structuredClone(validTransformOutput),
    model_used: 'llama-3.3-70b-versatile',
  });
});

describe('POST /api/transform', () => {
  it('returns 401 when there is no session', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: new Error('no session') });

    const res = await POST(request());
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe('AUTH_FAILED');
    expect(mocks.callGroq).not.toHaveBeenCalled();
  });

  it('rejects a body that fails the request schema before calling the model', async () => {
    const res = await POST(request({ resume_text: 'too short', job_description_text: 'x' }));
    expect(res.status).toBe(400);
    // The paid model call must not happen for input we already know is invalid.
    expect(mocks.callGroq).not.toHaveBeenCalled();
  });

  it('returns 503 when the rate limiter itself is unavailable', async () => {
    // Fails closed: an unreachable limiter must not become an open door.
    mocks.checkRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: new Date(),
      unavailable: true,
    });

    const res = await POST(request());
    expect(res.status).toBe(503);
    expect(mocks.callGroq).not.toHaveBeenCalled();
  });

  it('returns 429 once the quota is spent', async () => {
    mocks.checkRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: new Date(Date.now() + 3600000),
    });

    const res = await POST(request());
    expect(res.status).toBe(429);
    expect(mocks.callGroq).not.toHaveBeenCalled();
  });

  it('persists and returns a transformation on the happy path', async () => {
    const res = await POST(request());
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);

    const row = mocks.insert.mock.calls[0][0];
    expect(row.user_id).toBe('user-1');
    expect(row.detected_job_title).toBe('Software Engineer');
    expect(typeof row.match_score).toBe('number');
  });

  it('computes the score server-side rather than trusting the model', async () => {
    // The model self-reports match_score: 82 in the fixture. The route must
    // overwrite it, or the product's headline number is model-authored.
    const res = await POST(request());
    const body = await res.json();

    const row = mocks.insert.mock.calls[0][0];
    expect(row.match_score).not.toBe(82);
    expect(body.data.meta.match_score).toBe(row.match_score);
  });

  it('attaches a baseline score for the original resume', async () => {
    const res = await POST(request());
    const body = await res.json();

    expect(typeof body.data.meta.baseline_score).toBe('number');
    expect(body.data.meta.baseline_score).toBeGreaterThanOrEqual(0);
    expect(body.data.meta.baseline_score).toBeLessThanOrEqual(100);
  });

  it('passes a validator into the fallback chain', async () => {
    // Validation must run per model attempt. Without this, a schema failure
    // aborts the whole request while healthy fallback models go untried.
    await POST(request());

    const validate = mocks.callGroq.mock.calls[0][3];
    expect(typeof validate).toBe('function');
    expect(validate(validTransformOutput).ok).toBe(true);
    expect(validate({ summary: 'missing everything else' }).ok).toBe(false);
  });

  it('maps an exhausted fallback chain to 422 PARSE_FAILED', async () => {
    mocks.callGroq.mockRejectedValue(new Error('PARSE_FAILED'));

    const res = await POST(request());
    expect(res.status).toBe(422);
    expect((await res.json()).error).toBe('PARSE_FAILED');
  });

  it('maps unparseable model output to 502', async () => {
    mocks.callGroq.mockRejectedValue(new Error('INVALID_JSON'));

    const res = await POST(request());
    expect(res.status).toBe(502);
    expect((await res.json()).error).toBe('INVALID_JSON_FROM_AI');
  });

  it('maps a model timeout to 504', async () => {
    mocks.callGroq.mockRejectedValue(new Error('TIMEOUT while calling model'));

    const res = await POST(request());
    expect(res.status).toBe(504);
    expect((await res.json()).error).toBe('AI_TIMEOUT');
  });

  it('stores the original inputs so rescore can reach them', async () => {
    await POST(request());

    const row = mocks.insert.mock.calls[0][0];
    expect(row.output_json.original_resume_text).toBe(VALID_BODY.resume_text.trim());
    expect(row.output_json.original_job_description).toBe(VALID_BODY.job_description_text.trim());
  });
});
