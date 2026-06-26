import React from 'react';
import { Diff, ArrowRight } from 'lucide-react';

export default function RewritesTab({ rewritesList, originalText, setActiveTab }) {
  return (
    <div className="animate-fade-in flex flex-col gap-6 font-sans">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider select-none">
          <Diff size={14} className="text-emerald-500" />
          AI Rewrites
        </div>
        <h3 className="font-serif text-2xl text-slate-955 font-bold tracking-tight mt-1">Before and after improvements</h3>
        <p className="text-xs text-slate-500 mt-1 font-medium">Stronger language, clearer evidence, and better keyword alignment.</p>
      </div>

      {/* Rewrite Sections */}
      <div className="flex flex-col gap-5">
        {rewritesList.map((rewrite, idx) => (
          <div key={idx} className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center select-none">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">{rewrite.section}</h4>
              <span className="bg-slate-100 text-slate-700 text-[9px] font-bold uppercase rounded px-2 py-0.5">Rewrite {idx + 1}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_24px_1fr] gap-4 items-center">
              {/* Before */}
              <div className="border border-rose-200/80 bg-rose-50/20 rounded-xl p-4 min-h-[100px] flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase text-rose-700 flex items-center gap-1 select-none">✕ Before</span>
                <p className="text-xs text-rose-900/85 leading-relaxed font-medium">
                  {rewrite.before}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex justify-center text-slate-350 select-none">
                <ArrowRight size={18} className="rotate-90 lg:rotate-0" />
              </div>

              {/* After */}
              <div className="border border-emerald-200/80 bg-emerald-50/20 rounded-xl p-4 min-h-[100px] flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase text-emerald-700 flex items-center gap-1 select-none">✓ After</span>
                <p className="text-xs text-emerald-900/85 leading-relaxed font-medium">
                  {/* Dangerously set inner HTML if we want formatting, but standard rendering works fine if we just pass a react node.
                      Since we have HTML tags like <strong> in the text, we should parse or render them. 
                      Because they are standard strings returned by Deno or structured React text, using dangerouslySetInnerHTML 
                      ensures that <strong> tags rendered by the AI are styled beautifully! Let's do that! */}
                  <span dangerouslySetInnerHTML={{ __html: rewrite.after }} />
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {originalText && (
        <div className="mt-2 text-center select-none">
          <button 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:underline cursor-pointer"
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
