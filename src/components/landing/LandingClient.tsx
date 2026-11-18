'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRight, CheckCircle, FileText, Sparkles } from 'lucide-react';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import Accordion from '../ui/Accordion';
import { FAQ_ITEMS } from '../../lib/faq';
import { trackEvent } from '../../utils/analytics';

const SAMPLE_PERSONAS = [
  {
    name: 'Aayan Khan',
    role: 'Senior Frontend Engineer',
    summary: 'Frontend engineer with 6+ years building design-system libraries and performance-sensitive web apps in React and TypeScript.',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Tests'],
    experience: {
      title: 'Senior Frontend Engineer',
      company: 'Lumin Labs',
      bullets: [
        'Led migration of the customer dashboard to a React + TypeScript design system, cutting UI bug reports by 38%.',
        'Reduced largest-contentful-paint by 42% through code-splitting and lazy-loaded route segments.',
        'Mentored two junior engineers and introduced a component review process adopted across three squads.',
      ],
    },
  },
  {
    name: 'Mira Osei',
    role: 'ML Platform Engineer',
    summary: 'ML platform engineer focused on serving infrastructure, model pipelines, and latency-sensitive inference in Python and Go.',
    skills: ['Python', 'Go', 'Kubernetes', 'PyTorch', 'ML Pipelines'],
    experience: {
      title: 'ML Platform Engineer',
      company: 'Northwind AI',
      bullets: [
        'Built a model-serving layer handling 14k requests/minute with p99 latency under 90ms.',
        'Owned CI/CD for 20+ models, reducing rollout time from two days to under an hour.',
        'Collaborated with research to productionize three models that reached customer-facing features.',
      ],
    },
  },
  {
    name: 'Daniel Russo',
    role: 'Product Designer',
    summary: 'Product designer specializing in B2B SaaS, design systems, and turning complex workflows into clear, usable interfaces.',
    skills: ['Figma', 'Design Systems', 'Prototyping', 'User Research', 'Accessibility'],
    experience: {
      title: 'Senior Product Designer',
      company: 'Tableau Health',
      bullets: [
        'Redesigned the clinician workflow tool, lifting task-completion rate from 61% to 87% in usability tests.',
        'Established a cross-team design system with 60+ components adopted by four product lines.',
        'Ran discovery sessions with 30+ users that reshaped the roadmap for two quarters.',
      ],
    },
  },
];

