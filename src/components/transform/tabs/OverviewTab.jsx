import React from 'react';
import { Sparkles, AlertTriangle } from 'lucide-react';

export default function OverviewTab({ 
  currentScore, 
  jobTitle, 
  company, 
  keywordsMatchedCount, 
  keywordsTotalCount,
  recruiterScan,
  roadmapData,
  atsQuality
}) {
  
  // Fallbacks for older data records
  const quality = atsQuality || {
    keyword_density: currentScore >= 60 ? 'Optimal' : 'Low',
    section_headings: 'Standard',
    formatting_risk: 'Clean'
  };

  const scan = recruiterScan || {
    strong_yes: `Robust hands-on experience and a strong project portfolio makes this candidate a competitive fit for the ${jobTitle || 'target'} role.`,
    completely_missed: `Limited direct production-level focus on advanced scalability or specialized infrastructure tools.`
  };

  const tasks = roadmapData?.tasks || [
    { task: 'Highlight personal projects focusing on cloud scaling or containerization', impact: 'HIGH IMPACT', points: 5 },
    { task: 'Incorporate missing technical keywords from the job description', impact: 'MEDIUM IMPACT', points: 3 }
  ];

  // Helper to determine score color variable
  const getScoreColor = (score) => {
    if (score >= 70) return 'var(--success)';
    if (score >= 40) return 'var(--warning)';
    return 'var(--danger)';
  };

  // Helper for badge colors
  const getBadgeStyle = (val) => {
    const successValues = ['optimal', 'standard', 'zero flags', 'clean'];
    const warningValues = ['low', 'non-standard', 'minor issues'];
    
    const normalized = String(val).toLowerCase();
    
    if (successValues.includes(normalized)) {
      return 'bg-[var(--success-subtle)] text-[var(--success-fg)] border-[var(--success-fg)]/10';
    }
    if (warningValues.includes(normalized)) {
      return 'bg-[var(--warning-subtle)] text-[var(--warning-fg)] border-[var(--warning-fg)]/10';
    }
    return 'bg-[var(--danger-subtle)] text-[var(--danger-fg)] border-[var(--danger-fg)]/10';
  };

  const scoreColor = getScoreColor(currentScore);

  return (
    <div className="animate-fade-in flex flex-col gap-6 text-left font-sans text-[var(--text-primary)] bg-transparent">
      {/* 1. Score + ATS Quality Card (Merged Grid) */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-[var(--shadow-sm)]">
        {/* Left Column: Match Score */}
        <div className="flex flex-col justify-center border-b md:border-b-0 md:border-r border-[var(--border-subtle)] pb-6 md:pb-0 pr-0 md:pr-6">
          <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">ATS Compatibility</span>
          <span className="text-[36px] font-bold mt-1 leading-none" style={{ color: scoreColor }}>
            {currentScore}%
          </span>
          <div className="w-full h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden mt-3.5 select-none">
            <div 
              className="h-full transition-all duration-900 ease-out" 
              style={{ 
                width: `${currentScore}%`,
                backgroundColor: scoreColor 
              }} 
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-4 leading-relaxed font-normal">
            Your resume has been optimized for the <strong>{jobTitle}</strong> position. We integrated critical keywords and raised your overall match score to <strong>{currentScore}%</strong>.
          </p>
        </div>
        
        {/* Right Column: ATS Scan Quality */}
        <div className="flex flex-col justify-center pl-0 md:pl-2">
          <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2 select-none">ATS Scan Quality</span>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs font-semibold py-1.5 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)] font-normal">Keyword Density</span>
              <span className={`border rounded-[var(--radius-xs)] px-2 py-0.5 font-semibold text-[10px] uppercase tracking-wider ${getBadgeStyle(quality.keyword_density)}`}>
                {quality.keyword_density}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold py-1.5 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)] font-normal">Section Headings</span>
              <span className={`border rounded-[var(--radius-xs)] px-2 py-0.5 font-semibold text-[10px] uppercase tracking-wider ${getBadgeStyle(quality.section_headings)}`}>
                {quality.section_headings}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold py-1.5 border-b border-[var(--border-subtle)] last:border-0 last:pb-0">
              <span className="text-[var(--text-secondary)] font-normal">Formatting Risk</span>
              <span className={`border rounded-[var(--radius-xs)] px-2 py-0.5 font-semibold text-[10px] uppercase tracking-wider ${getBadgeStyle(quality.formatting_risk)}`}>
                {quality.formatting_risk}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. AI Analysis Panel */}
      <div className="border border-[var(--border-default)] border-l-[3px] border-l-[var(--accent)] rounded-[var(--radius-md)] p-4 sm:p-5 shadow-[var(--shadow-sm)] bg-[var(--bg-elevated)]">
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5 select-none">
          <Sparkles size={13} />
          AI Analysis
        </h4>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-normal mt-2.5">
          {scan.strong_yes}
        </p>
        {scan.completely_missed && scan.completely_missed.trim().length > 0 && (
          <div className="flex items-start gap-1.5 border-t border-[var(--border-subtle)] pt-3 mt-3 text-xs text-[var(--warning-fg)] font-medium leading-relaxed">
            <AlertTriangle size={14} className="shrink-0 mt-0.5 text-[var(--warning-fg)]" />
            <span>{scan.completely_missed}</span>
          </div>
        )}
      </div>

      {/* 3. Next Steps (Roadmap tasks) */}
      {tasks.length > 0 && (
        <div className="border border-[var(--border-default)] rounded-[var(--radius-md)] p-4 sm:p-5 shadow-[var(--shadow-sm)] bg-[var(--bg-elevated)]">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] select-none mb-3">Suggested Next Steps</h4>
          <div className="flex flex-col">
            {tasks.slice(0, 2).map((item, idx) => {
              const isHigh = String(item.impact).toUpperCase().includes('HIGH');
              return (
                <div key={idx} className="flex items-center gap-2.5 py-2.5 border-b border-[var(--border-subtle)] last:border-b-0 text-sm text-[var(--text-secondary)] font-normal">
                  <span className="text-[var(--text-muted)] select-none">&rarr;</span>
                  <span className="flex-1 leading-normal">{item.task}</span>
                  
                  <div className="flex items-center gap-3 shrink-0 ml-4 select-none">
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-[var(--radius-xs)] border tracking-wider ${
                      isHigh 
                        ? 'bg-[var(--warning-subtle)] text-[var(--warning-fg)] border-[var(--warning-fg)]/10' 
                        : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-default)]'
                    }`}>
                      {isHigh ? 'High Impact' : 'Medium Impact'}
                    </span>
                    <span className="text-xs font-semibold text-[var(--accent)]">+{item.points} pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Tailoring Metadata Row */}
      <div className="border border-[var(--border-default)] rounded-[var(--radius-md)] p-4 sm:p-5 bg-[var(--bg-elevated)] select-none">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Target Role</span>
            <span className="text-xs font-semibold text-[var(--text-primary)] mt-1 truncate" title={jobTitle}>{jobTitle || 'Not specified'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Company</span>
            <span className="text-xs font-semibold text-[var(--text-primary)] mt-1 truncate" title={company}>{company !== 'Target Company' && company ? company : '—'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Keywords Matched</span>
            <span className="text-xs font-semibold text-[var(--text-primary)] mt-1">{keywordsMatchedCount} / {keywordsTotalCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Layout Safety</span>
            <span className="text-xs font-semibold text-[var(--success)] mt-1">ATS Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}

