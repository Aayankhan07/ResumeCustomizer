'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import {
  TargetTileIcon,
  HourglassTileIcon,
  LightbulbTileIcon,
  ArrowTileIcon,
  ClockTileIcon,
  DocumentTileIcon,
} from './ChronoLandingIcons';

/**
 * Section 6 — Playful Floating Clay Footer (per plan).
 *
 * Top footer area:
 * - Left: brand logo + catchphrase "Stay organized and boost your job search"
 * - Right: multi-column clean links (Product, Solutions, Integrations, Pricing, Company)
 *
 * Bottom canvas / interactive tray:
 * - Subtle textured rounded surface filled with floating 3D clay tiles
 *   (document icon, hourglass, target flag, lightbulb, arrow widgets, clock)
 *
 * Bottom bar: copyright & legal links (Privacy Policy, Terms of Service).
 *
 * This replaces the landing page's footer when the plan is active. All links stay
 * within scope: no new routes, no external account claims.
 */
export default function ChronoFooter() {
  return (
    <footer className="bg-[var(--bg-elevated)] text-[var(--text-secondary)] py-14 relative overflow-hidden transition-colors duration-300">
      {/* Subtle top accent — soft, not loud. */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent z-10" />

      {/* Soft textured canvas behind the clay tiles at the bottom. */}
      <div
        className="absolute -bottom-20 left-0 right-0 h-40 rounded-t-3xl dot-grid pointer-events-none"
        style={{ opacity: 0.35 }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Top footer area: brand + links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12">
          {/* Brand Info */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-center shadow-clay-subtle">
                <Sparkles size={12} className="text-[var(--accent)] fill-[var(--accent)]/10" />
              </div>
              <span className="font-serif text-[var(--text-primary)] text-lg font-bold tracking-tight">
                ResumOrph
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)]/85 max-w-sm leading-relaxed">
              Stay organized and boost your job search.
            </p>
          </div>

          {/* Product */}
          <div className="md:col-span-2 md:col-start-7">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4 font-sans">
              Product
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-[var(--text-primary)] transition-colors duration-200"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/transform"
                  className="hover:text-[var(--text-primary)] transition-colors duration-200"
                >
                  Transform CV
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="hover:text-[var(--text-primary)] transition-colors duration-200"
                >
                  Profile Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4 font-sans">
              Solutions
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#features"
                  className="hover:text-[var(--text-primary)] transition-colors duration-200"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-[var(--text-primary)] transition-colors duration-200"
                >
                  How it works
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-[var(--text-primary)] transition-colors duration-200"
                >
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Integrations */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4 font-sans">
              Integrations
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-[var(--text-primary)] transition-colors duration-200"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[var(--text-primary)] transition-colors duration-200"
                >
                  Indeed
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[var(--text-primary)] transition-colors duration-200"
                >
                  Greenhouse
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[var(--text-primary)] transition-colors duration-200"
                >
                  Lever
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4 font-sans">
              Company
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-[var(--text-primary)] transition-colors duration-200"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[var(--text-primary)] transition-colors duration-200"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Quiet clay tile strip behind the copyright bar. */}
        <div
          className="relative rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] py-3 px-4 shadow-clay-subtle overflow-hidden"
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <ClayTileRow icons={[DocumentTileIcon, HourglassTileIcon, TargetTileIcon, LightbulbTileIcon, ArrowTileIcon, ClockTileIcon]} />
          </div>
        </div>

        {/* Bottom bar: copyright + legal */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[var(--text-muted)]">
          <span>&copy; {new Date().getFullYear()} ResumOrph. All rights reserved.</span>
          <span>Built for the job search, not the perfect cover letter.</span>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="hover:text-[var(--text-primary)] transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-[var(--text-primary)] transition-colors duration-200"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ClayTileRow({ icons }: { icons: typeof DocumentTileIcon[] }) {
  return (
    <div className="flex gap-2 flex-wrap px-1">
      {icons.map((Icon, idx) => (
        <div
          key={idx}
          className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] p-1.5 flex items-center justify-center shadow-clay-subtle"
        >
          <Icon className="w-5 h-5 text-[var(--text-muted)]" />
        </div>
      ))}
    </div>
  );
}
