export default function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  className = '' 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4 stroke-[3]',
    md: 'w-6 h-6 stroke-[3]',
    lg: 'w-8 h-8 stroke-[2.5]',
    xl: 'w-12 h-12 stroke-[2]'
  };

  const colorClasses = {
    primary: 'text-slate-900 dark:text-white',
    emerald: 'text-emerald-500 dark:text-emerald-400',
    white: 'text-white',
    slate: 'text-slate-400 dark:text-slate-500'
  };

  return (
    <svg 
      className={`animate-spin ${sizeClasses[size] || sizeClasses.md} ${colorClasses[color] || colorClasses.primary} ${className}`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
