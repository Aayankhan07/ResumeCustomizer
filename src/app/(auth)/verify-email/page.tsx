'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function VerifyEmail() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex items-center justify-center p-4 relative overflow-hidden select-none font-sans animate-fade-in transition-colors duration-300">
      {/* Decorative spotlights */}
      <div className="absolute top-0 left-0 right-0 h-[450px] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[color-mix(in_srgb,var(--accent)_8%,transparent)] via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[color-mix(in_srgb,var(--accent)_4%,transparent)] rounded-full blur-[100px] pointer-events-none" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293704_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-40" />

      <div className="w-full max-w-md border border-[var(--border-default)] bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] p-8 sm:p-10 shadow-lg relative z-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />

        <Link href="/" className="inline-flex items-center gap-2 font-serif text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-6">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-center">
            <Sparkles size={16} className="text-[var(--accent)] fill-[var(--accent)]/10" />
          </div>
          <span>ResumOrph</span>
        </Link>

        <div className="w-16 h-16 bg-[var(--bg-subtle)] border border-[var(--border-default)] text-[var(--accent)] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l8-4.8a2 2 0 012.22 0l8 4.8A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
          </svg>
        </div>

        <h2 className="font-serif text-2xl text-[var(--text-primary)] font-bold mb-2">Check Your Inbox</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
          We've sent a verification link to your email address. Please click the link to confirm your account and log in.
        </p>
        
        <Link href="/login" className="block w-full">
          <button className="btn-primary w-full py-2.5">
            Proceed to Login
          </button>
        </Link>
      </div>
    </div>
  );
}
