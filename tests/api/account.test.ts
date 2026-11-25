import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DELETE_CONFIRMATION } from '@/lib/account';

/**
 * DELETE /api/account permanently removes the signed-in user. It must require
 * a session and the exact confirmation phrase, and the deletion itself must
 * run through the service-role admin API for the caller's own id only.
 */

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  signOut: vi.fn(),
  deleteUser: vi.fn(),
  captureMessage: vi.fn(),
  captureException: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: mocks.getUser, signOut: mocks.signOut },
  }),
}));

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: () => ({
    auth: { admin: { deleteUser: mocks.deleteUser } },
  }),
}));

vi.mock('@sentry/nextjs', () => ({
  captureMessage: mocks.captureMessage,
  captureException: mocks.captureException,
}));

const { DELETE } = await import('@/app/api/account/route');

function request(body?: unknown, raw?: string): Request {
  return new Request('http://localhost/api/account', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
  });
}

let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
  mocks.deleteUser.mockResolvedValue({ data: {}, error: null });
  mocks.signOut.mockResolvedValue({ error: null });
});

afterEach(() => {
  errorSpy.mockRestore();
});

describe('DELETE /api/account', () => {
  it('returns 401 without a session and deletes nothing', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: new Error('no session') });

    const res = await DELETE(request({ confirm: DELETE_CONFIRMATION }));
    expect(res.status).toBe(401);
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it('returns 400 when there is no body', async () => {
    const res = await DELETE(request());
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('INVALID_REQUEST');
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await DELETE(request(undefined, '{not json'));
    expect(res.status).toBe(400);
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it('returns 400 when the confirmation phrase is wrong', async () => {
    const res = await DELETE(request({ confirm: DELETE_CONFIRMATION.toLowerCase() }));
    expect(res.status).toBe(400);
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it('returns 400 when extra keys are sent alongside the phrase', async () => {
    const res = await DELETE(request({ confirm: DELETE_CONFIRMATION, user_id: 'someone-else' }));
    expect(res.status).toBe(400);
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it('deletes the caller via the admin API and signs out on success', async () => {
    const res = await DELETE(request({ confirm: DELETE_CONFIRMATION }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });

    expect(mocks.deleteUser).toHaveBeenCalledTimes(1);
    expect(mocks.deleteUser).toHaveBeenCalledWith('user-1');
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
  });

  it('still succeeds when signOut rejects after the user is gone', async () => {
    mocks.signOut.mockRejectedValue(new Error('session already invalid'));

    const res = await DELETE(request({ confirm: DELETE_CONFIRMATION }));
    expect(res.status).toBe(200);
  });

  it('returns 500 and does not sign out when the admin delete fails', async () => {
    mocks.deleteUser.mockResolvedValue({
      data: null,
      error: { code: 'unexpected_failure', status: 500, message: 'db down' },
    });

    const res = await DELETE(request({ confirm: DELETE_CONFIRMATION }));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe('INTERNAL_SERVER_ERROR');
    expect(mocks.signOut).not.toHaveBeenCalled();
    expect(mocks.captureMessage).toHaveBeenCalledTimes(1);
    // Sentry gets the opaque user id only, never an email or other PII.
    const [, context] = mocks.captureMessage.mock.calls[0];
    expect(context.user).toEqual({ id: 'user-1' });
  });
});
