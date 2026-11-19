'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ChronoHeroDecorations from './ChronoHeroDecorations';

/**
 * Section 1 (hero) per the plan.
 *
 * Keeps the honest, plan-aligned copy, the existing ease-of-starting CTA, and
 * the same underlying account-aware routing. The eye-catching parts come from
 * the floating decorative widgets around it.
 */
export default function ChronoHero() {
  return (
    <section className="relative py-24 lg:py-32 flex flex-col items-center justify-center text-center px-6 overflow-hidden page-center">
      {/* One faint dot-grid texture + ambient glow, theme-aware. */}
      <div
        className="absolute inset-0 pointer-events-none z-0 dot-grid"
        style={{ opacity: 0.10 }}
      />
      <div
        className="absolute top-12 left-1/2 -translate-x-1/2 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
          filter: 'blur(80px)',
        }}
      />

      <div className="max-w-4xl mx-auto flex flex-col items-center z-10 relative">
        {/* Top badge / eyebrow — single short pill above the headline */}
        <span className="pill-badge pill-badge-accent mb-8 inline-flex items-center gap-2">
          <GridCubeBadge />
          <span className="tracking-wider">ATS Tailoring</span>
        </span>

        {/* Headline — high-impact, clean typography */}
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] max-w-3xl tracking-tight">
          Craft, tailor, and track{' '}
          <br />
          <span className="text-[var(--accent)]">your resumes all in one place</span>
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg text-[var(--text-secondary)] mt-6 max-w-xl leading-relaxed font-medium">
          Effortlessly customize your resume to any job description and boost your
          interview rates.
        </p>

        {/* Main CTA — vibrant pill button with subtle glow */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-10 w-full sm:w-auto">
          <Link href="/signup" className="w-full sm:w-auto">
            <button className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-8 text-sm shadow-accent-glow">
              Tailor for Free
              <ArrowRight size={14} className="stroke-[2.5]" />
            </button>
          </Link>
          <a href="#how-it-works" className="w-full sm:w-auto">
            <button className="btn-ghost w-full sm:w-auto py-3 px-8 text-sm">
              How it works
            </button>
          </a>
        </div>

                  <span className="text-sm text-[var(--text-muted)] mt-5 font-mono">
            
          Free to start. Up to 10 optimizations per hour.
        </span>
      </div>

      {/* Quiet accent behind the hero: one pinned note, kept subtle. */}
      <ChronoHeroDecorations />
    </section>
  );
}

function GridCubeBadge() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      style={{ transform: 'rotate(8deg)' }}
    >
      <rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor" opacity="0.95" />
      <rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor" opacity="0.45" />
    </svg>
  );
}
