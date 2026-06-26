import React from 'react';
import { UserCheck, Clock, Copy } from 'lucide-react';

export default function RecruiterTab({ jobTitle, recruiterScan, copiedPitch, handleCopyElevatorPitch }) {
  return (
    <div className="animate-fade-in flex flex-col gap-6 font-sans">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider select-none">
          <Clock size={14} className="text-emerald-505" />
          Recruiter Scan
        </div>
        <h3 className="font-serif text-2xl text-slate-955 font-bold tracking-tight mt-1">Six-second resume read</h3>
        <p className="text-xs text-slate-500 mt-1 font-medium">The first impression, the risk, and the single fix with the highest leverage.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Attention Timeline */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 select-none">
            <UserCheck size={14} className="text-slate-800" />
            Attention Timeline
          </h4>
          
          <div className="flex flex-col gap-3">
            {recruiterScan.attention_timeline.map((timelineStep, idx) => (
              <div key={idx} className="border border-slate-200/80 bg-white rounded-xl p-4 flex gap-3.5 items-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 select-none">
                  {idx + 1}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 select-none">
                    {idx === 0 ? 'First noticed' : idx === 1 ? 'Second noticed' : 'Third noticed'}
                  </span>
                  <span className="text-xs font-bold text-slate-850">{timelineStep.replace(/^(First noticed:|Second noticed:|Third noticed:)\s*/i, '')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Pile Categorization & Best Fix */}
        <div className="flex flex-col gap-3.5">
          {/* Strong Yes Card */}
          <div className="border border-emerald-200 bg-emerald-50/30 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between select-none">
              <span className="text-[10px] font-black uppercase text-emerald-700 flex items-center gap-1">
                ✓ Strong Yes
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Hiring pile</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {recruiterScan.strong_yes}
            </p>
          </div>

          {/* Completely Missed Card */}
          <div className="border border-rose-200 bg-rose-50/30 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
            <span className="text-[10px] font-black uppercase text-rose-700 flex items-center gap-1 select-none">
              ✕ Completely Missed
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {recruiterScan.completely_missed}
            </p>
          </div>

          {/* Best Fix Card */}
          <div className="border border-sky-200 bg-sky-50/25 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
            <span className="text-[10px] font-black uppercase text-sky-700 flex items-center gap-1 select-none">
              ✦ Best Fix
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {recruiterScan.best_fix}
            </p>
          </div>
        </div>
      </div>

      {/* Elevator Pitch */}
      <div className="border border-slate-200/80 rounded-xl p-5 flex flex-col gap-3 mt-2 shadow-sm bg-slate-50/40">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-505 flex items-center gap-1.5 select-none">
            Your 30-Second Elevator Pitch
          </h4>
          <button
            onClick={() => handleCopyElevatorPitch(recruiterScan.elevator_pitch)}
            className="text-xs text-slate-500 hover:text-slate-950 flex items-center gap-1 font-bold transition-all cursor-pointer select-none"
          >
            <Copy size={12} />
            {copiedPitch ? 'Copied' : 'Copy Pitch'}
          </button>
        </div>
        <p className="text-xs text-slate-750 leading-relaxed font-medium italic bg-white border border-slate-200/65 rounded-lg p-4 select-all">
          "{recruiterScan.elevator_pitch}"
        </p>
      </div>
    </div>
  );
}
