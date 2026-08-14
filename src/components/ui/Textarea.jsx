'use client';

import { forwardRef, useId } from 'react';

const Textarea = forwardRef(({ className = '', label, error, id, ...props }, ref) => {
  // Same missing label association as Input had; also migrated off custom
  // class names that were never defined in the theme and silently rendered
  // as nothing.
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full min-h-[220px] bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg px-3.5 py-2.5 font-mono text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all duration-150 resize-y leading-relaxed ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <span id={errorId} role="alert" className="text-xs text-red-600 font-medium">
          {error}
        </span>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;