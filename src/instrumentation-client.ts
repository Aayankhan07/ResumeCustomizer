// Next loads this automatically on the client. Kept as a thin re-export so the
// actual configuration lives beside the server and edge configs.
import '../sentry.client.config';

export { captureRouterTransitionStart as onRouterTransitionStart } from '@sentry/nextjs';
