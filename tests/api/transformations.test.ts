import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { recordingQuery, eqFilters, argsOf, type RecordingQuery } from '../helpers/queryMock';

/**
 * PATCH /api/transformations/[id] used to copy every body key into the
 * update. It now validates the id, rejects unknown keys, restricts
 * application_url to http(s), and pins the update to the caller's rows.
 *
 * The route exports PATCH only; deletion is a soft delete handled elsewhere.
 */

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: mocks.getUser },
    from: mocks.from,
  }),
}));

const route = await import('@/app/api/transformations/[id]/route');
const { PATCH } = route;

const ID = '22222222-2222-4222-8222-222222222222';

function request(body?: unknown, raw?: string): Request {
  return new Request(`http://localhost/api/transformations/${ID}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: raw ?? JSON.stringify(body),
  });
}

const ctx = (id = ID) => ({ params: Promise.resolve({ id }) });

let query: RecordingQuery;
let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
  query = recordingQuery('transformations', { data: { id: ID, status: 'Applied' }, error: null });
  mocks.from.mockImplementation(() => query);
});

afterEach(() => {
  errorSpy.mockRestore();
});

describe('PATCH /api/transformations/[id]', () => {
  it('does not export a DELETE handler', () => {
    expect((route as Record<string, unknown>).DELETE).toBeUndefined();
  });

  it('returns 400 for a non-uuid id before touching auth or the database', async () => {
    const res = await PATCH(request({ status: 'Applied' }), ctx('not-a-uuid'));
    expect(res.status).toBe(400);
    expect(mocks.getUser).not.toHaveBeenCalled();
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('returns 401 without a session', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: new Error('no session') });
    const res = await PATCH(request({ status: 'Applied' }), ctx());
    expect(res.status).toBe(401);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await PATCH(request(undefined, '{"status":'), ctx());
    expect(res.status).toBe(400);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('returns 400 for an empty object', async () => {
    const res = await PATCH(request({}), ctx());
    expect(res.status).toBe(400);
  });

  it('rejects unknown keys (strictObject)', async () => {
    const res = await PATCH(request({ status: 'Applied', match_score: 100 }), ctx());
    expect(res.status).toBe(400);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('rejects user_id in the body so rows cannot be reassigned', async () => {
    const res = await PATCH(request({ user_id: 'user-2' }), ctx());
    expect(res.status).toBe(400);
  });

  it.each([
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'ftp://example.com/job',
    'not a url',
  ])('rejects application_url %s', async (url) => {
    const res = await PATCH(request({ application_url: url }), ctx());
    expect(res.status).toBe(400);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('accepts an https application_url', async () => {
    const res = await PATCH(request({ application_url: 'https://jobs.example.com/123' }), ctx());
    expect(res.status).toBe(200);
  });

  it('updates only the validated fields, filtered by id and user id', async () => {
    const res = await PATCH(request({ status: 'Applied', priority: 'High' }), ctx());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, data: { id: ID, status: 'Applied' } });

    expect(mocks.from).toHaveBeenCalledWith('transformations');
    expect(argsOf(query, 'update')).toEqual([{ status: 'Applied', priority: 'High' }]);
    expect(eqFilters(query)).toEqual([
      ['id', ID],
      ['user_id', 'user-1'],
    ]);
  });

  it('returns 500 DATABASE_ERROR without leaking or logging row details', async () => {
    query = recordingQuery('transformations', {
      data: null,
      error: {
        code: '23514',
        message: 'check violation',
        details: 'Failing row contains (secret resume content)',
        hint: 'some hint',
      },
    });

    const res = await PATCH(request({ status: 'Applied' }), ctx());
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ success: false, error: 'DATABASE_ERROR' });

    const logged = JSON.stringify(errorSpy.mock.calls);
    expect(logged).toContain('23514');
    expect(logged).not.toContain('secret resume content');
    expect(logged).not.toContain('some hint');
  });
});
