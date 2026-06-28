import React, { useState, useEffect } from 'react';
import { Target, UserCheck, AlertTriangle, ArrowLeft, ArrowRight, RotateCw, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function InterviewTab({ interviewPrep }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const prep = interviewPrep || { technical: [], behavioral: [], curveball: [] };

  // Combine and tag all questions into a single deck of 10
  const questions = [
    ...(prep.technical || []).map(q => ({ ...q, category: 'Technical' })),
    ...(prep.behavioral || []).map(q => ({ ...q, category: 'Behavioral' })),
    ...(prep.curveball || []).map(q => ({ ...q, category: 'Curveball' }))
  ];

  // Helper for difficulty badge styling
  const getDifficultyBadge = (difficulty) => {
    const diff = String(difficulty).toUpperCase();
    if (diff === 'HARD') {
      return 'bg-[var(--danger-subtle)] text-[var(--danger-fg)] border-[var(--danger-fg)]/10';
    }
    if (diff === 'MEDIUM' || diff === 'MODERATE') {
      return 'bg-[var(--warning-subtle)] text-[var(--warning-fg)] border-[var(--warning-fg)]/10';
    }
    return 'bg-[var(--success-subtle)] text-[var(--success-fg)] border-[var(--success-fg)]/10';
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIdx(prev => prev + 1);
      }, 150);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIdx(prev => prev - 1);
      }, 150);
    }
  };

  // Keyboard navigation for active study session
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input/textarea
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, questions.length]);

  // Copy all questions to clipboard
  const handleCopyAll = async () => {
    let text = '';
    questions.forEach((q, i) => {
      text += `Question ${i + 1} [${q.category} - ${q.difficulty}]:\nQ: ${q.question}\nA: ${q.expectation}\n\n`;
    });

    try {
      await navigator.clipboard.writeText(text.trim());
      toast.success('All questions and answers copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy questions.');
    }
  };

  if (questions.length === 0) {
    return (
      <div className="border border-[var(--border-default)] rounded-[var(--radius-lg)] p-8 text-center bg-[var(--bg-elevated)]">
        <p className="text-sm text-[var(--text-muted)] italic font-normal">No interview questions generated. Try adding more detail to the job description.</p>
      </div>
    );
  }

  const qItem = questions[currentIdx];

  return (
    <div className="animate-fade-in flex flex-col gap-6 font-sans text-left text-[var(--text-primary)] bg-transparent">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Practice Interview Flashcards</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-normal">Use arrow keys or click the card to flip and practice.</p>
        </div>
        
        <button
          onClick={handleCopyAll}
          className="btn-default py-1.5 px-3 text-xs font-medium rounded-[var(--radius-sm)] flex items-center gap-1.5 shrink-0"
        >
          <Copy size={13} />
          Copy All Q&As
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[var(--bg-subtle)] h-1.5 rounded-full overflow-hidden select-none">
        <div 
          className="bg-[var(--accent)] h-full transition-all duration-300 rounded-full"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* 3D Flipping Card Stage */}
      <div className="w-full max-w-xl h-80 mx-auto perspective-1000 relative select-none mt-4">
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          style={{
            transform: isFlipped ? 'rotateY(180deg)' : 'none',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          className="w-full h-full relative cursor-pointer"
        >
          {/* FRONT OF THE CARD (Question) */}
          <div 
            style={{ backfaceVisibility: 'hidden' }}
            className="absolute inset-0 w-full h-full p-8 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-[var(--shadow-md)] flex flex-col justify-between items-center text-center z-10"
          >
            {/* Top Bar */}
            <div className="w-full flex justify-between items-center text-xs text-[var(--text-muted)] font-medium">
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                {qItem.category === 'Technical' && <Target size={13} className="text-[var(--accent)]" />}
                {qItem.category === 'Behavioral' && <UserCheck size={13} className="text-emerald-600" />}
                {qItem.category === 'Curveball' && <AlertTriangle size={13} className="text-[var(--warning)]" />}
                {qItem.category}
              </span>
              <span className={`px-2 py-0.5 rounded-[var(--radius-xs)] text-[9px] font-bold uppercase tracking-wide border ${getDifficultyBadge(qItem.difficulty)}`}>
                {qItem.difficulty}
              </span>
            </div>

            {/* Question Text */}
            <div className="my-auto px-2">
              <h4 className="text-lg md:text-xl font-bold text-[var(--text-primary)] leading-relaxed font-serif">
                "{qItem.question}"
              </h4>
            </div>

            {/* Bottom Bar */}
            <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 hover:text-[var(--text-secondary)] transition-colors">
              <RotateCw size={12} />
              Click card or press Space to reveal answer
            </div>
          </div>

          {/* BACK OF THE CARD (Expectation / Answer) */}
          <div 
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
            className="absolute inset-0 w-full h-full p-8 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-[var(--shadow-md)] flex flex-col justify-between items-center text-center"
          >
            {/* Top Bar */}
            <div className="w-full flex justify-between items-center text-xs text-[var(--text-muted)] font-medium">
              <span className="uppercase tracking-wider">Suggested Response</span>
              <span className="text-[10px] font-semibold">Question {currentIdx + 1} of {questions.length}</span>
            </div>

            {/* Response Content */}
            <div className="my-auto overflow-y-auto max-h-44 px-2 w-full text-left">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-normal">
                {qItem.expectation}
              </p>
            </div>

            {/* Bottom Bar */}
            <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 hover:text-[var(--text-secondary)] transition-colors">
              <RotateCw size={12} />
              Click card or press Space to view question
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center max-w-xl w-full mx-auto mt-4 select-none">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="btn-ghost flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <ArrowLeft size={14} />
          Previous
        </button>

        <span className="text-xs font-medium text-[var(--text-secondary)]">
          Card {currentIdx + 1} of {questions.length}
        </span>

        <button
          onClick={handleNext}
          disabled={currentIdx === questions.length - 1}
          className="btn-ghost flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          Next
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
