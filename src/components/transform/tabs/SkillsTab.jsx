import React from 'react';
import { Target, Check, AlertTriangle } from 'lucide-react';

export default function SkillsTab({ jobTitle, currentScore, technicalSkills, skillsIntell }) {
  // Calculate dynamic bar chart heights based on actual counts
  const maxCount = Math.max(
    skillsIntell.technical_count, 
    skillsIntell.soft_count, 
    skillsIntell.certs_count, 
    skillsIntell.missing_count, 
    1
  );
  
  const getBarHeight = (count) => {
    return `${Math.max(15, Math.min(100, (count / maxCount) * 100))}%`;
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6 font-sans">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider select-none">
          <Target size={14} className="text-emerald-500" />
          Role Match
        </div>
        <h3 className="font-serif text-2xl text-slate-955 font-bold tracking-tight mt-1">{jobTitle}</h3>
        <p className="text-xs text-slate-500 mt-1 font-medium">Core match analysis comparing your resume credentials against target-role requirements.</p>
      </div>

      {/* Score & Skills Chips Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: Score Card */}
        <div className="border border-slate-200/80 bg-white rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex flex-col gap-1.5 select-none">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Match Score</span>
            <span className="font-serif text-5xl font-black text-emerald-600 leading-none">{currentScore}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden my-4 select-none">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${currentScore}%` }} />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Strong candidate with relevant technical skills and experience, but could benefit from more emphasis on {skillsIntell.skills_to_add.join(' and ') || 'scalability and cloud computing'}.
          </p>
        </div>

        {/* Right: Matched/Missing Badges */}
        <div className="flex flex-col gap-4">
          <div className="border border-slate-200/80 bg-slate-50/40 rounded-xl p-4 flex flex-col gap-2.5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1 select-none">
              <Check size={11} className="stroke-[3]" />
              Matched Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {technicalSkills.slice(0, 8).map((skill, idx) => (
                <span key={idx} className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded px-2.5 py-0.5 text-[10px] font-bold">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-slate-200/80 bg-slate-50/40 rounded-xl p-4 flex flex-col gap-2.5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-750 flex items-center gap-1.5 select-none">
              <AlertTriangle size={11} />
              Skills To Add
            </span>
            <div className="flex flex-wrap gap-1.5">
              {skillsIntell.skills_to_add.map((skill, idx) => (
                <span key={idx} className="bg-amber-50 text-amber-700 border border-amber-100 rounded px-2.5 py-0.5 text-[10px] font-bold">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS Bar Chart for "Skills Intelligence" */}
      <div className="border border-slate-200/80 bg-slate-50/30 rounded-xl p-5 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Skills Intelligence</span>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5">Skill coverage by category</h4>
          </div>
          {/* Summary Badges */}
          <div className="flex items-center gap-1.5 select-none">
            {[
              { label: 'Technical', val: skillsIntell.technical_count },
              { label: 'Soft', val: skillsIntell.soft_count },
              { label: 'Certs', val: skillsIntell.certs_count },
              { label: 'Missing', val: skillsIntell.missing_count }
            ].map((badge, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded px-2.5 py-1 flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
                <span className="font-extrabold text-slate-955">{badge.val}</span>
                <span className="text-slate-400 font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-slate-500 font-medium leading-relaxed -mt-1 select-none">
          The skill map separates proven capabilities from missing keywords that could strengthen role alignment.
        </p>

        {/* Chart Visualizer */}
        <div className="h-44 border-b border-slate-200 relative flex items-end justify-around pb-1 pt-6 mt-2 bg-[linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:100%_2rem] select-none">
          {/* Technical */}
          <div className="flex flex-col items-center gap-2 w-16 group">
            <span className="text-[10px] font-black text-slate-900 group-hover:scale-110 transition-transform">{skillsIntell.technical_count}</span>
            <div 
              className="w-8 bg-emerald-400 hover:bg-emerald-500 rounded-t-md transition-all duration-500 shadow-sm" 
              style={{ height: getBarHeight(skillsIntell.technical_count) }} 
            />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Technical</span>
          </div>

          {/* Soft */}
          <div className="flex flex-col items-center gap-2 w-16 group">
            <span className="text-[10px] font-black text-slate-900 group-hover:scale-110 transition-transform">{skillsIntell.soft_count}</span>
            <div 
              className="w-8 bg-blue-400 hover:bg-blue-500 rounded-t-md transition-all duration-500 shadow-sm" 
              style={{ height: getBarHeight(skillsIntell.soft_count) }} 
            />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Soft</span>
          </div>

          {/* Certs */}
          <div className="flex flex-col items-center gap-2 w-16 group">
            <span className="text-[10px] font-black text-slate-900 group-hover:scale-110 transition-transform">{skillsIntell.certs_count}</span>
            <div 
              className="w-8 bg-amber-400 hover:bg-amber-500 rounded-t-md transition-all duration-500 shadow-sm" 
              style={{ height: getBarHeight(skillsIntell.certs_count) }} 
            />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Certs</span>
          </div>

          {/* Missing */}
          <div className="flex flex-col items-center gap-2 w-16 group">
            <span className="text-[10px] font-black text-slate-900 group-hover:scale-110 transition-transform text-rose-600">{skillsIntell.missing_count}</span>
            <div 
              className="w-8 bg-rose-400 hover:bg-rose-500 rounded-t-md transition-all duration-500 shadow-sm" 
              style={{ height: getBarHeight(skillsIntell.missing_count) }} 
            />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Missing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
