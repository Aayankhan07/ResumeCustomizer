import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  title: string;
  updated: string;
  children: React.ReactNode;
}

/** Shared shell for the plain-text legal pages (privacy, terms). */
export default function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-white text-slate-700">
      <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to ResumOrph
        </Link>
        <h1 className="mt-8 text-4xl sm:text-5xl font-medium tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-3 text-sm text-slate-500">Last updated {updated}</p>
        <div className="mt-10 space-y-8 text-base leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-blue-700 [&_a]:underline">
          {children}
        </div>
      </div>
    </div>
  );
}
