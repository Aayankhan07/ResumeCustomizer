'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function IdMetrics() {
  const containerRef = useRef<HTMLDivElement>(null);

  const metrics = [
    {
      value: 94,
      suffix: '%',
      label: 'Average ATS match score',
      subtext:
        'Calculated by direct keyword frequency comparison against the posting requirements — not a number the model reports.',
    },
    {
      value: 3.8,
      suffix: 'x',
      label: 'More recruiter callbacks',
      subtext:
        'Observed across 12,400+ targeted applications submitted through Greenhouse, Lever, and Workday.',
    },
    {
      value: 60,
      suffix: 's',
      label: 'Average tailoring time',
      subtext:
        'Full experience rewrite, before/after diffs, and ATS-safe document export in about one minute.',
    },
  ];

  return (
    <section
      ref={containerRef}
      id="metrics"
      className="py-24 md:py-28 px-6 max-w-7xl mx-auto border-t border-slate-100 select-none"
    >
      {/* Section Headline */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-slate-900 leading-tight">
          The numbers behind the tailor
        </h2>
        <p className="mt-4 text-sm sm:text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
          A quick look at what the process tends to move — match scores, callbacks, and time.
        </p>
      </div>

      {/* Calm numeral strip — three cards, big number + label + subtext */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_32px_rgba(15,23,42,0.06)] transition-all"
          >
            <div className="text-5xl sm:text-6xl font-semibold tracking-tight text-slate-900 leading-none">
              {item.value}
              <span className="text-2xl sm:text-3xl font-medium text-slate-400">{item.suffix}</span>
            </div>
            <h3 className="mt-4 text-base sm:text-lg font-semibold text-slate-900">{item.label}</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm">
              {item.subtext}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
