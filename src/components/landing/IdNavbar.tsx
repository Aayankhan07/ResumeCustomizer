'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Menu, X, FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function IdNavbar() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-6 left-0 right-0 z-50 px-4 sm:px-8 max-w-7xl mx-auto flex items-center justify-between">
        {/* Floating Capsule Bar (Matching inspo video) */}
        <div className="w-full bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_10px_35px_-8px_rgba(15,23,42,0.08)] rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between">

          {/* Left: Brand Mark */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <span className="font-semibold text-[17px] text-slate-900 tracking-tight">
              ResumOrph
            </span>
          </Link>

          {/* Center: Resume Tailoring Segmented Pill Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-[13px] font-medium text-slate-600 bg-slate-100/70 p-1 rounded-full border border-slate-200/50">
            <a
              href="#technology"
              className="px-4 py-1.5 rounded-full hover:text-slate-950 hover:bg-white transition-all"
            >
              How it Works
            </a>
            <a
              href="#technology"
              className="px-4 py-1.5 rounded-full hover:text-slate-950 hover:bg-white transition-all"
            >
              ATS Engine
            </a>
            <a
              href="#metrics"
              className="px-4 py-1.5 rounded-full hover:text-slate-950 hover:bg-white transition-all"
            >
              Match Scores
            </a>
                          <a
                href="#metrics"
                className="px-4 py-1.5 rounded-full hover:text-slate-950 hover:bg-white transition-all"
            >
              Resume Guides
            </a>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
              {/* ATS Safe Badge */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>ATS-Ready</span>
              </div>

              {user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all px-4 py-2 rounded-full shadow-[0_4px_14px_rgba(37,99,235,0.3)]"
                >
                  Dashboard
                  <ArrowRight size={13} />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:inline-block text-xs font-semibold text-slate-700 hover:text-slate-950 px-3 py-1.5 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all px-4 sm:px-5 py-2 rounded-full shadow-[0_4px_14px_rgba(37,99,235,0.3)]"
                  >
                    Tailor Resume
                    <ArrowRight size={13} />
                  </Link>
                </>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 text-slate-600 hover:text-slate-950 rounded-lg"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-4 right-4 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl p-5 shadow-2xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <a
                href="#technology"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 hover:text-blue-600 py-1"
              >
                How it Works
              </a>
              <a
                href="#technology"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 hover:text-blue-600 py-1"
              >
                ATS Engine
              </a>
              <a
                href="#metrics"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 hover:text-blue-600 py-1"
              >
                Match Scores
              </a>
              <a
                href="#metrics"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 hover:text-blue-600 py-1"
              >
                Resume Guides
              </a>
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-sm font-medium text-slate-600 py-2"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-sm font-semibold text-white bg-blue-600 py-2.5 rounded-full shadow-md"
                >
                  Tailor Resume
                </Link>
              </div>
            </div>
          )}
        </header>
        );
}
