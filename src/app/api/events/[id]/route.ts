import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // 1. Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'AUTH_FAILED' }, { status: 401 });
    }

    // 2. Parse body
    const body = await req.json();
    const {
      title,
      event_date,
      interview_round,
      interview_format,
      interviewer_name,
      notes,
      outcome,
      is_done
    } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (event_date !== undefined) updateData.event_date = event_date;
    if (interview_round !== undefined) updateData.interview_round = interview_round;
    if (interview_format !== undefined) updateData.interview_format = interview_format;
    if (interviewer_name !== undefined) updateData.interviewer_name = interviewer_name;
    if (notes !== undefined) updateData.notes = notes;
    if (outcome !== undefined) updateData.outcome = outcome;
    if (is_done !== undefined) updateData.is_done = is_done;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: 'NO_FIELDS_TO_UPDATE' }, { status: 400 });
    }

    // 3. Update the event
    const { data, error } = await supabase
      .from('application_events')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Unhandled error in PATCH /api/events/[id]:', err);
    return NextResponse.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // 1. Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'AUTH_FAILED' }, { status: 401 });
    }

    // 2. Delete the event
    const { error } = await supabase
      .from('application_events')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting event:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unhandled error in DELETE /api/events/[id]:', err);
    return NextResponse.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
