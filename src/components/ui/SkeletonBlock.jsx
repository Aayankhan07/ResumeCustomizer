export default function SkeletonBlock({ className = '', variant = 'line', width, height }) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'heading':
        return 'h-5 w-3/5 rounded-[var(--radius-sm)]';
      case 'pill':
        return 'h-6 w-20 rounded-[var(--radius-sm)]';
      case 'circle':
        return 'h-10 w-10 rounded-full';
      case 'line':
      default:
        return 'h-3.5 w-full rounded-[var(--radius-xs)]';
    }
  };

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      style={style}
      className={`bg-[var(--bg-muted)] animate-shimmer ${getVariantStyles()} ${className}`}
    />
  );
}
