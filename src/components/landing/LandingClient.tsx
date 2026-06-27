'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRight, CheckCircle, FileText, Sparkles } from 'lucide-react';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import Accordion from '../ui/Accordion';

const FAQ_ITEMS = [
  {
    question: 'Is my resume stored anywhere permanently?',
    answer: 'No. To ensure candidate privacy, your raw resume text and job descriptions are never saved in our database. We only persist the finalized, structured AI output for re-download purposes, which you can delete at any time.',
  },
  {
    question: 'Will the AI make up experience I don\'t have?',
    answer: 'Absolutely not. ResumOrph strictly adheres to the facts listed in your original resume. It rewrites and reframes existing bullet points for maximum relevance and impact, but it will never fabricate employer names, dates, degrees, or credentials.',
  },
  {
    question: 'Why is ATS optimization important?',
    answer: 'Applicant Tracking Systems parse resumes and filter candidates based on keyword matching and semantic relevance. If your resume lacks the specific terminology and standard layout required by the system, it may be automatically rejected before reaching human recruiters.',
  },
  {
    question: 'What file formats do you support for upload?',
    answer: 'You can upload resumes and job descriptions in PDF (.pdf), Microsoft Word (.docx), or plain text (.txt) formats. You can also paste text directly into the wizard.',
  },
  {
    question: 'How many resumes can I optimize?',
    answer: 'Free account holders are allowed up to 10 resume optimizations per hour. This rolling rate limit keeps AI operations within healthy margins.',
  },
];

const BULLET_EXAMPLES = [
  {
    before: 'Worked on machine learning projects using Python.',
    after: 'Engineered and deployed 3 production ML pipelines in Python using scikit-learn and XGBoost, reducing model inference latency by 40%.',
    keywords: ['Python', 'production ML pipelines', 'scikit-learn', 'XGBoost', 'latency'],
  },
  {
    before: 'Responsible for updating the company web dashboard.',
    after: 'Redesigned and optimized company admin dashboards using React and TailwindCSS, improving page load speeds by 55% and user retention by 15%.',
    keywords: ['React', 'TailwindCSS', 'optimizing', 'user retention'],
  },
  {
    before: 'Helped write tests and debug code.',
    after: 'Implemented comprehensive Jest integration test suites, raising code coverage from 60% to 92% and reducing customer-reported bugs by 18%.',
    keywords: ['Jest', 'integration test suites', 'code coverage'],
  },
];

