'use client';

import React, { useEffect } from 'react';
import Lenis from 'lenis';
import { toast } from 'sonner';
import IdNavbar from './IdNavbar';
import IdHero from './IdHero';
import IdHowItWorks from './IdHowItWorks';
import IdDemo from './IdDemo';
import IdBentoGrid from './IdBentoGrid';
import IdMetrics from './IdMetrics';
import IdPrivacy from './IdPrivacy';
import IdFaq from './IdFaq';
import IdFinalCta from './IdFinalCta';
import IdFooter from './IdFooter';

export interface LandingStats {
  total_transformations: number;
  total_users: number;
}

interface LandingClientProps {
  /** Null when the stats could not be loaded; the metrics section then hides the counts. */
  initialStats: LandingStats | null;
}

export default function LandingClient({ initialStats }: LandingClientProps) {
  // Confirmation after account deletion (profile page redirects here).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('account') !== 'deleted') return;
    toast.success('Your account and all of its data have been deleted.');
    params.delete('account');
    const query = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (query ? `?${query}` : ''));
  }, []);

  // Inertial smooth scroll, skipped entirely for visitors who ask for reduced
  // motion. `anchors` routes in-page hash links through Lenis so nav links
  // still land on their section.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      anchors: { offset: -96 },
    });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    // Outer frame. Below `sm` the padding and rounding are dropped so small
    // screens get the full width.
    <div className="min-h-screen bg-white sm:bg-[#E5E6EA] sm:p-4 md:p-6 lg:p-8 font-sans selection:bg-blue-600 selection:text-white">
      <div className="w-full bg-white sm:rounded-[36px] md:rounded-[44px] sm:shadow-[0_25px_60px_-15px_rgba(15,23,42,0.08)] sm:border sm:border-slate-200/60 overflow-hidden relative">
        <IdNavbar />
        <main>
          <IdHero />
          <IdHowItWorks />
          <IdDemo />
          <IdBentoGrid />
          <IdMetrics stats={initialStats} />
          <IdPrivacy />
          <IdFaq />
          <IdFinalCta />
        </main>
        <IdFooter />
      </div>
    </div>
  );
}
