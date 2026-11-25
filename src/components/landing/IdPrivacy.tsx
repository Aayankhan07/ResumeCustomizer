import React from 'react';
import Link from 'next/link';
import { Ban, Database, Trash2, Lock } from 'lucide-react';

const FACTS = [
  {
    icon: Ban,
    title: 'Your raw resume is not stored',
    body: 'The resume and job description you submit are used for the run and are not saved in our database. We keep only their lengths.',
  },
  {
    icon: Database,
    title: 'Only the result is saved',
    body: 'The tailored output is saved to your account so you can download it again and track the application.',
  },
  {
    icon: Trash2,
    title: 'Delete it whenever you want',
    body: 'Remove any saved result from your history at any time. You can also ask us to remove your account and everything tied to it.',
  },
  {
    icon: Lock,
    title: 'Private to you',
    body: 'Saved results are protected by row-level security, so only your signed-in account can read them.',
  },
];

export default function IdPrivacy() {
  return (
    <section
      id="privacy"
      className="scroll-mt-28 py-20 md:py-28 px-6 max-w-7xl mx-auto border-t border-slate-100"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-12 lg:gap-16 items-start">
        <div className="lg:sticky lg:top-32">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">Privacy</p>
          <h2 className="mt-3 text-3xl sm:text-5xl font-medium tracking-tight text-slate-900 leading-tight text-balance">
            Your resume stays yours
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-md">
            A resume holds your work history and contact details. Here is exactly what we keep and
            what we don&apos;t.
          </p>
          <Link
            href="/privacy"
            className="mt-6 inline-flex text-base font-semibold text-blue-700 hover:text-blue-800 underline underline-offset-4 decoration-blue-200 hover:decoration-blue-700"
          >
            Read the privacy policy
          </Link>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FACTS.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="bg-slate-50 rounded-3xl p-6 sm:p-7 border border-slate-200/80"
            >
              <span className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-blue-600">
                <Icon size={20} aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-base text-slate-600 leading-relaxed">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
