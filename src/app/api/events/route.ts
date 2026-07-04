import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export async function POST(req: Request) {
  try {
    // 1. Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'AUTH_FAILED' }, { status: 401 });
    }

    // 2. Parse body
    const body = await req.json();
    const {
      transformation_id,
      event_type,
      title,
      event_date,
      interview_round,
      interview_format,
      interviewer_name,
      notes
    } = body;

    if (!transformation_id || !event_type || !title) {
      return NextResponse.json({ success: false, error: 'MISSING_REQUIRED_FIELDS' }, { status: 400 });
    }

    // 3. Security: Check if the transformation belongs to the user
    const { data: transformation, error: transError } = await supabase
      .from('transformations')
      .select('id')
      .eq('id', transformation_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (transError || !transformation) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED_OR_NOT_FOUND' }, { status: 403 });
    }

    // 4. Insert event
    const { data: event, error: eventError } = await supabase
      .from('application_events')
      .insert({
        transformation_id,
        user_id: user.id,
        event_type,
        title,
        event_date: event_date || null,
        interview_round: event_type === 'interview' ? interview_round : null,
        interview_format: event_type === 'interview' ? interview_format : null,
        interviewer_name: event_type === 'interview' ? interviewer_name : null,
        notes: notes || null
      })
      .select()
      .single();

    if (eventError) {
      console.error('Error inserting event:', eventError);
      return NextResponse.json({ success: false, error: eventError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: event });
  } catch (err) {
    console.error('Unhandled error in POST /api/events:', err);
    return NextResponse.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    // 1. Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'AUTH_FAILED' }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get('days');
    const days = daysParam ? parseInt(daysParam, 10) : 14;

    // Fetch all non-done events (interviews and follow-ups) for the user, joined with transformation info
    const { data: events, error } = await supabase
      .from('application_events')
      .select(`
        *,
        transformations (
          detected_job_title,
          detected_company
        )
      `)
      .eq('user_id', user.id)
      .eq('is_done', false)
      .in('event_type', ['interview', 'follow_up'])
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const now = new Date();
    const futureLimit = new Date();
    futureLimit.setDate(futureLimit.getDate() + days);

    const overdue: any[] = [];
    const upcoming: any[] = [];

    events?.forEach((event: any) => {
      if (!event.event_date) return;
      const eventDate = new Date(event.event_date);
      if (eventDate < now) {
        overdue.push(event);
      } else if (eventDate <= futureLimit) {
        upcoming.push(event);
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        overdue,
        upcoming
      }
    });
  } catch (err) {
    console.error('Unhandled error in GET /api/events:', err);
    return NextResponse.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
