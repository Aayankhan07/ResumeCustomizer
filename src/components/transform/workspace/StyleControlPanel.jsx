'use client';

import { Sparkles } from 'lucide-react';
import { TEMPLATES } from '../../../lib/templates';

export default function StyleControlPanel({
 selectedTemplate,
 setSelectedTemplate,
 pageBudget,
 setPageBudget
}) {
 // Sourced from lib/templates.ts so this list cannot drift from what the
 // PDF generator actually implements.
 const templates = TEMPLATES;

 return (
 <div className="settings-panel bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm animate-fade-in">
 <div className="flex flex-col gap-4 flex-1">
 <div>
 <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-2">
 Select Design Template
 </label>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
 {templates.map(tpl => (
 <button
 key={tpl.id}
 onClick={() => setSelectedTemplate(tpl.id)}
 className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
 selectedTemplate === tpl.id
 ? 'border-[var(--accent)] bg-[var(--bg-elevated)] shadow-sm ring-1 ring-[var(--accent)]/20'
 : 'border-[var(--border-default)] hover:border-[var(--border-strong)] bg-[var(--bg-elevated)]'
 }`}
 >
 <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1">
 {tpl.label}
 {selectedTemplate === tpl.id && (
 <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
 )}
 </span>
 <span className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">{tpl.description}</span>
 </button>
 ))}
 </div>
 </div>
 </div>

 <div className="flex flex-col gap-2 shrink-0 md:border-l md:border-[var(--border-default)] md:pl-6">
 <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-1">
 Page Budgeting
 </label>
 <div className="flex items-center bg-[var(--bg-muted)] p-0.5 rounded-lg border border-[var(--border-default)] w-full sm:w-auto">
 <button
 type="button"
 onClick={() => setPageBudget('standard')}
 className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
 pageBudget === 'standard'
 ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm'
 : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
 }`}
 >
 Standard Spacing
 </button>
 <button
 type="button"
 onClick={() => setPageBudget('fit')}
 className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
 pageBudget === 'fit'
 ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm'
 : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
 }`}
 >
 <Sparkles size={11} className="text-[var(--accent)]" />
 Auto-Fit (1 Page)
 </button>
 </div>
 <span className="text-[11px] text-[var(--text-secondary)] font-medium text-center md:text-left mt-1">
 {pageBudget === 'fit' ? 'Font sizes & margins compressed to fit 1 page' : 'Generous spacing for multi-page layouts'}
 </span>
 </div>
 </div>
 );
}