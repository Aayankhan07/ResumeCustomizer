import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { computeMatchScore } from '../../../lib/matchScore';
import { checkRateLimit } from '../../../lib/rateLimit';
import { apiErrors } from '../../../lib/apiError';
import { rescoreRequestSchema } from '../../../lib/schemas/api';
import type { TransformOutput } from '../../../lib/schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. Auth check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return apiErrors.unauthorized();

    // 2. Rate limit. This endpoint does a DB read plus a write per call and
    // was previously uncapped.
    const rateCheck = await checkRateLimit(user.id, 'rescore');
    if (rateCheck.unavailable) {
      return NextResponse.json(
        { success: false, error: 'RATE_LIMIT_UNAVAILABLE' },
        { status: 503 }
      );
    }
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'RATE_LIMITED',
          remaining: 0,
          reset_at: rateCheck.resetAt.toISOString(),
        },
        { status: 429 }
      );
    }

    // 3. Validate body. Weights are bounded: unbounded values let a client
    // fabricate any score.
    const parsed = rescoreRequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return apiErrors.invalidBody(parsed.error.issues);
    }
    const { transformation_id, weights } = parsed.data;

    // 4. Fetch the stored output
    const { data: trans, error: fetchError } = await supabase
      .from('transformations')
      .select('id, output_json, output_plain_text')
      .eq('id', transformation_id)
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .maybeSingle();

    if (fetchError || !trans) {
      return apiErrors.notFound('TRANSFORMATION_NOT_FOUND');
    }

    const outputJson = trans.output_json as TransformOutput;
    const jobDescriptionText = outputJson.original_job_description;

    // Rows written before original_job_description existed would otherwise
    // rescore against '' and return 0, which reads as a catastrophic match
    // rather than missing data.
    if (!jobDescriptionText) {
      return NextResponse.json(
        { success: false, error: 'RESCORE_UNAVAILABLE' },
        { status: 409 }
      );
    }

    const optimizationMode =
      outputJson.meta?.optimization_mode === 'title' ? 'title' : 'description';

    // 5. Compute weighted match score
    const scoreResult = computeMatchScore(jobDescriptionText, outputJson, {
      ...weights,
      optimizationMode,
    });

    // 6. Update meta for future retrievals
    if (outputJson.meta) {
      outputJson.meta.match_score = scoreResult.score;
      outputJson.meta.keywords_matched = scoreResult.matched;
      outputJson.meta.keywords_total = scoreResult.total;
      outputJson.meta.keywords_missing = scoreResult.missing;
    }

    // 7. Persist
    const { error: updateError } = await supabase
      .from('transformations')
      .update({
        match_score: scoreResult.score,
        keywords_matched: scoreResult.matched,
        keywords_total: scoreResult.total,
        output_json: outputJson,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transformation_id)
      .eq('user_id', user.id);

    if (updateError) return apiErrors.database(updateError);

    return NextResponse.json(
      {
        success: true,
        data: {
          score: scoreResult.score,
          matched: scoreResult.matched,
          missing: scoreResult.missing,
          total: scoreResult.total,
          output_json: outputJson,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    return apiErrors.internal(err);
  }
}
