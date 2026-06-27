import { NextResponse } from 'next/server';
import { createServiceClient } from '../../../lib/supabase/service';

export async function GET(req: Request) {
  try {
    // Cron validation check (security)
    const { searchParams } = new URL(req.url);
    const cronSecret = searchParams.get('secret') || req.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
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
