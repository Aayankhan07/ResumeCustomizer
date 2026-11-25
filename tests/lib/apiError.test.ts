import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiError, apiErrors } from '@/lib/apiError';

/**
 * Postgres errors carry the failing row in `details` (and sometimes `hint`),
 * which can include resume text, notes or contact details. apiError must log
 * only code + message, and never send DB detail to the client.
 */

let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  errorSpy.mockRestore();
});

const PG_ERROR = {
  code: '23505',
  message: 'duplicate key value violates unique constraint',
  details: 'Failing row contains (john@example.com, 555-0100, full resume text)',
  hint: 'Key (email)=(john@example.com) already exists.',
};

describe('apiError', () => {
  it('logs database errors with code and message only', async () => {
    const res = apiErrors.database(PG_ERROR);
    expect(res.status).toBe(500);

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const [prefix, logged] = errorSpy.mock.calls[0];
    expect(prefix).toBe('[api:DATABASE_ERROR]');
    expect(logged).toEqual({ code: '23505', message: PG_ERROR.message });

    const all = JSON.stringify(errorSpy.mock.calls);
    expect(all).not.toContain('john@example.com');
    expect(all).not.toContain('full resume text');
  });

  it('never returns database detail to the client', async () => {
    const res = apiErrors.database(PG_ERROR);
    expect(await res.json()).toEqual({ success: false, error: 'DATABASE_ERROR' });
  });

  it('redacts internal errors that look like Postgres errors too', () => {
    apiErrors.internal(PG_ERROR);
    expect(errorSpy.mock.calls[0][1]).toEqual({ code: '23505', message: PG_ERROR.message });
  });

  it('logs non-object detail unchanged', () => {
    apiErrors.database('42P01');
    expect(errorSpy).toHaveBeenCalledWith('[api:DATABASE_ERROR]', '42P01');
  });

  it('does not log when no detail is given', () => {
    const res = apiErrors.unauthorized();
    expect(res.status).toBe(401);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('returns validation issues to the client for invalid bodies', async () => {
    const issues = [{ path: ['status'], message: 'Invalid option' }];
    const res = apiErrors.invalidBody(issues);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      success: false,
      error: 'INVALID_REQUEST',
      details: issues,
    });
  });

  it('merges extra fields into the response body', async () => {
    const res = apiError('RATE_LIMITED', 429, undefined, { remaining: 0 });
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ success: false, error: 'RATE_LIMITED', remaining: 0 });
  });

  it('notFound uses the given code', async () => {
    const res = apiErrors.notFound('TRANSFORMATION_NOT_FOUND');
    expect(res.status).toBe(404);
    expect((await res.json()).error).toBe('TRANSFORMATION_NOT_FOUND');
  });
});
