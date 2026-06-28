import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-elevated)] text-[var(--text-secondary)] py-16 border-t border-[var(--border-default)] select-none relative overflow-hidden transition-colors duration-300">
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent z-10" />
      
      {/* Background Grid Pattern & Ambient Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border-default)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-default)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-[0.03] dark:opacity-[0.015]" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[color-mix(in_srgb,var(--accent)_5%,transparent)] rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[var(--border-default)]/60">
          {/* Brand Info */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-center">
                <Sparkles size={12} className="text-[var(--accent)] fill-[var(--accent)]/10" />
              </div>
              <span className="font-serif text-[var(--text-primary)] text-lg font-bold tracking-tight">ResumOrph</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)]/85 max-w-sm leading-relaxed">
              Tailoring applicant profiles with advanced agentic keyword alignment in seconds. Optimize your resume for modern ATS systems.
            </p>
          </div>

          {/* Column 2: Product */}
          <div className="md:col-span-2 md:col-start-7">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4 font-sans">Product</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors duration-200">Dashboard</Link>
              </li>
              <li>
                <Link href="/transform" className="hover:text-[var(--text-primary)] transition-colors duration-200">Transform CV</Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-[var(--text-primary)] transition-colors duration-200">Profile Settings</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4 font-sans">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="hover:text-[var(--text-primary)] transition-colors duration-200">Privacy Policy</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[var(--text-primary)] transition-colors duration-200">Terms of Service</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4 font-sans">Connect</h4>
            <div className="flex gap-4">
              <a href="#" aria-label="GitHub" className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-center hover:text-[var(--text-primary)] hover:border-[var(--text-primary)]/20 transition-all duration-200">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-center hover:text-[var(--text-primary)] hover:border-[var(--text-primary)]/20 transition-all duration-200">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a href="#" aria-label="Email" className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-center hover:text-[var(--text-primary)] hover:border-[var(--text-primary)]/20 transition-all duration-200">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[var(--text-muted)]">
          <span>&copy; {new Date().getFullYear()} ResumOrph. All rights reserved.</span>
          <span>Engineered for modern career growth.</span>
        </div>
      </div>
    </footer>
  );
}
