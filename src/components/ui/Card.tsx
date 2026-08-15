import { forwardRef, HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

/**
 * Base surface primitive.
 *
 * The background was hardcoded `bg-white`, so every consumer inherited a
 * surface that never darkened — profile/page.tsx worked around it by passing
 * `bg-white dark:bg-slate-900` at the call site. `shadow-card` and
 * `shadow-card-hover` were also undefined utility names and rendered nothing.
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hoverable = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-sm)] transition-all duration-200 ${
          hoverable
            ? 'cursor-pointer hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]'
            : ''
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export default Card;
