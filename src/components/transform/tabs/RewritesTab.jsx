import React from 'react';
import { diffWords } from 'diff';

function DiffView({ before, after }) {
  const changes = diffWords(before || '', after || '');
  
  return (
    <span>
      {changes.map((part, i) => {
        if (part.added) {
          return (
            <mark key={i} className="bg-[var(--success-subtle)] text-[var(--success-fg)] border-b border-[var(--success-fg)]/10 rounded px-0.5 font-medium no-underline inline">
              {part.value}
            </mark>
          );
        }
        if (part.removed) {
          return (
            <span key={i} className="text-[var(--danger-fg)] line-through decoration-[var(--danger-fg)]/40 decoration-1">
              {part.value}
            </span>
          );
        }
        return <span key={i}>{part.value}</span>;
      })}
    </span>
  );
}

export default function RewritesTab({ rewritesList }) {
  const list = rewritesList || [];

  return (
    <div className="animate-fade-in flex flex-col gap-6 font-sans text-left text-[var(--text-primary)] bg-transparent">
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Experience Optimizations</h3>
        <p className="text-xs text-[var(--text-muted)] mt-1 font-normal">See side-by-side, word-level improvements of how your resume details were optimized for the job description.</p>
      </div>

      {list.length === 0 ? (
        <div className="border border-[var(--border-default)] rounded-[var(--radius-lg)] p-8 text-center bg-[var(--bg-elevated)]">
          <p className="text-sm text-[var(--text-muted)] italic font-normal">No rewrites generated. The resume matches the target text without revisions.</p>
        </div>
      ) : (
        <div className="border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)] bg-[var(--bg-elevated)]">
          
          {/* Table Header */}
          <div className="grid grid-cols-2 bg-[var(--bg-subtle)] border-b border-[var(--border-default)] select-none text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            <div className="px-5 py-3 border-r border-[var(--border-default)]">
              Original Resume Text
            </div>
            <div className="px-5 py-3 text-[var(--text-secondary)]">
              Optimized ATS Text
            </div>
          </div>

          {/* Table Rows */}
          <div className="flex flex-col">
            {list.map((item, idx) => (
              <div key={idx} className="flex flex-col border-b border-[var(--border-default)] last:border-b-0">
                
                {/* Full-width Section Label strip */}
                <div className="w-full bg-[var(--bg-muted)] border-b border-[var(--border-default)] px-5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)] select-none">
                  {item.section || `Rewrite ${idx + 1}`}
                </div>

                {/* Side-by-side cells */}
                <div className="grid grid-cols-2 text-sm leading-[1.65]">
                  {/* Left Cell */}
                  <div className="p-5 border-r border-[var(--border-default)] text-[var(--text-muted)] font-normal">
                    {item.before || <span className="italic text-[var(--text-disabled)]">No original text.</span>}
                  </div>
                  {/* Right Cell */}
                  <div className="p-5 text-[var(--text-primary)] font-normal">
                    <DiffView before={item.before} after={item.after} />
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
