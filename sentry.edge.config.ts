import * as Sentry from '@sentry/nextjs';

// Edge runtime (middleware). Kept minimal — middleware runs on nearly every
// request, so tracing here would dominate the sample budget.
const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0.05,
    sendDefaultPii: false,
  });
}
