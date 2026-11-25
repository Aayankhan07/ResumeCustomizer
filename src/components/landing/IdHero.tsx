'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ClayJack } from './ClayJack';
import { trackEvent } from '../../utils/analytics';
import { FREE_TIER_LINE, PENDING_ROLE_KEY, PRIMARY_CTA_LABEL } from './constants';

const ATS_SYSTEMS = ['Greenhouse', 'Lever', 'Workday', 'iCIMS', 'Taleo'];

export default function IdHero() {
  const router = useRouter();
  const [targetRole, setTargetRole] = useState('');
  const reduceMotion = useReducedMotion();

  // Mouse parallax for the decorative clusters. Only attached when the
  // visitor has not asked for reduced motion.
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 120 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const leftX = useTransform(smoothX, [-400, 400], [-25, 25]);
  const leftY = useTransform(smoothY, [-400, 400], [-20, 20]);
  const rightX = useTransform(smoothX, [-400, 400], [25, -25]);
  const rightY = useTransform(smoothY, [-400, 400], [20, -20]);

  useEffect(() => {
    if (reduceMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, reduceMotion]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const role = targetRole.trim();
    trackEvent('hero_cta_clicked', { cta: 'hero_tailor', has_role: role.length > 0 });

    if (role) {
      // Survives the /login redirect for signed-out visitors, which drops the
      // query string. /transform reads either source and clears the key.
      try {
        sessionStorage.setItem(PENDING_ROLE_KEY, role);
      } catch {
        // Storage disabled: the query param still covers signed-in visitors.
      }
      router.push(`/transform?role=${encodeURIComponent(role)}`);
    } else {
      router.push('/transform');
    }
  };

  return (
    <section className="relative pt-28 pb-16 sm:pt-36 md:pt-40 md:pb-24 overflow-hidden flex flex-col items-center text-center">
      {/* Decorative clusters: only from xl up, where the side gutters are wide
          enough that they never sit on top of the text column. */}
      <motion.div
        aria-hidden="true"
        style={{ x: leftX, y: leftY }}
        className="absolute left-6 2xl:left-16 top-1/3 -translate-y-1/2 pointer-events-none hidden xl:block"
      >
        <div className="relative w-48 h-64">
          <div className="absolute top-0 left-6 blur-[6px] opacity-40">
            <ClayJack color="white" size={104} delay={1} rotateOffset={15} />
          </div>
          <div className="absolute top-12 -left-2">
            <ClayJack color="coral" size={112} delay={0.2} rotateOffset={-10} />
          </div>
          <div className="absolute bottom-0 left-10">
            <ClayJack color="white" size={104} delay={0.6} rotateOffset={35} />
          </div>
        </div>
      </motion.div>

      <motion.div
        aria-hidden="true"
        style={{ x: rightX, y: rightY }}
        className="absolute right-6 2xl:right-16 top-1/3 -translate-y-1/2 pointer-events-none hidden xl:block"
      >
        <div className="relative w-48 h-64">
          <div className="absolute top-2 right-4 blur-[6px] opacity-50">
            <ClayJack color="blue" size={96} delay={0.8} rotateOffset={-20} />
          </div>
          <div className="absolute top-14 right-0">
            <ClayJack color="coral" size={112} delay={0.4} rotateOffset={20} />
          </div>
          <div className="absolute bottom-0 right-8">
            <ClayJack color="white" size={104} delay={1.1} rotateOffset={-30} />
          </div>
        </div>
      </motion.div>

      <div className="max-w-3xl mx-auto px-5 sm:px-6 relative z-10 flex flex-col items-center">
        {/* Headline and subtitle render visible from the first paint (no
            opacity-0 entrance), so they count for LCP immediately. */}
        <h1 className="text-[40px] sm:text-6xl md:text-[68px] font-medium tracking-tight text-slate-900 leading-[1.08] text-balance">
          Tailor your resume to any job description
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed text-pretty">
          Upload your resume and a job description. ResumOrph rewrites your real experience to match
          the role, scores it against the posting, and exports a clean PDF or DOCX in about a
          minute.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-9 w-full max-w-lg bg-white border border-slate-200 shadow-[0_8px_30px_rgba(15,23,42,0.06)] rounded-3xl sm:rounded-full p-1.5 flex flex-col sm:flex-row sm:items-center gap-1.5 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100 transition-shadow"
        >
          <label htmlFor="hero-target-role" className="sr-only">
            Target role (optional)
          </label>
          <input
            id="hero-target-role"
            name="role"
            type="text"
            maxLength={150}
            autoComplete="organization-title"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Target role, e.g. Senior Frontend Engineer"
            className="w-full min-w-0 bg-transparent px-4 py-2.5 sm:py-0 text-base sm:text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-sm px-6 py-3 sm:py-2.5 rounded-full transition-all shadow-md shadow-blue-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {PRIMARY_CTA_LABEL}
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-500">{FREE_TIER_LINE}</p>
      </div>

      <div className="w-full max-w-5xl mx-auto mt-16 md:mt-24 px-6 pt-8 border-t border-slate-100">
        <p className="text-xs font-semibold uppercase text-slate-500 tracking-widest">
          Single-column, ATS-safe layouts for systems like
        </p>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-10 sm:gap-x-14 gap-y-4">
          {ATS_SYSTEMS.map((system) => (
            <li key={system} className="font-semibold text-slate-500 text-base tracking-wide">
              {system}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
