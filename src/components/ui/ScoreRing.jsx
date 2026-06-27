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
      className="flex flex-col items-center justify-center relative select-none w-fit mx-auto"
      aria-label={`ATS Match Score: ${score}%`}
    >
      <svg width={size} height={size} className="transform -rotate-90">
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
      {/* Centered text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-[26px] font-bold text-[var(--text-primary)] font-sans leading-none">{currentScore}%</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)] font-sans mt-0.5">ATS Match</span>
      </div>
    </div>
  );
}
