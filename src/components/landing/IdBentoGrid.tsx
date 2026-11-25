'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FileText, FileType, MessageSquareText, Mail, ShieldCheck } from 'lucide-react';
import { ClayJack } from './ClayJack';
import { PRIMARY_CTA_LABEL } from './constants';

/**
 * Feature grid. Every card has the same structure: a visual on top, then a
 * title and one or two sentences. Visuals are static illustrations, except the
 * score card, which is an interactive example and says so.
 */

function Card({
  title,
  body,
  children,
  className = '',
}: {
  title: string;
  body: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/80 shadow-[0_10px_30px_rgba(15,23,42,0.04)] flex flex-col relative overflow-hidden ${className}`}
    >
      <div className="flex-1 min-h-[160px] flex items-center">{children}</div>
      <h3 className="mt-7 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-base text-slate-600 leading-relaxed">{body}</p>
    </article>
  );
}

const ALIGNMENT_BARS = [
  { label: 'Role', height: '60%' },
  { label: 'Skills', height: '85%' },
  { label: 'Impact', height: '72%' },
  { label: 'Format', height: '95%' },
];

const SCORES = { before: 48, after: 67 } as const;

function ScoreExample() {
  const [view, setView] = useState<'before' | 'after'>('after');
  const value = SCORES[view];

  return (
    <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          Match score
        </span>
        <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-full px-2.5 py-0.5">
          Try it
        </span>
      </div>
      <p
        className="mt-3 text-5xl font-semibold tracking-tight text-slate-900 tabular-nums"
        aria-live="polite"
      >
        {value}
        <span className="text-2xl text-slate-500">%</span>
      </p>
      <div className="mt-3 h-2 w-full rounded-full bg-slate-200 overflow-hidden" aria-hidden="true">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${view === 'after' ? 'bg-blue-600' : 'bg-slate-400'}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label="Show score">
        {(['before', 'after'] as const).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={view === key}
            onClick={() => setView(key)}
            className={`py-2 text-sm font-semibold rounded-lg transition-colors ${
              view === key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {key === 'before' ? 'Original' : 'Tailored'}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function IdBentoGrid() {
  return (
    <section
      id="features"
      className="scroll-mt-28 py-20 md:py-28 px-6 max-w-7xl mx-auto border-t border-slate-100"
    >
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">Features</p>
        <h2 className="mt-3 text-3xl sm:text-5xl font-medium tracking-tight text-slate-900 leading-tight text-balance">
          Everything you need for one application
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          title="Matched to the job"
          body="Your bullets are reworded around the role's skills and language, so the right experience reads first."
        >
          <div className="w-full relative">
            <div className="absolute -top-8 -right-2 pointer-events-none">
              <ClayJack color="blue" size={56} delay={0.2} rotateOffset={12} />
            </div>
            <div
              className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4"
              aria-hidden="true"
            >
              <div className="flex items-end gap-2 h-24">
                {ALIGNMENT_BARS.map((bar) => (
                  <div
                    key={bar.label}
                    className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
                  >
                    <div className="w-full bg-blue-200 rounded-md" style={{ height: bar.height }} />
                    <span className="text-xs text-slate-600 font-medium">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="Nothing made up"
          body="Employers, dates, degrees and skills come only from your resume. Missing keywords are flagged for you, never added."
        >
          <div
            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5"
            aria-hidden="true"
          >
            {['Employers', 'Dates', 'Degrees', 'Skills'].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2"
              >
                <span className="text-sm font-medium text-slate-700">{item}</span>
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  <ShieldCheck size={14} /> From your resume
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="A score you can check"
          body="The match score is calculated on our server from the job's keywords, for both your original and the tailored version."
        >
          <ScoreExample />
        </Card>

        <Card
          title="More than a resume"
          body="Each run also gives you a cover letter, interview questions for the role, and a recruiter-style scan."
        >
          <ul className="w-full grid grid-cols-2 gap-2.5" aria-hidden="true">
            {[
              { icon: FileText, label: 'PDF resume' },
              { icon: FileType, label: 'DOCX resume' },
              { icon: Mail, label: 'Cover letter' },
              { icon: MessageSquareText, label: 'Interview prep' },
            ].map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-3 text-sm font-medium text-slate-700"
              >
                <Icon size={16} className="text-blue-600 shrink-0" />
                {label}
              </li>
            ))}
          </ul>
        </Card>

        <Card
          title="Full description or just a title"
          body="Paste the whole posting for the closest match. Only have a job title? That works too."
        >
          <div
            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4"
            aria-hidden="true"
          >
            <div className="grid grid-cols-2 gap-1 bg-slate-200/70 rounded-lg p-1 text-sm font-semibold">
              <span className="text-center py-1.5 rounded-md bg-white text-slate-900 shadow-sm">
                Job description
              </span>
              <span className="text-center py-1.5 rounded-md text-slate-600">Job title</span>
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-2.5 rounded-full bg-slate-200 w-full" />
              <div className="h-2.5 rounded-full bg-slate-200 w-11/12" />
              <div className="h-2.5 rounded-full bg-slate-200 w-4/5" />
              <div className="h-2.5 rounded-full bg-slate-200 w-2/3" />
            </div>
          </div>
        </Card>

        <Card
          title="Track where you applied"
          body="Tailored resumes are saved to your history, each with an application status like applied, interviewing or offer."
        >
          <div
            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5"
            aria-hidden="true"
          >
            {[
              {
                role: 'Frontend Engineer',
                status: 'Interviewing',
                tone: 'bg-amber-50 text-amber-800 border-amber-200',
              },
              {
                role: 'Product Designer',
                status: 'Applied',
                tone: 'bg-slate-100 text-slate-700 border-slate-200',
              },
              {
                role: 'Data Analyst',
                status: 'Offer',
                tone: 'bg-emerald-50 text-emerald-800 border-emerald-200',
              },
            ].map((row) => (
              <div
                key={row.role}
                className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2"
              >
                <span className="text-sm font-medium text-slate-700">{row.role}</span>
                <span
                  className={`text-xs font-semibold border rounded-full px-2.5 py-0.5 ${row.tone}`}
                >
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href="/transform"
          className="inline-flex items-center gap-2 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all px-6 py-3 rounded-full shadow-[0_4px_14px_rgba(37,99,235,0.3)]"
        >
          {PRIMARY_CTA_LABEL}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
