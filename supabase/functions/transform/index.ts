import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { getAuthenticatedUser } from '../_shared/auth.ts';
import { checkRateLimit } from '../_shared/rateLimit.ts';
import { callGroqWithFallback } from '../_shared/groq.ts';
import { computeMatchScore } from '../_shared/matchScore.ts';
import { resumeToPlainText } from '../_shared/resumeToText.ts';
import { TransformOutputSchema } from '../_shared/schemas.ts';

const MAX_RESUME_CHARS = 10000;
const MAX_JD_CHARS = 8000;
const MIN_CHARS = 50;

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'METHOD_NOT_ALLOWED' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  let userId = 'anonymous';
  try {
    // 1. Auth check
    const { user, error: authError } = await getAuthenticatedUser(req);
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'AUTH_FAILED' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    userId = user.id;

    // 2. Parse body
    const body = await req.json();
    const { resume_text, job_description_text } = body;

    // 3. Input validation
    if (!resume_text || typeof resume_text !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'MISSING_RESUME_TEXT' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (resume_text.trim().length < MIN_CHARS) {
      return new Response(JSON.stringify({ success: false, error: 'INPUT_TOO_SHORT', field: 'resume_text' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (resume_text.length > MAX_RESUME_CHARS) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'CONTENT_TOO_LONG', 
        field: 'resume_text',
        max: MAX_RESUME_CHARS,
        actual: resume_text.length
      }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (!job_description_text || job_description_text.trim().length < MIN_CHARS) {
      return new Response(JSON.stringify({ success: false, error: 'INVALID_JD', field: 'job_description_text' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 4. Rate limit check
    const rateCheck = await checkRateLimit(user.id, 'transform');
    if (!rateCheck.allowed) {
      return new Response(JSON.stringify({
        success: false,
        error: 'RATE_LIMITED',
        remaining: 0,
        reset_at: rateCheck.resetAt.toISOString(),
      }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Initialize Supabase Client (moved up for idempotency query)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Idempotency check
    const idempotencyKey = req.headers.get('X-Idempotency-Key');
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
        return new Response(JSON.stringify({
          success: true,
          cached: true,
          data: existing.output_json,
          plain_text: existing.output_plain_text,
          transformation_id: existing.id,
          rate_limit: {
            remaining: rateCheck.remaining,
            reset_at: rateCheck.resetAt.toISOString(),
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
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
        return new Response(JSON.stringify({ success: false, error: 'AI_TIMEOUT' }), {
          status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (errMsg.includes('INVALID_JSON')) {
        return new Response(JSON.stringify({ success: false, error: 'INVALID_JSON_FROM_AI' }), {
          status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      throw err;
    }

    // Validate output schema
    const validationResult = TransformOutputSchema.safeParse(transformResult);
    if (!validationResult.success) {
      console.error('Validation failed for Groq response:', validationResult.error);
      return new Response(JSON.stringify({
        success: false,
        error: 'PARSE_FAILED',
        details: validationResult.error.issues
      }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    // Use cleaned and validated data
    transformResult = validationResult.data;

    // 6. Compute match score
    const scoreResult = computeMatchScore(job_description_text, transformResult as unknown as Record<string, unknown>);
    
    // Override Groq's self-reported score with our computed one for consistency
    transformResult.meta.match_score = scoreResult.score;
    transformResult.meta.keywords_matched = scoreResult.matched;
    transformResult.meta.keywords_total = scoreResult.total;
    transformResult.meta.keywords_missing = scoreResult.missing;

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
        input_plain_text:    resume_text,
        output_json:         transformResult,
        output_plain_text:   plainText,
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
    return new Response(JSON.stringify({
      success: true,
      data: transformResult,
      plain_text: plainText,
      transformation_id: saved?.id ?? null,
      rate_limit: {
        remaining: rateCheck.remaining,
        reset_at: rateCheck.resetAt.toISOString(),
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error(JSON.stringify({
      sentry: true,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      user_id: userId
    }));
    console.error('Unhandled error in /transform:', err);
    return new Response(JSON.stringify({ success: false, error: 'INTERNAL_SERVER_ERROR' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
