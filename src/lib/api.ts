import { createClient } from './supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { TransformOutput } from './schemas';

/**
 * Client-side data layer.
 *
 * Every fetch used to call `response.json()` before checking `response.ok`, so
 * a 502 HTML gateway page threw a bare SyntaxError with no `.code` — which
 * useTransform then reported as a generic UNKNOWN_ERROR. All requests now go
 * through `request()`, which checks status and content-type first and always
 * throws a typed ApiError.
 */

const FUNCTIONS_URL =
  typeof window !== 'undefined' ? '/api' : `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}/api`;

/** Error carrying the server's stable error code, rather than an opaque message. */
export class ApiError extends Error {
  code: string;
  status: number;
  details: unknown;
  resetAt?: string;

  constructor(code: string, status: number, details?: unknown, resetAt?: string) {
    super(code);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details ?? null;
    this.resetAt = resetAt;
  }
}

// Created lazily so importing this module never constructs a client during
// prerender, where public env vars are absent.
let client: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!client) client = createClient();
  return client;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await db().auth.getSession();
  if (!session?.access_token) throw new ApiError('AUTH_FAILED', 401);
  return {
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
  reset_at?: string;
  [key: string]: unknown;
}

/**
 * Performs a request and returns the parsed envelope.
 *
 * Guards the response before parsing: a non-JSON body (gateway error page,
 * empty 204, proxy timeout) produces a structured ApiError rather than a
 * SyntaxError from JSON.parse.
 */
async function request<T>(
  path: string,
  init: RequestInit & { fallbackCode: string }
): Promise<ApiEnvelope<T>> {
  const { fallbackCode, ...requestInit } = init;

  let response: Response;
  try {
    response = await fetch(`${FUNCTIONS_URL}${path}`, requestInit);
  } catch (err) {
    // Offline, DNS failure, or a request aborted mid-flight.
    throw new ApiError('NETWORK_ERROR', 0, err instanceof Error ? err.message : String(err));
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new ApiError(
      response.ok ? fallbackCode : 'INTERNAL_SERVER_ERROR',
      response.status,
      `Expected JSON, received ${contentType || 'no content-type'}`
    );
  }

  let body: ApiEnvelope<T>;
  try {
    body = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError('INVALID_RESPONSE', response.status, 'Response body was not valid JSON');
  }

  if (!response.ok || !body.success) {
    throw new ApiError(body.error ?? fallbackCode, response.status, body.details, body.reset_at);
  }

  return body;
}

// ── Transform

export interface TransformResponse {
  success: boolean;
  persisted?: boolean;
  data: TransformOutput;
  plain_text: string;
  transformation_id: string | null;
  rate_limit?: { remaining: number; reset_at: string };
}

export async function transformResume({
  resumeText,
  jobDescriptionText,
  optimizationMode = 'description',
}: {
  resumeText: string;
  jobDescriptionText: string;
  optimizationMode?: 'description' | 'title';
}): Promise<TransformResponse> {
  const headers = await getAuthHeaders();

  // Idempotency key: SHA-256 of the exact inputs, so a retry within the
  // server's window returns the cached result instead of paying for the LLM
  // call twice.
  const dataBytes = new TextEncoder().encode(
    (resumeText || '') + (jobDescriptionText || '') + (optimizationMode || '')
  );
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
  headers['X-Idempotency-Key'] = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const body = await request<TransformOutput>('/transform', {
    method: 'POST',
    headers,
    fallbackCode: 'TRANSFORM_FAILED',
    body: JSON.stringify({
      resume_text: resumeText,
      job_description_text: jobDescriptionText,
      optimization_mode: optimizationMode,
    }),
  });

  return body as unknown as TransformResponse;
}

export async function rescoreTransformation(
  transformationId: string,
  weights?: Record<string, number>
) {
  const headers = await getAuthHeaders();
  const body = await request<{
    score: number;
    matched: string[];
    missing: string[];
    total: number;
    output_json: TransformOutput;
  }>('/rescore', {
    method: 'POST',
    headers,
    fallbackCode: 'RESCORE_FAILED',
    body: JSON.stringify({ transformation_id: transformationId, weights }),
  });
  return body.data!;
}

// ── Transformations (direct Supabase reads, authorized by RLS)

