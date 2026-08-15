import ResumePreview from './ResumePreview';

export default function ResumeCompare({ originalText, transformedData }) {
 return (
 <div className="flex flex-col lg:flex-row gap-8 items-stretch animate-fade-in text-left select-none">
 {/* Original Panel */}
 <div className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-6 flex flex-col min-w-0 shadow-sm">
 <div className="flex items-center justify-between mb-4 border-b border-[var(--border-subtle)] pb-3 shrink-0">
 <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">Original Resume</h4>
 <span className="px-2.5 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--danger-fg)] bg-[var(--danger-subtle)] border border-[var(--danger)] rounded">
 Original Text
 </span>
 </div>
 <div className="flex-1 min-h-[350px] lg:max-h-[600px] overflow-y-auto whitespace-pre-wrap font-mono text-[11px] text-[var(--text-secondary)] bg-[var(--bg-subtle)] p-5 rounded-md border border-[var(--border-default)] leading-relaxed select-text">
 {originalText || 'No original text available.'}
 </div>
 </div>

 {/* Transformed Panel */}
 <div className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-6 flex flex-col min-w-0 shadow-sm">
 <div className="flex items-center justify-between mb-4 border-b border-[var(--border-subtle)] pb-3 shrink-0">
 <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">Tailored CV</h4>
 <span className="px-2.5 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--success-fg)] bg-[var(--success-subtle)] border border-[var(--success)] rounded">
 Tailored Result
 </span>
 </div>
 <div className="flex-1 lg:max-h-[600px] overflow-y-auto bg-[var(--bg-subtle)]/20 p-2.5 rounded-md border border-[var(--border-default)]">
 <ResumePreview data={transformedData} />
 </div>
 </div>
 </div>
 );
}

