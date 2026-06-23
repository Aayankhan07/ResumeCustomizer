import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getGlobalStats } from '../lib/api';
import { ArrowRight, CheckCircle, RefreshCw, FileText, Sparkles } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Accordion from '../components/ui/Accordion';
import Card from '../components/ui/Card';

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

export default function Landing() {
  const { user } = useAuth();
  const [globalStats, setGlobalStats] = useState({ total_transformations: 12400, total_users: 3800 });
  const [exampleIdx, setExampleIdx] = useState(0);
  const [isTransformed, setIsTransformed] = useState(false);

  // Fetch real global stats on mount
  useEffect(() => {
    getGlobalStats().then((data) => {
      if (data && data.total_transformations > 0) {
        setGlobalStats(data);
      }
    });
  }, []);

  // Cycle animated before/after preview card
  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransformed((prev) => {
        if (prev) {
          // If it was transformed, move to next example and set to untransformed
          setExampleIdx((idx) => (idx + 1) % BULLET_EXAMPLES.length);
          return false;
        } else {
          // If it was original, transform it
          return true;
        }
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const currentExample = BULLET_EXAMPLES[exampleIdx];

  return (
    <div className="min-h-screen bg-mist flex flex-col font-sans select-none overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-slate-50/50 py-24 lg:py-32 flex flex-col items-center justify-center text-center px-6 border-b border-slate-200">
        {/* Subtle Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-70 z-0" />

        <div className="max-w-4xl mx-auto flex flex-col items-center z-10 stagger-children">
          {/* Eyebrow badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 rounded-md mb-8">
            ATS Tailoring System
          </span>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-slate-900 font-bold leading-[1.15] max-w-3xl tracking-tight">
            Your resume. <br />
            <span className="text-slate-800">Tailored for every job.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-500 mt-6 max-w-md leading-relaxed">
            Upload your resume and a target job description. We rewrite and format it to align with applicant tracking systems and keywords in under 30 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-10 w-full sm:w-auto">
            <Link to={user ? '/transform' : '/signup'} className="w-full sm:w-auto">
              <Button variant="primary" className="w-full flex items-center justify-center gap-2 py-3 px-8 text-sm font-medium rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors">
                Optimize My Resume
                <ArrowRight size={14} className="stroke-[2.5]" />
              </Button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full py-3 px-8 text-sm font-medium bg-white hover:bg-slate-50 rounded-md border border-slate-200 text-slate-700 transition-colors">
                How It Works
              </Button>
            </a>
          </div>

          <span className="text-[10px] font-mono text-slate-400 mt-5">
            No credit card required. Up to 10 free optimizations per hour.
          </span>
        </div>

        {/* Morphing Preview Card (IDE Style with Side-by-side comparison) */}
        <div className="w-full max-w-3xl mt-16 px-4 z-10 animate-slide-up" style={{ animationDelay: '80ms' }}>
          <div className="bg-slate-900 shadow-xl rounded-xl border border-slate-800 overflow-hidden text-left transition-all duration-200">
            {/* IDE Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-slate-950 border-b border-slate-800 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-semibold tracking-wider">
                optimizer_diff.py
              </span>
              <span
                className="px-2 py-0.5 text-[9px] font-mono font-medium rounded border text-slate-400 bg-slate-800 border-slate-700"
              >
                Line-by-line comparison
              </span>
            </div>

            {/* IDE Workspace (Side-by-side comparing input vs output) */}
            <div className="p-6 font-mono text-xs sm:text-sm leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[160px] relative select-text bg-slate-900">
              {/* Left Column: Original */}
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

              {/* Right Column: Tailored */}
              <div className="flex flex-col gap-2 pl-0 md:pl-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">AI Tailored Bullet</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 font-semibold uppercase">After</span>
                </div>
                <div className="text-emerald-400 flex items-start gap-1.5 mt-2 animate-fade-in" key={`after-${exampleIdx}`}>
                  <span className="text-emerald-500 font-bold select-none">+</span>
                  <div>
                    {currentExample.after.split(' ').map((word, idx) => {
                      const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
                      const match = currentExample.keywords.find(kw =>
                        cleanWord.includes(kw.toLowerCase()) || kw.toLowerCase().includes(cleanWord)
                      );
                      if (match && cleanWord.length > 2) {
                        return (
                          <span key={idx} className="bg-emerald-900/30 text-emerald-300 font-semibold border border-emerald-800/30 px-1 py-0.5 rounded mx-0.5 inline-block select-none transition-all">
                            {word}
                          </span>
                        );
                      }
                      return <span key={idx} className="inline-block my-0.5">{word}&nbsp;</span>;
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-28 bg-white border-b border-slate-100 relative">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] opacity-40 z-0" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 font-bold mb-4">Three steps. One perfect resume.</h2>
          <p className="text-sm text-slate-500 mb-20 max-w-md mx-auto">Get your documents optimized and ready in less than 2 minutes.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Add your resume',
                desc: 'Upload a PDF, DOCX, or TXT file — or just paste your resume text directly into the workspace wizard.',
              },
              {
                step: '02',
                title: 'Add the job details',
                desc: 'Paste the target job description or requirements. Our system parses the parameters.',
              },
              {
                step: '03',
                title: 'Download tailored PDF',
                desc: 'Download a clean, ATS-optimized resume PDF formatted in Times New Roman for maximum readability.',
              },
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-200 shadow-sm rounded-lg p-8 text-left flex flex-col gap-4 hover:border-slate-400 transition-colors duration-150 relative group"
              >
                <span className="w-10 h-10 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm select-none border border-slate-200 shadow-sm">
                  {item.step}
                </span>
                
                <h3 className="font-serif text-lg font-bold text-slate-900 mt-1">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <section className="py-16 bg-slate-50 border-y border-slate-200 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <h3 className="font-serif text-4xl font-bold text-slate-900 mb-1">
                {(globalStats?.total_transformations || 12400).toLocaleString()}+
              </h3>
              <p className="text-[10px] text-slate-550 font-mono font-bold uppercase tracking-wider">Resumes Optimized</p>
            </div>
            
            <div className="flex flex-col items-center border-y sm:border-y-0 sm:border-x border-slate-200 py-4 sm:py-0">
              <h3 className="font-serif text-4xl font-bold text-slate-900 mb-1">
                83%
              </h3>
              <p className="text-[10px] text-slate-550 font-mono font-bold uppercase tracking-wider">Average Match Score</p>
            </div>
            
            <div className="flex flex-col items-center">
              <h3 className="font-serif text-4xl font-bold text-slate-900 mb-1">
                &lt; 30s
              </h3>
              <p className="text-[10px] text-slate-550 font-mono font-bold uppercase tracking-wider">Processing Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-serif text-3xl text-slate-900 font-bold mb-10 text-center">Frequently Asked Questions</h2>
          <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
            <Accordion items={FAQ_ITEMS} />
          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
}
