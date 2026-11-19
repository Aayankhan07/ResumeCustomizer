'use client';

import { memo } from 'react';

/**
 * Minimal inline-SVG icon set for the claymorphic landing section.
 *
 * These are decorative landing assets only. They intentionally avoid pulling in
 * a heavier icon library for one-off landing flourishes (pin, cube, stopwatch,
 * document tile, target, hourglass, lightbulb, arrow tile, clock).
 */
export const PinIcon = memo(function PinIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 2C8.686 2 6 4.686 6 8c0 5.25 7 13 7 13s7-7.75 7-13c0-3.314-2.686-6-6-6z"
        fill="currentColor"
        opacity="0.9"
      />
      <circle cx="12" cy="8" r="2.2" fill="color-mix(in srgb, var(--bg-elevated) 70%, #ffffff)" />
    </svg>
  );
});

export const CubeIcon = memo(function CubeIcon({
  className = '',
  accent = false,
}: {
  className?: string;
  accent?: boolean;
}) {
  const color = accent ? 'var(--accent)' : 'var(--text-secondary)';
  const face = accent
    ? "color-mix(in srgb, var(--accent) 80%, var(--bg-elevated))"
    : 'var(--bg-elevated)';

  return (
    <svg className={className} width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      {/* top face */}
      <path
        d="M4 14L17 7L30 14V28L17 34L4 28V14Z"
        fill="color-mix(in srgb, var(--bg-elevated) 92%, transparent)"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* left face */}
      <path
        d="M4 14L17 20L17 34L4 28V14Z"
        fill={face}
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* right face */}
      <path
        d="M17 20L30 14V28L17 34L17 20Z"
        fill="color-mix(in srgb, var(--bg-elevated) 78%, transparent)"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* checkmark accent on the top face */}
      <path
        d="M13 18.5L15.5 21L21 14.5"
        stroke={accent ? 'var(--accent-fg)' : 'var(--accent)'}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
});

export const StopwatchIcon = memo(function StopwatchIcon({
  className = '',
  accent = false,
}: {
  className?: string;
  accent?: boolean;
}) {
  const color = accent ? 'var(--accent)' : 'var(--text-secondary)';
  return (
    <svg className={className} width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <circle cx="17" cy="17" r="12.4" stroke={color} strokeWidth="1.5" fill="color-mix(in srgb, var(--bg-elevated) 90%, transparent)" />
      <path d="M11.2 15.4L15.6 19.8" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15.6 19.8L22.4 11.8" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="17" cy="17" r="2.4" fill={accent ? 'var(--accent)' : 'var(--bg-muted)'} stroke={color} strokeWidth="1.2" />
      <path d="M17 2V7" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M15.6 4.6H18.4V7H15.6V4.6Z" fill={color} />
      <path d="M16.6 8.6H17.4V10.4H16.6V8.6Z" fill={color} />
    </svg>
  );
});

