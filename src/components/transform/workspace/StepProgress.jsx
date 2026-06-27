import { useEffect, useState } from 'react';
import { Check, Loader2, Circle } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Resume parsed', delay: 0 },
  { id: 2, label: 'Job description read', delay: 1000 },
  { id: 3, label: 'Rewriting content', delay: 4000 },
  { id: 4, label: 'Scoring alignment', delay: 10000 },
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
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto select-none animate-fade-in font-sans">
      <h3 className="text-base font-medium text-[var(--text-primary)] mb-8 text-center leading-snug">
        Analyzing your resume for {getRoleTitle()}...
      </h3>

      <div className="flex flex-col gap-3 w-[280px] text-left mx-auto mb-6" aria-live="polite">
        {STEPS.map((step, idx) => {
          const isDone = completedSteps.includes(step.id);
          const isActive = currentStep === step.id;
          
          let icon = <Circle size={14} className="text-[var(--text-disabled)]" />;
          let labelClass = 'text-[var(--text-muted)] font-normal';
          
          if (isDone) {
            icon = <Check size={14} className="text-[var(--success)] stroke-[3]" />;
            labelClass = 'text-[var(--text-secondary)] font-normal';
          } else if (isActive) {
            icon = <Loader2 size={14} className="text-[var(--accent)] animate-spin" />;
            labelClass = 'text-[var(--text-primary)] font-medium';
          }

          return (
            <div 
              key={step.id} 
              className="flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="w-5 h-5 shrink-0 flex items-center justify-center">{icon}</div>
              <span className={`text-sm tracking-tight ${labelClass}`}>{step.label}</span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[var(--text-muted)] mt-6">
        Takes about 15–25 seconds.
      </p>
    </div>
  );
}
