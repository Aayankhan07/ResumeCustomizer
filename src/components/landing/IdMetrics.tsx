'use client';

import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import RollingCounter from './RollingCounter';

export default function IdMetrics() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-50px' });

  // Floating Micro-gauge scroll-linked progress (Frame 040 in video)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'center center'],
  });

  const miniRingOffset = useTransform(scrollYProgress, [0, 1], [180, 50]);

  const metrics = [
    {
      percentage: 94,
      from: 33,
      suffix: '%',
      label: 'Average ATS Match Score',
      subtext: 'Calculated by direct keyword frequency comparison against posting requirements.',
    },
    {
      percentage: 3.8,
      from: 1.2,
      suffix: 'x',
      label: 'More Recruiter Callbacks',
      subtext: 'Demonstrated across 12,400+ targeted applications submitted on Greenhouse, Lever, and Workday.',
    },
    {
      percentage: 60,
      from: 15,
      suffix: 's',
      label: 'Average Tailoring Speed',
      subtext: 'Full experience rewrite, before/after diffs, and ATS document export in one minute.',
    },
  ];

  return (
    <section
      ref={containerRef}
      id="metrics"
      className="py-24 md:py-32 px-6 max-w-7xl mx-auto border-t border-slate-100 select-none relative"
    >
      {/* Floating Micro-Gauge on Left + Floating Trophy Widget on Right (Frames 040 & 048) */}
      <div className="absolute top-16 left-8 sm:left-14 hidden md:flex items-center gap-3 bg-white/90 border border-slate-200/80 shadow-[0_12px_24px_rgba(0,0,0,0.04)] rounded-2xl p-3.5 backdrop-blur-md">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" stroke="#E2E8F0" strokeWidth="3" fill="transparent" />
            <motion.circle
              cx="20"
              cy="20"
              r="16"
              stroke="#2563EB"
              strokeWidth="3.5"
              strokeDasharray="100"
              style={{ strokeDashoffset: miniRingOffset }}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <span className="absolute text-[11px] font-bold text-slate-800">
            <RollingCounter from={33} to={94} suffix="%" />
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">ATS Lift</span>
          <span className="text-xs font-semibold text-slate-800">Match score</span>
        </div>
      </div>

      {/* Floating 3D Trophy / Cup on Right Margin (Frame 048) */}
      <div className="absolute top-20 right-8 sm:right-14 hidden md:block">
        <motion.div
          animate={{ y: [-4, 4, -4], rotate: [0, 4, -4, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/80 shadow-[0_10px_20px_rgba(249,115,22,0.15)] flex items-center justify-center text-xl"
        >
          🏆
        </motion.div>
      </div>

      {/* Section Headline with Inline Sparkle Icon */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-slate-900 leading-tight">
          Highlighting{' '}
            <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 align-middle shadow-sm mx-1">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>{' '}
            our Key <br />
            Resume Optimization Metrics
        </h2>
      </div>

      {/* 3 Circular Animated Gauge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {metrics.map((item, idx) => {
          const circumference = 251.2;
          const targetOffset = circumference - (circumference * item.percentage) / 100;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.08)] transition-all flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-100"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: isInView ? targetOffset : circumference }}
                    transition={{ duration: 1.8, delay: 0.2 + idx * 0.2, ease: [0.16, 1, 0.3, 1] }}
                    strokeLinecap="round"
                    fill="transparent"
                    className="text-blue-600"
                  />
                </svg>

                <div className="absolute font-bold text-3xl text-slate-900 tracking-tight">
                  <RollingCounter
                    from={item.from}
                    to={item.percentage}
                    suffix={item.suffix}
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-slate-900">{item.label}</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-xs">{item.subtext}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
