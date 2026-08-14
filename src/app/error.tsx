'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Route-level error boundary.
 *
 * Nothing outside TransformOutput was previously protected, so a render error
 * on the dashboard, profile, or an auth page produced a blank white screen.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-base)]">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-[var(--danger-subtle)] border border-[var(--danger-fg)]/20 flex items-center justify-center mb-5">
          <AlertTriangle className="w-7 h-7 text-[var(--danger-fg)]" />
        </div>

        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          This page failed to load. Your data is safe — try again, or head back to your dashboard.
        </p>

        {error.digest && (
          <p className="text-xs font-mono text-[var(--text-tertiary)] mb-6">
            Reference: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[var(--radius-md)] bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[var(--radius-md)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm font-semibold hover:bg-[var(--bg-subtle)] transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