export const DocumentTileIcon = memo(function DocumentTileIcon({
  className = '',
  accent = false,
}: {
  className?: string;
  accent?: boolean;
}) {
  const color = accent ? 'var(--accent)' : 'var(--text-secondary)';
  return (
    <svg className={className} width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <path
        d="M6 5H22L28 11V29H6V5Z"
        fill="color-mix(in srgb, var(--bg-elevated) 90%, transparent)"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M6 5H22L28 11V29H6V5Z" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M10 14H20" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10 17H20" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10 20H16" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M17 21L20.5 24.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.5 21L17 24.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
});

export const TargetTileIcon = memo(function TargetTileIcon({
  className = '',
  accent = false,
}: {
  className?: string;
  accent?: boolean;
}) {
  const color = accent ? 'var(--accent)' : 'var(--text-secondary)';
  return (
    <svg className={className} width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <circle cx="17" cy="17" r="12.4" stroke={color} strokeWidth="1.5" fill="color-mix(in srgb, var(--bg-elevated) 90%, transparent)" />
      <circle cx="17" cy="17" r="8.2" stroke={color} strokeWidth="1.4" fill="none" />
      <circle cx="17" cy="17" r="4.2" stroke={color} strokeWidth="1.4" fill="none" />
      <circle cx="17" cy="17" r="1.6" fill={accent ? 'var(--accent)' : 'var(--bg-muted)'} stroke={color} strokeWidth="1" />
      <path d="M17 4.6V5.6" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M17 28.4V29.4" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M4.6 17H5.6" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M28.4 17H29.4" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
});

export const HourglassTileIcon = memo(function HourglassTileIcon({
  className = '',
  accent = false,
}: {
  className?: string;
  accent?: boolean;
}) {
  const color = accent ? 'var(--accent)' : 'var(--text-secondary)';
  return (
    <svg className={className} width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <path d="M7 5H27V9H7V5Z" stroke={color} strokeWidth="1.5" fill="color-mix(in srgb, var(--bg-elevated) 90%, transparent)" />
      <path d="M7 25H27V29H7V25Z" stroke={color} strokeWidth="1.5" fill="color-mix(in srgb, var(--bg-elevated) 90%, transparent)" />
      <path d="M7 9L17 17L7 25" stroke={color} strokeWidth="1.4" fill="none" />
      <path d="M27 9L17 17L27 25" stroke={color} strokeWidth="1.4" fill="none" />
      <path d="M13 12.5L15 14.5L19.5 9.5" stroke={accent ? 'var(--accent)' : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 21.5L19 19.5L14.5 24.5" stroke={accent ? 'var(--accent)' : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
});

export const LightbulbTileIcon = memo(function LightbulbTileIcon({
  className = '',
  accent = false,
}: {
  className?: string;
  accent?: boolean;
}) {
  const color = accent ? 'var(--accent)' : 'var(--text-secondary)';
  return (
    <svg className={className} width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <path
        d="M17 4C11.5 4 7 8.5 7 14c0 4.5 4 9.2 7 10.6 3-.2 7-4.4 7-10.6 0-5.5-4.5-10-9-10z"
        stroke={color}
        strokeWidth="1.5"
        fill="color-mix(in srgb, var(--bg-elevated) 90%, transparent)"
      />
      <path d="M12 14h10M14 17h6M13.5 20h7" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M13 25.4V27a5 5 0 0010 0v-1.6" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="17" cy="13.2" r="2" fill={accent ? 'var(--accent)' : 'var(--bg-muted)'} stroke={color} strokeWidth="1.2" />
    </svg>
  );
});

export const ArrowTileIcon = memo(function ArrowTileIcon({
  className = '',
  accent = false,
}: {
  className?: string;
  accent?: boolean;
}) {
  const color = accent ? 'var(--accent)' : 'var(--text-secondary)';
  return (
    <svg className={className} width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <path
        d="M6 7H22L28 13V29H6V7Z"
        fill="color-mix(in srgb, var(--bg-elevated) 90%, transparent)"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M6 7H22L28 13" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M16 20l5 5M21 20H14" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 24.5h8M17 21.5v6" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
});

export const ClockTileIcon = memo(function ClockTileIcon({
  className = '',
  accent = false,
}: {
  className?: string;
  accent?: boolean;
}) {
  const color = accent ? 'var(--accent)' : 'var(--text-secondary)';
  return (
    <svg className={className} width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <circle cx="17" cy="17" r="12.4" stroke={color} strokeWidth="1.5" fill="color-mix(in srgb, var(--bg-elevated) 90%, transparent)" />
      <path d="M17 9V17L21.5 21.5" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 9V7M17 27V25M25 17H27M7 17H9M22.6 11.6L24 10.2M9.4 22.4L8 23.8" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="17" cy="17" r="1.5" fill={accent ? 'var(--accent)' : 'var(--bg-muted)'} />
    </svg>
  );
});

export const BoltIcon = memo(function BoltIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M12 2.4L6.6 9.1L8.6 11.1L13.6 4.7L15.2 6.7L8.6 13.3L12 2.4Z"
        fill="var(--accent-fg)"
      />
    </svg>
  );
});

export const StickyNotePinSvg = memo(function StickyNotePinSvg({
  accentColor = 'var(--accent)',
}: {
  accentColor?: string;
}) {
  return (
    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden="true">
      <path
        d="M4 0C2.2 0 1 1.2 1 3v4c0 3.5 6 8 6 8s6-4.5 6-8V3c0-1.8-1.2-3-3-3z"
        fill={accentColor}
      />
      <circle cx="4" cy="3" r="1.1" fill="color-mix(in srgb, var(--bg-elevated) 70%, #ffffff)" />
    </svg>
  );
});

export const MinusBarSvg = memo(function MinusBarSvg({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <rect x="1" y="4" width="8" height="2" rx="1" fill="currentColor" />
    </svg>
  );
});

export const PlusBarSvg = memo(function PlusBarSvg({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <rect x="4" y="1" width="2" height="8" rx="1" fill="currentColor" />
      <rect x="1" y="4" width="8" height="2" rx="1" fill="currentColor" />
    </svg>
  );
});

export const FolderTileIcon = memo(function FolderTileIcon({
  className = '',
  accent = false,
}: {
  className?: string;
  accent?: boolean;
}) {
  const color = accent ? 'var(--accent)' : 'var(--text-secondary)';
  return (
    <svg className={className} width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <path
        d="M5 9H29V11H5V9Z"
        stroke={color}
        strokeWidth="1.5"
        fill="color-mix(in srgb, var(--bg-elevated) 90%, transparent)"
      />
      <path
        d="M5 13H29V26H5V13Z"
        fill="color-mix(in srgb, var(--bg-elevated) 86%, transparent)"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9 17H15M9 20H15M9 23H13" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M19 18.5L21 20.5M21 18.5L19 20.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
});
