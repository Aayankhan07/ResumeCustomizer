'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import GlassPanel from './GlassPanel';
import Button from './Button';
import * as Sentry from '@sentry/nextjs';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    try {
      Sentry.captureException(error, { extra: errorInfo });
    } catch (err) {
      console.error("Failed to report exception to Sentry:", err);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback prop if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isGlobal = this.props.variant === 'global';

      // The raw exception message is deliberately not rendered. It was shown
      // to users in a mono block ("Cannot read properties of undefined…"),
      // which tells them nothing and leaks internals. It still reaches the
      // console and Sentry in componentDidCatch.

      if (isGlobal) {
        return (
          <div
            role="alert"
            className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-base)] p-4 text-[var(--text-primary)]"
          >
            <GlassPanel className="relative z-10 max-w-lg w-full text-center border-[var(--danger)]/25 p-8 sm:p-10">
              <div className="mx-auto w-16 h-16 bg-[var(--danger-subtle)] border border-[var(--danger)]/30 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-[var(--danger-fg)]" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-3">
                Something went wrong
              </h1>

              <p className="text-sm sm:text-base text-[var(--text-secondary)] mb-8">
                This page stopped working unexpectedly. Your saved resumes are
                safe — reloading usually fixes it.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => window.location.reload()} className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reload page
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = '/dashboard')}
                  className="flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go to dashboard
                </Button>
              </div>
            </GlassPanel>
          </div>
        );
      }

      // Tab or section-level fallback
      return (
        <GlassPanel role="alert" className="w-full border-[var(--danger)]/20 p-6 text-center">
          <div className="mx-auto w-12 h-12 bg-[var(--danger-subtle)] border border-[var(--danger)]/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-[var(--danger-fg)]" />
          </div>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
            This section couldn&apos;t load
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mb-4 max-w-md mx-auto">
            The rest of the page still works. Try loading this section again.
          </p>
          <Button
            onClick={this.handleReset}
            size="sm"
            variant="secondary"
            className="inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try again
          </Button>
        </GlassPanel>
      );
    }

    return this.props.children;
  }
}