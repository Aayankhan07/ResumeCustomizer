'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRight, CheckCircle, FileText, Sparkles } from 'lucide-react';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import Button from '../ui/Button';
import Accordion from '../ui/Accordion';
import Card from '../ui/Card';

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
    <div className="min-h-screen bg-mist dark:bg-[#030712] flex flex-col font-sans select-none overflow-x-hidden transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 flex flex-col items-center justify-center text-center px-6">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-slate-200)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-slate-200)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-25 z-0 dark:opacity-5" />

        <div className="max-w-4xl mx-auto flex flex-col items-center z-10 stagger-children">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-655 bg-slate-100 dark:bg-slate-800 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 rounded-md mb-8">
            ATS Tailoring System
          </span>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white font-bold leading-[1.15] max-w-3xl tracking-tight">
            Your resume. <br />
            <span className="text-slate-800 dark:text-indigo-400">Tailored for every job.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-555 dark:text-slate-400 mt-6 max-w-md leading-relaxed font-semibold">
            Upload your resume and a target job description. We rewrite and format it to align with applicant tracking systems and keywords in under 30 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-10 w-full sm:w-auto">
            <Link href={user ? '/transform' : '/signup'} className="w-full sm:w-auto">
              <Button variant="primary" className="w-full flex items-center justify-center gap-2 py-3 px-8 text-sm font-bold rounded-md bg-slate-900 dark:bg-indigo-650 text-white hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors">
                Optimize My Resume
                <ArrowRight size={14} className="stroke-[2.5]" />
              </Button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full py-3 px-8 text-sm font-semibold bg-white dark:bg-slate-900/10 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
                How It Works
              </Button>
            </a>
          </div>

          <span className="text-[10px] font-mono text-slate-450 mt-5">
            No credit card required. Up to 10 free optimizations per hour.
          </span>
        </div>

        {/* Morphing Preview Card */}
        <div className="w-full max-w-3xl mt-16 px-4 z-10 animate-slide-up" style={{ animationDelay: '80ms' }}>
          <div className="ide-preview-card bg-slate-900 shadow-xl rounded-xl border border-slate-800 overflow-hidden text-left transition-all duration-200">
            <div className="flex items-center justify-between px-5 py-3 bg-slate-950 border-b border-slate-800 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-semibold tracking-wider">
                optimizer_diff.py
              </span>
              <span className="px-2 py-0.5 text-[9px] font-mono font-medium rounded border text-slate-400 bg-slate-850 border-slate-750">
                Line-by-line comparison
              </span>
            </div>

            <div className="p-6 font-mono text-xs sm:text-sm leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[160px] relative select-text bg-slate-900">
              <div className="flex flex-col gap-2 border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0 pr-0 md:pr-4">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Original Bullet</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950/20 text-red-400 border border-red-900/30 font-semibold uppercase">Before</span>
                </div>
                <div className="text-slate-400 flex items-start gap-1.5 mt-2 animate-fade-in" key={`before-${exampleIdx}`}>
                  <span className="text-red-500 font-bold select-none">-</span>
                  <span className="text-slate-400">{currentExample.before}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pl-0 md:pl-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">AI Tailored Bullet</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-955/20 text-emerald-400 border border-emerald-900/30 font-semibold uppercase">After</span>
                </div>
                <div className="text-emerald-400 flex items-start gap-1.5 mt-2 animate-fade-in" key={`after-${exampleIdx}`}>
                  <span className="text-emerald-500 font-bold select-none">+</span>
                  <p className="text-emerald-450 leading-relaxed m-0 font-sans text-xs sm:text-sm">
                    {currentExample.after}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-28 relative border-t border-slate-100 dark:border-slate-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-slate-200)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-slate-200)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] opacity-20 z-0 dark:opacity-5" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 dark:text-white font-bold mb-4">Three steps. One perfect resume.</h2>
          <p className="text-sm text-slate-550 dark:text-slate-400 mb-20 max-w-md mx-auto font-semibold">Get your documents optimized and ready in less than 2 minutes.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Add your resume',
                desc: 'Upload a PDF, DOCX, or TXT file — or just paste your resume text directly into the workspace wizard.',
                icon: FileText,
                color: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
              },
              {
                step: '02',
                title: 'Paste job description',
                desc: 'Insert the target job description. Our engine extracts process terms and technical skill demands.',
                icon: Sparkles,
                color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
              },
              {
                step: '03',
                title: 'Tailor and download',
                desc: 'Review match scores, adjust custom sliders, see token-level rewrites, and export as dynamic PDF or split DOCX.',
                icon: CheckCircle,
                color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
              }
            ].map((item, idx) => (
              <Card key={idx} className="flex flex-col items-center text-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-card-hover transition-all">
                <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500 mb-4">{item.step}</span>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-6 ${item.color}`}>
                  <item.icon size={22} className="stroke-[2.5]" />
                </div>
                <h3 className="font-serif text-lg text-slate-900 dark:text-white font-bold mb-2.5">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-semibold">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-t border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-2 gap-8 text-center">
          <div>
            <h3 className="text-3xl sm:text-4.5xl font-bold text-slate-900 dark:text-white tracking-tight">{globalStats.total_transformations.toLocaleString()}+</h3>
            <p className="text-xs font-mono font-bold text-slate-450 dark:text-slate-500 mt-2 uppercase tracking-wider">Resumes Tailored</p>
          </div>
          <div>
            <h3 className="text-3xl sm:text-4.5xl font-bold text-slate-900 dark:text-white tracking-tight">{globalStats.total_users.toLocaleString()}+</h3>
            <p className="text-xs font-mono font-bold text-slate-450 dark:text-slate-500 mt-2 uppercase tracking-wider">Active Candidates</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-28 max-w-3xl mx-auto px-6">
        <h2 className="font-serif text-3xl text-slate-900 dark:text-white font-bold text-center mb-4">Frequently Asked Questions</h2>
        <p className="text-sm text-slate-550 dark:text-slate-400 text-center mb-16 font-semibold">Everything you need to know about the AI tailoring process.</p>
        <Accordion items={FAQ_ITEMS} />
      </section>

      <Footer />
    </div>
  );
}
