import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { recordingQuery, eqFilters, argsOf, type RecordingQuery } from '../helpers/queryMock';

/**
 * /api/events (POST, GET) and /api/events/[id] (PATCH, DELETE).
 *
 * POST must confirm the parent transformation belongs to the caller before
 * inserting; the [id] routes must pin every write to the caller's user id.
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

const { POST, GET } = await import('@/app/api/events/route');
const { PATCH, DELETE } = await import('@/app/api/events/[id]/route');

const TXN_ID = '33333333-3333-4333-8333-333333333333';
const EVENT_ID = '44444444-4444-4444-8444-444444444444';

const VALID_EVENT = {
  transformation_id: TXN_ID,
  event_type: 'interview',
  title: 'Onsite with Northwind',
  event_date: '2026-12-01T10:00:00Z',
  interview_round: 'Final',
  interview_format: 'Onsite',
  interviewer_name: 'Pat',
  notes: 'Bring portfolio',
};

function jsonRequest(url: string, method: string, body?: unknown, raw?: string): Request {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
  });
}

const ctx = (id = EVENT_ID) => ({ params: Promise.resolve({ id }) });

let ownershipQuery: RecordingQuery;
let eventsQuery: RecordingQuery;
let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
  ownershipQuery = recordingQuery('transformations', { data: { id: TXN_ID }, error: null });
  eventsQuery = recordingQuery('application_events', {
    data: { id: EVENT_ID },
    error: null,
  });
  mocks.from.mockImplementation((table: string) =>
    table === 'transformations' ? ownershipQuery : eventsQuery
  );
});

afterEach(() => {
  errorSpy.mockRestore();
});

describe('POST /api/events', () => {
  const post = (body?: unknown, raw?: string) =>
    POST(jsonRequest('http://localhost/api/events', 'POST', body, raw));

  it('returns 401 without a session', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: new Error('no session') });
    const res = await post(VALID_EVENT);
    expect(res.status).toBe(401);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await post(undefined, '{"title":');
    expect(res.status).toBe(400);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('returns 400 for an unknown event_type', async () => {
    const res = await post({ ...VALID_EVENT, event_type: 'party' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for unknown keys such as user_id', async () => {
    const res = await post({ ...VALID_EVENT, user_id: 'user-2' });
    expect(res.status).toBe(400);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('returns 400 for a non-uuid transformation_id', async () => {
    const res = await post({ ...VALID_EVENT, transformation_id: 'abc' });
    expect(res.status).toBe(400);
  });

  it('returns 404 and inserts nothing when the transformation is not the caller’s', async () => {
    ownershipQuery = recordingQuery('transformations', { data: null, error: null });

    const res = await post(VALID_EVENT);
    expect(res.status).toBe(404);
    expect((await res.json()).error).toBe('UNAUTHORIZED_OR_NOT_FOUND');
    expect(mocks.from).not.toHaveBeenCalledWith('application_events');
  });

  it('checks ownership of the transformation by id and user id before inserting', async () => {
    const res = await post(VALID_EVENT);
    expect(res.status).toBe(200);

    expect(mocks.from.mock.calls.map((c) => c[0])).toEqual([
      'transformations',
      'application_events',
    ]);
    expect(eqFilters(ownershipQuery)).toEqual([
      ['id', TXN_ID],
      ['user_id', 'user-1'],
    ]);

    const [row] = argsOf(eventsQuery, 'insert') as [Record<string, unknown>];
    expect(row.user_id).toBe('user-1');
    expect(row.transformation_id).toBe(TXN_ID);
    expect(row.interview_round).toBe('Final');
  });

  it('clears interview-only fields for non-interview events', async () => {
    await post({ ...VALID_EVENT, event_type: 'note' });
    const [row] = argsOf(eventsQuery, 'insert') as [Record<string, unknown>];
    expect(row.interview_round).toBeNull();
    expect(row.interview_format).toBeNull();
    expect(row.interviewer_name).toBeNull();
  });

  it('returns 500 without logging the failing row on insert error', async () => {
    eventsQuery = recordingQuery('application_events', {
      data: null,
      error: { code: '23503', message: 'fk', details: 'Failing row contains (Bring portfolio)' },
    });
    const res = await post(VALID_EVENT);
    expect(res.status).toBe(500);
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain('Bring portfolio');
  });
});

describe('GET /api/events', () => {
  const get = (qs = '') => GET(new Request(`http://localhost/api/events${qs}`));

  it('returns 401 without a session', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await get();
    expect(res.status).toBe(401);
  });

  it.each(['?days=abc', '?days=0', '?days=1000'])('returns 400 for %s', async (qs) => {
    const res = await get(qs);
    expect(res.status).toBe(400);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('filters by user id and splits overdue from upcoming', async () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    const soon = new Date(Date.now() + 2 * 86400000).toISOString();
    const far = new Date(Date.now() + 60 * 86400000).toISOString();
    eventsQuery = recordingQuery('application_events', {
      data: [
        { id: 'a', event_date: past },
        { id: 'b', event_date: soon },
        { id: 'c', event_date: far },
        { id: 'd', event_date: null },
      ],
      error: null,
    });

    const res = await get('?days=14');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.overdue.map((e: { id: string }) => e.id)).toEqual(['a']);
    expect(body.data.upcoming.map((e: { id: string }) => e.id)).toEqual(['b']);
    expect(eqFilters(eventsQuery)).toContainEqual(['user_id', 'user-1']);
  });
});

describe('PATCH /api/events/[id]', () => {
  const patch = (body?: unknown, id = EVENT_ID, raw?: string) =>
    PATCH(jsonRequest(`http://localhost/api/events/${id}`, 'PATCH', body, raw), ctx(id));

  it('returns 400 for a non-uuid id', async () => {
    const res = await patch({ is_done: true }, 'nope');
    expect(res.status).toBe(400);
    expect(mocks.getUser).not.toHaveBeenCalled();
  });

  it('returns 401 without a session', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await patch({ is_done: true });
    expect(res.status).toBe(401);
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await patch(undefined, EVENT_ID, '{');
    expect(res.status).toBe(400);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('rejects unknown keys', async () => {
    const res = await patch({ is_done: true, transformation_id: TXN_ID });
    expect(res.status).toBe(400);
  });

  it('updates the caller’s event only', async () => {
    const res = await patch({ is_done: true, outcome: 'Passed' });
    expect(res.status).toBe(200);
    expect(mocks.from).toHaveBeenCalledWith('application_events');
    expect(argsOf(eventsQuery, 'update')).toEqual([{ is_done: true, outcome: 'Passed' }]);
    expect(eqFilters(eventsQuery)).toEqual([
      ['id', EVENT_ID],
      ['user_id', 'user-1'],
    ]);
  });
});

describe('DELETE /api/events/[id]', () => {
  const del = (id = EVENT_ID) =>
    DELETE(new Request(`http://localhost/api/events/${id}`, { method: 'DELETE' }), ctx(id));

  it('returns 400 for a non-uuid id', async () => {
    const res = await del('1 OR 1=1');
    expect(res.status).toBe(400);
  });

  it('returns 401 without a session', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await del();
    expect(res.status).toBe(401);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('deletes filtered by id and user id', async () => {
    const res = await del();
    expect(res.status).toBe(200);
    expect(eventsQuery.calls.some((c) => c[0] === 'delete')).toBe(true);
    expect(eqFilters(eventsQuery)).toEqual([
      ['id', EVENT_ID],
      ['user_id', 'user-1'],
    ]);
  });

  it('returns 500 on database error', async () => {
    eventsQuery = recordingQuery('application_events', {
      data: null,
      error: { code: '42501', message: 'denied' },
    });
    const res = await del();
    expect(res.status).toBe(500);
  });
});
