import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { apiErrors } from '../../../lib/apiError';
import { createEventSchema, eventsQuerySchema } from '../../../lib/schemas/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ApplicationEvent {
  id: string;
  event_date: string | null;
  [key: string]: unknown;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return apiErrors.unauthorized();

    // Previously only 3 of 8 fields were checked; the rest were inserted raw.
    const parsed = createEventSchema.safeParse(await req.json());
    if (!parsed.success) {
      return apiErrors.invalidBody(parsed.error.issues);
    }

    const {
      transformation_id,
      event_type,
      title,
      event_date,
      interview_round,
      interview_format,
      interviewer_name,
      notes,
    } = parsed.data;

    // The parent transformation must belong to the caller.
    const { data: transformation, error: transError } = await supabase
      .from('transformations')
      .select('id')
      .eq('id', transformation_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (transError || !transformation) {
      return apiErrors.notFound('UNAUTHORIZED_OR_NOT_FOUND');
    }

    const isInterview = event_type === 'interview';

    const { data: event, error: eventError } = await supabase
      .from('application_events')
      .insert({
        transformation_id,
        user_id: user.id,
        event_type,
        title,
        event_date: event_date ?? null,
        interview_round: isInterview ? (interview_round ?? null) : null,
        interview_format: isInterview ? (interview_format ?? null) : null,
        interviewer_name: isInterview ? (interviewer_name ?? null) : null,
        notes: notes ?? null,
      })
      .select()
      .single();

    if (eventError) return apiErrors.database(eventError);

    return NextResponse.json({ success: true, data: event });
  } catch (err) {
    return apiErrors.internal(err);
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return apiErrors.unauthorized();

    // parseInt with no guard previously let ?days=abc through as NaN, which
    // made every event fall outside the window.
    const { searchParams } = new URL(req.url);
    const query = eventsQuerySchema.safeParse({
      days: searchParams.get('days') ?? undefined,
    });
    if (!query.success) {
      return apiErrors.invalidBody(query.error.issues);
    }
    const { days } = query.data;

    const { data: events, error } = await supabase
      .from('application_events')
      .select(
        `
        *,
        transformations (
          detected_job_title,
          detected_company
        )
      `
      )
      .eq('user_id', user.id)
      .eq('is_done', false)
      .in('event_type', ['interview', 'follow_up'])
      .order('event_date', { ascending: true });

    if (error) return apiErrors.database(error);

    const now = new Date();
    const futureLimit = new Date();
    futureLimit.setDate(futureLimit.getDate() + days);

    const overdue: ApplicationEvent[] = [];
    const upcoming: ApplicationEvent[] = [];

    (events as ApplicationEvent[] | null)?.forEach((event) => {
      if (!event.event_date) return;
      const eventDate = new Date(event.event_date);
      if (eventDate < now) {
        overdue.push(event);
      } else if (eventDate <= futureLimit) {
        upcoming.push(event);
      }
    });

    return NextResponse.json({ success: true, data: { overdue, upcoming } });
  } catch (err) {
    return apiErrors.internal(err);
  }
}
