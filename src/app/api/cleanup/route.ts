import { NextResponse } from 'next/server';
import { createServiceClient } from '../../../lib/supabase/service';

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
    const cronSecret = req.headers.get('Authorization')?.replace('Bearer ', '');

    if (cronSecret !== expectedSecret) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const serviceClient = createServiceClient();
    const { data, error } = await serviceClient.rpc('cleanup_old_rate_limits');

    if (error) throw error;

    return NextResponse.json({ success: true, deleted_count: data }, { status: 200 });

  } catch (err) {
    console.error('Cleanup route error:', err);
    return NextResponse.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
