import type { CSSProperties } from 'react';

const VARIANT_STYLES = {
  heading: 'h-5 w-3/5 rounded-[var(--radius-sm)]',
  pill: 'h-6 w-20 rounded-[var(--radius-sm)]',
  circle: 'h-10 w-10 rounded-full',
  line: 'h-3.5 w-full rounded-[var(--radius-xs)]',
} as const;

export interface SkeletonBlockProps {
  className?: string;
  variant?: keyof typeof VARIANT_STYLES;
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
}

export default function SkeletonBlock({
  className = '',
  variant = 'line',
  width,
  height,
}: SkeletonBlockProps) {
  const style: CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      style={style}
      aria-hidden="true"
      className={`bg-[var(--bg-muted)] animate-shimmer ${VARIANT_STYLES[variant]} ${className}`}
    />
  );
}
