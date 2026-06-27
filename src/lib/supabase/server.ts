import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const getMetaEnv = (key: string): string | undefined => {
  try {
    const meta = import.meta as any;
    return meta && meta['env'] ? meta['env'][key] : undefined;
  } catch {
    return undefined;
  }
};

const supabaseUrl = 
  (typeof process !== 'undefined' && process.env ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined) || 
  getMetaEnv('VITE_SUPABASE_URL') ||
  'https://placeholder-project.supabase.co';

const supabaseKey = 
  (typeof process !== 'undefined' && process.env ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined) || 
  getMetaEnv('VITE_SUPABASE_ANON_KEY') ||
  'placeholder-anon-key-for-build-time-pass';

export async function createClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore cookie updates inside read-only context (e.g. server components)
          }
        },
      },
    }
  );
}

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createAnonClient() {
  return createSupabaseClient(supabaseUrl, supabaseKey);
}
