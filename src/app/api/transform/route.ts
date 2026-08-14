import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { checkRateLimit } from '../../../lib/rateLimit';
import { callGroqWithFallback } from '../../../lib/groq';
import { computeMatchScore } from '../../../lib/matchScore';
import { resumeToPlainText } from '../../../lib/resumeToText';
import { TransformOutputSchema } from '../../../lib/schemas';
import { transformRequestSchema } from '../../../lib/schemas/api';
import { apiErrors } from '../../../lib/apiError';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Worst case is 3 models x 20s (see groq.ts) plus validation and the DB write.
export const maxDuration = 90;

export async function POST(req: Request) {
  let userId = 'anonymous';
  try {
    // 1. Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'AUTH_FAILED' }, { status: 401 });
    }
    userId = user.id;

    // 2. Parse and validate body.
    //
    // Replaces a hand-rolled ladder whose limits disagreed with the client's
    // and which then silently truncated over-long input rather than rejecting
    // it. Limits now come from lib/limits.ts, shared with the UI.
    const parsed = transformRequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return apiErrors.invalidBody(parsed.error.issues);
    }
    const { resume_text, job_description_text, optimization_mode } = parsed.data;

    // 4. Rate limit check
    const rateCheck = await checkRateLimit(user.id, 'transform');
    if (rateCheck.unavailable) {
      // Limiter itself failed. Fail closed rather than leave LLM spend uncapped.
      return NextResponse.json({
        success: false,
        error: 'RATE_LIMIT_UNAVAILABLE',
      }, { status: 503 });
    }
    if (!rateCheck.allowed) {
      return NextResponse.json({
        success: false,
        error: 'RATE_LIMITED',
        remaining: 0,
        reset_at: rateCheck.resetAt.toISOString(),
      }, { status: 429 });
    }

    // Idempotency check
    const idempotencyKey = req.headers.get('x-idempotency-key');
    if (idempotencyKey) {
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: existing } = await supabase
        .from('transformations')
        .select('id, output_json, output_plain_text')
        .eq('user_id', user.id)
        .eq('idempotency_key', idempotencyKey)
        .eq('is_deleted', false)
        .gt('created_at', fiveMinsAgo)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        console.log(`Cached response hit for idempotency key: ${idempotencyKey}`);
        return NextResponse.json({
          success: true,
          cached: true,
          data: existing.output_json,
          plain_text: existing.output_plain_text,
          transformation_id: existing.id,
          rate_limit: {
            remaining: rateCheck.remaining,
            reset_at: rateCheck.resetAt.toISOString(),
          }
        }, { status: 200 });
      }
    }

    // 5. Call Groq with Fallback
    let transformResult;
    let modelUsed = 'llama-3.3-70b-versatile';
    try {
      // No truncation here: the schema already rejected over-long input, so
      // trimming silently would only hide a validation gap.
      const groqRes = await callGroqWithFallback(
        resume_text,
        job_description_text,
        optimization_mode
      );
      transformResult = groqRes.data;
      modelUsed = groqRes.model_used;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'UNKNOWN';
      if (errMsg.includes('TIMEOUT') || errMsg.includes('abort')) {
        return NextResponse.json({ success: false, error: 'AI_TIMEOUT' }, { status: 504 });
      }
      if (errMsg.includes('INVALID_JSON')) {
        return NextResponse.json({ success: false, error: 'INVALID_JSON_FROM_AI' }, { status: 502 });
      }
      throw err;
    }

    // Validate output schema
    const validationResult = TransformOutputSchema.safeParse(transformResult);
    if (!validationResult.success) {
      console.error('Validation failed for Groq response:', validationResult.error);
      return NextResponse.json({
        success: false,
        error: 'PARSE_FAILED',
        details: validationResult.error.issues
      }, { status: 422 });
    }
    // Use cleaned and validated data
    transformResult = validationResult.data;

    // 6. Compute match score
    const scoreResult = computeMatchScore(job_description_text, transformResult, {
      optimizationMode: optimization_mode,
    });
    
    // Override Groq's self-reported score with our computed one for consistency.
    // meta is required by the schema, so validation above guarantees it exists
    // along with detected_job_title and detected_company.
    transformResult.meta.match_score = scoreResult.score;
    transformResult.meta.keywords_matched = scoreResult.matched;
    transformResult.meta.keywords_total = scoreResult.total;
    transformResult.meta.keywords_missing = scoreResult.missing;
    transformResult.meta.optimization_mode = optimization_mode;

    // Store original texts inside transformResult for history retrieval
    transformResult.original_resume_text = resume_text;
    transformResult.original_job_description = job_description_text;

    // 7. Generate plain text
    const plainText = resumeToPlainText(transformResult);

    // 8. Save to database
    const { data: saved, error: saveError } = await supabase
      .from('transformations')
      .insert({
        user_id:             user.id,
        detected_job_title:  transformResult.meta.detected_job_title,
        detected_company:    transformResult.meta.detected_company,
        input_resume_chars:  resume_text.length,
        input_jd_chars:      job_description_text.length,
        output_json:         transformResult,
        output_plain_text:   plainText,
        input_plain_text:    resume_text,
        match_score:         scoreResult.score,
        keywords_matched:    scoreResult.matched,
        keywords_total:      scoreResult.total,
        ai_model:            modelUsed,
        idempotency_key:     idempotencyKey,
      })
      .select('id')
      .single();

    if (saveError) {
      // Log the full error server-side only. It must never reach the client:
      // Supabase errors carry constraint and schema names.
      console.error('DB save error:', saveError);
    }

    // 9. Return response
    //
    // The LLM call already succeeded and was paid for, so the output is
    // returned either way. But a failed save is NOT a success: persisted
    // tells the client the result is missing from history, and the status
    // code reflects that so the hook cannot report plain success.
    return NextResponse.json({
      success: true,
      persisted: !saveError,
      error: saveError ? 'DATABASE_SAVE_FAILED' : undefined,
      data: transformResult,
      plain_text: plainText,
      transformation_id: saved?.id ?? null,
      rate_limit: {
        remaining: rateCheck.remaining,
        reset_at: rateCheck.resetAt.toISOString(),
      }
    }, { status: saveError ? 207 : 200 });

  } catch (err) {
    console.error(JSON.stringify({
      sentry: true,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      user_id: userId
    }));
    console.error('Unhandled error in /api/transform:', err);
    return NextResponse.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
