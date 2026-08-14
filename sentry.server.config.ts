import * as Sentry from '@sentry/nextjs';

// Server-side error reporting for API route handlers and server components.
//
// api/transform/route.ts logs `{ sentry: true, ... }` as JSON, implying a log
// drain someone intended and never built. With this in place those unhandled
// errors are captured directly.
const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0.1,

    // Request bodies here contain full resume text and job descriptions.
    sendDefaultPii: false,

    beforeSend(event) {
      if (event.request?.url) {
        event.request.url = event.request.url.split('?')[0];
      }
      // Never ship the request body: /api/transform receives resume PII.
      if (event.request?.data) {
        delete event.request.data;
      }
      return event;
    },
  });
}
