import { createBrowserClient } from '@supabase/ssr';

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

export function createClient() {
  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
}
