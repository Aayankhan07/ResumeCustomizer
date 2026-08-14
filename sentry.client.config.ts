import * as Sentry from '@sentry/nextjs';

// Browser-side error reporting.
//
// Until this file existed, ErrorBoundary called Sentry.captureException() with
// no init anywhere in the repo, so every reported exception was discarded.
//
// Reporting stays off unless NEXT_PUBLIC_SENTRY_DSN is set, so local and
// preview runs do not emit noise.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,

    // Sample rather than capture everything: this is a low-volume app and
    // full tracing would be mostly redundant.
    tracesSampleRate: 0.1,

    // Errors carry resume and job-description text in component state, which
    // is user PII. Do not let the SDK attach request bodies or cookies.
    sendDefaultPii: false,

    beforeSend(event) {
      // Strip query strings, which can carry auth codes from /auth/callback.
      if (event.request?.url) {
        event.request.url = event.request.url.split('?')[0];
      }
      return event;
    },
  });
}
