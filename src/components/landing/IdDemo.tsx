import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * Static before/after example. Everything here is illustrative and labelled
 * as such: it shows what the output looks like, not a measured result.
 */

type Segment = { text: string; keyword?: boolean };

const BEFORE_BULLETS = [
  'Worked on the company website using React and TypeScript, fixed bugs.',
  'Helped the team move our site over to Next.js.',
];

// Only facts from the original bullets appear here, reworded and with the
// job's own terms. No new numbers, tools or responsibilities.
const AFTER_BULLETS: Segment[][] = [
  [
    { text: 'Built and maintained customer-facing pages in ' },
    { text: 'React', keyword: true },
    { text: ' and ' },
    { text: 'TypeScript', keyword: true },
    { text: ', resolving production UI bugs.' },
  ],
  [
    { text: 'Contributed to migrating the company site to ' },
    { text: 'Next.js', keyword: true },
    { text: ' as part of the ' },
    { text: 'frontend', keyword: true },
    { text: ' team.' },
  ],
];

const KEYWORDS = ['React', 'TypeScript', 'Next.js', 'frontend', 'accessibility', 'testing'];
const MATCHED = new Set(['React', 'TypeScript', 'Next.js', 'frontend']);

function ScoreBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'muted' | 'accent';
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <span
          className={`text-2xl font-semibold tabular-nums ${tone === 'accent' ? 'text-blue-700' : 'text-slate-700'}`}
        >
          {value}%
        </span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden" aria-hidden="true">
        <div
          className={`h-full rounded-full ${tone === 'accent' ? 'bg-blue-600' : 'bg-slate-400'}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function IdDemo() {
  return (
    <section
      id="demo"
      className="scroll-mt-28 py-20 md:py-28 px-6 max-w-6xl mx-auto border-t border-slate-100"
    >
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
          See the difference
        </p>
        <h2 className="mt-3 text-3xl sm:text-5xl font-medium tracking-tight text-slate-900 leading-tight text-balance">
          Same experience, written for the role
        </h2>
        <p className="mt-4 text-base text-slate-600 leading-relaxed">
          Every rewrite keeps your facts. You see each change next to the original before you
          export.
        </p>
      </div>

      <figure className="rounded-3xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)] overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 border-b border-slate-100 bg-slate-50">
          <span className="text-sm font-semibold text-slate-800">Target: Frontend Engineer</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 rounded-full px-3 py-1">
            Example
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr]">
          <div className="p-6 sm:p-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Your original
            </h3>
            <ul className="mt-4 space-y-3">
              {BEFORE_BULLETS.map((bullet) => (
                <li key={bullet} className="flex gap-3 text-base text-slate-600 leading-relaxed">
                  <span
                    className="mt-2.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"
                    aria-hidden="true"
                  />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden lg:flex items-center px-2" aria-hidden="true">
            <span className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <ArrowRight size={18} />
            </span>
          </div>

          <div className="p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-slate-100 bg-blue-50/30">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Tailored
            </h3>
            <ul className="mt-4 space-y-3">
              {AFTER_BULLETS.map((segments, idx) => (
                <li key={idx} className="flex gap-3 text-base text-slate-800 leading-relaxed">
                  <span
                    className="mt-2.5 w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"
                    aria-hidden="true"
                  />
                  <span>
                    {segments.map((seg, i) =>
                      seg.keyword ? (
                        <mark
                          key={i}
                          className="bg-blue-100 text-blue-900 rounded px-1 font-medium"
                        >
                          {seg.text}
                        </mark>
                      ) : (
                        <React.Fragment key={i}>{seg.text}</React.Fragment>
                      )
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6 sm:px-8 py-6 border-t border-slate-100 bg-slate-50">
          <div className="space-y-4">
            <ScoreBar label="Match score before" value={48} tone="muted" />
            <ScoreBar label="Match score after" value={67} tone="accent" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-600">Job keywords</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {KEYWORDS.map((kw) => {
                const matched = MATCHED.has(kw);
                return (
                  <li
                    key={kw}
                    className={`text-sm rounded-full px-3 py-1 border ${
                      matched
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-white border-amber-300 text-amber-800'
                    }`}
                  >
                    <span className="sr-only">{matched ? 'Matched: ' : 'Missing: '}</span>
                    {kw}
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-sm text-slate-600">
              Missing keywords are listed, not invented. If you don&apos;t have the skill, it stays
              out.
            </p>
          </div>
        </div>

        <figcaption className="px-6 sm:px-8 py-4 border-t border-slate-100 text-sm text-slate-500">
          Illustrative example. Your scores depend on your resume and the job description.
        </figcaption>
      </figure>
    </section>
  );
}
