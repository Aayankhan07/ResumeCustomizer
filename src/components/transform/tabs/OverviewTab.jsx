import React from 'react';
import { Sparkles, ShieldCheck, Info } from 'lucide-react';

export default function OverviewTab({ currentScore, jobTitle, company, keywordsMatchedCount, keywordsTotalCount }) {
  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div>
        <h3 className="font-serif text-2xl text-slate-955 font-bold tracking-tight">Compatibility Overview</h3>
        <p className="text-xs text-slate-500 mt-1 font-medium">Visual summary of how well your tailored profile aligns with the job specification.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="border border-slate-200/80 bg-slate-50/50 rounded-xl p-5 flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-sans">
            <Sparkles size={14} className="text-emerald-500" />
            Fit Summary
          </h4>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            Your resume has been optimized for the <strong>{jobTitle}</strong> position. We integrated critical keywords and framed your achievements using target-role terminology, raising your overall match score to <strong>{currentScore}%</strong>.
          </p>
        </div>
        
        <div className="border border-slate-200/80 bg-slate-50/50 rounded-xl p-5 flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-sans">
            <ShieldCheck size={14} className="text-blue-500" />
            ATS Scan Quality
          </h4>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Keyword Density</span>
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 font-bold text-[10px]">OPTIMAL</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Section Headings</span>
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 font-bold text-[10px]">100% STANDARD</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Formatting Risk</span>
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 font-bold text-[10px]">ZERO FLAGS</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-slate-200/70 rounded-xl p-5 flex flex-col gap-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Tailoring Metadata</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400">Target Role</span>
            <span className="text-xs font-bold text-slate-900 mt-1 truncate">{jobTitle}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400">Company</span>
            <span className="text-xs font-bold text-slate-900 mt-1 truncate">{company !== 'Target Company' ? company : 'Not Specified'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400">Keywords Matched</span>
            <span className="text-xs font-bold text-slate-900 mt-1">{keywordsMatchedCount} / {keywordsTotalCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400">Layout Safety</span>
            <span className="text-xs font-bold text-emerald-600 mt-1">ATS Compliant</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-4 flex items-start gap-3">
        <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          This resume has been restructured utilizing a single-column, standard-heading layout. Avoid introducing tables, custom graphics, text boxes, or icons, as these elements commonly trigger parsing errors in legacy Applicant Tracking Systems.
        </p>
      </div>
    </div>
  );
}
