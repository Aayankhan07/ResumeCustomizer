import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ScoreBanner({ 
  candidateName, 
  jobTitle, 
  onReset 
}) {
  return (
    <header className="h-[52px] border-b border-[var(--border-default)] bg-[var(--bg-base)] flex items-center px-6 gap-4 select-none w-full rounded-[var(--radius-lg)]">
      {/* Back Link */}
      <Link href="/dashboard" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] flex items-center gap-1.5 transition-colors font-medium">
        <ArrowLeft size={14} />
        Back to Dashboard
      </Link>

      {/* Divider */}
      <div className="w-px h-4 bg-[var(--border-default)]" />

      {/* Candidate name & role */}
      <div className="text-sm font-medium text-[var(--text-primary)] truncate">
        {candidateName} <span className="text-[var(--text-muted)] font-normal">—</span> <span className="text-[var(--text-secondary)] font-normal">{jobTitle}</span>
      </div>

      {/* New Analysis button */}
      <button
        onClick={onReset}
        className="btn-default ml-auto py-1.5 px-3 text-xs font-medium rounded-[var(--radius-sm)] flex items-center gap-1"
      >
        New Analysis
      </button>
    </header>
  );
}
