'use client';

import { memo, useState } from 'react';
import { FileText, Search, User } from 'lucide-react';
import ScoreRing from '../ui/ScoreRing';
import {
  DocumentTileIcon,
  TargetTileIcon,
  HourglassTileIcon,
} from './ChronoLandingIcons';

/**
 * Section 3 — Interactive Dashboard / Transformation Mockup (per plan).
 *
 * Decorative landing mockup; not the real dashboard route. Frames the
 * "ResumOrph Workspace" against a soft vibrant backdrop aura and includes:
 * - Header: "Good morning, Alex" with search and profile pill
 * - Left sidebar: Workspace navigation (Resumes, Applications, Job Matcher, Portfolio)
 * - Main panel split:
 *   - Live Tailoring / To-Do List widget: real-time bullet rewrite checklist with diff-style highlights
 *   - Match Score Donut Chart / Progress Gauge (ScoreRing)
 *   - Optimization Time Tracker: "00:45s" style per-application time saved
 *   - Active Applications Tracker: target roles with status bars
 */
export default function ChronoAppPreview() {
  const [searchValue, setSearchValue] = useState('');
  const [checked, setChecked] = useState<Record<string, boolean>>({
    summary: true,
    bullets: false,
    keywords: true,
    formatting: false,
  });

  const toDoItems = [
    { id: 'summary', label: 'Rewrite summary for the role' },
    { id: 'bullets', label: 'Reframe experience bullets' },
    { id: 'keywords', label: 'Fill missing keywords' },
    { id: 'formatting', label: 'Apply ATS-safe layout' },
  ];

  const activeApplications = [
    { role: 'Senior Frontend Engineer', progress: 70, status: 'Screen' },
    { role: 'Product Designer', progress: 45, status: 'Applied' },
    { role: 'ML Platform Engineer', progress: 20, status: 'Applied' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Framed showcase card set against a soft vibrant backdrop aura */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-clay"
        style={{ borderRadius: 'var(--radius-xl)' }}
      >
        {/* Soft electric-blue / vibrant backdrop aura behind the frame */}
        <div
          className="absolute -top-32 -right-32 w-[55%] h-[55%] rounded-full pointer-events-none"
          style={{
            background: 'color-mix(in srgb, var(--accent) 18%, transparent)',
            filter: 'blur(70px)',
          }}
        />
        <div
          className="absolute -bottom-24 -left-20 w-[45%] h-[45%] rounded-full pointer-events-none"
          style={{
            background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
            filter: 'blur(60px)',
          }}
        />

        <div
          className="relative bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-clay-inset rounded-2xl"
          style={{ borderRadius: 'var(--radius-xl)' }}
        >
          {/* Header */}
          <header className="flex items-center justify-between gap-4 px-5 py-3 border-b border-[var(--border-default)]">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                Good morning, Alex
              </span>
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="hidden sm:flex items-center gap-2 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-default)] px-3 py-1.5 shadow-clay-subtle"
                style={{ minWidth: '14rem' }}
              >
                <Search size={14} className="text-[var(--text-muted)] shrink-0" />
                <input
                  type="search"
                  aria-label="Search workspace"
                  placeholder="Search workspace..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="bg-transparent text-xs text-[var(--text-secondary)] placeholder-[var(--text-muted)] outline-none w-full"
                />
              </div>
              <div className="rounded-full bg-[var(--bg-muted)] border border-[var(--border-default)] px-2.5 py-1 shadow-clay-subtle flex items-center gap-2 shrink-0">
                <span className="w-5 h-5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-center">
                  <User size={12} className="text-[var(--text-muted)]" />
                </span>
                <span className="text-[11px] font-medium text-[var(--text-secondary)]">Alex</span>
              </div>
            </div>
          </header>

          <div className="flex flex-col md:flex-row min-h-[30rem]">
            {/* Left sidebar */}
            <Sidebar />

            {/* Main panel */}
            <main className="flex-1 p-4 sm:p-5 space-y-5 min-w-0">
              {/* Live Tailoring / To-Do List widget */}
              <LiveTailoringWidget items={toDoItems} checked={checked} onToggle={setChecked} />

              {/* Match Score donut / progress gauge — split with the time tracker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <MatchGaugeWidget score={92} />
                <TimeTrackerWidget saved="00:45s" />
              </div>

              {/* Active Applications Tracker */}
              <ActiveApplicationsWidget applications={activeApplications} />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

const Sidebar = memo(function Sidebar() {
  const items = [
    { label: 'Resumes', active: true },
    { label: 'Applications', active: false },
    { label: 'Job Matcher', active: false },
    { label: 'Portfolio', active: false },
  ];

  return (
    <aside className="md:w-44 shrink-0 border-b md:border-b-0 md:border-r border-[var(--border-default)] bg-[var(--bg-subtle)]/50 p-3 sm:p-4">
      <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible" aria-label="Workspace navigation">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap"
            style={{
              background: item.active
                ? 'color-mix(in srgb, var(--accent) 10%, var(--bg-elevated))'
                : 'transparent',
              color: item.active ? 'var(--accent)' : 'var(--text-secondary)',
            }}
          >
            <FileText size={15} className="shrink-0 stroke-[1.6]" />
            {item.label}
          </div>
        ))}
      </nav>
    </aside>
  );
});

