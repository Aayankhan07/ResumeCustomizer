import Link from 'next/link';
import { Sparkles, Github, Linkedin, Mail } from 'lucide-react';

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
                <Github size={14} />
              </a>
              <a href="#" aria-label="LinkedIn" className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-center hover:text-[var(--text-primary)] hover:border-[var(--text-primary)]/20 transition-all duration-200">
                <Linkedin size={14} />
              </a>
              <a href="#" aria-label="Email" className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-center hover:text-[var(--text-primary)] hover:border-[var(--text-primary)]/20 transition-all duration-200">
                <Mail size={14} />
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
