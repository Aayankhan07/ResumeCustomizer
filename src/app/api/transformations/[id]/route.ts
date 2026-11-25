import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { apiErrors } from '../../../../lib/apiError';
import { updateTransformationSchema, uuidParamSchema } from '../../../../lib/schemas/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!uuidParamSchema.safeParse(id).success) {
      return apiErrors.invalidBody();
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return apiErrors.unauthorized();

    // Was mass-assignment: 11 fields copied straight from the body, including
    // application_url, which is later rendered as a link.
    const parsed = updateTransformationSchema.safeParse(
      // Malformed JSON becomes a 400 via the schema, not a thrown 500.
      await req.json().catch(() => undefined)
    );
    if (!parsed.success) {
      return apiErrors.invalidBody(parsed.error.issues);
    }

    const { data, error } = await supabase
      .from('transformations')
      .update(parsed.data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .maybeSingle();

    if (error) return apiErrors.database(error);
    // No row: the id does not exist or belongs to someone else.
    if (!data) return apiErrors.notFound();

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return apiErrors.internal(err);
  }
}
