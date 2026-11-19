'use client';

import React, { useEffect } from 'react';
import Lenis from 'lenis';
import IdNavbar from './IdNavbar';
import IdHero from './IdHero';
import IdInlineStatement from './IdInlineStatement';
import IdBentoGrid from './IdBentoGrid';
import IdMetrics from './IdMetrics';
import IdCaseStudies from './IdCaseStudies';
import IdFooter from './IdFooter';

interface LandingClientProps {
  initialStats?: {
    total_transformations: number;
    total_users: number;
  };
}

export default function LandingClient({ initialStats }: LandingClientProps) {
  // Initialize Lenis smooth scroll for inertial luxury scrolling (matching video feel)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    // Outer Luxury Frame (Warm Gray canvas matching the video container)
    <div className="min-h-screen bg-[#E5E6EA] p-2 sm:p-4 md:p-6 lg:p-8 font-sans selection:bg-blue-600 selection:text-white">
      {/* Inner Elevated Pristine White Stage with Soft Ambient Shadow */}
      <div className="w-full bg-white rounded-[28px] sm:rounded-[36px] md:rounded-[44px] shadow-[0_25px_60px_-15px_rgba(15,23,42,0.08)] border border-slate-200/60 overflow-hidden relative">
        <IdNavbar />
        <main>
          <IdHero />
          <IdInlineStatement />
          <IdBentoGrid />
          <IdMetrics />
          <IdCaseStudies />
        </main>
        <IdFooter />
      </div>
    </div>
  );
}
