import { forwardRef, ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyle = 'inline-flex items-center justify-center font-sans font-medium rounded-lg transition-all duration-150 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 disabled:opacity-45 disabled:cursor-not-allowed disabled:transform-none disabled:active:scale-100';
    
    const variants = {
      primary: 'bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] border border-transparent shadow-sm',
      secondary: 'bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-muted)]',
      ghost: 'bg-transparent text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]',
      danger: 'bg-[var(--danger-subtle)] text-[var(--danger-fg)] border border-[var(--danger-subtle)] hover:bg-[var(--danger)] hover:text-white',
      text: 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      icon: 'w-9 h-9 items-center justify-center p-0',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
