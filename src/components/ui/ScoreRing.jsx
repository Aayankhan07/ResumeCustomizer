'use client';

import { useEffect, useState, useRef } from 'react';

export default function ScoreRing({ score, size = 88, strokeWidth = 6, duration = 900 }) {
  const [currentScore, setCurrentScore] = useState(0);
  const prevScoreRef = useRef(0);

  useEffect(() => {
    let startTimestamp = null;
    const startScore = prevScoreRef.current;
    const endScore = score ?? 0;
    prevScoreRef.current = endScore;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const val = Math.floor(progress * (endScore - startScore) + startScore);
      setCurrentScore(val);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [score, duration]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  // Score color ranges: ≥70 → success, 40–69 → warning, <40 → danger
  const getStrokeColor = (val) => {
    if (val >= 70) return 'var(--success)';
    if (val >= 40) return 'var(--warning)';
    return 'var(--danger)';
  };

  const strokeColor = getStrokeColor(score ?? 0);

  return (
    <div
      className="flex flex-col items-center justify-center relative select-none mx-auto"
      // The label sits at a fixed 11px, so on small rings it is wider than the
      // SVG. With the old w-fit the box collapsed to the ring and the text was
      // clipped; a floor of 72px keeps "ATS MATCH" inside the element while
      // the ring itself still renders at `size`.
      style={{ width: Math.max(size, 72) }}
      aria-label={`ATS Match Score: ${score}%`}
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
            stroke: strokeColor
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
            scaled down to fit the ring. The wrapper below is widened instead,
            so the label has room at any ring size. */}
        <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)] font-sans mt-0.5 leading-none whitespace-nowrap">
          ATS Match
        </span>
      </div>
    </div>
  );
}