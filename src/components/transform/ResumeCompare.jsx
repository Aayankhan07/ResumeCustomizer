import ResumePreview from './ResumePreview';

export default function ResumeCompare({ originalText, transformedData }) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 items-stretch animate-fade-in text-left select-none">
      {/* Original Panel */}
      <div className="flex-1 bg-white border border-slate-200 rounded-lg p-6 flex flex-col min-w-0 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 shrink-0">
          <h4 className="font-serif text-lg font-bold text-slate-900">Original Resume</h4>
          <span className="px-2.5 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 rounded">
            Original Text
          </span>
        </div>
        <div className="flex-1 min-h-[350px] lg:max-h-[600px] overflow-y-auto whitespace-pre-wrap font-mono text-[11px] text-slate-500 bg-slate-50/50 p-5 rounded-md border border-slate-200 leading-relaxed select-text">
          {originalText || 'No original text available.'}
        </div>
      </div>

      {/* Transformed Panel */}
      <div className="flex-1 bg-white border border-slate-200 rounded-lg p-6 flex flex-col min-w-0 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 shrink-0">
          <h4 className="font-serif text-lg font-bold text-slate-900">Tailored CV</h4>
          <span className="px-2.5 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded">
            Tailored Result
          </span>
        </div>
        <div className="flex-1 lg:max-h-[600px] overflow-y-auto bg-slate-50/20 p-2.5 rounded-md border border-slate-200">
          <ResumePreview data={transformedData} />
        </div>
      </div>
    </div>
  );
}

