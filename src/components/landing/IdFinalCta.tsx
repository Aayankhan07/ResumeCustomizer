import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FREE_TIER_LINE, PRIMARY_CTA_LABEL } from './constants';

export default function IdFinalCta() {
  return (
    <section className="px-4 sm:px-6 pb-20 md:pb-28 max-w-7xl mx-auto">
      <div className="rounded-[32px] bg-slate-900 px-6 py-14 sm:px-12 sm:py-20 text-center">
        <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-white leading-tight text-balance">
          Tailor your next application
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
          Upload your resume, add the job, and get a version written for that role in about a
          minute.
        </p>
        <Link
          href="/transform"
          className="mt-9 inline-flex items-center gap-2 text-base font-semibold text-slate-900 bg-white hover:bg-blue-50 active:scale-95 transition-all px-7 py-3.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          {PRIMARY_CTA_LABEL}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <p className="mt-5 text-sm text-slate-300">{FREE_TIER_LINE}</p>
      </div>
    </section>
  );
}
