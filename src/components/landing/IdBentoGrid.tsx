'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Sparkles, Check, ArrowRight, Zap, RefreshCw, FileCheck } from 'lucide-react';
import { ClayJack } from './ClayJack';

export default function IdBentoGrid() {
  const [matchScore, setMatchScore] = useState(['8', '8', '%']);
  const [verified, setVerified] = useState(false);
  const [tailorMode, setTailorMode] = useState<'standard' | 'aggressive'>('standard');

    const handleRescore = () => {
      setVerified(true);
      setTimeout(() => {
        setMatchScore(['9', '4', '%']);
        setVerified(false);
      }, 800);
    };

    return (
      <section id="technology" className="py-20 md:py-28 px-6 max-w-7xl mx-auto select-none">
        {/* Header Pill */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-4 py-1.5 rounded-full mb-3">
            Our Technology
          </span>
          <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-slate-900 leading-tight">
            The ResumOrph Engine: Engineering <br />High-Impact Resumes
          </h2>
        </div>

        {/* Complete 6-Card Bento Architecture grounded in ResumOrph core features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ============================================================== */}
          {/* ROW 1 - CARD 1: Human-in-the-Loop Resume Customizer            */}
          {/* ============================================================== */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between relative overflow-hidden"
          >
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Experience Alignment</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                ResumOrph reframes your authentic career achievements into quantifiable action bullets that directly match the employer&apos;s job criteria.
              </p>
            </div>

            <div className="mt-8 pt-4 relative">
              <div className="absolute -top-6 right-1 pointer-events-none">
                <ClayJack color="blue" size={54} delay={0.2} rotateOffset={12} />
              </div>

              {/* Resume Match Score Gauge Card */}
              <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-700">ATS Keyword Match</span>
                  <span className="text-sm font-bold text-blue-600">88.4%</span>
                </div>

                {/* Keyword Alignment Bar */}
                <div className="flex items-end gap-2 h-16 pt-2">
                  {[
                    { label: 'Role', height: '60%' },
                    { label: 'Stack', height: '85%' },
                    { label: 'Metrics', height: '75%' },
                    { label: 'ATS', height: '95%' },
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <div
                        className="w-full bg-blue-100 rounded-md transition-all duration-500 hover:bg-blue-600"
                        style={{ height: bar.height }}
                      />
                      <span className="text-[10px] text-slate-400 font-mono">{bar.label}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/transform"
                  className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm block text-center"
                >
                  Tailor My Resume
                </Link>
              </div>
            </div>
          </motion.div>

          {/* ============================================================== */}
          {/* ROW 1 - CARD 2: Zero Hallucination Guarantee                  */}
          {/* ============================================================== */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between"
          >
            {/* 3D Dual Pill Pill Accent Icons */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shadow-sm">
                <Sparkles size={20} />
              </div>
              <div className="text-slate-300">⇄</div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                  <Shield size={20} />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900">Zero Hallucination</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  We never fabricate past companies, degrees, dates, or skills. Our AI solely reorganizes and elevates your verified experience.
                </p>
              </div>
          </motion.div>

          {/* ============================================================== */}
          {/* ROW 1 - CARD 3: ATS Match Verification Score                   */}
          {/* ============================================================== */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between"
          >
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] text-slate-500 font-medium block mb-3">
                Server-calculated ATS score vs posting keywords
              </span>

                  {/* 3 Digit Interactive Boxes */ }
                  < div className = "grid grid-cols-3 gap-2 mb-4" >
                  {
                    matchScore.map((digit, idx) => (
                      <div
                        key={idx}
                        className="h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-2xl font-bold text-slate-900 shadow-inner"
                      >
                        {digit}
                      </div>
                    ))
                  }
            </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMatchScore(['6', '2', '%'])}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                >
                  Raw CV
                </button>
                <button
                  onClick={handleRescore}
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                >
                  {verified ? 'Scoring...' : 'Rescore AI'}
                </button>
              </div>
            </div>

            <div className="mt-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Algorithmic Validation</span>
            </div>
          </motion.div>

          {/* ============================================================== */}
          {/* ROW 2 - CARD 4: Export Deliverables (PDF, DOCX, Cover Letter)  */}
          {/* ============================================================== */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between relative overflow-hidden"
          >
            <div className="relative mb-6">
              <div className="absolute -top-4 -right-2 pointer-events-none">
                <ClayJack color="coral" size={48} delay={0.4} rotateOffset={-18} />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm max-w-[240px]">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                    <span className="flex items-center gap-1.5 text-blue-600">
                      <FileCheck size={14} />
                      Export Bundle
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Ready</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">ATS PDF, DOCX file, Interview Prep, Cover Letter.</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900">Full Application Suite</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Every transformation produces a cleanly formatted ATS resume, keyword delta analysis, and a customized cover letter.
              </p>
            </div>
          </motion.div>

          {/* ============================================================== */}
          {/* ROW 2 - CARD 5: Tailoring Strategy Mode Settings               */}
          {/* ============================================================== */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between"
          >
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-full text-[10px] font-semibold flex items-center gap-1">
                  <Zap size={10} /> Fast
                </span>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-medium flex items-center gap-1">
                  <Check size={10} /> Tailoring profile saved
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-medium text-slate-700">
                <label
                  onClick={() => setTailorMode('standard')}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="tailor-mode"
                    checked={tailorMode === 'standard'}
                    onChange={() => setTailorMode('standard')}
                    className="text-blue-600"
                  />
                  Balanced ATS keyword matching
                </label>
                <label
                  onClick={() => setTailorMode('aggressive')}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="tailor-mode"
                    checked={tailorMode === 'aggressive'}
                    onChange={() => setTailorMode('aggressive')}
                    className="text-blue-600"
                  />
                  Executive impact & metric re-weighting
                </label>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                <button className="px-3 py-1 bg-blue-600 text-white text-[11px] font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  Apply mode
                </button>
                <span className="text-[10px] text-slate-400 font-medium">Safe Mode 🔒</span>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900">Model Customization</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Powered by Groq LLaMA 3.3 70B, tuned specifically for applicant tracking systems and recruiter skimming patterns.
              </p>
            </div>
          </motion.div>

          {/* ============================================================== */}
          {/* ROW 2 - CARD 6: Zero Retention & Privacy Protection            */}
          {/* ============================================================== */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between relative overflow-hidden"
          >
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Privacy & Data Security</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Your raw resume text is never retained in our database. We only store your structured exports with full deletion controls.
              </p>
            </div>

            {/* Giant 3D Royal Blue Sculpture Cross */}
            <div className="mt-6 flex justify-end items-end relative h-40">
              <div className="absolute -bottom-6 -right-6 scale-110">
                <ClayJack color="blue" size={175} delay={0.3} rotateOffset={-15} />
              </div>
            </div>
          </motion.div>

        </div>
      </section>
    );
  }
