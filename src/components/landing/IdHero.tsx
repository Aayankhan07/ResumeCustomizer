'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Upload } from 'lucide-react';
import { ClayJack } from './ClayJack';
import { trackEvent } from '../../utils/analytics';

// The ATS platforms and companies ResumOrph resumes pass through
const ATS_PARTNERS = [
  'Greenhouse',
  'Lever',
  'Workday',
  'iCIMS',
  'Taleo',
  'Google',
  'Stripe',
  'Amazon',
  'Microsoft',
];

export default function IdHero() {
  const [targetJobRole, setTargetJobRole] = useState('');

  // Mouse parallax motion for floating 3D organic shapes
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Parallax transforms for left and right clusters
  const leftX = useTransform(smoothX, [-400, 400], [-25, 25]);
  const leftY = useTransform(smoothY, [-400, 400], [-20, 20]);
  const leftRotate = useTransform(smoothX, [-400, 400], [-8, 8]);

  const rightX = useTransform(smoothX, [-400, 400], [25, -25]);
  const rightY = useTransform(smoothY, [-400, 400], [20, -20]);
  const rightRotate = useTransform(smoothX, [-400, 400], [8, -8]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX.set(e.clientX - innerWidth / 2);
      mouseY.set(e.clientY - innerHeight / 2);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const handleCta = () => {
    trackEvent('hero_cta_clicked', { cta: 'id_hero_tailor', value: targetJobRole });
  };

  return (
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden flex flex-col items-center justify-center text-center select-none">
        {/* ============================================================== */}
        {/* 3D ORGANIC CLAY SCULPTURES (LEFT CLUSTER)                      */}
        {/* ============================================================== */}
        <motion.div
          style={{ x: leftX, y: leftY, rotate: leftRotate }}
          className="absolute -left-12 sm:left-4 lg:left-12 top-1/2 -translate-y-1/2 pointer-events-none z-10 hidden sm:block"
        >
          <div className="relative w-56 h-72">
            {/* Frosted blurred shape in deep background */}
            <div className="absolute top-0 left-6 filter blur-[6px] opacity-60">
              <ClayJack color="white" size={130} delay={1} rotateOffset={15} />
            </div>

            {/* Terracotta/Coral main organic sculpture */}
            <div className="absolute top-14 -left-4">
              <ClayJack color="coral" size={160} delay={0.2} rotateOffset={-10} />
            </div>

            {/* Foreground Pearl White smooth jack */}
            <div className="absolute bottom-2 left-8">
              <ClayJack color="white" size={150} delay={0.6} rotateOffset={35} />
            </div>
          </div>
        </motion.div>

        {/* ============================================================== */}
        {/* 3D ORGANIC CLAY SCULPTURES (RIGHT CLUSTER)                     */}
        {/* ============================================================== */}
        <motion.div
          style={{ x: rightX, y: rightY, rotate: rightRotate }}
          className="absolute -right-12 sm:right-4 lg:right-12 top-1/2 -translate-y-1/2 pointer-events-none z-10 hidden sm:block"
        >
          <div className="relative w-56 h-72">
            {/* Frosted deep blue/sky blurred shape in background */}
            <div className="absolute top-2 right-4 filter blur-[6px] opacity-70">
              <ClayJack color="blue" size={120} delay={0.8} rotateOffset={-20} />
            </div>

            {/* Terracotta/Coral accent jack */}
            <div className="absolute top-16 right-0">
              <ClayJack color="coral" size={155} delay={0.4} rotateOffset={20} />
            </div>

            {/* Foreground Smooth Pearl White jack */}
            <div className="absolute bottom-0 right-6">
              <ClayJack color="white" size={155} delay={1.1} rotateOffset={-30} />
            </div>
          </div>
        </motion.div>

        {/* ============================================================== */}
        {/* HERO HEADLINE & RESUME TAILORING INPUT CAPSULE                 */}
        {/* ============================================================== */}
        <div className="max-w-3xl mx-auto px-6 relative z-20 flex flex-col items-center">
          {/* Main Grand Typography */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl md:text-[68px] font-medium tracking-tight text-slate-900 leading-[1.08]"
          >
            Precision Resume <br />
            Tailoring For Every Job
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-base sm:text-lg text-slate-500 max-w-lg font-normal leading-relaxed"
          >
            Upload your resume and target job description. ResumOrph rewrites your experience to match the role, scores your ATS keywords, and exports PDF or DOCX in 60 seconds.
          </motion.p>

          {/* Unified Capsule Input & Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 w-full max-w-md bg-white border border-slate-200 shadow-[0_8px_30px_rgba(15,23,42,0.06)] rounded-full p-1.5 flex items-center justify-between gap-2"
          >
            <input
              type="text"
              value={targetJobRole}
              onChange={(e) => setTargetJobRole(e.target.value)}
              placeholder="Enter target role (e.g. Senior Frontend Engineer)"
              className="w-full bg-transparent px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            <Link
              href="/transform"
              onClick={handleCta}
              className="shrink-0 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-medium text-xs sm:text-sm px-6 py-2.5 rounded-full transition-all shadow-md shadow-blue-500/20"
            >
              Tailor Now
            </Link>
          </motion.div>

          {/* Free Tier Callout */}
          <p className="mt-4 text-xs text-slate-400 font-mono">
            Free tier: up to 10 resume optimizations per hour. No credit card required.
          </p>
        </div>

        {/* ============================================================== */}
        {/* ATS & HIRING PLATFORMS TICKER                                  */}
        {/* ============================================================== */}
            <div className="w-full max-w-5xl mx-auto mt-16 md:mt-24 px-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-10 sm:gap-x-14 gap-y-6 opacity-65">
              <span className="text-[11px] font-mono uppercase text-slate-400 tracking-widest w-full text-center mb-1">
                Bypasses filters on all major applicant tracking systems
              </span>
              {ATS_PARTNERS.map((brand, idx) => (
                <span
                  key={idx}
                  className="font-semibold text-slate-400 hover:text-slate-800 transition-colors text-sm sm:text-base tracking-wider uppercase"
                >
                  {brand}
                </span>
              ))}
            </div>
    </section>
      );
}
