'use client';

export const STATUS_OPTIONS = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn'];

export const STATUS_STYLES = {
  Saved: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-default)]',
  Applied: 'bg-[var(--neutral-subtle)] text-[var(--neutral)] border-[var(--border-default)]',
  Interviewing:
    'bg-[var(--warning-subtle)] text-[var(--warning-fg)] border-[var(--warning-fg)]/10',
  Offer: 'bg-[var(--success-subtle)] text-[var(--success-fg)] border-[var(--success-fg)]/10',
  Rejected: 'bg-[var(--danger-subtle)] text-[var(--danger-fg)] border-[var(--danger-fg)]/10',
  Withdrawn:
    'bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--border-default)] line-through opacity-75',
};

/** Status selector for an application. Extracted from TrackingTab. */
export default function ApplicationStatusBar({ status, onChange }) {
  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Application Status</h3>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Where is this resume in the application lifecycle?
        </p>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Application status">
        {STATUS_OPTIONS.map((opt) => {
          const isActive = status === opt;
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(opt)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                isActive
                  ? STATUS_STYLES[opt] + ' ring-2 ring-[var(--accent)]/15 border-[var(--accent)]'
                  : 'bg-transparent border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