export default function LandingClient({ initialStats }) {
  const { user } = useAuth();
  const [globalStats] = useState(initialStats || { total_transformations: 12400, total_users: 3800 });
  const [exampleIdx, setExampleIdx] = useState(0);
  const [isTransformed, setIsTransformed] = useState(false);

  // Cycle animated before/after preview card
  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransformed((prev) => {
        if (prev) {
          setExampleIdx((idx) => (idx + 1) % BULLET_EXAMPLES.length);
          return false;
        } else {
          return true;
        }
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const currentExample = BULLET_EXAMPLES[exampleIdx];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col font-sans select-none overflow-x-hidden transition-colors duration-300 text-[var(--text-primary)]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 flex flex-col items-center justify-center text-center px-6">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border-default)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-default)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 z-0 dark:opacity-5" />

        <div className="max-w-4xl mx-auto flex flex-col items-center z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono font-medium uppercase tracking-wider text-[var(--text-secondary)] bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-[var(--radius-xs)] mb-8">
            ATS Tailoring System
          </span>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] max-w-3xl tracking-tight">
            Your resume. <br />
            <span className="text-[var(--accent)]">Tailored for every job.</span>
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-6 max-w-md leading-relaxed font-medium">
            Upload your resume and a target job description. We rewrite and format it to align with applicant tracking systems and keywords in under 30 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-10 w-full sm:w-auto">
            <Link href={user ? '/transform' : '/signup'} className="w-full sm:w-auto">
              <button className="btn-primary w-full flex items-center justify-center gap-2 py-3 px-8 text-sm">
                Optimize My Resume
                <ArrowRight size={14} className="stroke-[2.5]" />
              </button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <button className="btn-ghost w-full py-3 px-8 text-sm">
                How It Works
              </button>
            </a>
          </div>

          <span className="text-[12px] text-[var(--text-muted)] mt-5 font-mono">
            No credit card required. Up to 10 free optimizations per hour.
          </span>
        </div>

        {/* Morphing Preview Card */}
        <div className="w-full max-w-3xl mt-16 px-4 z-10 animate-slide-up" style={{ animationDelay: '80ms' }}>
          <div className="ide-preview-card bg-[#0d0d0d] shadow-[var(--shadow-lg)] rounded-[var(--radius-lg)] border border-[#2a2a2a] overflow-hidden text-left transition-all duration-200">
            <div className="flex items-center justify-between px-5 py-3 bg-[#0d0d0d] border-b border-[#2a2a2a] select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
              </div>
              <span className="text-[10px] font-mono text-neutral-500 font-semibold tracking-wider">
                optimizer_diff.py
              </span>
              <span className="px-2 py-0.5 text-[9px] font-mono font-medium rounded border text-neutral-400 bg-neutral-900 border-neutral-800">
                Line-by-line comparison
              </span>
            </div>

            <div className="p-6 font-mono text-xs sm:text-sm leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[160px] relative select-text bg-[#0d0d0d]">
              <div className="flex flex-col gap-2 border-b md:border-b-0 md:border-r border-[#2a2a2a] pb-6 md:pb-0 pr-0 md:pr-4">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#2a2a2a]">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Original Bullet</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950/20 text-red-400 border border-red-900/30 font-semibold uppercase">Before</span>
                </div>
                <div className="text-neutral-400 flex items-start gap-1.5 mt-2 animate-fade-in" key={`before-${exampleIdx}`}>
                  <span className="text-red-500 font-bold select-none">-</span>
                  <span className="text-neutral-400">{currentExample.before}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pl-0 md:pl-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#2a2a2a]">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">AI Tailored Bullet</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-955/20 text-emerald-400 border border-emerald-900/30 font-semibold uppercase">After</span>
                </div>
                <div className="text-emerald-400 flex items-start gap-1.5 mt-2 animate-fade-in" key={`after-${exampleIdx}`}>
                  <span className="text-emerald-500 font-bold select-none">+</span>
                  <p className="text-emerald-400 leading-relaxed m-0 font-sans text-xs sm:text-sm">
                    {currentExample.after}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-28 relative border-t border-[var(--border-default)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border-default)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-default)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] opacity-15 z-0 dark:opacity-5" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4 text-[var(--text-primary)]">Three steps. One perfect resume.</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-20 max-w-md mx-auto font-medium">Get your documents optimized and ready in less than 2 minutes.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Add your resume',
                desc: 'Upload a PDF, DOCX, or TXT file — or just paste your resume text directly into the workspace wizard.',
                icon: FileText,
              },
              {
                step: '02',
                title: 'Paste job description',
                desc: 'Insert the target job description. Our engine extracts process terms and technical skill demands.',
                icon: Sparkles,
              },
              {
                step: '03',
                title: 'Tailor and download',
                desc: 'Review match scores, adjust custom sliders, see token-level rewrites, and export as dynamic PDF or split DOCX.',
                icon: CheckCircle,
              }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-6 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]">
                <span className="bg-[var(--bg-subtle)] text-[var(--text-muted)] text-[11px] font-medium py-1 px-2 rounded-[var(--radius-xs)] border border-[var(--border-default)] mb-4">{item.step}</span>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--bg-subtle)] border border-[var(--border-default)] text-[var(--accent)] mb-6">
                  <item.icon size={22} className="stroke-[2]" />
                </div>
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-2.5">{item.title}</h3>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed font-normal">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 border-t border-b border-[var(--border-default)]">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-center">
          <div className="flex items-center">
            <span className="text-[20px] font-bold text-[var(--text-primary)]">{globalStats.total_transformations.toLocaleString()}+</span>
            <span className="text-[13px] text-[var(--text-muted)] ml-1.5">resumes optimized</span>
          </div>
          <span className="hidden md:inline text-[var(--border-default)]">•</span>
          <div className="flex items-center">
            <span className="text-[20px] font-bold text-[var(--text-primary)]">83%</span>
            <span className="text-[13px] text-[var(--text-muted)] ml-1.5">average match score</span>
          </div>
          <span className="hidden md:inline text-[var(--border-default)]">•</span>
          <div className="flex items-center">
            <span className="text-[20px] font-bold text-[var(--text-primary)]">&lt;30s</span>
            <span className="text-[13px] text-[var(--text-muted)] ml-1.5">processing time</span>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-28 max-w-3xl mx-auto px-6">
        <h2 className="font-serif text-3xl font-bold text-center mb-4 text-[var(--text-primary)]">Frequently Asked Questions</h2>
        <p className="text-sm text-[var(--text-secondary)] text-center mb-16 font-medium">Everything you need to know about the AI tailoring process.</p>
        <Accordion items={FAQ_ITEMS} />
      </section>

      <Footer />
    </div>
  );
}
