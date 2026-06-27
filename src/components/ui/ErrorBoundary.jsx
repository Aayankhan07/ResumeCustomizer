import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import GlassPanel from './GlassPanel';
import Button from './Button';
import * as Sentry from '@sentry/react';

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
      const errorMsg = this.state.error?.message || "An unexpected error occurred.";

      if (isGlobal) {
        return (
          <div className="min-h-screen w-full flex items-center justify-center bg-[#0B0F19] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0B0F19] to-black p-4 text-slate-200">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />
            
            <GlassPanel className="relative z-10 max-w-lg w-full text-center border-red-500/20 dark:border-red-500/20 shadow-[0_0_50px_-12px_rgba(239,68,68,0.15)] bg-slate-900/60 dark:bg-slate-900/40 p-8 sm:p-10">
              <div className="mx-auto w-16 h-16 bg-red-500/10 dark:bg-red-900/20 border border-red-500/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-3">
                Workspace Encountered a Crash
              </h1>
              
              <p className="text-sm sm:text-base text-slate-400 mb-6">
                Our core engine caught an unexpected runtime crash. No worries, your session is intact. Try reloading the workspace or navigating back home.
              </p>

              <div className="p-4 bg-black/40 dark:bg-black/60 border border-slate-800 rounded-lg text-left font-mono text-xs text-red-400/90 mb-8 max-h-32 overflow-y-auto custom-scrollbar break-all">
                {errorMsg}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => window.location.reload()}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 border-0"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-hover" />
                  Reload Workspace
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex items-center justify-center gap-2 border-slate-700/80 hover:bg-slate-800/40 text-slate-300"
                >
                  <Home className="w-4 h-4" />
                  Go to Dashboard
                </Button>
              </div>
            </GlassPanel>
          </div>
        );
      }

      // Tab or Section specific Error Boundary
      return (
        <GlassPanel className="w-full border-red-500/10 dark:border-red-500/10 bg-red-500/[0.02] dark:bg-red-950/[0.01] p-6 text-center shadow-[inset_0_1px_1px_rgba(239,68,68,0.05)]">
          <div className="mx-auto w-12 h-12 bg-red-500/10 dark:bg-red-900/20 border border-red-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-100 mb-1">
            Section Failed to Load
          </h3>
          <p className="text-xs text-slate-400 mb-4 max-w-md mx-auto">
            {errorMsg}
          </p>
          <Button 
            onClick={this.handleReset}
            size="sm"
            className="inline-flex items-center gap-1.5 py-1.5 px-3.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload Section
          </Button>
        </GlassPanel>
      );
    }

    return this.props.children;
  }
}
