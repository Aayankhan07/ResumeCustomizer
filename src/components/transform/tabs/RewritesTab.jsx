import React, { useState } from 'react';
import { Diff, ArrowRight } from 'lucide-react';
import { diffWords } from 'diff';

function DiffView({ before, after }) {
  const changes = diffWords(before || '', after || '');
  
  return (
    <span>
      {changes.map((part, i) => {
        if (part.added) {
          return (
            <mark key={i} className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded px-0.5 font-bold">
              {part.value}
            </mark>
          );
        }
        if (part.removed) {
          return (
            <del key={i} className="bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-350 line-through rounded px-0.5 opacity-70">
              {part.value}
            </del>
          );
        }
        return <span key={i}>{part.value}</span>;
      })}
    </span>
  );
}

export default function RewritesTab({ rewritesList, originalText, setActiveTab }) {
  const [highlightChanges, setHighlightChanges] = useState(true);

  return (
    <div className="animate-fade-in flex flex-col gap-6 font-sans">
      
      {/* Header with Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider select-none">
            <Diff size={14} className="text-emerald-500" />
            AI Rewrites
          </div>
          <h3 className="font-serif text-2xl text-slate-900 dark:text-white font-bold tracking-tight mt-1">Before and after improvements</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Stronger language, clearer evidence, and better keyword alignment.</p>
        </div>

        {/* Premium Switch Control */}
        <div className="flex items-center gap-2.5 select-none self-start sm:self-center">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Highlight Changes</span>
          <button
            onClick={() => setHighlightChanges(!highlightChanges)}
            className={`w-9 h-5.5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 focus:outline-none ${
              highlightChanges ? 'bg-emerald-500' : 'bg-slate-350 dark:bg-slate-700'
            }`}
            title="Toggle word diff highlights"
          >
            <div
              className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transform transition-transform duration-200 ${
                highlightChanges ? 'translate-x-3.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Rewrite Sections */}
      <div className="flex flex-col gap-5">
        {rewritesList.map((rewrite, idx) => (
          <div key={idx} className="border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 bg-white dark:bg-slate-900/10 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center select-none">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">{rewrite.section}</h4>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-305 text-[9px] font-bold uppercase rounded px-2 py-0.5">Rewrite {idx + 1}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_24px_1fr] gap-4 items-center">
              {/* Before */}
              <div className="border border-rose-200/80 dark:border-rose-900/30 bg-rose-50/20 rounded-xl p-4 min-h-[100px] flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400 flex items-center gap-1 select-none">✕ Before</span>
                <p className="text-xs text-rose-900/85 dark:text-rose-300 leading-relaxed font-medium">
                  {rewrite.before}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex justify-center text-slate-350 select-none">
                <ArrowRight size={18} className="rotate-90 lg:rotate-0" />
              </div>

              {/* After */}
              <div className="border border-emerald-200/80 dark:border-emerald-900/30 bg-emerald-50/20 rounded-xl p-4 min-h-[100px] flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-1 select-none">
                  {highlightChanges ? '✓ After (Changes Highlighted)' : '✓ After'}
                </span>
                <p className="text-xs text-emerald-900/85 dark:text-emerald-350 leading-relaxed font-medium">
                  {highlightChanges ? (
                    <DiffView before={rewrite.before} after={rewrite.after} />
                  ) : (
                    <span dangerouslySetInnerHTML={{ __html: rewrite.after }} />
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {originalText && (
        <div className="mt-2 text-center select-none">
          <button 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-300 hover:underline cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('compare');
            }}
          >
            View Original vs. Optimized Side-by-Side Comparison
            <ArrowRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
