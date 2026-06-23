import { forwardRef } from 'react';

const Button = forwardRef(({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
  const baseStyle = 'inline-flex items-center justify-center font-sans font-medium rounded-lg transition-all duration-150 active:translate-y-0 active:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-cobalt focus-visible:outline-offset-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0';
  
  const variants = {
    primary: 'bg-cobalt text-white shadow-cobalt hover:bg-cobalt-light hover:-translate-y-px hover:shadow-lg',
    secondary: 'bg-cobalt-subtle text-cobalt hover:bg-blue-100 hover:-translate-y-px',
    ghost: 'bg-transparent text-ink border border-boundary hover:border-graphite hover:bg-mist/50',
    danger: 'bg-transparent text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-600 hover:-translate-y-px',
    text: 'bg-transparent text-graphite hover:text-ink',
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
});

Button.displayName = 'Button';
export default Button;
