'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PRIMARY_CTA_LABEL, SECTION_LINKS } from './constants';

export function BrandMark({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-sm"
        aria-hidden="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </span>
      <span
        className={`font-semibold text-slate-900 tracking-tight ${size === 'lg' ? 'text-lg' : 'text-[17px]'}`}
      >
        ResumOrph
      </span>
    </span>
  );
}

export default function IdNavbar() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const closeMenu = (returnFocus = false) => {
    setMenuOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  };

  // While the drawer is open: Escape closes it, Tab stays inside it, and a
  // resize to desktop width closes it.
  useEffect(() => {
    if (!menuOpen) return;

    const drawer = drawerRef.current;
    drawer?.querySelector<HTMLElement>('a, button')?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu(true);
        return;
      }
      if (e.key !== 'Tab' || !drawer) return;
      const focusable = Array.from(drawer.querySelectorAll<HTMLElement>('a, button'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [menuOpen]);

  return (
    <header className="fixed top-3 sm:top-6 left-0 right-0 z-50 px-3 sm:px-8 max-w-7xl mx-auto">
      <div className="w-full bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_10px_35px_-8px_rgba(15,23,42,0.08)] rounded-full pl-4 pr-2 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between">
        <Link
          href="/"
          aria-label="ResumOrph home"
          className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <BrandMark />
        </Link>

        <nav
          aria-label="Sections"
          className="hidden lg:flex items-center gap-1 text-[13px] whitespace-nowrap font-medium text-slate-600 bg-slate-100/70 p-1 rounded-full border border-slate-200/50"
        >
          {SECTION_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-1.5 rounded-full hover:text-slate-950 hover:bg-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all px-4 py-2 rounded-full shadow-[0_4px_14px_rgba(37,99,235,0.3)]"
            >
              Dashboard
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-block whitespace-nowrap text-sm font-semibold text-slate-700 hover:text-slate-950 px-3 py-1.5 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/transform"
                className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all px-4 sm:px-5 py-2 rounded-full shadow-[0_4px_14px_rgba(37,99,235,0.3)]"
              >
                {PRIMARY_CTA_LABEL}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </>
          )}

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-950 rounded-full"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-menu"
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="landing-mobile-menu"
          ref={drawerRef}
          className="lg:hidden absolute top-16 left-3 right-3 bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl flex flex-col gap-1"
        >
          <nav aria-label="Sections" className="flex flex-col">
            {SECTION_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => closeMenu()}
                className="text-base font-medium text-slate-700 hover:text-blue-600 py-2.5"
              >
                {link.label}
              </a>
            ))}
          </nav>
          {!user && (
            <div className="pt-3 mt-2 border-t border-slate-100">
              <Link
                href="/login"
                onClick={() => closeMenu()}
                className="block text-center text-sm font-semibold text-slate-700 py-2.5"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
