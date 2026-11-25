import { withSentryConfig } from '@sentry/nextjs';

const isDev = process.env.NODE_ENV !== 'production';

// Supabase is called from the browser (auth, history, realtime).
const supabaseOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').origin;
  } catch {
    return 'https://*.supabase.co';
  }
})();
const supabaseWs = supabaseOrigin.replace(/^https:/, 'wss:');

/**
 * Content-Security-Policy.
 *
 * 'unsafe-inline' for scripts is required because the root layout ships an
 * inline theme script and JSON-LD, and the landing page is statically
 * rendered (ISR), which rules out per-request nonces. Everything else is
 * locked to this origin plus the services the app actually calls.
 * 'wasm-unsafe-eval' is for pdf.js image decoders; 'unsafe-eval' only in dev
 * (React Refresh).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ''} https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} ${supabaseWs} https://vitals.vercel-insights.com https://va.vercel-scripts.com`,
  "worker-src 'self' blob:",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // The auth callback receives ?code= in its URL; never send it onward.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

// Source-map upload only runs when SENTRY_AUTH_TOKEN is present, so local and
// CI builds are unaffected.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  silent: !process.env.CI,
  widenClientFileUpload: true,

  // Route browser reports through the app's own origin so ad blockers do not
  // silently drop them.
  tunnelRoute: '/monitoring',

  // Keep stack traces readable without shipping sources to the client: maps
  // are uploaded to Sentry, then deleted from the build output. (`hideSourceMaps`
  // was removed in @sentry/nextjs v9+; this is its replacement.)
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
