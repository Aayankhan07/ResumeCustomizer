import React from 'react';
import type { LandingStats } from './LandingClient';

/**
 * Only figures the product actually records. The counts come from the
 * `usage_stats` table; the timing figure is the typical run time of a single
 * tailoring request. When stats are unavailable the counts are left out
 * rather than replaced with placeholder numbers.
 *
 * Small counts read as a negative signal, so each count only shows once it
 * passes a threshold, and the whole section hides until at least one does.
 */

const MIN_TRANSFORMATIONS = 1000;
const MIN_USERS = 250;

interface Metric {
  value: string;
  label: string;
  detail: string;
}

function formatCount(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

export default function IdMetrics({ stats }: { stats: LandingStats | null }) {
  const metrics: Metric[] = [];

  if (stats && stats.total_transformations >= MIN_TRANSFORMATIONS) {
    metrics.push({
      value: formatCount(stats.total_transformations),
      label: 'Resumes tailored',
      detail: 'Counted from every completed tailoring run.',
    });
  }
  if (stats && stats.total_users >= MIN_USERS) {
    metrics.push({
      value: formatCount(stats.total_users),
      label: 'People signed up',
      detail: 'Accounts created to tailor and save resumes.',
    });
  }
  // Run time alone is not a section; it is already stated in the hero.
  if (metrics.length === 0) return null;

  metrics.push({
    value: '~60s',
    label: 'Typical run time',
    detail: 'From submitting your resume and job to a full result, including the cover letter.',
  });

  const gridCols =
    metrics.length === 3
      ? 'md:grid-cols-3'
      : metrics.length === 2
        ? 'md:grid-cols-2'
        : 'md:grid-cols-1';

  return (
    <section
      id="metrics"
      className="scroll-mt-28 py-20 md:py-28 px-6 max-w-7xl mx-auto border-t border-slate-100"
    >
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
          By the numbers
        </p>
        <h2 className="mt-3 text-3xl sm:text-5xl font-medium tracking-tight text-slate-900 leading-tight text-balance">
          Used for real applications
        </h2>
      </div>

      <dl className={`grid grid-cols-1 ${gridCols} gap-6 max-w-5xl mx-auto`}>
        {metrics.map((item) => (
          <div
            key={item.label}
            className="flex flex-col bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/80 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
          >
            <dt className="text-base sm:text-lg font-semibold text-slate-900 mt-4 order-2">
              {item.label}
            </dt>
            <dd className="text-5xl sm:text-6xl font-semibold tracking-tight text-slate-900 leading-none tabular-nums order-1">
              {item.value}
            </dd>
            <dd className="order-3 mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
              {item.detail}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
