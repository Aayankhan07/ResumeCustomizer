import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { getAuthenticatedUser } from '../_shared/auth.ts';
import { checkRateLimit } from '../_shared/rateLimit.ts';
import { callGroq } from '../_shared/groq.ts';
import { computeMatchScore } from '../_shared/matchScore.ts';
import { resumeToPlainText } from '../_shared/resumeToText.ts';

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

  try {
    // 1. Auth check
    const { user, error: authError } = await getAuthenticatedUser(req);
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'UNAUTHORIZED' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

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
      return new Response(JSON.stringify({ success: false, error: 'INPUT_TOO_LONG', field: 'resume_text' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (!job_description_text || job_description_text.trim().length < MIN_CHARS) {
      return new Response(JSON.stringify({ success: false, error: 'INPUT_TOO_SHORT', field: 'job_description_text' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 4. Rate limit check
    const rateCheck = await checkRateLimit(user.id, 'transform');
    if (!rateCheck.allowed) {
      return new Response(JSON.stringify({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        remaining: 0,
        reset_at: rateCheck.resetAt.toISOString(),
      }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 5. Call Groq
    let transformResult;
    try {
      transformResult = await callGroq(
        resume_text.substring(0, MAX_RESUME_CHARS),
        job_description_text.substring(0, MAX_JD_CHARS)
      );
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

    // 6. Compute match score
    const scoreResult = computeMatchScore(job_description_text, transformResult as unknown as Record<string, unknown>);
    
    // Override Groq's self-reported score with our computed one for consistency
    transformResult.meta.match_score = scoreResult.score;
    transformResult.meta.keywords_matched = scoreResult.matched;
    transformResult.meta.keywords_total = scoreResult.total;

    // 7. Generate plain text
    const plainText = resumeToPlainText(transformResult);

    // 8. Save to database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

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
        match_score:         scoreResult.score,
        keywords_matched:    scoreResult.matched,
        keywords_total:      scoreResult.total,
        ai_model:            'llama-3.3-70b-versatile',
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
    console.error('Unhandled error in /transform:', err);
    return new Response(JSON.stringify({ success: false, error: 'INTERNAL_SERVER_ERROR' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
