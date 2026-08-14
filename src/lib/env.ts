import { z } from 'zod';

/**
 * Validated environment access.
 *
 * Every env read previously fell back to a hardcoded placeholder
 * ('placeholder-service-key-for-build-time-pass' and friends), so a
 * misconfigured deployment produced a client that looked fine at boot and
 * failed with confusing auth errors at request time. These schemas surface the
 * problem where it happens instead.
 *
 * NEXT_PUBLIC_* vars must be referenced as full literal property accesses so
 * Next can statically inline them into the client bundle — do not rewrite
 * these as process.env[key].
 */

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required'),
});

function format(error: z.ZodError): string {
  return error.issues.map((i) => `  - ${i.message}`).join('\n');
}

/**
 * True while `next build` is prerendering pages, where env vars are often
 * absent by design (a clean CI checkout has no .env file).
 */
function isPrerender(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build';
}

let cachedClientEnv: z.infer<typeof clientSchema> | null = null;

/**
 * Supabase URL and anon key. Safe on the client; protected by RLS.
 *
 * NEXT_PUBLIC_* values are inlined at build time, so a missing one is a build
 * configuration problem rather than a runtime condition. Throwing during
 * static prerender would abort the build itself — including on machines that
 * legitimately have no .env, such as a clean CI checkout — so prerender gets
 * placeholder values while every real request path throws.
 */
export function getClientEnv() {
  if (cachedClientEnv) return cachedClientEnv;

  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    if (isPrerender()) {
      // Not cached: a real request must re-evaluate and fail loudly.
      return {
        NEXT_PUBLIC_SUPABASE_URL: 'https://build-time-placeholder.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'build-time-placeholder',
      };
    }
    throw new Error(`Invalid public environment configuration:\n${format(parsed.error)}`);
  }

  cachedClientEnv = parsed.data;
  return cachedClientEnv;
}

let cachedServerEnv: z.infer<typeof serverSchema> | null = null;

/** Server-only secrets. Never import this from a client component. */
export function getServerEnv() {
  if (cachedServerEnv) return cachedServerEnv;

  const parsed = serverSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
  });

  if (!parsed.success) {
    if (isPrerender()) {
      // Never cached, so any real request still throws.
      return {
        SUPABASE_SERVICE_ROLE_KEY: 'build-time-placeholder',
        GROQ_API_KEY: 'build-time-placeholder',
      };
    }
    throw new Error(`Invalid server environment configuration:\n${format(parsed.error)}`);
  }

  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}
