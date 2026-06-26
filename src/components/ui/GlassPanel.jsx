export default function GlassPanel({ 
  children, 
  className = '', 
  hoverEffect = false,
  ...props 
}) {
  return (
    <div 
      className={`bg-white/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md rounded-xl p-5 sm:p-6 shadow-sm transition-all duration-300 ${
        hoverEffect ? 'hover:shadow-md hover:border-slate-300/80 dark:hover:border-slate-700/80 hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
