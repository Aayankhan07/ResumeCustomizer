import React from 'react';
import { Mic, Target, UserCheck, AlertTriangle, ChevronUp, ChevronDown, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function InterviewTab({ 
  interviewPrep, 
  interviewSubTab, 
  setInterviewSubTab, 
  expandedExpectation, 
  setExpandedExpectation,
  jobTitle
}) {

  // Copy all questions to clipboard in a clean formatted block
  const handleCopyAllQuestions = async () => {
    const formattedText = `MOCK INTERVIEW PREPARATION
Target Role: ${jobTitle}

--- TECHNICAL QUESTIONS ---
${interviewPrep.technical.map((q, i) => `${i+1}. ${q.question} (${q.difficulty})\nExpectation: ${q.expectation}`).join('\n\n')}

--- BEHAVIORAL QUESTIONS ---
${interviewPrep.behavioral.map((q, i) => `${i+1}. ${q.question} (${q.difficulty})\nExpectation: ${q.expectation}`).join('\n\n')}

--- CURVEBALL QUESTIONS ---
${interviewPrep.curveball.map((q, i) => `${i+1}. ${q.question} (${q.difficulty})\nExpectation: ${q.expectation}`).join('\n\n')}`;

    try {
      await navigator.clipboard.writeText(formattedText);
      toast.success('All interview questions copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy questions.');
    }
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider select-none">
            <Mic size={14} className="text-emerald-500" />
            Interview Prep
          </div>
          <h3 className="font-serif text-2xl text-slate-955 font-bold tracking-tight mt-1">Questions from resume evidence</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Practice prompts generated from the candidate's actual experience and skill profile.</p>
        </div>
        
        {/* Copy All Questions Button */}
        <button
          onClick={handleCopyAllQuestions}
          className="border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 select-none shadow-sm"
        >
          <Copy size={13} />
          Copy Questions
        </button>
      </div>

      {/* Sub Navigation (Technical, Behavioral, Curveball) */}
      <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3 select-none">
        {[
          { id: 'technical', label: 'Technical', count: interviewPrep.technical.length, icon: Target },
          { id: 'behavioral', label: 'Behavioral', count: interviewPrep.behavioral.length, icon: UserCheck },
          { id: 'curveball', label: 'Curveball', count: interviewPrep.curveball.length, icon: AlertTriangle }
        ].map((subTab) => {
          const isActive = interviewSubTab === subTab.id;
          return (
            <button
              key={subTab.id}
              onClick={() => {
                setInterviewSubTab(subTab.id);
                setExpandedExpectation(null);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-955'
              }`}
            >
              <subTab.icon size={13} />
              {subTab.label}
              <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-black ${
                isActive ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-850'
              }`}>{subTab.count}</span>
            </button>
          );
        })}
      </div>

      {/* Questions Grid based on active Sub-tab */}
      <div className="flex flex-col gap-4">
        {interviewPrep[interviewSubTab]?.map((qItem, idx) => {
          const uniqueId = `${interviewSubTab}-${idx}`;
          const isExpanded = expandedExpectation === uniqueId;
          return (
            <div key={idx} className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm flex flex-col gap-4 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center">
                  <span className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 select-none">{idx + 1}</span>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{qItem.question}</h4>
                </div>
                <span className={`rounded px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider shrink-0 select-none ${
                  qItem.difficulty === 'Hard'
                    ? 'bg-rose-50 border border-rose-200 text-rose-700'
                    : 'bg-amber-50 border border-amber-200 text-amber-750'
                }`}>{qItem.difficulty}</span>
              </div>
              
              <div className="border-t border-slate-100 pt-3">
                <button
                  onClick={() => setExpandedExpectation(isExpanded ? null : uniqueId)}
                  className="flex items-center gap-1 text-slate-505 hover:text-slate-950 text-xs font-bold cursor-pointer select-none"
                >
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  Interviewer Expectation
                </button>
                {isExpanded && (
                  <div className="mt-2.5 bg-slate-50 border border-slate-200/60 rounded-lg p-4 text-xs flex flex-col gap-2 animate-fade-in">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] select-none">What they want to hear:</span>
                    <p className="text-slate-650 leading-relaxed font-medium">
                      {qItem.expectation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
