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
      status,
      applied_at,
      application_deadline,
      application_url,
      job_location,
      salary_range,
      recruiter_name,
      recruiter_contact,
      priority,
      source,
      is_archived
    } = body;

    // Build update object with only provided fields
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (applied_at !== undefined) updateData.applied_at = applied_at;
    if (application_deadline !== undefined) updateData.application_deadline = application_deadline;
    if (application_url !== undefined) updateData.application_url = application_url;
    if (job_location !== undefined) updateData.job_location = job_location;
    if (salary_range !== undefined) updateData.salary_range = salary_range;
    if (recruiter_name !== undefined) updateData.recruiter_name = recruiter_name;
    if (recruiter_contact !== undefined) updateData.recruiter_contact = recruiter_contact;
    if (priority !== undefined) updateData.priority = priority;
    if (source !== undefined) updateData.source = source;
    if (is_archived !== undefined) updateData.is_archived = is_archived;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: 'NO_FIELDS_TO_UPDATE' }, { status: 400 });
    }

    // 3. Update the transformation ensuring it belongs to the authenticated user
    const { data, error } = await supabase
      .from('transformations')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transformation tracking details:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Unhandled error in PATCH /api/transformations/[id]:', err);
    return NextResponse.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
