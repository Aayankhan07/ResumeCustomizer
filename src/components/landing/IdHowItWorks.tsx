import React from 'react';
import { FileUp, ClipboardList, Download } from 'lucide-react';

const STEPS = [
  {
    icon: FileUp,
    title: 'Upload your resume',
    body: 'Drop in a PDF, DOCX or TXT file, or paste the text. Nothing is rewritten yet.',
  },
  {
    icon: ClipboardList,
    title: 'Add the job',
    body: 'Paste the full job description for the closest match, or just enter the job title.',
  },
  {
    icon: Download,
    title: 'Review and export',
    body: 'Compare every rewritten line with your original, check the match score, then download PDF or DOCX.',
  },
];

export default function IdHowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-28 py-20 md:py-28 px-6 max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
          How it works
        </p>
        <h2 className="mt-3 text-3xl sm:text-5xl font-medium tracking-tight text-slate-900 leading-tight text-balance">
          Three steps, about a minute
        </h2>
      </div>

      <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <li
              key={step.title}
              className="relative bg-slate-50 rounded-3xl p-7 sm:p-8 border border-slate-200/80"
            >
              <div className="flex items-center justify-between">
                <span className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <span className="font-mono text-sm font-semibold text-slate-500" aria-hidden="true">
                  0{idx + 1}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-slate-900">
                <span className="sr-only">Step {idx + 1}: </span>
                {step.title}
              </h3>
              <p className="mt-2 text-base text-slate-600 leading-relaxed">{step.body}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
