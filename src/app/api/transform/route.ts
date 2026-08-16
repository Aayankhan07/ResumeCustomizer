import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createClient } from '../../../lib/supabase/server';
import { checkRateLimit } from '../../../lib/rateLimit';
import { callGroqWithFallback } from '../../../lib/groq';
import { computeMatchScore, computeBaselineScore } from '../../../lib/matchScore';
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
      // Validation runs per model attempt rather than once after the chain,
      // so a response that parses but fails the schema falls through to the
      // next model instead of failing the whole request.
      const groqRes = await callGroqWithFallback(
        resume_text,
        job_description_text,
        optimization_mode,
        (parsed) => {
          const result = TransformOutputSchema.safeParse(parsed);
          return result.success
            ? { ok: true, data: result.data }
            : { ok: false, reason: result.error.issues.map((i) => i.path.join('.')).join(', ') };
        }
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
      // Every model returned a response that failed the schema. This is the
      // signature of a prompt/schema mismatch — it once meant *no* transform
      // could succeed, and nothing surfaced it — so it is reported rather than
      // just counted as a bad request.
      if (errMsg.includes('PARSE_FAILED')) {
        Sentry.captureException(err, {
          tags: { route: 'api/transform', stage: 'validation' },
          user: { id: userId },
        });
        return NextResponse.json({ success: false, error: 'PARSE_FAILED' }, { status: 422 });
      }
      throw err;
    }

    // Already schema-validated inside the fallback loop, so transformResult is
    // the parsed output. Re-validating here would repeat the work and, more
    // importantly, would reintroduce the single-shot failure this moved away
    // from.

    // 6. Compute match score
    const scoreResult = computeMatchScore(job_description_text, transformResult, {
      optimizationMode: optimization_mode,
    });

    // The same measurement against the resume the user arrived with, so the
    // UI can report the improvement rather than a bare number the user has
    // no way to judge.
    const baselineScore = computeBaselineScore(job_description_text, resume_text, {
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
    transformResult.meta.baseline_score = baselineScore;

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
      // The user paid for this result and it is not in their history. Silent
      // in production otherwise, since the request still returns 207.
      Sentry.captureException(saveError, {
        tags: { route: 'api/transform', stage: 'persist' },
        user: { id: userId },
      });
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
    // Reported to Sentry rather than only written to stdout as a
    // `{ sentry: true }` JSON blob, which implied a log drain that was never
    // built. Only the user id is attached — never resume text or the job
    // description, both of which are PII.
    Sentry.captureException(err, {
      tags: { route: 'api/transform' },
      user: { id: userId },
    });
    console.error('Unhandled error in /api/transform:', err);
    return NextResponse.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
