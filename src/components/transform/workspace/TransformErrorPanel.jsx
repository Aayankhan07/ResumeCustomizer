'use client';

import { useEffect, useState } from 'react';
import { Clock, WifiOff, AlertOctagon, ShieldAlert, FileText, AlertTriangle } from 'lucide-react';
import GlassPanel from '../../ui/GlassPanel';
import Button from '../../ui/Button';
import { ERROR_MESSAGES } from '../../../utils/errors';

/** Errors the user can only resolve by editing their input. */
const INPUT_ERRORS = [
  'CONTENT_TOO_LONG',
  'INVALID_JD',
  'INVALID_JOB_TITLE',
  'INPUT_TOO_SHORT',
  'MISSING_RESUME_TEXT',
  'INVALID_REQUEST',
];

export default function TransformErrorPanel({
  errorCode,
  errorDetails,
  rateLimit,
  onRetry,
  onBackToEditor,
}) {
  const [timeLeft, setTimeLeft] = useState('');

  // Map rate limit standard codes to either RATE_LIMITED or RATE_LIMIT_EXCEEDED
  const normalizedErrorCode = errorCode === 'RATE_LIMIT_EXCEEDED' ? 'RATE_LIMITED' : errorCode;
  const errorObj = ERROR_MESSAGES[normalizedErrorCode] || ERROR_MESSAGES.DEFAULT_ERROR;

  // Rate limit countdown logic
  useEffect(() => {
    if (normalizedErrorCode !== 'RATE_LIMITED') return;

    // No fabricated fallback: this used to invent `now + 1 hour` and count
    // down from a number it made up. If the server did not tell us when the
    // limit resets, we say so instead of guessing.
    if (!rateLimit?.resetAt) {
      setTimeLeft('');
      return;
    }
    const resetTime = new Date(rateLimit.resetAt).getTime();


    const updateTimer = () => {
      const now = Date.now();
      const diff = resetTime - now;
      
      if (diff <= 0) {
        setTimeLeft('00:00');
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      const hrsStr = hours > 0 ? `${hours}:` : '';
      const minsStr = minutes < 10 ? `0${minutes}` : minutes;
      const secsStr = seconds < 10 ? `0${seconds}` : seconds;
      
      setTimeLeft(`${hrsStr}${minsStr}:${secsStr}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [normalizedErrorCode, rateLimit]);

  // Determine icon based on error
  const getIcon = () => {
    switch (normalizedErrorCode) {
      case 'RATE_LIMITED':
        return <Clock className="w-7 h-7 text-amber-500 animate-pulse" />;
      case 'CONTENT_TOO_LONG':
        return <FileText className="w-7 h-7 text-[var(--danger)]" />;
      case 'AI_TIMEOUT':
      case 'NETWORK_ERROR':
        return <WifiOff className="w-7 h-7 text-[var(--text-secondary)]" />;
      case 'AUTH_FAILED':
      case 'UNAUTHORIZED':
        return <ShieldAlert className="w-7 h-7 text-[var(--danger)]" />;
      case 'INVALID_JD':
      case 'INVALID_JOB_TITLE':
        return <AlertTriangle className="w-7 h-7 text-[var(--warning)]" />;
      case 'PARSE_FAILED':
      default:
        return <AlertOctagon className="w-7 h-7 text-[var(--text-secondary)]" />;
    }
  };

  // Border tint by severity. Tokenized so it works in both themes — the
  // previous values were hardcoded for a dark background only, which made
  // this panel a dark card floating on a white page in light mode.
  const getPanelClass = () => {
    switch (normalizedErrorCode) {
      case 'RATE_LIMITED':
      case 'INVALID_JD':
      case 'INVALID_JOB_TITLE':
        return 'border-[var(--warning)]/30';
      case 'CONTENT_TOO_LONG':
      case 'AUTH_FAILED':
      case 'UNAUTHORIZED':
        return 'border-[var(--danger)]/30';
      default:
        return 'border-[var(--border-default)]';
    }
  };

  // Dynamic description mapping
  const getDescription = () => {
    if (normalizedErrorCode === 'RATE_LIMITED') {
      return errorObj.description(timeLeft || 'some time');
    }
    if (normalizedErrorCode === 'CONTENT_TOO_LONG') {
      // Look for max/actual details in errorDetails if provided
      const max = errorDetails?.max || 10000;
      const actual = errorDetails?.actual || 'too many';
      return errorObj.description(max, actual);
    }
    return errorObj.description(errorDetails);
  };

  const isAuthError =
    normalizedErrorCode === 'AUTH_FAILED' || normalizedErrorCode === 'UNAUTHORIZED';
  const isInputError = INPUT_ERRORS.includes(normalizedErrorCode);
  const isRateLimited = normalizedErrorCode === 'RATE_LIMITED';

  // Rate limiting cannot be retried away — offering "retry" there just
  // re-trips the same limit.
  const canRetry = !isRateLimited && !isInputError && !isAuthError;

  return (
    <div className="w-full flex items-center justify-center p-4 min-h-[400px]">
      <GlassPanel
        role="alert"
        className={`max-w-md w-full text-center p-6 sm:p-8 ${getPanelClass()}`}
      >
        <div className="mx-auto w-14 h-14 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-full flex items-center justify-center mb-5">
          {getIcon()}
        </div>

        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{errorObj.title}</h3>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
          {getDescription()}
        </p>

        {isRateLimited && timeLeft && (
          <div className="py-4 px-6 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-[var(--radius-lg)] mb-6 flex flex-col items-center justify-center">
            <span className="text-[11px] font-semibold font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Limit resets in
            </span>
            <span className="text-3xl font-mono font-bold text-[var(--warning-fg)] tracking-wider">
              {timeLeft}
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Input errors can only be fixed by editing, so the primary action
              returns to the wizard with the user's text intact rather than
              re-submitting the same rejected input. */}
          {isInputError && onBackToEditor && (
            <Button onClick={onBackToEditor} className="flex-1">
              Edit and try again
            </Button>
          )}

          {isAuthError && (
            <Button onClick={() => (window.location.href = '/login')} className="flex-1">
              Sign in
            </Button>
          )}

          {canRetry && onRetry && (
            <Button onClick={onRetry} className="flex-1">
              Try again
            </Button>
          )}

          {!isInputError && onBackToEditor && (
            <Button variant="outline" onClick={onBackToEditor} className="flex-1">
              Back to editor
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => (window.location.href = '/dashboard')}
            className="flex-1"
          >
            Dashboard
          </Button>
        </div>
      </GlassPanel>
    </div>
  );
}