import React from 'react';
import { Milestone } from 'lucide-react';

export default function RoadmapTab({ roadmapData, completedTasks, toggleTask, currentScore }) {
  // Calculate gains and progress dynamically based on completed tasks
  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = roadmapData.tasks.length > 0 
    ? Math.floor((completedCount / roadmapData.tasks.length) * 100)
    : 0;

  const currentGain = Object.entries(completedTasks).reduce((acc, [key, completed]) => {
    if (!completed) return acc;
    const taskObj = roadmapData.tasks[key];
    return acc + (taskObj?.points ?? 0);
  }, 0);

  const activeScore = currentScore + currentGain;

  // Determine current timeline level dynamically
  // If no tasks are done, use the starting level.
  // If 1 task is done, advance to at least Competitive.
  // If all tasks are done, advance to Top Tier.
  let dynamicLevel = roadmapData.current_level;
  if (completedCount === roadmapData.tasks.length && roadmapData.tasks.length > 0) {
    dynamicLevel = 'Top Tier';
  } else if (completedCount > 0) {
    dynamicLevel = 'Competitive';
  }

  const getLevelProgress = (level) => {
    switch (level) {
      case 'Beginner': return '10%';
      case 'Developing': return '40%';
      case 'Competitive': return '70%';
      case 'Top Tier': return '100%';
      default: return '40%';
    }
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6 font-sans">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Milestone size={14} className="text-emerald-505" />
          Resume Roadmap
        </div>
        <h3 className="font-serif text-2xl text-slate-955 font-bold tracking-tight mt-1">Path to Top Tier</h3>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          To reach the Top Tier level, the candidate should focus on developing a personal project showcasing expertise in scalability and cloud computing, pursuing additional certifications in AI/ML, and networking with professionals in the field.
        </p>
      </div>

      {/* Horizontal Progress Timeline */}
      <div className="border border-slate-200/85 bg-slate-50/50 rounded-xl p-6 flex flex-col gap-6 shadow-sm">
        {/* Step Indicators */}
        <div className="flex justify-between items-center relative px-2 select-none">
          {/* Line Rail */}
          <div className="absolute left-6 right-6 top-4 h-1 bg-slate-200 rounded-full z-0">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out" 
              style={{ width: getLevelProgress(dynamicLevel) }} 
            />
          </div>
          
          {/* Steps */}
          {[
            { label: 'Beginner', val: 'Beginner' },
            { label: 'Developing', val: 'Developing' },
            { label: 'Competitive', val: 'Competitive' },
            { label: 'Top Tier', val: 'Top Tier' }
          ].map((step, idx) => {
            const levels = ['Beginner', 'Developing', 'Competitive', 'Top Tier'];
            const currentIdx = levels.indexOf(dynamicLevel);
            const stepIdx = levels.indexOf(step.val);
            
            const isChecked = stepIdx < currentIdx;
            const isActive = stepIdx === currentIdx;
            
            return (
              <div key={idx} className="flex flex-col items-center gap-2 relative z-10">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isChecked 
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
                    : isActive
                    ? 'bg-white border-emerald-500 text-emerald-600 shadow-sm ring-4 ring-emerald-55'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}>
                  {isChecked ? '✓' : isActive ? '◎' : '●'}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-slate-500'
                }`}>{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* High-level scores */}
        <div className="grid grid-cols-3 gap-3 border-t border-slate-200/60 pt-4 mt-2">
          <div className="text-center flex flex-col">
            <span className="text-2xl font-black text-slate-900 tracking-tight transition-all">{activeScore}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Current Score</span>
          </div>
          <div className="text-center flex flex-col border-x border-slate-200/60">
            <span className="text-2xl font-black text-emerald-650 tracking-tight">+{currentGain}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Tracked Gain</span>
          </div>
          <div className="text-center flex flex-col">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{completedCount}/{roadmapData.tasks.length}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Tasks Done</span>
          </div>
        </div>
      </div>

      {/* Checklist Tasks */}
      <div className="flex flex-col gap-3">
        {roadmapData.tasks.map((taskItem, idx) => {
          const isCompleted = !!completedTasks[idx];
          return (
            <div 
              key={idx}
              className={`border rounded-xl p-4 flex items-center justify-between gap-4 transition-all duration-200 shadow-sm ${
                isCompleted ? 'bg-slate-50/70 border-slate-200' : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-4.5 flex-1">
                <div className="flex items-center h-5 mt-0.5">
                  <input 
                    type="checkbox" 
                    id={`task-${idx}`}
                    checked={isCompleted}
                    onChange={() => toggleTask(idx)}
                    className="w-4.5 h-4.5 rounded border-slate-350 text-slate-900 focus:ring-slate-900 cursor-pointer transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor={`task-${idx}`} className="text-xs font-bold text-slate-800 cursor-pointer leading-relaxed">
                    {taskItem.task}
                  </label>
                  <div className="flex flex-wrap gap-1.5 mt-1 select-none">
                    <span className="bg-slate-100 text-slate-600 rounded px-2 py-0.5 text-[9px] font-bold uppercase">{taskItem.type}</span>
                    <span className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
                      taskItem.impact === 'High Impact' 
                        ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                        : 'bg-amber-50 text-amber-750 border border-amber-100'
                    }`}>{taskItem.impact}</span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded px-2 py-0.5 text-[9px] font-bold uppercase">+{taskItem.points} pts</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-50/50 border border-slate-200/60 rounded-xl p-4 flex flex-col gap-2 shadow-inner">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">
          <span>Task Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500 ease-out" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-500 font-medium italic text-center mt-1 select-none">
          "With dedication and persistence, you can reach the Top Tier level and become a leading expert in the field of machine learning engineering."
        </p>
      </div>
    </div>
  );
}
