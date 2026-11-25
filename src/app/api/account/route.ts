import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';
import { createClient } from '../../../lib/supabase/server';
import { createServiceClient } from '../../../lib/supabase/service';
import { apiErrors } from '../../../lib/apiError';
import { DELETE_CONFIRMATION } from '../../../lib/account';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// The client must send this exact phrase, so a stray request cannot delete an account.
const deleteAccountSchema = z.strictObject({
  confirm: z.literal(DELETE_CONFIRMATION),
});

/**
 * Permanently deletes the signed-in user's account.
 *
 * Every user-owned table (profiles, transformations, application_events,
 * rate_limits) references auth.users with ON DELETE CASCADE, so removing the
 * auth user removes all of their data in one step.
 */
export async function DELETE(req: Request) {
  let userId = 'anonymous';
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return apiErrors.unauthorized();
    userId = user.id;

    const parsed = deleteAccountSchema.safeParse(await req.json().catch(() => undefined));
    if (!parsed.success) return apiErrors.invalidBody();

    const { error } = await createServiceClient().auth.admin.deleteUser(user.id);
    if (error) {
      Sentry.captureMessage(`account deletion failed: ${error.code ?? error.status ?? 'unknown'}`, {
        level: 'error',
        tags: { route: 'api/account' },
        user: { id: userId },
      });
      return apiErrors.internal({ code: error.code ?? error.status, message: error.message });
    }

    // Clear the session cookies for the now-deleted user.
    await supabase.auth.signOut().catch(() => undefined);

    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err, { tags: { route: 'api/account' }, user: { id: userId } });
    return apiErrors.internal(err instanceof Error ? err.message : 'unknown');
  }
}
