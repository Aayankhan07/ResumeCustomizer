// supabase/functions/rescore/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { getAuthenticatedUser } from '../_shared/auth.ts';
import { computeMatchScore } from '../_shared/matchScore.ts';

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
      return new Response(JSON.stringify({ success: false, error: 'AUTH_FAILED' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. Parse body
    const body = await req.json();
    const { transformation_id, weights } = body;

    if (!transformation_id) {
      return new Response(JSON.stringify({ success: false, error: 'MISSING_TRANSFORMATION_ID' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase Client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 3. Fetch original job description and transformation output
    const { data: trans, error: fetchError } = await supabase
      .from('transformations')
      .select('id, output_json, output_plain_text')
      .eq('id', transformation_id)
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .maybeSingle();

    if (fetchError || !trans) {
      return new Response(JSON.stringify({ success: false, error: 'TRANSFORMATION_NOT_FOUND' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const outputJson = trans.output_json as Record<string, any>;
    const jobDescriptionText = outputJson.original_job_description || '';

    // 4. Compute weighted match score
    const scoreResult = computeMatchScore(jobDescriptionText, outputJson, weights);

    // 5. Update output_json meta scoring fields for future retrievals
    if (outputJson.meta) {
      outputJson.meta.match_score = scoreResult.score;
      outputJson.meta.keywords_matched = scoreResult.matched;
      outputJson.meta.keywords_total = scoreResult.total;
      outputJson.meta.keywords_missing = scoreResult.missing;
    }

    // 6. Save updated score, keywords, and output_json back to DB
    const { error: updateError } = await supabase
      .from('transformations')
      .update({
        match_score: scoreResult.score,
        keywords_matched: scoreResult.matched,
        keywords_total: scoreResult.total,
        output_json: outputJson,
        updated_at: new Date().toISOString()
      })
      .eq('id', transformation_id);

    if (updateError) {
      console.error('Failed to update rescored transformation in DB:', updateError);
      return new Response(JSON.stringify({ success: false, error: 'DATABASE_UPDATE_FAILED' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        score: scoreResult.score,
        matched: scoreResult.matched,
        missing: scoreResult.missing,
        total: scoreResult.total,
        output_json: outputJson
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Unhandled error in /rescore:', err);
    return new Response(JSON.stringify({ success: false, error: 'INTERNAL_SERVER_ERROR' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
