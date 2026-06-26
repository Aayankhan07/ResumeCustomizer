import { Sparkles } from 'lucide-react';

export default function StyleControlPanel({
  selectedTemplate,
  setSelectedTemplate,
  pageBudget,
  setPageBudget
}) {
  const templates = [
    { id: 'classic', label: 'Classic Serif', desc: 'Traditional & elegant' },
    { id: 'modern', label: 'Modern Minimalist', desc: 'Clean, left-aligned' },
    { id: 'tech', label: 'Clean Tech', desc: 'Mono, structured' },
    { id: 'executive', label: 'Executive Elegant', desc: 'Luxury serif, centered' }
  ];

  return (
    <div className="settings-panel bg-slate-50/50 border border-slate-200/80 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm animate-fade-in">
      <div className="flex flex-col gap-4 flex-1">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Select Design Template
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {templates.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                  selectedTemplate === tpl.id
                    ? 'border-slate-900 bg-white shadow-sm ring-1 ring-slate-900/5'
                    : 'border-slate-200 hover:border-slate-300 bg-white/50'
                }`}
              >
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  {tpl.label}
                  {selectedTemplate === tpl.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </span>
                <span className="text-[9px] text-slate-450 font-medium mt-0.5">{tpl.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 shrink-0 md:border-l md:border-slate-200 md:pl-6">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
          Page Budgeting
        </label>
        <div className="flex items-center bg-slate-200/60 p-0.5 rounded-lg border border-slate-300/40 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setPageBudget('standard')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              pageBudget === 'standard'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Standard Spacing
          </button>
          <button
            type="button"
            onClick={() => setPageBudget('fit')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              pageBudget === 'fit'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles size={11} className="text-emerald-500 fill-emerald-500/10" />
            Auto-Fit (1 Page)
          </button>
        </div>
        <span className="text-[9px] text-slate-400 font-medium text-center md:text-left mt-1">
          {pageBudget === 'fit' ? 'Font sizes & margins compressed to fit 1 page' : 'Generous spacing for multi-page layouts'}
        </span>
      </div>
    </div>
  );
}
