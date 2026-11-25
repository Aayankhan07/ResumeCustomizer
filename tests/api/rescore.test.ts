import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validTransformOutput } from '../fixtures/transformOutput';
import { recordingQuery, eqFilters, argsOf, type RecordingQuery } from '../helpers/queryMock';

/**
 * POST /api/rescore reads the caller's transformation through the RLS-scoped
 * user client, then writes the new score with the service role (score and
 * output_json columns are not client-writable since migration 014). The
 * write must still be pinned to the caller's user id.
 */

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  userFrom: vi.fn(),
  serviceFrom: vi.fn(),
  checkRateLimit: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: mocks.getUser },
    from: mocks.userFrom,
  }),
}));

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: () => ({ from: mocks.serviceFrom }),
}));

vi.mock('@/lib/rateLimit', () => ({ checkRateLimit: mocks.checkRateLimit }));

const { POST } = await import('@/app/api/rescore/route');

const TXN_ID = '11111111-1111-4111-8111-111111111111';
const JD = 'Software Engineer. Python, SQL, Docker and Kubernetes experience required.';

function request(body: unknown = { transformation_id: TXN_ID }, raw?: string): Request {
  return new Request('http://localhost/api/rescore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: raw ?? JSON.stringify(body),
  });
}

let readQuery: RecordingQuery;
let writeQuery: RecordingQuery;
let errorSpy: ReturnType<typeof vi.spyOn>;

function storedRow(overrides: Record<string, unknown> = {}) {
  return {
    id: TXN_ID,
    output_json: {
      ...structuredClone(validTransformOutput),
      original_job_description: JD,
      ...overrides,
    },
    output_plain_text: 'plain',
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
  mocks.checkRateLimit.mockResolvedValue({
    allowed: true,
    remaining: 5,
    resetAt: new Date(Date.now() + 3600000),
  });
  readQuery = recordingQuery('transformations', { data: storedRow(), error: null });
  writeQuery = recordingQuery('transformations', { data: null, error: null });
  mocks.userFrom.mockImplementation(() => readQuery);
  mocks.serviceFrom.mockImplementation(() => writeQuery);
});

afterEach(() => {
  errorSpy.mockRestore();
});

describe('POST /api/rescore', () => {
  it('returns 401 without a session', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: new Error('no session') });

    const res = await POST(request());
    expect(res.status).toBe(401);
    expect(mocks.checkRateLimit).not.toHaveBeenCalled();
    expect(mocks.userFrom).not.toHaveBeenCalled();
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await POST(request(undefined, '{"transformation_id":'));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('INVALID_REQUEST');
    expect(mocks.userFrom).not.toHaveBeenCalled();
  });

  it('returns 400 for a non-uuid id', async () => {
    const res = await POST(request({ transformation_id: 'abc' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for out-of-range weights', async () => {
    const res = await POST(request({ transformation_id: TXN_ID, weights: { techDepth: 50 } }));
    expect(res.status).toBe(400);
    expect(mocks.serviceFrom).not.toHaveBeenCalled();
  });

  it('returns 429 when rate limited', async () => {
    const resetAt = new Date(Date.now() + 60000);
    mocks.checkRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetAt });

    const res = await POST(request());
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toBe('RATE_LIMITED');
    expect(body.reset_at).toBe(resetAt.toISOString());
    expect(mocks.checkRateLimit).toHaveBeenCalledWith('user-1', 'rescore');
    expect(mocks.userFrom).not.toHaveBeenCalled();
  });

  it('returns 503 when the rate limiter is unavailable', async () => {
    mocks.checkRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: new Date(),
      unavailable: true,
    });

    const res = await POST(request());
    expect(res.status).toBe(503);
  });

  it('returns 404 when the transformation is not found for this user', async () => {
    readQuery = recordingQuery('transformations', { data: null, error: null });

    const res = await POST(request());
    expect(res.status).toBe(404);
    expect((await res.json()).error).toBe('TRANSFORMATION_NOT_FOUND');
    expect(mocks.serviceFrom).not.toHaveBeenCalled();
  });

  it('scopes the read to the caller and to non-deleted rows', async () => {
    await POST(request());
    expect(mocks.userFrom).toHaveBeenCalledWith('transformations');
    expect(eqFilters(readQuery)).toEqual(
      expect.arrayContaining([
        ['id', TXN_ID],
        ['user_id', 'user-1'],
        ['is_deleted', false],
      ])
    );
  });

  it('returns 409 RESCORE_UNAVAILABLE for rows without original_job_description', async () => {
    readQuery = recordingQuery('transformations', {
      data: storedRow({ original_job_description: undefined }),
      error: null,
    });

    const res = await POST(request());
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe('RESCORE_UNAVAILABLE');
    expect(mocks.serviceFrom).not.toHaveBeenCalled();
  });

  it('writes the new score with the service client, filtered by user id', async () => {
    const res = await POST(request({ transformation_id: TXN_ID, weights: { techDepth: 1.5 } }));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(typeof body.data.score).toBe('number');

    // The write goes through the service role, never the user client.
    expect(mocks.serviceFrom).toHaveBeenCalledWith('transformations');
    expect(mocks.userFrom).toHaveBeenCalledTimes(1);
    expect(readQuery.calls.some((c) => c[0] === 'update')).toBe(false);

    const [update] = argsOf(writeQuery, 'update') as [Record<string, unknown>];
    expect(update.match_score).toBe(body.data.score);
    expect(update).not.toHaveProperty('user_id');
    expect(eqFilters(writeQuery)).toEqual([
      ['id', TXN_ID],
      ['user_id', 'user-1'],
    ]);
  });

  it('returns 500 DATABASE_ERROR when the update fails, logging only the code', async () => {
    writeQuery = recordingQuery('transformations', {
      data: null,
      error: { code: '42501', message: 'denied', details: 'Failing row contains (resume text...)' },
    });

    const res = await POST(request());
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe('DATABASE_ERROR');
    const logged = JSON.stringify(errorSpy.mock.calls);
    expect(logged).not.toContain('resume text');
  });
});
