import { useEffect, useState } from 'react';
import { Check, Loader2, Circle } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Resume parsed successfully', delay: 0 },
  { id: 2, label: 'Job description processed', delay: 1000 },
  { id: 3, label: 'Rewriting experience bullets', delay: 4000 },
  { id: 4, label: 'Scoring keyword alignment', delay: 10000 },
  { id: 5, label: 'Generating cover letter', delay: 16000 },
];

export default function StepProgress({ jobDescriptionText, apiStatus }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Fallback to extract a potential job title from the first line of the job description
  const getRoleTitle = () => {
    if (!jobDescriptionText) return 'your target role';
    const firstLine = jobDescriptionText.trim().split('\n')[0].trim();
    if (firstLine.length > 4 && firstLine.length < 60 && !firstLine.includes('http')) {
      return firstLine;
    }
    return 'your target role';
  };

  useEffect(() => {
    if (apiStatus === 'success') {
      setCompletedSteps([1, 2, 3, 4, 5]);
      setCurrentStep(6);
      return;
    }

    if (apiStatus === 'error') {
      return;
    }

    // Timed progression
    const timers = STEPS.map((step) => {
      return setTimeout(() => {
        setCurrentStep(step.id);
        setCompletedSteps((prev) => {
          const prevCompleted = Array.from({ length: step.id - 1 }, (_, i) => i + 1);
          return [...new Set([...prev, ...prevCompleted])];
        });
      }, step.delay);
    });

    return () => timers.forEach(clearTimeout);
  }, [apiStatus]);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto select-none animate-fade-in font-sans">
      <h3 className="font-serif text-xl text-slate-900 dark:text-white font-bold mb-6 leading-snug">
        Analyzing your resume for {getRoleTitle()}...
      </h3>

      <div className="flex flex-col gap-3.5 w-full text-left max-w-xs mx-auto mb-8" aria-live="polite">
        {STEPS.map((step, idx) => {
          const isDone = completedSteps.includes(step.id);
          const isActive = currentStep === step.id;
          
          let icon = <Circle size={14} className="text-slate-355 dark:text-slate-600" />;
          let labelClass = 'text-slate-400 dark:text-slate-500 font-normal';
          
          if (isDone) {
            icon = <Check size={14} className="text-emerald-600 dark:text-emerald-450 stroke-[3]" />;
            labelClass = 'text-slate-500 dark:text-slate-400 font-normal';
          } else if (isActive) {
            icon = <Loader2 size={14} className="text-slate-900 dark:text-indigo-400 animate-spin" />;
            labelClass = 'text-slate-900 dark:text-white font-medium';
          }

          return (
            <div 
              key={step.id} 
              className="flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className="shrink-0">{icon}</div>
              <span className={`text-sm tracking-tight ${labelClass}`}>{step.label}</span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
        This typically takes 15–25 seconds.
      </p>
    </div>
  );
}
