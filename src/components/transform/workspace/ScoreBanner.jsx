import { useEffect, useState } from 'react';
import { Sparkles, Plus } from 'lucide-react';

export default function ScoreBanner({ 
  candidateName, 
  jobTitle, 
  targetScore = 85, 
  scoreColors, 
  onReset 
}) {
  const [score, setScore] = useState(0);

  // Animate score count-up on mount or targetScore change
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = targetScore / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= targetScore) {
        setScore(targetScore);
        clearInterval(timer);
      } else {
        setScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [targetScore]);

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5 select-none animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm shadow-slate-900/10">
          <Sparkles size={18} className="text-emerald-400 fill-emerald-400/20" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl text-slate-900 font-bold tracking-tight">ResumeAI Report</h2>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Analysis Active
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">{candidateName} | {jobTitle}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className={`border rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-bold transition-colors duration-300 ${scoreColors.pill}`}>
          <span className={`w-2 h-2 rounded-full animate-pulse ${scoreColors.dot}`} />
          {score} Match Score
        </div>
        <button
          onClick={onReset}
          className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <Plus size={13} />
          New Analysis
        </button>
      </div>
    </div>
  );
}
