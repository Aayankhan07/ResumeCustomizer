import { useEffect, useState } from 'react';

const MESSAGES = [
  'Parsing document structure...',
  'Extracting technical skill set...',
  'Analyzing applicant profile relevance...',
  'Aligning bullets with job criteria...',
  'Injecting target keywords...',
  'Structuring layout for ATS compliance...',
  'Refining summary narrative...',
  'Polishing draft representation...',
  'Almost ready...',
];

export default function TransformLoading() {
  const [messageIdx, setMessageIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  // Cycle messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx((prev) => {
        if (prev < MESSAGES.length - 1) return prev + 1;
        return prev;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Animate progress bar to 90% over 20s
  useEffect(() => {
    const totalDuration = 18000; // 18s
    const steps = 100;
    const intervalTime = totalDuration / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto select-none animate-fade-in">
      {/* Minimalist Circular Spinner */}
      <div className="relative w-16 h-16 mb-8 flex items-center justify-center shrink-0">
        <div className="w-12 h-12 border-2 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
      </div>
      
      <span className="inline-flex items-center px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 rounded-md mb-4">
        ATS Optimizer Active
      </span>

      <h3 className="font-serif text-xl text-slate-900 font-bold mb-1.5">Tailoring Resume</h3>
      <p className="text-xs text-slate-500 h-5 mb-8 font-medium">
        {MESSAGES[messageIdx]}
      </p>

      {/* Progress Bar Container */}
      <div className="w-full h-1.5 bg-slate-100 border border-slate-200 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-slate-900 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-[10px] font-mono font-bold text-slate-400">{progress}% Processed</span>
    </div>
  );
}
