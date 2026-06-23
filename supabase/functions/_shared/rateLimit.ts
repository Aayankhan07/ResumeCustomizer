import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LIMITS: Record<string, { count: number; windowMs: number }> = {
  transform: { count: 10, windowMs: 3600000 }, // 10 per hour
};

export async function checkRateLimit(userId: string, action: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}> {
  const limit = LIMITS[action];
  if (!limit) return { allowed: true, remaining: 999, resetAt: new Date() };

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const windowStart = new Date(Date.now() - limit.windowMs).toISOString();
  const { count } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action', action)
    .gte('created_at', windowStart);

  const used = count ?? 0;
  const remaining = Math.max(0, limit.count - used);
  const resetAt = new Date(Date.now() + limit.windowMs);

  if (used >= limit.count) {
    return { allowed: false, remaining: 0, resetAt };
  }

  // Record this usage
  await supabase.from('rate_limits').insert({ user_id: userId, action });

  return { allowed: true, remaining: remaining - 1, resetAt };
}
