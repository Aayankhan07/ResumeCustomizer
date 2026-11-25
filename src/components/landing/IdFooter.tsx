import React from 'react';
import Link from 'next/link';
import { BrandMark } from './IdNavbar';
import { SECTION_LINKS } from './constants';

const linkClass = 'hover:text-blue-700 transition-colors';

export default function IdFooter() {
  return (
    <footer className="pt-16 pb-12 px-6 max-w-7xl mx-auto border-t border-slate-100">
      <div className="flex flex-col md:flex-row items-start justify-between gap-10 pb-12 border-b border-slate-100">
        <div>
          <BrandMark size="lg" />
          <p className="text-sm text-slate-600 mt-3 max-w-xs leading-relaxed">
            Tailors your resume to each job description, using only the experience you already have.
          </p>
        </div>

        <div className="flex flex-wrap gap-12 sm:gap-16 text-sm text-slate-600">
          <nav aria-label="Product" className="flex flex-col gap-3">
            <span className="font-semibold text-slate-900 uppercase tracking-wider text-xs">
              Product
            </span>
            <Link href="/transform" className={linkClass}>
              Tailor a resume
            </Link>
            <Link href="/dashboard" className={linkClass}>
              Dashboard
            </Link>
            <Link href="/login" className={linkClass}>
              Sign in
            </Link>
          </nav>
          <nav aria-label="On this page" className="flex flex-col gap-3">
            <span className="font-semibold text-slate-900 uppercase tracking-wider text-xs">
              On this page
            </span>
            {SECTION_LINKS.map((link) => (
              <a key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </a>
            ))}
          </nav>
          <nav aria-label="Legal" className="flex flex-col gap-3">
            <span className="font-semibold text-slate-900 uppercase tracking-wider text-xs">
              Legal
            </span>
            <Link href="/privacy" className={linkClass}>
              Privacy policy
            </Link>
            <Link href="/terms" className={linkClass}>
              Terms of service
            </Link>
          </nav>
        </div>
      </div>

      <p className="pt-8 text-sm text-slate-500">
        © {new Date().getFullYear()} ResumOrph. All rights reserved.
      </p>
    </footer>
  );
}
