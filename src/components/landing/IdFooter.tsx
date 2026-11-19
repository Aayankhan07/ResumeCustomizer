'use client';

import React from 'react';
import Link from 'next/link';

export default function IdFooter() {
  return (
      <footer className="pt-16 pb-12 px-6 max-w-7xl mx-auto border-t border-slate-100 select-none">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <span className="font-semibold text-lg text-slate-900 tracking-tight">
                ResumOrph
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
              AI-powered resume tailoring. Rewriting experience to match role requirements with zero fabrication.
            </p>
          </div>

          {/* Clean Link Columns Grounded in ResumOrph Features */}
          <div className="flex flex-wrap gap-10 sm:gap-16 text-xs font-medium text-slate-600">
            <div className="flex flex-col gap-2.5">
              <span className="font-semibold text-slate-900 uppercase tracking-wider text-xs">Product</span>
              <Link href="/transform" className="hover:text-blue-600 transition-colors">Resume Tailor</Link>
              <Link href="/transform" className="hover:text-blue-600 transition-colors">ATS Keyword Scanner</Link>
              <Link href="/transform" className="hover:text-blue-600 transition-colors">Cover Letter Generator</Link>
              <Link href="/transform" className="hover:text-blue-600 transition-colors">Interview Prep</Link>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="font-semibold text-slate-900 uppercase tracking-wider text-xs">Solutions</span>
              <a href="#approach" className="hover:text-blue-600 transition-colors">How It Works</a>
              <a href="#technology" className="hover:text-blue-600 transition-colors">ATS Engine</a>
              <a href="#metrics" className="hover:text-blue-600 transition-colors">Match Scoring</a>
              <a href="#insights" className="hover:text-blue-600 transition-colors">Guides</a>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="font-semibold text-slate-900 uppercase tracking-wider text-xs">Legal & Privacy</span>
              <Link href="/profile" className="hover:text-blue-600 transition-colors">Privacy Guarantee</Link>
              <Link href="/profile" className="hover:text-blue-600 transition-colors">Data Retention Policy</Link>
              <Link href="/profile" className="hover:text-blue-600 transition-colors">Zero-Fabrication Terms</Link>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} ResumOrph. All rights reserved. Free tier: 10 optimizations / hour.</p>
          <p>Built with Groq LLaMA 3.3 70B & ATS Precision Scoring.</p>
        </div>
      </footer>
      );
}
