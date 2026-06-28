import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { computeMatchScore } from '../../../lib/matchScore';

export async function POST(req: Request) {
  try {
    // 1. Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'AUTH_FAILED' }, { status: 401 });
    }

    // 2. Parse body
    const body = await req.json();
    const { transformation_id, weights } = body;

    if (!transformation_id) {
      return NextResponse.json({ success: false, error: 'MISSING_TRANSFORMATION_ID' }, { status: 400 });
    }

    // 3. Fetch original job description and transformation output
    const { data: trans, error: fetchError } = await supabase
      .from('transformations')
      .select('id, output_json, output_plain_text')
      .eq('id', transformation_id)
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .maybeSingle();

    if (fetchError || !trans) {
      return NextResponse.json({ success: false, error: 'TRANSFORMATION_NOT_FOUND' }, { status: 404 });
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
      return NextResponse.json({ success: false, error: 'DATABASE_UPDATE_FAILED' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        score: scoreResult.score,
        matched: scoreResult.matched,
        missing: scoreResult.missing,
        total: scoreResult.total,
        output_json: outputJson
      }
    }, { status: 200 });

  } catch (err) {
    console.error('Unhandled error in /api/rescore:', err);
    return NextResponse.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
