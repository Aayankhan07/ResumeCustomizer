'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import RollingCounter from './RollingCounter';

export default function IdInlineStatement() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll-linked parallax translation for flanking widgets
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const leftTagY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const leftTagRotate = useTransform(scrollYProgress, [0, 1], [-10, -3]);

  const rightTagY = useTransform(scrollYProgress, [0, 1], [-40, 50]);
  const rightTagRotate = useTransform(scrollYProgress, [0, 1], [8, 1]);

  const bottomBadgeY = useTransform(scrollYProgress, [0, 1], [70, -20]);

  return (
    <section
      ref={containerRef}
      id="approach"
      className="relative py-28 md:py-36 px-6 overflow-hidden select-none"
    >
      {/* Background Floating Elements Drifting with Parallax */}
      <div className="absolute inset-0 pointer-events-none max-w-6xl mx-auto overflow-visible">
        {/* Top-Left Tilted Glass Tag: Keywords & ATS match */}
        <motion.div
          style={{ y: leftTagY, rotate: leftTagRotate }}
          className="absolute left-2 sm:left-6 top-8 bg-white/95 border border-slate-200/80 shadow-[0_16px_32px_rgba(15,23,42,0.06)] rounded-2xl p-4 hidden md:block w-48 backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold">Keywords Match</span>
            <span className="text-xs text-slate-400 font-mono">14 missing</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              whileInView={{ width: '88%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full bg-blue-600 rounded-full"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">React · Next.js · TypeScript</p>
        </motion.div>

        {/* Top-Right Tilted Status Tag: Tailoring Engine */}
        <motion.div
          style={{ y: rightTagY, rotate: rightTagRotate }}
          className="absolute right-4 sm:right-8 top-10 bg-white/95 border border-slate-200/80 shadow-[0_16px_32px_rgba(15,23,42,0.06)] rounded-2xl p-4 hidden md:block w-52 text-left backdrop-blur-md"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Groq LLaMA 3.3 Engine
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            Quantified impact bullets, zero fabricated experience.
          </p>
        </motion.div>

        {/* Bottom-Right Verification Floating Tag */}
        <motion.div
          style={{ y: bottomBadgeY, rotate: -3 }}
          className="absolute right-12 bottom-6 bg-white border border-slate-200/90 shadow-[0_16px_32px_rgba(15,23,42,0.06)] rounded-2xl px-4 py-2.5 hidden lg:flex items-center gap-2.5 text-xs font-medium text-slate-700 backdrop-blur-md"
        >
          <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck size={14} />
          </div>
          Strict privacy: raw resumes never stored in database
        </motion.div>
      </div>

      {/* Main Statement with Rolling Counter + ATS Pill + Candidate Photo (ResumOrph context) */}
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-5xl md:text-[56px] font-medium tracking-tight text-slate-900 leading-[1.3] sm:leading-[1.25]"
        >
          Over{' '}
          <span className="inline-flex items-center justify-center px-4 py-1 mx-1.5 text-white bg-blue-600 rounded-2xl font-bold text-2xl sm:text-4xl md:text-5xl align-middle shadow-lg shadow-blue-500/25">
            <RollingCounter from={10400} to={12400} suffix="+" />
          </span>{' '}
          resumes optimized
          <br className="hidden sm:inline" />
          {' '}
          {/* Sparkle / ATS Pill from Video */}
          <span className="inline-flex items-center justify-center w-10 h-10 sm:w-13 sm:h-13 mx-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 align-middle shadow-inner">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </span>{' '}
          to pass algorithmic screening and
          <br />
          land top{' '}
          {/* Candidate Photo Thumbnail embedded in text line (matching frame 004/005) */}
          <span className="inline-flex items-center justify-center align-middle mx-2 overflow-hidden rounded-xl border border-slate-200 shadow-sm w-12 h-8 sm:w-16 sm:h-10 relative bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80"
              alt="Hired candidate"
              className="w-full h-full object-cover"
            />
          </span>{' '}
          interview callbacks.
        </motion.p>
      </div>
    </section>
  );
}
