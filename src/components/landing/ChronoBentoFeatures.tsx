'use client';

import { memo } from 'react';
import {
  DocumentTileIcon,
  TargetTileIcon,
  ArrowTileIcon,
} from './ChronoLandingIcons';

/**
 * Section 4 — Bento Grid Feature Showcase (per plan).
 *
 * Header: Pill badge `Features` + headline "Keep everything in one place" +
 * subhead "Forget generic templates and manual copy-pasting."
 *
 * Cards:
 * 1. Smart Keyword Alignment — floating pills of extracted job skills
 * 2. ATS Score & Analytics — mini bars comparing raw vs tailored score
 * 3. Instant Bullet Rewrites — before/after toggle card
 * 4. Application Pipeline — kanban-style mini board: Applied → Screen → Interview → Offer
 */
export default memo(function ChronoBentoFeatures() {
  return (
    <section className="py-24 relative border-t border-[var(--border-default)]">
                <div
        className="absolute inset-0 pointer-events-none z-0 dot-grid-fine"
        style={{ opacity: 0.10 }}
      />

      <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
        <span className="pill-badge pill-badge-accent mb-4 inline-flex items-center gap-2 self-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor" opacity="0.95" />
            <rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor" opacity="0.7" />
            <rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor" opacity="0.7" />
            <rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor" opacity="0.45" />
          </svg>
          Features
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
          Keep everything in one place
        </h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto font-medium mb-14">
          Forget generic templates and manual copy-pasting.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
          <FeatureKeywordCard className="animate-scale-in stagger-enter-delay-1" />
          <FeatureAnalyticsCard className="animate-scale-in stagger-enter-delay-2" />
          <FeatureRewritesCard className="animate-scale-in stagger-enter-delay-3 md:col-span-2" />
          <FeaturePipelineCard className="animate-scale-in stagger-enter-delay-4 md:col-span-2" />
        </div>
      </div>
    </section>
  );
});

function FeatureKeywordCard({ className = '' }: { className?: string }) {
  const skills = ['React', 'TypeScript', 'System Design', 'Kubernetes', 'ML Pipelines'];

  return (
    <div
      className={`rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-5 shadow-clay flex flex-col gap-4 ${className}`}
      style={{ borderRadius: 'var(--radius-lg)' }}
    >
      <div className="flex items-center gap-2">
        <DocumentTileIcon className="shrink-0" />
        <span className="text-xs font-semibold text-[var(--text-primary)]">Smart Keyword Alignment</span>
      </div>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        The engine extracts the skills and terms that matter for the role, then
        lines them up with your experience.
      </p>
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 py-1 text-xs text-[var(--text-secondary)] shadow-clay-subtle"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

function FeatureAnalyticsCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-5 shadow-clay flex flex-col gap-4 ${className}`}
      style={{ borderRadius: 'var(--radius-lg)' }}
    >
      <div className="flex items-center gap-2">
        <TargetTileIcon className="shrink-0 accent" />
        <span className="text-xs font-semibold text-[var(--text-primary)]">ATS Score &amp; Analytics</span>
      </div>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        See the gap between your raw resume and the tailored version before you
        export.
      </p>
      <div className="flex flex-col gap-3 mt-auto">
        <ScoreRow label="Raw resume" score={58} />
        <ScoreRow label="Tailored resume" score={92} accent />
      </div>
    </div>
  );
}

function ScoreRow({ label, score, accent = false }: { label: string; score: number; accent?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-xs text-[var(--text-secondary)]">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-[var(--bg-muted)] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${score}%`,
            background: accent ? 'var(--accent)' : 'var(--text-muted)',
          }}
        />
      </div>
      <span className="w-8 text-right text-xs font-mono text-[var(--text-secondary)]">{score}%</span>
    </div>
  );
}

function FeatureRewritesCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-5 shadow-clay flex flex-col gap-4 ${className}`}
      style={{ borderRadius: 'var(--radius-lg)' }}
    >
      <div className="flex items-center gap-2">
        <ArrowTileIcon className="shrink-0" accent />
        <span className="text-xs font-semibold text-[var(--text-primary)]">Instant Bullet Rewrites</span>
      </div>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        Before/after rewrites of your summary and bullets — reframed for impact
        without changing the facts.
      </p>
      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)] p-4 shadow-clay-subtle">
        <Rewrites />
      </div>
    </div>
  );
}

function Rewrites() {
  const before =
    'Worked on frontend development and improved performance.';
  const after =
    'Led a React + TypeScript redesign that cut UI bug reports by 38% and reduced largest-contentful-paint by 42%.';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] p-3">
        <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-1 block">
          Before
        </span>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{before}</p>
      </div>
      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)] p-3 shadow-clay-inset">
        <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--accent)' }}>After</span>
        <p className="text-sm text-[var(--text-primary)] leading-relaxed mt-1">{after}</p>
      </div>
    </div>
  );
}

function FeaturePipelineCard({ className = '' }: { className?: string }) {
  const columns = ['Applied', 'Screen', 'Interview', 'Offer'];
  const cards = [
    { label: 'Senior Frontend Eng.', column: 1 },
    { label: 'Product Designer', column: 0 },
    { label: 'ML Platform Eng.', column: 2 },
    { label: 'Product Manager', column: 3 },
  ];

  return (
    <div
      className={`rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-5 shadow-clay flex flex-col gap-4 ${className}`}
      style={{ borderRadius: 'var(--radius-lg)' }}
    >
      <div className="flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="shrink-0">
          <rect x="2" y="2" width="5" height="14" rx="1.5" fill="var(--bg-subtle)" stroke="var(--border-strong)" strokeWidth="1" />
          <rect x="8.5" y="2" width="5" height="14" rx="1.5" fill="var(--bg-subtle)" stroke="var(--border-strong)" strokeWidth="1" />
          <rect x="15" y="2" width="1" height="14" rx="0.5" fill="var(--bg-subtle)" stroke="var(--border-strong)" strokeWidth="1" />
        </svg>
        <span className="text-xs font-semibold text-[var(--text-primary)]">Application Pipeline</span>
      </div>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        Move each application from applied through screen, interview, and offer — at a glance.
      </p>
      <div className="grid grid-cols-4 gap-2 mt-auto">
        {columns.map((col) => (
          <PipelineColumn key={col} name={col} cards={cards.filter((c) => c.column === columns.indexOf(col))} />
        ))}
      </div>
    </div>
  );
}

function PipelineColumn({ name, cards }: { name: string; cards: { label: string; column: number }[] }) {
  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] p-2 shadow-clay-subtle flex flex-col gap-2 min-h-[8rem]">
      <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold w-full text-center">
        {name}
      </span>
      {cards.map((card) => (
        <div
          key={card.label + card.column}
          className="rounded-md border border-[var(--border-default)] bg-[var(--bg-base)] px-2 py-1.5 text-xs text-[var(--text-secondary)] shadow-clay-subtle truncate"
        >
          {card.label}
        </div>
      ))}
    </div>
  );
}
