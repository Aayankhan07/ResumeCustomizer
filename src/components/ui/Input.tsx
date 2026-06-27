import { forwardRef, InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-graphite uppercase tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full bg-white border border-boundary rounded-lg px-3.5 py-2.5 font-sans text-sm text-ink placeholder:text-graphite/50 focus:outline-none focus:border-cobalt focus:ring-4 focus:ring-cobalt/12 transition-all duration-150 ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/12' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-600 font-medium">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
