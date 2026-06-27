import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

export default function KeywordsTab({
  technicalSkills = [],
  toolsSkills = [],
  softSkills = [],
  keywordsMatched = [],
  keywordsMissing = [],
  keywordsTotal = 0,
  matchScore = 0
}) {
  const [showAllMatched, setShowAllMatched] = useState(false);

  const matchedDisplay = showAllMatched ? keywordsMatched : keywordsMatched.slice(0, 20);
  const remainingMatchedCount = keywordsMatched.length - matchedDisplay.length;

  // Calculate relative bar widths for Skill Categories
  const techCount = technicalSkills.length;
  const toolsCount = toolsSkills.length;
  const softCount = softSkills.length;
  const missingCount = keywordsMissing.length;

  const maxVal = Math.max(techCount, toolsCount, softCount, missingCount, 1);

  const getWidth = (val) => `${(val / maxVal) * 100}%`;

  return (
    <div className="animate-fade-in flex flex-col gap-6 font-sans text-left text-[var(--text-primary)] bg-transparent">
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Keyword Coverage & Skills</h3>
        <p className="text-xs text-[var(--text-muted)] mt-1 font-normal">Analyze matched keywords and core skill breakdown relative to the job posting.</p>
      </div>

      {/* Section 1: Score + Status line */}
      <div className="flex flex-col gap-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] p-4">
        <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-muted)] tracking-wider select-none">
          <span>KEYWORD COVERAGE</span>
          <span className="font-mono text-[var(--text-primary)]">{matchScore}% ({keywordsMatched.length}/{keywordsTotal})</span>
        </div>
        <div className="w-full h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--accent)] rounded-full transition-all duration-900 ease-out"
            style={{ width: `${matchScore}%` }}
          />
        </div>
      </div>

      {/* Section 2: Two-Column Keyword View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Left Column - MATCHED */}
        <div className="border border-[var(--border-default)] bg-[var(--bg-elevated)] rounded-[var(--radius-md)] p-5 flex flex-col gap-3">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--success-fg)] select-none">
            MATCHED ({keywordsMatched.length})
          </h4>
          
          {keywordsMatched.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-1 select-all">
              {matchedDisplay.map((kw, idx) => (
                <span 
                  key={idx} 
                  className="bg-[var(--success-subtle)] text-[var(--success-fg)] border border-[var(--success-fg)]/10 rounded-[var(--radius-xs)] px-2 py-0.5 text-[11px] font-medium"
                >
                  {kw}
                </span>
              ))}
              
              {remainingMatchedCount > 0 && (
                <button
                  onClick={() => setShowAllMatched(true)}
                  className="bg-[var(--bg-subtle)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] rounded-[var(--radius-xs)] px-2.5 py-0.5 text-[11px] font-medium cursor-pointer transition-colors"
                >
                  +{remainingMatchedCount} more
                </button>
              )}
            </div>
          ) : (
            <span className="text-xs text-[var(--text-muted)] italic">No keywords matched yet.</span>
          )}
        </div>

        {/* Right Column - MISSING */}
        <div className="border border-[var(--border-default)] bg-[var(--bg-elevated)] rounded-[var(--radius-md)] p-5 flex flex-col gap-3">
          <h4 className={`text-[11px] font-semibold uppercase tracking-wider select-none ${keywordsMissing.length > 0 ? 'text-[var(--warning-fg)]' : 'text-[var(--success-fg)]'}`}>
            MISSING ({keywordsMissing.length})
          </h4>
          
          {keywordsMissing.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-1 select-all">
              {keywordsMissing.map((kw, idx) => (
                <span 
                  key={idx} 
                  className="bg-[var(--warning-subtle)] text-[var(--warning-fg)] border border-[var(--warning-fg)]/10 rounded-[var(--radius-xs)] px-2 py-0.5 text-[11px] font-medium"
                >
                  {kw}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-6 text-[var(--success-fg)] font-semibold text-sm select-none">
              <CheckCircle size={15} className="mr-1.5 text-[var(--success-fg)]" />
              ✓ No critical gaps found
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Skill Categories */}
      <div className="border border-[var(--border-default)] bg-[var(--bg-elevated)] rounded-[var(--radius-md)] p-5 flex flex-col gap-5 shadow-[var(--shadow-sm)]">
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] select-none">Skill Categories Breakdown</h4>
        
        <div className="flex flex-col gap-4">
          
          {/* Technical */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-normal">
              <span className="text-[var(--text-secondary)]">Technical Skills</span>
              <span className="text-[var(--text-primary)] font-semibold">{techCount}</span>
            </div>
            <div className="w-full h-1.5 bg-[var(--bg-muted)] rounded-full">
              <div 
                className="h-full bg-[var(--accent)] rounded-full transition-all duration-500" 
                style={{ width: getWidth(techCount) }} 
              />
            </div>
          </div>

          {/* Tools */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-normal">
              <span className="text-[var(--text-secondary)]">Tools & Platforms</span>
              <span className="text-[var(--text-primary)] font-semibold">{toolsCount}</span>
            </div>
            <div className="w-full h-1.5 bg-[var(--bg-muted)] rounded-full">
              <div 
                className="h-full bg-[var(--accent)] rounded-full transition-all duration-500" 
                style={{ width: getWidth(toolsCount) }} 
              />
            </div>
          </div>

          {/* Soft Skills */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-normal">
              <span className="text-[var(--text-secondary)]">Soft Skills</span>
              <span className="text-[var(--text-primary)] font-semibold">{softCount}</span>
            </div>
            <div className="w-full h-1.5 bg-[var(--bg-muted)] rounded-full">
              <div 
                className="h-full bg-[var(--accent)] rounded-full transition-all duration-500" 
                style={{ width: getWidth(softCount) }} 
              />
            </div>
          </div>

          {/* Missing */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-normal">
              <span className="text-[var(--text-secondary)]">Missing Core Keywords</span>
              {missingCount > 0 ? (
                <span className="text-[var(--danger-fg)] font-semibold">{missingCount}</span>
              ) : (
                <span className="text-[var(--success-fg)] font-semibold text-[11px] flex items-center">✓ none</span>
              )}
            </div>
            <div className="w-full h-1.5 bg-[var(--bg-muted)] rounded-full">
              {missingCount > 0 ? (
                <div 
                  className="h-full bg-[var(--danger)] rounded-full transition-all duration-500" 
                  style={{ width: getWidth(missingCount) }} 
                />
              ) : (
                <div className="h-full bg-[var(--bg-muted)] rounded-full w-0" />
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
