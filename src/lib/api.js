import { supabase } from './supabase';

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

export async function transformResume({ resumeText, jobDescriptionText }) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${FUNCTIONS_URL}/transform`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      resume_text: resumeText,
      job_description_text: jobDescriptionText,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const error = new Error(data.error || 'TRANSFORM_FAILED');
    error.code = data.error;
    error.resetAt = data.reset_at;
    error.details = data.details || null;
    throw error;
  }

  return data; // { success, data, plain_text, transformation_id, rate_limit }
}

export async function getTransformations(limit = 20, offset = 0) {
  const { data, error, count } = await supabase
    .from('transformations')
    .select('id, detected_job_title, detected_company, match_score, created_at, label', { count: 'exact' })
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { data, count };
}

export async function getTransformation(id) {
  const { data, error } = await supabase
    .from('transformations')
    .select('*')
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTransformation(id) {
  const { error } = await supabase
    .from('transformations')
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function updateTransformationLabel(id, label) {
  const { error } = await supabase
    .from('transformations')
    .update({ label })
    .eq('id', id);

  if (error) throw error;
}

export async function getUserStats() {
  const { count: total } = await supabase
    .from('transformations')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false);

  const { data: best } = await supabase
    .from('transformations')
    .select('match_score')
    .eq('is_deleted', false)
    .order('match_score', { ascending: false })
    .limit(1)
    .maybeSingle();

  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const { count: thisWeek } = await supabase
    .from('transformations')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false)
    .gte('created_at', weekAgo);

  return {
    total: total ?? 0,
    bestScore: best?.match_score ?? null,
    thisWeek: thisWeek ?? 0,
  };
}

export async function getGlobalStats() {
  const { data, error } = await supabase
    .from('usage_stats')
    .select('total_transformations, total_users')
    .maybeSingle();
  if (error) console.error('Global stats error:', error);
  return data || { total_transformations: 0, total_users: 0 };
}
