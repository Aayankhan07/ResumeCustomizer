import { useEffect, useState } from 'react';

function getScoreColor(score) {
  if (score >= 75) return { fill: '#16A34A', label: 'Strong Match', bg: '#F0FDF4', border: '#DCFCE7' };
  if (score >= 50) return { fill: '#D97706', label: 'Good Match',   bg: '#FFFBEB', border: '#FEF3C7' };
  return               { fill: '#DC2626', label: 'Partial Match', bg: '#FFF5F5', border: '#FEE2E2' };
}

export default function ScoreDisplay({ score, keywordsMatched = [], keywordsTotal = 0 }) {
  const [displayScore, setDisplayScore] = useState(0);
  const { fill, label, bg, border } = getScoreColor(score);
  const [showAll, setShowAll] = useState(false);
  const MAX_SHOWN = 8;

  // Animate score counting up
  useEffect(() => {
    let frame;
    const duration = 800;
    const start = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const shown = showAll ? keywordsMatched : keywordsMatched.slice(0, MAX_SHOWN);
  const remaining = keywordsMatched.length - MAX_SHOWN;
  
  // Radial ring calculation
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm select-none animate-slide-up">
      {/* Score row */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-5">
        {/* Animated SVG Progress Circle */}
        <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#F1F5F9"
              strokeWidth="5"
              fill="transparent"
            />
            {/* Foreground circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="transparent"
              stroke={fill}
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="font-serif text-3xl font-bold leading-none" style={{ color: fill }}>
              {displayScore}
            </span>
            <span className="text-[9px] text-slate-450 font-mono mt-1 font-bold uppercase tracking-wider">Score</span>
          </div>
        </div>

        {/* Bar + label */}
        <div className="flex-1 w-full text-left">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-semibold text-slate-900">{label}</span>
            <span className="text-xs font-mono font-semibold text-slate-500">{displayScore}% Match</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ 
                width: `${displayScore}%`, 
                backgroundColor: fill
              }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            {keywordsMatched.length} of {keywordsTotal} keywords matched in the optimized resume.
          </p>
        </div>
      </div>

      {/* Keyword chips */}
      {keywordsMatched.length > 0 && (
        <div className="border-t border-slate-100 pt-4 text-left">
          <p className="text-[10px] font-bold text-slate-400 mb-2.5 uppercase tracking-wider font-mono">Matched Technical Terms</p>
          <div className="flex flex-wrap gap-1.5">
            {shown.map(kw => (
              <span
                key={kw}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-50 text-slate-700 border border-slate-200 select-none"
              >
                {kw}
              </span>
            ))}
            {!showAll && remaining > 0 && (
              <button
                onClick={() => setShowAll(true)}
                className="px-2.5 py-1 text-xs text-slate-500 font-medium hover:text-slate-950 hover:bg-slate-100 rounded-md transition-colors border border-slate-200 cursor-pointer"
              >
                +{remaining} more
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
