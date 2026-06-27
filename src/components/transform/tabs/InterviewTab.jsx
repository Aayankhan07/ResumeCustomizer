import React, { useState } from 'react';
import { Target, UserCheck, AlertTriangle, ChevronDown, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { trackEvent } from '../../../utils/analytics';


export default function InterviewTab({ interviewPrep, jobTitle }) {
  const [activeSubTab, setActiveSubTab] = useState('technical'); // 'technical' | 'behavioral' | 'curveball'
  const [expandedIdx, setExpandedIdx] = useState(null);

  const prep = interviewPrep || { technical: [], behavioral: [], curveball: [] };

  // Helper for difficulty badge
  const getDifficultyBadge = (difficulty) => {
    const diff = String(difficulty).toUpperCase();
    if (diff === 'HARD') {
      return 'bg-[var(--danger-subtle)] text-[var(--danger-fg)] border border-[var(--danger-fg)]/10';
    }
    if (diff === 'MEDIUM' || diff === 'MODERATE') {
      return 'bg-[var(--warning-subtle)] text-[var(--warning-fg)] border border-[var(--warning-fg)]/10';
    }
    return 'bg-[var(--success-subtle)] text-[var(--success-fg)] border border-[var(--success-fg)]/10';
  };

  // Copy all questions to clipboard as requested
  const handleCopyAll = async () => {
    let text = '';
    
    if (prep.technical?.length > 0) {
      text += 'TECHNICAL:\n';
      prep.technical.forEach((q, i) => {
        text += `${i + 1}. ${q.question} (${String(q.difficulty).toUpperCase()})\n`;
      });
      text += '\n';
    }

    if (prep.behavioral?.length > 0) {
      text += 'BEHAVIORAL:\n';
      prep.behavioral.forEach((q, i) => {
        text += `${i + 1}. ${q.question} (${String(q.difficulty).toUpperCase()})\n`;
      });
      text += '\n';
    }

    if (prep.curveball?.length > 0) {
      text += 'CURVEBALL:\n';
      prep.curveball.forEach((q, i) => {
        text += `${i + 1}. ${q.question} (${String(q.difficulty).toUpperCase()})\n`;
      });
    }

    try {
      await navigator.clipboard.writeText(text.trim());
      trackEvent('interview_copied');
      toast.success('Questions copied');
    } catch (err) {
      toast.error('Failed to copy questions.');
    }
  };

  const toggleAccordion = (idx) => {
    setExpandedIdx(expandedIdx === idx ? null : idx);
  };

  const currentQuestions = prep[activeSubTab] || [];

  return (
    <div className="animate-fade-in flex flex-col gap-6 font-sans text-left text-[var(--text-primary)] bg-transparent">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Practice Interview Questions</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-normal">Practice questions tailored specifically to your resume and target role.</p>
        </div>
        
        {/* Copy All Questions */}
        <button
          onClick={handleCopyAll}
          className="btn-default py-1.5 px-3 text-xs font-medium rounded-[var(--radius-sm)] flex items-center gap-1.5 shrink-0"
        >
          <Copy size={13} />
          Copy All Questions
        </button>
      </div>

      {/* Category Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-[var(--border-default)] pb-3 select-none">
        {[
          { id: 'technical', label: 'Technical', count: prep.technical?.length || 0, icon: Target },
          { id: 'behavioral', label: 'Behavioral', count: prep.behavioral?.length || 0, icon: UserCheck },
          { id: 'curveball', label: 'Curveball', count: prep.curveball?.length || 0, icon: AlertTriangle }
        ].map((subTab) => {
          const isActive = activeSubTab === subTab.id;
          return (
            <button
              key={subTab.id}
              onClick={() => {
                setActiveSubTab(subTab.id);
                setExpandedIdx(null);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive 
                  ? 'bg-[var(--text-primary)] text-[var(--bg-base)]' 
                  : 'bg-transparent border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <subTab.icon size={13} />
              {subTab.label}
              <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                isActive ? 'bg-[var(--bg-base)] text-[var(--text-primary)]' : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
              }`}>{subTab.count}</span>
            </button>
          );
        })}
      </div>

      {/* Questions List */}
      {currentQuestions.length === 0 ? (
        <div className="border border-[var(--border-default)] rounded-[var(--radius-lg)] p-8 text-center bg-[var(--bg-elevated)]">
          <p className="text-sm text-[var(--text-muted)] italic font-normal">No interview questions generated. Try adding more detail to the job description.</p>
        </div>
      ) : (
        <div className="flex flex-col border border-[var(--border-default)] rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] divide-y divide-[var(--border-default)] overflow-hidden shadow-[var(--shadow-sm)]">
          {currentQuestions.map((qItem, idx) => {
            const isExpanded = expandedIdx === idx;
            return (
              <div key={idx} className="flex flex-col">
                {/* Header (Trigger) */}
                <button
                  onClick={() => toggleAccordion(idx)}
                  aria-expanded={isExpanded}
                  aria-controls={`faq-body-${idx}`}
                  className="w-full flex items-center justify-between p-4 text-left gap-4 cursor-pointer focus:outline-none hover:bg-[var(--bg-subtle)] transition-colors duration-150"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5.5 h-5.5 rounded bg-[var(--text-primary)] text-[var(--bg-base)] flex items-center justify-center text-[10px] font-bold shrink-0 select-none">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
                      {qItem.question}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0 select-none">
                    <span className={`rounded-[var(--radius-xs)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider border ${getDifficultyBadge(qItem.difficulty)}`}>
                      {qItem.difficulty}
                    </span>
                    <ChevronDown size={14} className={`text-[var(--text-muted)] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Collapsible Body */}
                <div
                  id={`faq-body-${idx}`}
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-96 border-t border-[var(--border-subtle)]' : 'max-h-0'
                  }`}
                >
                  <div className="p-4 bg-[var(--bg-subtle)] flex flex-col gap-2 text-xs">
                    <span className="font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                      WHAT THE INTERVIEWER EXPECTS:
                    </span>
                    <p className="text-[var(--text-secondary)] leading-relaxed font-normal text-xs">
                      {qItem.expectation}
                    </p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
