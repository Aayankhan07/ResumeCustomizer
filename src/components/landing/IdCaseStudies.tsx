'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, FileText } from 'lucide-react';

interface CaseStudy {
  number: string;
  title: string;
  date: string;
  category: string;
  href: string;
}

const RESUME_GUIDES: CaseStudy[] = [
  {
    number: '01',
    title: 'How our candidates optimized technical bullets to land offers at Google, Stripe, and Meta',
    date: 'Updated weekly',
    category: 'Engineering & Tech CVs',
    href: '/transform',
  },
  {
    number: '02',
    title: 'How to bypass modern ATS keyword parsing on Greenhouse, Lever, and Workday',
    date: 'ATS Whitepaper',
    category: 'ATS Screening Rules',
    href: '/transform',
  },
  {
    number: '03',
    title: 'Structuring executive achievements without fabricating false work history',
    date: 'Executive Playbook',
    category: 'Leadership & Product',
    href: '/transform',
  },
];

export default function IdCaseStudies() {
  return (
    <section id="insights" className="py-20 md:py-28 px-6 max-w-7xl mx-auto border-t border-slate-100 relative">
      {/* Floating Trophy Widget on Top Right margin (Frame 048) */}
      <div className="absolute top-8 right-8 sm:right-16 hidden md:block">
        <motion.div
          animate={{ y: [-3, 3, -3], rotate: [0, 6, -6, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-10 h-10 rounded-2xl bg-orange-100/80 border border-orange-200 text-orange-600 flex items-center justify-center shadow-sm"
        >
          🏆
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-4 py-1.5 rounded-full mb-3 inline-block">
              Resume Intelligence & Guides
            </span>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-slate-900">
              Proven Strategies & Real Interview Wins
            </h2>
          </div>
          <Link
            href="/transform"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Start Tailoring Free <ArrowRight size={14} />
          </Link>
        </div>

        {/* Stepped Numbered Rows (Matching frames 13-16) */}
        <div className="space-y-4">
            {
              RESUME_GUIDES.map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 6 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all flex items-center justify-between gap-6 group"
                >
                  {/* Left Number */}
                  <span className="text-2xl sm:text-3xl font-light text-slate-300 group-hover:text-blue-600 transition-colors font-mono">
                    {item.number}
                  </span>

                  {/* Middle Thumbnail + Content */}
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-100 border border-slate-200/80 shrink-0 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform overflow-hidden shadow-inner">
                        <FileText size={24} className="stroke-[2]" />
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-blue-600 tracking-wide uppercase">
                          {item.category}
                        </span>
                        <h3 className="text-base sm:text-lg font-medium text-slate-900 group-hover:text-blue-600 transition-colors mt-0.5 leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">{item.date}</p>
                      </div>
                    </div>

                    {/* Right Circular Arrow Button */}
                      <Link
                        href={item.href}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shrink-0 shadow-sm"
                      >
                        <ChevronRight size={18} />
                  </Link>
                </motion.div>
              ))
            }
        </div>
      </div>
    </section>
  );
}
