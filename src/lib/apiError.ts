import { NextResponse } from 'next/server';

/**
 * Standard error response for API routes.
 *
 * Routes used to return Supabase error objects straight to the client, e.g.
 * `NextResponse.json({ error: dbError.message })`, which leaks table names,
 * constraint names, and column names to anyone who can trigger a failure.
 * Log the detail server-side; send the client a stable code only.
 */
export function apiError(
  code: string,
  status: number,
  detail?: unknown,
  extra?: Record<string, unknown>
) {
  if (detail !== undefined) {
    console.error(`[api:${code}]`, redactDetail(detail));
  }
  return NextResponse.json({ success: false, error: code, ...extra }, { status });
}

/**
 * Postgres errors carry the failing row in `details` (and sometimes `hint`),
 * which can include resume text or notes. Keep only code and message.
 */
function redactDetail(detail: unknown): unknown {
  if (detail && typeof detail === 'object' && !Array.isArray(detail) && 'code' in detail) {
    const { code, message } = detail as { code?: unknown; message?: unknown };
    return { code, message };
  }
  return detail;
}

/** Convenience wrappers for the codes used across routes. */
export const apiErrors = {
  unauthorized: () => apiError('AUTH_FAILED', 401),
  notFound: (code = 'NOT_FOUND') => apiError(code, 404),
  invalidBody: (issues?: unknown) =>
    apiError('INVALID_REQUEST', 400, issues, issues ? { details: issues } : undefined),
  internal: (detail?: unknown) => apiError('INTERNAL_SERVER_ERROR', 500, detail),
  database: (detail?: unknown) => apiError('DATABASE_ERROR', 500, detail),
};