export async function getTransformations(limit = 20, offset = 0) {
  const { data, error, count } = await db()
    .from('transformations')
    .select(
      'id, detected_job_title, detected_company, match_score, created_at, label, status, applied_at, application_deadline, priority, application_events(event_date, event_type, is_done)',
      { count: 'exact' }
    )
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { data, count };
}

export async function getTransformation(id: string) {
  const { data, error } = await db()
    .from('transformations')
    .select('*')
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTransformation(id: string) {
  const { error } = await db()
    .from('transformations')
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function updateTransformationLabel(id: string, label: string) {
  const { error } = await db().from('transformations').update({ label }).eq('id', id);
  if (error) throw error;
}

export async function updateTransformationScore(id: string, score: number) {
  const { error } = await db().from('transformations').update({ match_score: score }).eq('id', id);
  if (error) throw error;
}

export async function updateTransformationStatus(id: string, status: string) {
  const { error } = await db().from('transformations').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function updateTransformationTracking(
  id: string,
  trackingData: Record<string, unknown>
) {
  const headers = await getAuthHeaders();
  const body = await request(`/transformations/${id}`, {
    method: 'PATCH',
    headers,
    fallbackCode: 'TRACKING_UPDATE_FAILED',
    body: JSON.stringify(trackingData),
  });
  return body.data;
}

// ── Stats

export async function getUserStats() {
  const supabase = db();
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  // Run concurrently: these were three sequential awaits, so the dashboard
  // paid three round trips in series.
  const [totalRes, bestRes, weekRes] = await Promise.all([
    supabase
      .from('transformations')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false),
    supabase
      .from('transformations')
      .select('match_score')
      .eq('is_deleted', false)
      .order('match_score', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('transformations')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .gte('created_at', weekAgo),
  ]);

  // Errors were previously not destructured at all, so a failed query silently
  // rendered as zeros.
  const failure = totalRes.error ?? bestRes.error ?? weekRes.error;
  if (failure) throw failure;

  return {
    total: totalRes.count ?? 0,
    bestScore: bestRes.data?.match_score ?? null,
    thisWeek: weekRes.count ?? 0,
  };
}

export async function getGlobalStats() {
  const { data, error } = await db()
    .from('usage_stats')
    .select('total_transformations, total_users')
    .maybeSingle();

  // Landing-page social proof: a failure here should not block the page, so
  // this one intentionally degrades to zeros rather than throwing.
  if (error) console.error('Global stats error:', error);
  return data ?? { total_transformations: 0, total_users: 0 };
}

// ── Events

export interface ApplicationEvent {
  id: string;
  transformation_id: string;
  event_type: string;
  title: string;
  event_date: string | null;
  is_done: boolean;
  outcome?: string | null;
  notes?: string | null;
  transformations?: { detected_job_title?: string; detected_company?: string } | null;
  [key: string]: unknown;
}

export interface EventBuckets {
  overdue: ApplicationEvent[];
  upcoming: ApplicationEvent[];
}

export async function getEvents(days = 14): Promise<EventBuckets> {
  const headers = await getAuthHeaders();
  const body = await request<EventBuckets>(`/events?days=${days}`, {
    method: 'GET',
    headers,
    fallbackCode: 'EVENTS_FETCH_FAILED',
  });
  return body.data ?? { overdue: [], upcoming: [] };
}

export async function createEvent(eventData: Record<string, unknown>) {
  const headers = await getAuthHeaders();
  const body = await request('/events', {
    method: 'POST',
    headers,
    fallbackCode: 'EVENT_CREATE_FAILED',
    body: JSON.stringify(eventData),
  });
  return body.data;
}

export async function updateEvent(id: string, eventData: Record<string, unknown>) {
  const headers = await getAuthHeaders();
  const body = await request(`/events/${id}`, {
    method: 'PATCH',
    headers,
    fallbackCode: 'EVENT_UPDATE_FAILED',
    body: JSON.stringify(eventData),
  });
  return body.data;
}

export async function deleteEvent(id: string) {
  const headers = await getAuthHeaders();
  return request(`/events/${id}`, {
    method: 'DELETE',
    headers,
    fallbackCode: 'EVENT_DELETE_FAILED',
  });
}

export async function getTransformationEvents(transformationId: string) {
  const { data, error } = await db()
    .from('application_events')
    .select('*')
    .eq('transformation_id', transformationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
