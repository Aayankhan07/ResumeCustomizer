'use client';

/**
 * Translucent surface panel.
 *
 * Was built entirely on raw Tailwind palette values, which meant it could not
 * follow the theme tokens the rest of the app uses. `color-mix` keeps the
 * translucency while deriving the colour from the active theme.
 */
export default function GlassPanel({ children, className = '', hoverEffect = false, ...props }) {
  return (
    <div
      className={`bg-[color-mix(in_srgb,var(--bg-elevated)_75%,transparent)] border border-[var(--border-default)] backdrop-blur-md rounded-[var(--radius-lg)] p-5 sm:p-6 shadow-[var(--shadow-sm)] transition-all duration-300 ${
        hoverEffect
          ? 'hover:shadow-[var(--shadow-md)] hover:border-[var(--border-strong)] hover:-translate-y-0.5'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