export default function LandingClient({ initialStats }) {
  const { user } = useAuth();
  const [globalStats] = useState(
    initialStats || { total_transformations: 12400, total_users: 3800 }
  );
  const [personaIdx, setPersonaIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const persona = SAMPLE_PERSONAS[personaIdx];

  // Cycle the sample preview every 6s when not paused.
  useEffect(() => {
    if (paused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setPersonaIdx((idx) => (idx + 1) % SAMPLE_PERSONAS.length);
    }, 6000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [paused]);

  const handleTailorClick = (e: React.MouseEvent) => {
    trackEvent('hero_cta_clicked', {
      cta: 'tailor',
      auth_state: user ? 'logged_in' : 'guest',
    });
  };

  const handleHowItWorksClick = () => {
    trackEvent('hero_cta_clicked', {
      cta: 'how_it_works',
      auth_state: user ? 'logged_in' : 'guest',
    });
  };

  const handleFaqOpen = (idx: number) => {
    trackEvent('faq_item_opened', { faq_index: idx, question: FAQ_ITEMS[idx].question });
  };

  const totalFormatted = globalStats.total_transformations.toLocaleString();

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col font-sans select-none overflow-x-hidden transition-colors duration-300 text-[var(--text-primary)]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 flex flex-col items-center justify-center text-center px-6">
        {/* One faint texture only — removes the second competing grid overlay. */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--border-default) 1px, transparent 1px),
              linear-gradient(to bottom, var(--border-default) 1px, transparent 1px)
            `,
            backgroundSize: '4.5rem 4.5rem',
            opacity: 0.10,
          }}
        />
        {/* Soft ambient glow, theme-aware. */}
        <div
          className="absolute top-8 left-1/2 -translate-x-1/2 w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full pointer-events-none"
          style={{
            background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
            filter: 'blur(80px)',
          }}
        />

        <div className="max-w-4xl mx-auto flex flex-col items-center z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono font-medium uppercase tracking-wider text-[var(--text-secondary)] bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-[var(--radius-xs)] mb-8">
            ATS Tailoring System
          </span>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] max-w-3xl tracking-tight">
            Your resume. <br />
            <span className="text-[var(--accent)]">Tailored for every job.</span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] mt-6 max-w-xl leading-relaxed font-medium">
            Upload your resume and a job description. ResumOrph rewrites your experience to match the role,
            scores it against the posting, and exports an ATS-ready PDF or DOCX — in about a minute.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-10 w-full sm:w-auto">
            <Link href={user ? '/transform' : '/signup'} onClick={handleTailorClick} className="w-full sm:w-auto">
              <button className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-8 text-sm">
                Tailor my resume
                <ArrowRight size={14} className="stroke-[2.5]" />
              </button>
            </Link>
            <a href="#how-it-works" onClick={handleHowItWorksClick} className="w-full sm:w-auto">
              <button className="btn-ghost w-full sm:w-auto py-3 px-8 text-sm">
                How it works
              </button>
            </a>
          </div>

          <span className="text-sm text-[var(--text-muted)] mt-5 font-mono">
            No credit card required. Up to 10 free optimizations per hour.
          </span>
        </div>

        {/* Sample resume preview — clean, paper-like, theme-parity. Replaces the dark code-diff card. */}
        <div
          className="w-full max-w-3xl mt-20 px-4 z-10 animate-slide-up"
          style={{ animationDelay: '80ms' }}
        >
          <div className="relative">
            {/* Pause control for the cycling preview. */}
            <button
              onClick={() => setPaused((p) => !p)}
              className="absolute -top-3 right-3 z-20 btn-ghost text-xs py-1 px-3 rounded-full"
              aria-label={paused ? 'Resume cycling preview' : 'Pause cycling preview'}
            >
              {paused ? '▶ Play' : '❚❚ Pause'}
            </button>

            <div className="preview-card p-6 sm:p-8 text-left">
              {/* Header row: name, role, score badge. */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="demo-text-primary font-semibold text-xl leading-tight">
                    {persona.name}
                  </h2>
                  <p className="demo-text-muted text-sm mt-0.5">{persona.role}</p>
                </div>
                <span className="score-badge shrink-0">
                  <span className="text-xs mr-1 opacity-70">Match</span>
                  82%
                </span>
              </div>

              {/* Summary. */}
              <p className="demo-text-primary text-sm leading-relaxed mb-5">
                {persona.summary}
              </p>

              {/* Skills row. */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {persona.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-block text-xs bg-[var(--bg-subtle)] border border-[var(--border-default)] text-[var(--text-secondary)] rounded-full px-2.5 py-1"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* One experience block — enough to read as a real resume. */}
              <div className="border-t border-[var(--border-default)] pt-5">
                <div className="flex items-baseline justify-between mb-2.5">
                  <div>
                    <p className="demo-text-primary font-semibold text-sm">{persona.experience.title}</p>
                    <p className="demo-text-muted text-xs">{persona.experience.company}</p>
                  </div>
                  <span className="demo-text-muted text-xs ml-4 font-mono">2021 — present</span>
                </div>
                <ul className="space-y-2">
                  {persona.experience.bullets.map((bullet, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="demo-text-accent mt-0.5 shrink-0 font-bold">›</span>
                      <span className="demo-text-primary text-[13px] leading-relaxed">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What else you get — small footer strip on the preview. */}
              <div className="mt-6 pt-4 border-t border-[var(--border-default)]/60 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[var(--text-muted)]">
                <span>Rewrites for summary + bullets</span>
                <span>Missing keywords</span>
                <span>Recruiter scan</span>
                <span>Interview prep</span>
                <span>Cover letter</span>
                <span>PDF / DOCX / text</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works — clean stepped row. */}
      <section
        id="how-it-works"
        className="py-24 relative border-t border-[var(--border-default)]"
      >
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--border-default) 1px, transparent 1px),
              linear-gradient(to bottom, var(--border-default) 1px, transparent 1px)
            `,
            backgroundSize: '4rem 4rem',
            opacity: 0.08,
          }}
        />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4 text-[var(--text-primary)]">
            Three steps. One tailored resume.
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-16 max-w-md mx-auto font-medium">
            From raw resume to an ATS-ready document you can download in minutes.
          </p>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Add your resume',
                desc: 'Upload a PDF, DOCX, or TXT — or paste your resume text straight into the wizard.',
                icon: FileText,
              },
              {
                step: '02',
                title: 'Paste the job description',
                desc: 'Drop in the target posting. The engine extracts the skills and terms that matter for the role.',
                icon: Sparkles,
              },
              {
                step: '03',
                title: 'Tailor and download',
                desc: 'Review your match score and missing keywords, read the rewrites, and export as PDF or DOCX — plus a cover letter.',
                icon: CheckCircle,
              },
            ].map((item, idx) => (
              <li
                key={idx}
                className="relative flex flex-col items-start text-left p-6 bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]"
              >
                <span className="text-[11px] font-mono font-medium text-[var(--text-muted)] mb-4">
                  {item.step}
                </span>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--bg-subtle)] border border-[var(--border-default)] text-[var(--accent)] mb-4 shrink-0">
                  <item.icon size={18} className="stroke-[2]" />
                </div>
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-2">
                  {item.title}
                </h3>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed font-normal">
                  {item.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Honest trust line — real number + defensible copy. */}
      <section className="py-10 border-y border-[var(--border-default)]/60">
        <div className="max-w-3xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-center">
          <div className="flex items-center">
            <span className="text-[22px] font-bold text-[var(--text-primary)]">
              {totalFormatted}+
            </span>
            <span className="text-sm text-[var(--text-muted)] ml-1.5">resumes optimized</span>
          </div>
          <span className="hidden md:inline text-[var(--border-default)]">·</span>
          <div className="flex items-center">
            <span className="text-[22px] font-bold text-[var(--text-primary)]">10</span>
            <span className="text-sm text-[var(--text-muted)] ml-1.5">free optimizations / hour</span>
          </div>
          <span className="hidden md:inline text-[var(--border-default)]">·</span>
          <div className="flex items-center">
            <span className="text-[22px] font-bold text-[var(--text-primary)]">PDF, DOCX, text</span>
            <span className="text-sm text-[var(--text-muted)] ml-1.5">download formats</span>
          </div>
        </div>
      </section>

      {/* FAQ — same accordion, calmer surround, expanded content. */}
      <section className="py-24 max-w-3xl mx-auto px-6">
        <h2 className="font-serif text-3xl font-bold text-center mb-4 text-[var(--text-primary)]">
          Frequently asked questions
        </h2>
        <p className="text-sm text-[var(--text-secondary)] text-center mb-14 font-medium">
          The practical details — not a wall of text.
        </p>
        <Accordion
          items={FAQ_ITEMS}
          onItemToggle={handleFaqOpen}
        />
      </section>

      <Footer />
    </div>
  );
}
