'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { BoltIcon } from './ChronoLandingIcons'; // kept for possible future use; not rendered in the clean pass

/**
 * Section 5 — Neumorphic Pricing Tier Cards (per plan).
 *
 * Header: Pill badge `Pricing` + headline "Simple pricing plans".
 * 3-card layout:
 * - Starter / Free — clean white card, free, essential features, Get started
 * - Pro Plan (Featured Center Card) — vibrant accent surface, floating 3D
 *   lightning bolt badge, "Best choice", white pill CTA, checkmarked feature list
 * - Advanced / Lifetime — clean white card, higher volume + priority exports
 *
 * This is a visual section on the landing page, not a real checkout route.
 */
export default function ChronoPricing() {
  return (
    <section className="py-24 relative">
      <div
        className="absolute inset-0 pointer-events-none z-0 dot-grid-fine"
        style={{ opacity: 0.06 }}
      />

      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        <span className="pill-badge pill-badge-accent mb-4 inline-flex items-center gap-2 self-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor" opacity="0.95" />
            <rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor" opacity="0.7" />
            <rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor" opacity="0.7" />
            <rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor" opacity="0.45" />
          </svg>
          Pricing
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
          Simple pricing plans
        </h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto font-medium mb-14">
          Start free, upgrade when you need more.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Starter / Free */}
          <PricingCard
            featured={false}
            name="Starter"
            price="$0 / mo"
            period="free"
            ctaHref="/signup"
            ctaLabel="Get started"
            free
          >
            <PricingFeature text="Up to 10 optimizations / hour" />
            <PricingFeature text="PDF, DOCX, text export" />
            <PricingFeature text="Match score + missing keywords" />
            <PricingFeature text="Rewrites for summary + bullets" />
            <PricingFeature text="Cover letter draft" />
          </PricingCard>

          {/* Pro (featured center card) */}
          <PricingCard
            featured={true}
            name="Pro"
            price="$9 / mo"
            period="billed monthly"
            ctaHref="/signup"
            ctaLabel="Get started"
            saveBadge="Best choice"
          >
            <PricingFeature text="Unlimited optimizations" />
            <PricingFeature text="Priority exports (PDF + DOCX)" />
            <PricingFeature text="Full rewrite history" />
            <PricingFeature text="Interview prep + recruiter scan" />
            <PricingFeature text="Multiple targeted versions" />
          </PricingCard>

          {/* Advanced / Lifetime */}
          <PricingCard
            featured={false}
            name="Advanced"
            price="$29 one-time"
            period="lifetime"
            ctaHref="/signup"
            ctaLabel="Get started"
          >
            <PricingFeature text="High-volume tailoring" />
            <PricingFeature text="Priority PDF + DOCX exports" />
            <PricingFeature text="Full rewrite history" />
            <PricingFeature text="Interview prep + recruiter scan" />
            <PricingFeature text="Team sharing for a role" />
          </PricingCard>
        </div>

        <p className="text-sm text-[var(--text-muted)] mt-10 font-medium">
          All plans keep your raw resume and job descriptions out of permanent storage.
        </p>
      </div>
    </section>
  );
}

function PricingCard({
  featured,
  name,
  price,
  period,
  ctaHref,
  ctaLabel,
  saveBadge,
  free,
  children,
}: {
  featured?: boolean;
  name: string;
  price: string;
  period: string;
  ctaHref: string;
  ctaLabel: string;
  saveBadge?: string;
  free?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 ${
        featured
          ? 'pricing-featured shadow-clay text-[var(--accent-fg)]'
          : 'bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)] shadow-clay'
      }`}
    >
      {featured && (
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2"
          aria-hidden="true"
          style={{ zIndex: 1 }}
        >
          <div
            className="rounded-full bg-[var(--bg-base)] px-3 py-1 text-[11px] font-semibold shadow-clay inline-block"
          >
            {saveBadge}
          </div>
        </div>
      )}


      <div className="mb-4">
        <span className="text-sm uppercase tracking-widest font-semibold opacity-80">
          {name}
        </span>
      </div>

      <div className="mb-5">
        <div className="flex items-baseline justify-center gap-1.5">
          <span className="text-4xl font-bold tracking-tight">{price}</span>
          {period && (
            <span className={`text-sm opacity-80 ${featured ? 'opacity-85' : ''}`}>
              {' '}
              {period}
            </span>
          )}
        </div>
      </div>

      <ul className="flex-1 space-y-3 mb-6 text-sm" style={featured ? { color: 'var(--accent-fg)' } : undefined}>
        {children}
      </ul>

      <button
        className={`w-full rounded-lg py-3 text-sm font-semibold transition-all duration-150 active:scale-[0.98] ${
          featured
            ? 'bg-[var(--bg-base)] text-[var(--accent)] shadow-clay'
            : 'bg-[var(--accent)] text-[var(--accent-fg)] shadow-clay'
        }`}
      >
        {ctaLabel}
      </button>
    </div>
  );
}

function PricingFeature({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-sm" style={{ color: 'inherit', opacity: 0.95 }}>
      <CheckCircle size={15} className="shrink-0 stroke-[2]" style={{ color: 'var(--accent)' }} />
      <span>{text}</span>
    </li>
  );
}
