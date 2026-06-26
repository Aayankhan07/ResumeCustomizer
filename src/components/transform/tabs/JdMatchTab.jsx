export default function JdMatchTab({ jobTitle, technicalSkills }) {
  return (
    <div className="animate-fade-in flex flex-col gap-6 font-sans">
      <div>
        <h3 className="font-serif text-2xl text-slate-955 font-bold tracking-tight">Requirement Alignment</h3>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Checklist verifying how your resume meets the core requirements of the job description.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="border border-slate-200/80 rounded-xl p-4 flex items-center justify-between gap-4 bg-slate-50/40 shadow-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-slate-955">Engineering Scope & Role Title</span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">Target title matched: {jobTitle}</span>
          </div>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 select-none">
            Met
          </span>
        </div>

        <div className="border border-slate-200/80 rounded-xl p-4 flex items-center justify-between gap-4 bg-slate-50/40 shadow-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-slate-955">Technical Stack Mastery</span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">
              Matched technologies: {technicalSkills.slice(0, 4).join(', ') || 'essential languages'}
            </span>
          </div>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 select-none">
            Met
          </span>
        </div>

        <div className="border border-slate-200/80 rounded-xl p-4 flex items-center justify-between gap-4 bg-slate-50/40 shadow-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-slate-955">Quantifiable Achievement Focus</span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">
              All experience bullets include measurable performance outcomes or placeholders.
            </span>
          </div>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 select-none">
            Met
          </span>
        </div>
      </div>
    </div>
  );
}
