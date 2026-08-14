import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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

  // Keep stack traces readable without shipping sources to the client bundle.
  hideSourceMaps: true,
});