const LiveTailoringWidget = memo(function LiveTailoringWidget({
  items,
  checked,
  onToggle,
}: {
  items: { id: string; label: string }[];
  checked: Record<string, boolean>;
  onToggle: (map: Record<string, boolean>) => void;
}) {
  return (
    <div className="doc-block rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-4 shadow-clay-subtle">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <DocumentTileIcon className="shrink-0" accent />
          <span className="text-xs font-semibold text-[var(--text-primary)]">Live Tailoring</span>
        </div>
        <span className="text-[11px] font-mono text-[var(--text-muted)]">To-Do list</span>
      </div>
      <ul className="space-y-2.5">
        {items.map((item) => {
          const isDone = Boolean(checked[item.id]);
          return (
            <li key={item.id} className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => onToggle({ ...checked, [item.id]: !isDone })}
                aria-pressed={isDone}
                aria-label={item.label}
                className="mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center text-[10px] transition-colors"
                style={{
                  background: isDone ? 'var(--accent)' : 'transparent',
                  color: isDone ? 'var(--accent-fg)' : 'transparent',
                  borderColor: isDone ? 'var(--accent)' : 'var(--border-strong)',
                }}
              >
                {isDone && (
                  <svg width={8} height={8} viewBox="0 0 8 8" fill="none" aria-hidden="true">
                    <path
                      d="M1.8 4.2L3.4 5.8L6.2 2.4"
                      stroke="currentColor"
                      strokeWidth={1.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
              <span className={`text-sm leading-relaxed ${isDone ? 'doc-done' : 'doc-text'}`}>
                {item.label}
              </span>
              {isDone && (
                <span className="ml-auto text-[10px] font-medium text-[var(--accent)] bg-[var(--accent-subtle)]/60 px-1.5 py-0.5 rounded">
                  diff
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
        <span className="text-[var(--accent)] font-medium">Highlight:</span> rewritten bullets and keywords shown in-context.
      </div>
    </div>
  );
});

const MatchGaugeWidget = memo(function MatchGaugeWidget({ score }: { score: number }) {
  return (
    <div className="doc-block rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-4 shadow-clay-subtle flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: 88, height: 88 }}>
        <ScoreRing score={score} size={88} />
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="text-lg font-bold text-[var(--text-primary)]">{score}%</span>
        </div>
      </div>
              <div className="flex flex-col gap-1.5 text-xs min-w-0">
        <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
          Match Score
        </span>
        <span className="text-sm font-medium text-[var(--text-primary)]">Keywords · Experience · Formatting</span>
      </div>
    </div>
  );
});

const TimeTrackerWidget = memo(function TimeTrackerWidget({ saved }: { saved: string }) {
  return (
    <div className="doc-block rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-4 shadow-clay-subtle flex items-center gap-4">
      <div className="shrink-0" style={{ width: 72, height: 72 }}>
        <HourglassTileIcon className="w-full h-full" accent />
      </div>
      <div className="flex flex-col gap-1 text-xs min-w-0">
        <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
          Time Saved
        </span>
        <span className="text-2xl font-bold text-[var(--text-primary)] font-mono leading-none">{saved}</span>
      </div>
    </div>
  );
});

const ActiveApplicationsWidget = memo(function ActiveApplicationsWidget({
  applications,
}: {
  applications: { role: string; progress: number; status: string }[];
}) {
  return (
    <div className="doc-block rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-4 shadow-clay-subtle flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <TargetTileIcon className="shrink-0" accent />
        <span className="text-xs font-semibold text-[var(--text-primary)]">Active Applications Tracker</span>
      </div>
      <ul className="space-y-3 flex-1">
        {applications.map((app) => (
          <li key={app.role} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 min-w-0 sm:w-56">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0" />
              <span className="text-sm text-[var(--text-secondary)] truncate">{app.role}</span>
            </div>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-muted)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${app.progress}%` }} />
              </div>
              <span className="text-xs font-mono text-[var(--text-muted)] w-10 text-right shrink-0">
                {app.progress}%
              </span>
              <span
                className={`text-[11px] rounded-full px-2 py-0.5 font-medium shrink-0 ${
                  app.status === 'Screen'
                    ? 'bg-[color-mix(in_srgb,var(--accent)_16%,var(--bg-elevated))] text-[var(--accent)]'
                    : 'bg-[color-mix(in_srgb,var(--text-muted)_14%,var(--bg-elevated))] text-[var(--text-secondary)]'
                }`}
              >
                {app.status}
              </span>
            </div>
          </li>
        ))}
      </ul>

    </div>
  );
});
