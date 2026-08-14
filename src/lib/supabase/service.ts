import { createClient } from '@supabase/supabase-js';
import { getClientEnv, getServerEnv } from '../env';

/**
 * Service-role client. Bypasses RLS — server-side use only.
 *
 * The VITE_SUPABASE_URL fallback that used to sit here was a Vite-era leftover
 * that could silently point production at a different project.
 */
export function createServiceClient() {
  const { NEXT_PUBLIC_SUPABASE_URL } = getClientEnv();
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();

  return createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}
