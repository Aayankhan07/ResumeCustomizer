'use client';

import { useEffect, useState, useRef } from 'react';

export interface ScoreRingProps {
  /** 0-100. Null or undefined is treated as 0. */
  score: number | null | undefined;
  /** Diameter of the ring in pixels. */
  size?: number;
  strokeWidth?: number;
  /** Count-up duration in milliseconds. */
  duration?: number;
}

/** Score bands: >=70 success, 40-69 warning, <40 danger. */
function getStrokeColor(val: number): string {
  if (val >= 70) return 'var(--success)';
  if (val >= 40) return 'var(--warning)';
  return 'var(--danger)';
}

export default function ScoreRing({
  score,
  size = 88,
  strokeWidth = 6,
  duration = 900,
}: ScoreRingProps) {
  const [currentScore, setCurrentScore] = useState(0);
  const prevScoreRef = useRef(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startScore = prevScoreRef.current;
    const endScore = score ?? 0;
    prevScoreRef.current = endScore;

    let frame = 0;
    const step = (timestamp: number) => {
      if (startTimestamp === null) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCurrentScore(Math.floor(progress * (endScore - startScore) + startScore));
      if (progress < 1) {
        frame = window.requestAnimationFrame(step);
      }
    };
    frame = window.requestAnimationFrame(step);

    // The loop used to run unguarded, so unmounting mid-animation left it
    // calling setState on a dead component.
    return () => window.cancelAnimationFrame(frame);
  }, [score, duration]);

  const safeScore = score ?? 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;
  const strokeColor = getStrokeColor(safeScore);

  return (
    <div
      className="flex flex-col items-center justify-center relative select-none mx-auto"
      // The label sits at a fixed 11px, so on small rings it is wider than the
      // SVG. With the old w-fit the box collapsed to the ring and the text was
      // clipped; a floor of 72px keeps "ATS MATCH" inside the element while
      // the ring itself still renders at `size`.
      style={{ width: Math.max(size, 72) }}
      // safeScore, not score: a null previously rendered "ATS Match Score: null%"
      // to screen readers.
      aria-label={`ATS Match Score: ${safeScore}%`}
    >
      <svg width={size} height={size} className="transform -rotate-90 mx-auto block">
        {/* Background track circle */}
        <circle
          className="stroke-[var(--border-default)]"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Animated fill circle */}
        <circle
          style={{
            transitionDuration: `${duration}ms`,
            stroke: strokeColor,
          }}
          className="transition-all ease-out"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Centered text. Pinned to the wrapper (inset-0) rather than left to
          size itself: as an unconstrained absolute child it overflowed the
          ring and "ATS MATCH" was clipped on both sides. */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-1">
        {/* Sized so the widest value ("100%") clears the ring's inner
            diameter with margin, rather than filling it edge to edge. */}
        <span
          className="font-bold text-[var(--text-primary)] font-sans leading-none tabular-nums"
          style={{ fontSize: Math.round(size * 0.22) }}
        >
          {currentScore}%
        </span>
        {/* Held at 11px — the project's minimum legible size — rather than
            scaled down to fit the ring. The wrapper is widened instead, so the
            label has room at any ring size. */}
        <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)] font-sans mt-0.5 leading-none whitespace-nowrap">
          ATS Match
        </span>
      </div>
    </div>
  );
}
