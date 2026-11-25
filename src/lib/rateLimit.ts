import { createServiceClient } from './supabase/service';

const LIMITS: Record<string, { count: number; windowMs: number }> = {
  transform: { count: 10, windowMs: 3600000 }, // 10 per hour
  rescore: { count: 30, windowMs: 3600000 }, // 30 per hour
};

export async function checkRateLimit(
  userId: string,
  action: string
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  unavailable?: boolean;
}> {
  const limit = LIMITS[action];
  if (!limit) return { allowed: true, remaining: 999, resetAt: new Date() };

  const supabase = createServiceClient();

  // Counts the window and, only if under the limit, records this request, all
  // in one locked statement. Concurrent requests cannot each read an
  // under-limit count and all pass, and denied requests are not recorded, so
  // retrying while limited does not extend the lockout.
  const { data, error } = await supabase.rpc('consume_rate_limit_v2', {
    p_user_id: userId,
    p_action: action,
    p_window_ms: limit.windowMs,
    p_limit: limit.count,
  });

  // Fail closed. A failed query previously yielded count = null -> used = 0,
  // which silently disabled the limit and left LLM spend uncapped.
  if (error) {
    console.error('Rate limit check failed:', error);
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(Date.now() + limit.windowMs),
      unavailable: true,
    };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row.used !== 'number') {
    console.error('Rate limit check returned unexpected shape:', data);
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(Date.now() + limit.windowMs),
      unavailable: true,
    };
  }

  const used: number = row.used;

  // Reset when the oldest request in the window ages out, not now + window.
  const oldestAt = row.oldest_at ? new Date(row.oldest_at) : new Date();
  const resetAt = new Date(oldestAt.getTime() + limit.windowMs);

  return {
    allowed: row.allowed === true,
    remaining: Math.max(0, limit.count - used),
    resetAt,
  };
}
