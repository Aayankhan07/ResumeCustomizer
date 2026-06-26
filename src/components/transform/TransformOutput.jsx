import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Milestone, 
  Target, 
  UserCheck, 
  Diff, 
  Mic, 
  Mail, 
  ShieldCheck, 
  Sliders, 
  Briefcase, 
  Download, 
  Copy, 
  RefreshCw, 
  FileText, 
  Check, 
  AlertTriangle, 
  Info,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Clock,
  Plus,
  AlignLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { generateResumePDF } from '../../lib/pdfGenerator';
import Button from '../ui/Button';
import ResumePreview from './ResumePreview';
import ResumeCompare from './ResumeCompare';

// Import modular tab components
import OverviewTab from './tabs/OverviewTab';
import RoadmapTab from './tabs/RoadmapTab';
import SkillsTab from './tabs/SkillsTab';
import RecruiterTab from './tabs/RecruiterTab';
import RewritesTab from './tabs/RewritesTab';
import InterviewTab from './tabs/InterviewTab';
import CoverLetterTab from './tabs/CoverLetterTab';
import AtsCheckTab from './tabs/AtsCheckTab';
import RescoreTab from './tabs/RescoreTab';

export default function TransformOutput({ result, plainText, originalText, onReset }) {
  // Set Compatibility Overview as the default active tab
  const [activeTab, setActiveTab] = useState('overview');
  const [cvSubTab, setCvSubTab] = useState('optimized'); // 'optimized' | 'compare' | 'plain'
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [pageBudget, setPageBudget] = useState('standard');
  const [copying, setCopying] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);
  const [score, setScore] = useState(0);
  
  // Accordion state for Interview Prep Expectation
  const [expandedExpectation, setExpandedExpectation] = useState(null);
  
  // Sub-tab selection for Interview Prep (technical, behavioral, curveball)
  const [interviewSubTab, setInterviewSubTab] = useState('technical');

  // Roadmap task completion states
  const [completedTasks, setCompletedTasks] = useState({});

  // Re-score adjustment sliders
  const [sliders, setSliders] = useState({
    techDepth: 65,
    conciseness: 50,
    industryFocus: 80
  });
  const [isReScoring, setIsReScoring] = useState(false);
  const [adjustedScore, setAdjustedScore] = useState(null);

  const targetScore = result.meta?.match_score ?? 85;

  // Animate score count up on mount
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = targetScore / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= targetScore) {
        setScore(targetScore);
        clearInterval(timer);
      } else {
        setScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [targetScore]);

  const currentScore = adjustedScore !== null ? adjustedScore : score;

  const getScoreColorInfo = (scoreValue) => {
    if (scoreValue < 50) {
      return {
        pill: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/15 dark:border-rose-500/25 dark:text-rose-400',
        dot: 'bg-rose-500',
        bar: 'bg-rose-500'
      };
    } else if (scoreValue < 75) {
      return {
        pill: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/15 dark:border-amber-500/25 dark:text-amber-400',
        dot: 'bg-amber-500',
        bar: 'bg-amber-500'
      };
    } else {
      return {
        pill: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-500/25 dark:text-emerald-400',
        dot: 'bg-emerald-500',
        bar: 'bg-emerald-500'
      };
    }
  };

  const scoreColors = getScoreColorInfo(currentScore);

  // Derive dynamic fields from results
  const jobTitle = result.meta?.detected_job_title || 'Machine Learning Engineer';
  const company = result.meta?.detected_company || 'Target Company';
  const candidateName = result.contact?.name || 'Muhammad Aayan Khan';
  
  const technicalSkills = result.skills?.technical || [];
  const toolsSkills = result.skills?.tools || [];
  const softSkills = result.skills?.soft || [];

  // DYNAMIC RECRUITER SCAN DATA
  const recruiterScan = result.recruiter_scan || {
    attention_timeline: [
      `First noticed: Strong technical skills in ${technicalSkills.slice(0, 3).join(', ') || 'core languages'}`,
      `Second noticed: Experience tailoring projects and experience for ${jobTitle} roles`,
      `Third noticed: Solid self-taught credentials, courses, and certifications`
    ],
    strong_yes: `Robust hands-on experience with ${technicalSkills.slice(0, 4).join(', ') || 'essential skills'} and a strong project portfolio makes this candidate a competitive fit for the ${jobTitle} role.`,
    completely_missed: `Limited direct production-level focus on advanced cloud scalability or specialized infrastructure tools.`,
    best_fix: `Develop or highlight a personal project showcasing containerization, cloud deployment, or system scaling to mitigate infrastructure concerns.`,
    elevator_pitch: `Hi, I'm ${candidateName}. I'm a ${jobTitle} specializing in building high-quality, high-performance systems. In my recent work, I've focused on leveraging ${technicalSkills.slice(0, 3).join(', ')} to build scalable solutions that improve efficiency and user experiences. I take a lot of pride in translating complex requirements into clean, optimized code. I'm very excited about the ${jobTitle} position because my technical stack and engineering philosophy align directly with the problems your team is tackling.`
  };

  // DYNAMIC ROADMAP DATA
  const roadmapData = result.roadmap || {
    current_level: currentScore >= 90 ? 'Competitive' : currentScore >= 75 ? 'Developing' : 'Beginner',
    tasks: [
      { 
        task: recruiterScan.best_fix.replace('Develop or highlight a ', 'Develop a '), 
        type: 'Projects', 
        impact: 'High Impact', 
        points: 5 
      },
      { 
        task: `Pursue an advanced certification or build a deep-dive project focusing on ${toolsSkills[0] || 'modern system architecture'}`, 
        type: 'Certifications', 
        impact: 'Medium Impact', 
        points: 3 
      }
    ]
  };

  // DYNAMIC SKILLS INTELLIGENCE DATA
  const skillsIntell = result.skills_intelligence || {
    technical_count: technicalSkills.length || 8,
    soft_count: softSkills.length || 3,
    certs_count: result.certifications?.length || 2,
    missing_count: 2,
    skills_to_add: ['System Scalability', 'Cloud Computing']
  };

  // DYNAMIC REWRITES DATA
  const rewritesList = result.rewrites || [
    {
      section: 'Professional Summary',
      before: `AI undergraduate with hands-on experience across the ML lifecycle: pipelines, model training, NLP, LLMs, and deployments. Seeking a role in software engineering.`,
      after: result.summary
    },
    {
      section: 'Work Experience',
      before: result.experience?.[0] 
        ? `Built and deployed applications using Python and javascript. Collaborated with teams to deliver features.` 
        : `Designed systems, wrote code, fixed bugs, and worked with databases.`,
      after: result.experience?.[0]?.bullets?.[0] || `Spearheaded the development and deployment of production-ready AI and full-stack applications, leveraging core engineering best practices.`
    },
    {
      section: 'Skills Section',
      before: `Skills: ${technicalSkills.slice(0, 4).join(', ')}. Tools: ${toolsSkills.join(', ')}.`,
      after: `Technical skills include ${technicalSkills.join(', ')}, with a strong foundation in computer science and software engineering.`
    }
  ];

  // DYNAMIC INTERVIEW PREP DATA
  const interviewPrep = result.interview_prep || {
    technical: [
      {
        question: `What is your experience with ${technicalSkills[0] || 'Python'} and ${technicalSkills[1] || 'your core stack'}?`,
        difficulty: 'Medium',
        expectation: `Explain how you design, compile, and tune models or systems. Reference specific projects like your ML-vault or repositories, outlining the architectural pipelines you built with ${technicalSkills[0]} and ${toolsSkills[0] || 'your tools'}.`
      },
      {
        question: `How do you approach performance optimization and scalability when deploying systems?`,
        difficulty: 'Hard',
        expectation: `Discuss latency reduction, model quantization, caching strategies, or API optimization. Quantify the results using metrics from your experience points (e.g., resource utilization or latency savings).`
      }
    ],
    behavioral: [
      {
        question: `Can you describe a technical challenge you faced in your previous projects and how you resolved it?`,
        difficulty: 'Hard',
        expectation: `Use the STAR method. Describe a slow database query, model drift, or pipeline blockage. Detail your diagnostic process and how you refactored the codebase to achieve a measurable result.`
      },
      {
        question: `How do you prioritize features or technical debt when working under tight deadlines?`,
        difficulty: 'Medium',
        expectation: `Explain your prioritization matrix (high-impact vs. effort), how you align with product owners, and your strategy for maintaining code quality while shipping critical features.`
      }
    ],
    curveball: [
      {
        question: `If a production system fails silently (e.g., bad model predictions or memory leaks), how do you diagnose it?`,
        difficulty: 'Hard',
        expectation: `Outline your telemetry, logging, and monitoring workflow. Discuss drift detection, setting up anomaly alerts, and deploying automated rollback or fallback mechanisms.`
      }
    ]
  };

  const handleDownloadPDF = () => {
    try {
      generateResumePDF(result, selectedTemplate, pageBudget);
      toast.success('PDF saved to your downloads');
    } catch (err) {
      toast.error('Failed to generate PDF. Try copying the plain text.');
    }
  };

  const handleCopyText = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(plainText);
      toast.success('Copied tailored resume to clipboard');
    } catch (err) {
      toast.error('Failed to copy text.');
    } finally {
      setTimeout(() => setCopying(false), 1500);
    }
  };

  const handleCopyElevatorPitch = async (pitch) => {
    setCopiedPitch(true);
    try {
      await navigator.clipboard.writeText(pitch);
      toast.success('Elevator pitch copied!');
    } catch (err) {
      toast.error('Failed to copy pitch.');
    } finally {
      setTimeout(() => setCopiedPitch(false), 1500);
    }
  };

  const handleCopyCoverLetter = async (letter) => {
    setCopiedLetter(true);
    try {
      await navigator.clipboard.writeText(letter);
      toast.success('Cover letter copied!');
    } catch (err) {
      toast.error('Failed to copy cover letter.');
    } finally {
      setTimeout(() => setCopiedLetter(false), 1500);
    }
  };

  const handleDownloadCoverLetter = (letter) => {
    try {
      const element = document.createElement("a");
      const file = new Blob([letter], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `Cover_Letter_${result.contact?.name?.replace(/\s+/g, '_') || 'Resume'}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Cover letter downloaded as text file');
    } catch (err) {
      toast.error('Failed to download cover letter.');
    }
  };

  const toggleTask = (taskKey) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskKey]: !prev[taskKey]
    }));
  };

  const handleApplyAdjustments = () => {
    setIsReScoring(true);
    setTimeout(() => {
      setIsReScoring(false);
      const baseScore = result.meta?.match_score ?? 85;
      const boost = Math.min(100, Math.max(0, Math.floor((sliders.techDepth + sliders.industryFocus) / 18)));
      const newScore = Math.min(98, Math.floor(baseScore + (boost - 8)));
      setAdjustedScore(newScore);
      toast.success('Resume parameters refined. Compatibility adjusted!');
    }, 1200);
  };

  // Unified Sidebar Menu Items incorporating Transformed CV/Resume and Before & After comparison
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'preview', label: 'Transformed CV', icon: FileText },
    { id: 'roadmap', label: 'Roadmap', icon: Milestone },
    { id: 'skills', label: 'Skills', icon: Target },
    { id: 'recruiter', label: 'Recruiter', icon: UserCheck },
    { id: 'rewrites', label: 'Rewrites', icon: Diff },
    { id: 'interview', label: 'Interview', icon: Mic },
    { id: 'coverletter', label: 'Cover Letter', icon: Mail },
    { id: 'atscheck', label: 'ATS Check', icon: ShieldCheck },
    { id: 'rescore', label: 'Re-Score', icon: Sliders }
  ];

  // Generate cover letter dynamically using candidate details
  const generatedCoverLetter = `[Your Name]
${result.contact?.email || '[Your Email]'} | ${result.contact?.phone || '[Your Phone]'}
${result.contact?.location || '[Your Location]'}
${result.contact?.linkedin ? `LinkedIn: ${result.contact.linkedin}` : ''}

${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Hiring Team
${company !== 'Target Company' ? company : 'Hiring Company'}

Subject: Application for ${jobTitle}

Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position. With a robust background in software development and a proven track record of delivering high-impact solutions, I am confident in my ability to make a significant contribution to your engineering team.

In my previous experience, I have focused heavily on core architectures, development standards, and performance optimization. I have hands-on experience designing and deploying scalable systems, and I specialize in ${technicalSkills.slice(0, 4).join(', ')}. My approach to engineering is highly analytical and output-driven—constantly aligning technical designs with user experience and business needs.

I am particularly drawn to your organization because of your focus on building modern, high-performance applications. I thrive in collaborative environments where engineers are empowered to take ownership and solve complex technical challenges. I am eager to bring my skills in ${toolsSkills.slice(0, 3).join(', ')} to your team to help build and scale your platform.

Thank you for your time and consideration. I welcome the opportunity to discuss how my technical skills and experience align with the needs of your engineering team.

Sincerely,

${candidateName}`;

  return (
    <div className="w-full flex flex-col gap-6 select-none animate-fade-in font-sans">
      
      {/* Visual Confirmation Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm shadow-slate-900/10">
            <Sparkles size={18} className="text-emerald-400 fill-emerald-400/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl text-slate-955 font-bold tracking-tight">ResumeAI Report</h2>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Analysis Active
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">{candidateName} | {jobTitle}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className={`border rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-bold transition-colors duration-300 ${scoreColors.pill}`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${scoreColors.dot}`} />
            {currentScore} Match Score
          </div>
          <button
            onClick={onReset}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <Plus size={13} />
            New Analysis
          </button>
        </div>
      </div>

      {/* Grid Layout: Sidebar & Content Panel */}
      <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch">
        
        {/* Balanced Light Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 bg-slate-50/70 border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between select-none shadow-inner">
          <div className="flex flex-col gap-6">
            
            {/* ATS Score Box */}
            <div className="bg-white border border-slate-200/70 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ATS Compatibility</span>
                <span className="text-xs font-bold text-slate-955">{currentScore}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${scoreColors.bar}`} 
                  style={{ width: `${currentScore}%` }}
                />
              </div>
            </div>

            {/* Mobile Tab Navigation (Scrollable) */}
            <div className="lg:hidden flex overflow-x-auto pb-1 gap-1.5 scrollbar-none snap-x">
              {menuItems.map((item) => {
                if (item.hideIfNoOriginal && !originalText) return null;
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`snap-center flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive 
                        ? 'sidebar-active-tab bg-slate-900 text-white font-bold shadow-sm' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <IconComponent size={14} />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Desktop Vertical Menu */}
            <nav className="hidden lg:flex flex-col gap-1">
              {menuItems.map((item) => {
                if (item.hideIfNoOriginal && !originalText) return null;
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm font-semibold tracking-tight transition-all cursor-pointer ${
                      isActive 
                        ? 'sidebar-active-tab bg-slate-900 text-white shadow-sm font-bold' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <IconComponent 
                      size={15} 
                      className={`transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} 
                    />
                    {item.label}
                  </button>
                );
              })}
            </nav>

          </div>

          {/* Bottom Sidebar Buttons */}
          <div className="hidden lg:flex flex-col gap-2 pt-6 border-t border-slate-200/80 mt-6">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Download size={13} />
              Download PDF
            </button>
            <button
              onClick={handleCopyText}
              className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
            >
              <Copy size={13} />
              {copying ? 'Copied' : 'Share Score'}
            </button>
          </div>
        </aside>

        {/* Content Area Panel - Renders separated sub-component functions */}
        <main className="flex-1 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm flex flex-col justify-between min-h-[580px] transition-all">
          <div className="w-full">
            {activeTab === 'overview' && (
              <OverviewTab 
                currentScore={currentScore}
                jobTitle={jobTitle}
                company={company}
                keywordsMatchedCount={result.meta?.keywords_matched?.length || 0}
                keywordsTotalCount={result.meta?.keywords_total || 0}
              />
            )}

            {/* Document Previews & Text Views inside primary sidebar navigation */}
            {activeTab === 'preview' && (
              <div className="flex flex-col gap-6">
                {/* Segmented Sub-tabs */}
                <div className="flex border-b border-slate-200 pb-px gap-4">
                  <button
                    onClick={() => setCvSubTab('optimized')}
                    className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
                      cvSubTab === 'optimized'
                        ? 'border-slate-900 text-slate-900 font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Optimized CV Preview
                  </button>
                  {originalText && (
                    <button
                      onClick={() => setCvSubTab('compare')}
                      className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
                        cvSubTab === 'compare'
                          ? 'border-slate-900 text-slate-900 font-bold'
                          : 'border-transparent text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Compare Before & After
                    </button>
                  )}
                  <button
                    onClick={() => setCvSubTab('plain')}
                    className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
                      cvSubTab === 'plain'
                        ? 'border-slate-900 text-slate-900 font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Raw Plain Text
                  </button>
                </div>

                {/* Sub-tab content */}
                {cvSubTab === 'optimized' && (
                  <div className="flex flex-col gap-6 animate-fade-in">
                    {/* Settings Panel */}
                    <div className="settings-panel bg-slate-50/50 border border-slate-200/80 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                      <div className="flex flex-col gap-4 flex-1">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                            Select Design Template
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { id: 'classic', label: 'Classic Serif', desc: 'Traditional & elegant' },
                              { id: 'modern', label: 'Modern Minimalist', desc: 'Clean, left-aligned' },
                              { id: 'tech', label: 'Clean Tech', desc: 'Mono, structured' },
                              { id: 'executive', label: 'Executive Elegant', desc: 'Luxury serif, centered' }
                            ].map(tpl => (
                              <button
                                key={tpl.id}
                                onClick={() => setSelectedTemplate(tpl.id)}
                                className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                                  selectedTemplate === tpl.id
                                    ? 'template-card-active border-slate-900 bg-white shadow-sm ring-1 ring-slate-900/5'
                                    : 'border-slate-200 hover:border-slate-300 bg-white/50'
                                }`}
                              >
                                <span className="text-xs font-bold text-slate-850 dark:text-slate-200 flex items-center gap-1">
                                  {tpl.label}
                                  {selectedTemplate === tpl.id && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  )}
                                </span>
                                <span className="text-[9px] text-slate-400 font-medium mt-0.5">{tpl.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 shrink-0 md:border-l md:border-slate-250 md:pl-6">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                          Page Budgeting
                        </label>
                        <div className="flex items-center bg-slate-200/60 p-0.5 rounded-lg border border-slate-250 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => setPageBudget('standard')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                              pageBudget === 'standard'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Standard Spacing
                          </button>
                          <button
                            type="button"
                            onClick={() => setPageBudget('fit')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                              pageBudget === 'fit'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Sparkles size={11} className="text-emerald-500 fill-emerald-500/10" />
                            Auto-Fit (1 Page)
                          </button>
                        </div>
                        <span className="text-[9px] text-slate-400 font-medium text-center md:text-left mt-1">
                          {pageBudget === 'fit' ? 'Font sizes & margins compressed to fit 1 page' : 'Generous spacing for multi-page layouts'}
                        </span>
                      </div>
                    </div>

                    {/* Preview document container */}
                    <div className="bg-mist/20 py-6 rounded-xl border border-boundary">
                      <ResumePreview data={result} templateId={selectedTemplate} pageBudget={pageBudget} />
                    </div>
                  </div>
                )}

                {cvSubTab === 'compare' && originalText && (
                  <div className="animate-fade-in">
                    <ResumeCompare originalText={originalText} transformedData={result} />
                  </div>
                )}

                {cvSubTab === 'plain' && (
                  <div className="animate-fade-in flex flex-col gap-4 text-left">
                    <div className="relative">
                      <textarea
                        readOnly
                        value={plainText}
                        className="w-full min-h-[420px] bg-white border border-boundary rounded-xl p-6 font-mono text-[11px] text-ink leading-relaxed focus:outline-none select-all"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-4 right-4 flex items-center gap-1.5 border border-slate-200 bg-white shadow-sm hover:bg-slate-50"
                        onClick={handleCopyText}
                      >
                        <Copy size={13} />
                        {copying ? 'Copied' : 'Copy'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'roadmap' && (
              <RoadmapTab 
                roadmapData={roadmapData}
                completedTasks={completedTasks}
                toggleTask={toggleTask}
                currentScore={currentScore}
              />
            )}

            {activeTab === 'skills' && (
              <SkillsTab 
                jobTitle={jobTitle}
                currentScore={currentScore}
                technicalSkills={technicalSkills}
                skillsIntell={skillsIntell}
              />
            )}

            {activeTab === 'recruiter' && (
              <RecruiterTab 
                jobTitle={jobTitle}
                recruiterScan={recruiterScan}
                copiedPitch={copiedPitch}
                handleCopyElevatorPitch={handleCopyElevatorPitch}
              />
            )}

            {activeTab === 'rewrites' && (
              <RewritesTab 
                rewritesList={rewritesList}
                originalText={originalText}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'interview' && (
              <InterviewTab 
                interviewPrep={interviewPrep}
                interviewSubTab={interviewSubTab}
                setInterviewSubTab={setInterviewSubTab}
                expandedExpectation={expandedExpectation}
                setExpandedExpectation={setExpandedExpectation}
              />
            )}

            {activeTab === 'coverletter' && (
              <CoverLetterTab 
                generatedCoverLetter={generatedCoverLetter}
                copiedLetter={copiedLetter}
                handleCopyCoverLetter={handleCopyCoverLetter}
                handleDownloadCoverLetter={handleDownloadCoverLetter}
              />
            )}

            {activeTab === 'atscheck' && (
              <AtsCheckTab />
            )}

            {activeTab === 'rescore' && (
              <RescoreTab 
                sliders={sliders}
                setSliders={setSliders}
                isReScoring={isReScoring}
                handleApplyAdjustments={handleApplyAdjustments}
              />
            )}

          </div>

          {/* Simple Clean Footer */}
          <div className="flex justify-end border-t border-slate-150 pt-5 mt-8 select-none">
            <span className="text-[10px] font-mono text-slate-400 font-bold">
              ResumOrph Engine v1.2
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}
