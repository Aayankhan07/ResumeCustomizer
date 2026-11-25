import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';
import { createServiceClient } from '../../../lib/supabase/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Days a soft-deleted transformation is kept before it is purged for good. */
const DELETED_RETENTION_DAYS = 30;

/**
 * Constant-time secret comparison. Both sides are hashed first so the
 * comparison length never depends on the input.
 */
function secretMatches(provided: string | undefined, expected: string): boolean {
  if (!provided) return false;
  const a = createHash('sha256').update(provided).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  try {
    // Cron validation check (security). Fails closed: an unconfigured secret
    // must never leave this service-role endpoint open to anonymous callers.
    const expectedSecret = process.env.CRON_SECRET;
    if (!expectedSecret) {
      console.error('Cleanup route: CRON_SECRET is not configured');
      return NextResponse.json({ success: false, error: 'NOT_CONFIGURED' }, { status: 500 });
    }

    // Header only. Query strings land in access logs and browser history.
    const authHeader = req.headers.get('Authorization');
    const provided = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (!secretMatches(provided, expectedSecret)) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const serviceClient = createServiceClient();

    const { data: rateLimitsDeleted, error: rateLimitError } =
      await serviceClient.rpc('cleanup_old_rate_limits');
    if (rateLimitError) throw new Error(`cleanup_old_rate_limits: ${rateLimitError.code}`);

    // Soft delete only hides a result; this removes it (and the resume and
    // job description stored with it) once the retention window has passed.
    const { data: transformationsPurged, error: purgeError } = await serviceClient.rpc(
      'purge_deleted_transformations',
      { p_retention_days: DELETED_RETENTION_DAYS }
    );
    if (purgeError) throw new Error(`purge_deleted_transformations: ${purgeError.code}`);

    return NextResponse.json(
      {
        success: true,
        deleted_count: rateLimitsDeleted,
        transformations_purged: transformationsPurged,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Cleanup route error:', err);
    return NextResponse.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
