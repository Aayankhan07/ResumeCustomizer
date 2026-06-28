import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { checkRateLimit } from '../../../lib/rateLimit';
import { callGroqWithFallback } from '../../../lib/groq';
import { computeMatchScore } from '../../../lib/matchScore';
import { resumeToPlainText } from '../../../lib/resumeToText';
import { TransformOutputSchema } from '../../../lib/schemas';

const MAX_RESUME_CHARS = 10000;
const MAX_JD_CHARS = 8000;
const MIN_CHARS = 50;

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

    // 2. Parse body
    const body = await req.json();
    const { resume_text, job_description_text } = body;

    // 3. Input validation
    if (!resume_text || typeof resume_text !== 'string') {
      return NextResponse.json({ success: false, error: 'MISSING_RESUME_TEXT' }, { status: 400 });
    }
    if (resume_text.trim().length < MIN_CHARS) {
      return NextResponse.json({ success: false, error: 'INPUT_TOO_SHORT', field: 'resume_text' }, { status: 400 });
    }
    if (resume_text.length > MAX_RESUME_CHARS) {
      return NextResponse.json({ 
        success: false, 
        error: 'CONTENT_TOO_LONG', 
        field: 'resume_text',
        max: MAX_RESUME_CHARS,
        actual: resume_text.length
      }, { status: 400 });
    }
    if (!job_description_text || job_description_text.trim().length < MIN_CHARS) {
      return NextResponse.json({ success: false, error: 'INVALID_JD', field: 'job_description_text' }, { status: 400 });
    }

    // 4. Rate limit check
    const rateCheck = await checkRateLimit(user.id, 'transform');
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
      const groqRes = await callGroqWithFallback(
        resume_text.substring(0, MAX_RESUME_CHARS),
        job_description_text.substring(0, MAX_JD_CHARS)
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
    const scoreResult = computeMatchScore(job_description_text, transformResult as any);
    
    // Override Groq's self-reported score with our computed one for consistency
    transformResult.meta = transformResult.meta || {};
    transformResult.meta.match_score = scoreResult.score;
    transformResult.meta.keywords_matched = scoreResult.matched;
    transformResult.meta.keywords_total = scoreResult.total;
    transformResult.meta.keywords_missing = scoreResult.missing;

    // Store original texts inside transformResult for history retrieval
    (transformResult as any).original_resume_text = resume_text;
    (transformResult as any).original_job_description = job_description_text;

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
      console.error('DB save error:', saveError);
    }

    // 9. Return response
    return NextResponse.json({
      success: true,
      data: transformResult,
      plain_text: plainText,
      transformation_id: saved?.id ?? null,
      db_error: saveError || null,
      rate_limit: {
        remaining: rateCheck.remaining,
        reset_at: rateCheck.resetAt.toISOString(),
      }
    }, { status: 200 });

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
