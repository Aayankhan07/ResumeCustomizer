import { AlertTriangle, ShieldCheck, Milestone } from 'lucide-react';

export default function AtsCheckTab({ 
  currentScore, 
  keywordsMatched = [], 
  missingKeywords = [], 
  screeningIssues, 
  nextMoves = [] 
}) {
  return (
    <div className="animate-fade-in flex flex-col gap-6 font-sans select-none">
      {/* ATS Score Panel */}
      <div className="border border-slate-200/80 bg-slate-50/20 rounded-xl p-5 shadow-sm text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <ShieldCheck size={12} className="text-emerald-500" />
              ATS Compatibility
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-slate-955 font-bold tracking-tight mt-1">
              Parsing and keyword readiness
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Keyword coverage and formatting issues that can affect automated screening.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center bg-slate-900 text-white rounded-xl px-6 py-3.5 border border-slate-800 shrink-0 min-w-[110px] shadow-sm">
            <span className="text-2xl font-bold text-emerald-400">{currentScore}%</span>
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 mt-0.5">ATS Score</span>
          </div>
        </div>

        {/* Score Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-6">
          <div 
            className="h-full bg-emerald-500 transition-all duration-1000 ease-out" 
            style={{ width: `${currentScore}%` }}
          />
        </div>
      </div>

      {/* Analysis Grid (Keywords Found, Missing Keywords, Screening Issues) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Keywords Found */}
        <div className="border border-slate-200/80 bg-slate-50/40 rounded-xl p-5 flex flex-col gap-3 shadow-sm text-left">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Keywords Found</h4>
          {keywordsMatched.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {keywordsMatched.slice(0, 15).map((kw) => (
                <span key={kw} className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50/80 text-emerald-700 border border-emerald-100/60 rounded">
                  {kw}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No keywords matched yet.</span>
          )}
        </div>

        {/* Missing Keywords */}
        <div className="border border-slate-200/80 bg-slate-50/40 rounded-xl p-5 flex flex-col gap-3 shadow-sm text-left">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Missing Keywords</h4>
          {missingKeywords.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {missingKeywords.map((kw) => (
                <span key={kw} className="px-2 py-0.5 text-[10px] font-bold bg-amber-50/80 text-amber-700 border border-amber-100/60 rounded">
                  {kw}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No missing keywords detected.</span>
          )}
        </div>

        {/* Screening Issues */}
        <div className="border border-slate-200/80 bg-slate-50/40 rounded-xl p-5 flex flex-col gap-3 shadow-sm text-left">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Screening Issues</h4>
          <div className="text-xs text-slate-650 leading-relaxed font-medium mt-1 flex items-start gap-1.5">
            <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <span>{screeningIssues || 'No format or content risks identified.'}</span>
          </div>
        </div>
      </div>

      {/* Action Plan / Next Moves */}
      <div className="border border-slate-200/80 bg-white rounded-xl p-5 sm:p-6 shadow-sm text-left">
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <Milestone size={12} className="text-emerald-500" />
            Action Plan
          </span>
          <h3 className="font-serif text-xl sm:text-2xl text-slate-955 font-bold tracking-tight mt-0.5">
            Next moves
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {nextMoves.length > 0 ? (
            nextMoves.slice(0, 6).map((item, idx) => (
              <div key={idx} className="flex gap-3.5 items-start border border-slate-200/60 bg-slate-50/30 rounded-xl p-4 shadow-sm">
                <div className="w-5.5 h-5.5 rounded bg-slate-900 text-white flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-[11px] text-slate-650 leading-relaxed font-medium">{item.task}</p>
              </div>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic col-span-2">No next steps defined.</span>
          )}
        </div>
      </div>
    </div>
  );
}
