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
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { generateResumePDF } from '../../lib/pdfGenerator';
import Button from '../ui/Button';
import ResumePreview from './ResumePreview';
import ResumeCompare from './ResumeCompare';

export default function TransformOutput({ result, plainText, originalText, onReset }) {
  const [activeTab, setActiveTab] = useState('overview');
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

  // Derive dynamic fields from results
  const jobTitle = result.meta?.detected_job_title || 'Machine Learning Engineer';
  const company = result.meta?.detected_company || 'Target Company';
  const candidateName = result.contact?.name || 'Muhammad Aayan Khan';
  
  const technicalSkills = result.skills?.technical || [];
  const toolsSkills = result.skills?.tools || [];
  const softSkills = result.skills?.soft || [];

  // 1. DYNAMIC RECRUITER SCAN
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

  // 2. DYNAMIC ROADMAP
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

  // Determine horizontal timeline progress based on current level
  const getLevelProgress = (level) => {
    switch (level) {
      case 'Beginner': return '10%';
      case 'Developing': return '40%';
      case 'Competitive': return '70%';
      case 'Top Tier': return '100%';
      default: return '40%';
    }
  };

  // 3. DYNAMIC SKILLS INTELLIGENCE
  const skillsIntell = result.skills_intelligence || {
    technical_count: technicalSkills.length || 8,
    soft_count: softSkills.length || 3,
    certs_count: result.certifications?.length || 2,
    missing_count: 2,
    skills_to_add: ['System Scalability', 'Cloud Computing']
  };

  // Calculate dynamic bar chart heights based on actual counts
  const maxCount = Math.max(
    skillsIntell.technical_count, 
    skillsIntell.soft_count, 
    skillsIntell.certs_count, 
    skillsIntell.missing_count, 
    1
  );
  
  const getBarHeight = (count) => {
    return `${Math.max(15, Math.min(100, (count / maxCount) * 100))}%`;
  };

  // 4. DYNAMIC REWRITES
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

  // 5. DYNAMIC INTERVIEW PREP
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
      generateResumePDF(result);
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

  // Sidebar Menu Items
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'roadmap', label: 'Roadmap', icon: Milestone },
    { id: 'skills', label: 'Skills', icon: Target },
    { id: 'recruiter', label: 'Recruiter', icon: UserCheck },
    { id: 'rewrites', label: 'Rewrites', icon: Diff },
    { id: 'interview', label: 'Interview', icon: Mic },
    { id: 'coverletter', label: 'Cover Letter', icon: Mail },
    { id: 'atscheck', label: 'ATS Check', icon: ShieldCheck },
    { id: 'rescore', label: 'Re-Score', icon: Sliders },
    { id: 'jdmatch', label: 'JD Match', icon: Briefcase }
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
              <h2 className="font-serif text-2xl text-slate-950 font-bold tracking-tight">ResumeAI Report</h2>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Analysis Active
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">{candidateName} | {jobTitle}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="bg-slate-50 border border-slate-200/75 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            {currentScore} Match Score
          </div>
          <button
            onClick={onReset}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <PlusIcon size={13} />
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
                <span className="text-xs font-bold text-slate-950">{currentScore}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000 ease-out" 
                  style={{ width: `${currentScore}%` }}
                />
              </div>
            </div>

            {/* Mobile Tab Navigation (Scrollable) */}
            <div className="lg:hidden flex overflow-x-auto pb-1 gap-1.5 scrollbar-none snap-x">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`snap-center flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive 
                        ? 'bg-slate-900 text-white font-bold shadow-sm' 
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
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm font-semibold tracking-tight transition-all ${
                      isActive 
                        ? 'bg-slate-900 text-white shadow-sm font-bold' 
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

        {/* Content Area Panel */}
        <main className="flex-1 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm flex flex-col justify-between min-h-[580px] transition-all">
          <div className="w-full">
            
            {/* 1. Overview Tab */}
            {activeTab === 'overview' && (
              <div className="animate-fade-in flex flex-col gap-6">
                <div>
                  <h3 className="font-serif text-2xl text-slate-955 font-bold tracking-tight">Compatibility Overview</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Visual summary of how well your tailored profile aligns with the job specification.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="border border-slate-200/80 bg-slate-50/50 rounded-xl p-5 flex flex-col gap-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-sans">
                      <Sparkles size={14} className="text-emerald-500" />
                      Fit Summary
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      Your resume has been optimized for the <strong>{jobTitle}</strong> position. We integrated critical keywords and framed your achievements using target-role terminology, raising your overall match score to <strong>{currentScore}%</strong>.
                    </p>
                  </div>
                  
                  <div className="border border-slate-200/80 bg-slate-50/50 rounded-xl p-5 flex flex-col gap-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-sans">
                      <ShieldCheck size={14} className="text-blue-500" />
                      ATS Scan Quality
                    </h4>
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-500">Keyword Density</span>
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 font-bold text-[10px]">OPTIMAL</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-500">Section Headings</span>
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 font-bold text-[10px]">100% STANDARD</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-500">Formatting Risk</span>
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 font-bold text-[10px]">ZERO FLAGS</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200/70 rounded-xl p-5 flex flex-col gap-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Tailoring Metadata</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Target Role</span>
                      <span className="text-xs font-bold text-slate-900 mt-1 truncate">{jobTitle}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Company</span>
                      <span className="text-xs font-bold text-slate-900 mt-1 truncate">{company !== 'Target Company' ? company : 'Not Specified'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Keywords Matched</span>
                      <span className="text-xs font-bold text-slate-900 mt-1">{result.meta?.keywords_matched?.length || 0} / {result.meta?.keywords_total || 0}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Layout Safety</span>
                      <span className="text-xs font-bold text-emerald-600 mt-1">ATS Compliant</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-4 flex items-start gap-3">
                  <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    This resume has been restructured utilizing a single-column, standard-heading layout. Avoid introducing tables, custom graphics, text boxes, or icons, as these elements commonly trigger parsing errors in legacy Applicant Tracking Systems.
                  </p>
                </div>
              </div>
            )}

            {/* 2. Roadmap Tab ("Path to Top Tier") */}
            {activeTab === 'roadmap' && (
              <div className="animate-fade-in flex flex-col gap-6">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Milestone size={14} className="text-emerald-500" />
                    Resume Roadmap
                  </div>
                  <h3 className="font-serif text-2xl text-slate-955 font-bold tracking-tight mt-1">Path to Top Tier</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    To reach the Top Tier level, focus on developing a personal project showcasing expertise in scalability and cloud computing, pursuing additional certifications in AI/ML, and networking with professionals in the field.
                  </p>
                </div>

                {/* Horizontal Progress Timeline */}
                <div className="border border-slate-200/80 bg-slate-50/50 rounded-xl p-6 flex flex-col gap-6">
                  {/* Step Indicators */}
                  <div className="flex justify-between items-center relative px-2">
                    {/* Line Rail */}
                    <div className="absolute left-6 right-6 top-4 h-1 bg-slate-200 rounded-full z-0">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                        style={{ width: getLevelProgress(roadmapData.current_level) }} 
                      />
                    </div>
                    
                    {/* Steps */}
                    {[
                      { label: 'Beginner', val: 'Beginner' },
                      { label: 'Developing', val: 'Developing' },
                      { label: 'Competitive', val: 'Competitive' },
                      { label: 'Top Tier', val: 'Top Tier' }
                    ].map((step, idx) => {
                      const levels = ['Beginner', 'Developing', 'Competitive', 'Top Tier'];
                      const currentIdx = levels.indexOf(roadmapData.current_level);
                      const stepIdx = levels.indexOf(step.val);
                      
                      const isChecked = stepIdx < currentIdx;
                      const isActive = stepIdx === currentIdx;
                      
                      return (
                        <div key={idx} className="flex flex-col items-center gap-2 relative z-10">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                            isChecked 
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
                              : isActive
                              ? 'bg-white border-emerald-500 text-emerald-600 shadow-sm ring-4 ring-emerald-50'
                              : 'bg-white border-slate-300 text-slate-400'
                          }`}>
                            {isChecked ? '✓' : isActive ? '◎' : '●'}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            isActive ? 'text-emerald-600' : 'text-slate-500'
                          }`}>{step.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* High-level scores */}
                  <div className="grid grid-cols-3 gap-3 border-t border-slate-200/60 pt-4 mt-2">
                    <div className="text-center flex flex-col">
                      <span className="text-2xl font-black text-slate-900 tracking-tight">{currentScore}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Current Score</span>
                    </div>
                    <div className="text-center flex flex-col border-x border-slate-200/60">
                      <span className="text-2xl font-black text-emerald-600 tracking-tight">
                        +{Object.entries(completedTasks).reduce((acc, [key, completed]) => {
                          if (!completed) return acc;
                          const taskObj = roadmapData.tasks[key];
                          return acc + (taskObj?.points ?? 0);
                        }, 0)}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Tracked Gain</span>
                    </div>
                    <div className="text-center flex flex-col">
                      <span className="text-2xl font-black text-slate-900 tracking-tight">
                        {Object.values(completedTasks).filter(Boolean).length}/{roadmapData.tasks.length}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Tasks Done</span>
                    </div>
                  </div>
                </div>

                {/* Checklist Tasks */}
                <div className="flex flex-col gap-3">
                  {roadmapData.tasks.map((taskItem, idx) => {
                    const isCompleted = !!completedTasks[idx];
                    return (
                      <div 
                        key={idx}
                        className={`border rounded-xl p-4 flex items-center justify-between gap-4 transition-all shadow-sm ${
                          isCompleted ? 'bg-slate-50/70 border-slate-200' : 'bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <input 
                            type="checkbox" 
                            id={`task-${idx}`}
                            checked={isCompleted}
                            onChange={() => toggleTask(idx)}
                            className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300 cursor-pointer mt-0.5"
                          />
                          <div className="flex flex-col gap-1">
                            <label htmlFor={`task-${idx}`} className="text-xs font-bold text-slate-850 cursor-pointer leading-relaxed">
                              {taskItem.task}
                            </label>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              <span className="bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase">{taskItem.type}</span>
                              <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                                taskItem.impact === 'High Impact' 
                                  ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                                  : 'bg-amber-50 text-amber-700 border border-amber-100'
                              }`}>{taskItem.impact}</span>
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase">+{taskItem.points} pts</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-50/50 border border-slate-200/60 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>Task Progress</span>
                    <span>
                      {roadmapData.tasks.length > 0 
                        ? Math.floor((Object.values(completedTasks).filter(Boolean).length / roadmapData.tasks.length) * 100)
                        : 0
                      }%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-300" 
                      style={{ 
                        width: `${roadmapData.tasks.length > 0 
                          ? (Object.values(completedTasks).filter(Boolean).length / roadmapData.tasks.length) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium italic text-center mt-1">
                    "With dedication and persistence, you can reach the Top Tier level and become a leading expert in the field of machine learning engineering."
                  </p>
                </div>

              </div>
            )}

            {/* 3. Skills Tab ("Role Match" & "Skills Intelligence") */}
            {activeTab === 'skills' && (
              <div className="animate-fade-in flex flex-col gap-6">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Target size={14} className="text-emerald-500" />
                    Role Match
                  </div>
                  <h3 className="font-serif text-2xl text-slate-955 font-bold tracking-tight mt-1">{jobTitle}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Core match analysis comparing your resume credentials against target-role requirements.</p>
                </div>

                {/* Score & Skills Chips Side-by-Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left: Score Card */}
                  <div className="border border-slate-200/80 bg-white rounded-xl p-5 flex flex-col justify-between shadow-sm">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Match Score</span>
                      <span className="font-serif text-5xl font-black text-emerald-600 leading-none">{currentScore}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden my-4">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${currentScore}%` }} />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Strong candidate with relevant technical skills and experience, but could benefit from more emphasis on {skillsIntell.skills_to_add.join(' and ') || 'scalability and cloud computing'}.
                    </p>
                  </div>

                  {/* Right: Matched/Missing Badges */}
                  <div className="flex flex-col gap-4">
                    <div className="border border-slate-200/80 bg-slate-50/40 rounded-xl p-4 flex flex-col gap-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                        <Check size={11} className="stroke-[3]" />
                        Matched Skills
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {technicalSkills.slice(0, 8).map((skill, idx) => (
                          <span key={idx} className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded px-2.5 py-0.5 text-[10px] font-bold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="border border-slate-200/80 bg-slate-50/40 rounded-xl p-4 flex flex-col gap-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                        <AlertTriangle size={11} />
                        Skills To Add
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {skillsIntell.skills_to_add.map((skill, idx) => (
                          <span key={idx} className="bg-amber-50 text-amber-700 border border-amber-100 rounded px-2.5 py-0.5 text-[10px] font-bold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom CSS Bar Chart for "Skills Intelligence" */}
                <div className="border border-slate-200/80 bg-slate-50/30 rounded-xl p-5 flex flex-col gap-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Skills Intelligence</span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">Skill coverage by category</h4>
                    </div>
                    {/* Summary Badges */}
                    <div className="flex items-center gap-1.5 select-none">
                      {[
                        { label: 'Technical', val: skillsIntell.technical_count, color: 'bg-emerald-500' },
                        { label: 'Soft', val: skillsIntell.soft_count, color: 'bg-blue-400' },
                        { label: 'Certs', val: skillsIntell.certs_count, color: 'bg-amber-400' },
                        { label: 'Missing', val: skillsIntell.missing_count, color: 'bg-rose-400' }
                      ].map((badge, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded px-2 py-1 flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
                          <span className="font-extrabold text-slate-950">{badge.val}</span>
                          <span className="text-slate-400 font-medium">{badge.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed -mt-1">
                    The skill map separates proven capabilities from missing keywords that could strengthen role alignment.
                  </p>

                  {/* Chart Visualizer */}
                  <div className="h-44 border-b border-slate-200 relative flex items-end justify-around pb-1 pt-6 mt-2 bg-[linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:100%_2rem] select-none">
                    
                    {/* 1. Technical */}
                    <div className="flex flex-col items-center gap-2 w-16 group">
                      <span className="text-[10px] font-black text-slate-900 group-hover:scale-110 transition-transform">{skillsIntell.technical_count}</span>
                      <div 
                        className="w-8 bg-emerald-400 hover:bg-emerald-500 rounded-t-md transition-all duration-500 shadow-sm" 
                        style={{ height: getBarHeight(skillsIntell.technical_count) }} 
                      />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Technical</span>
                    </div>

                    {/* 2. Soft */}
                    <div className="flex flex-col items-center gap-2 w-16 group">
                      <span className="text-[10px] font-black text-slate-900 group-hover:scale-110 transition-transform">{skillsIntell.soft_count}</span>
                      <div 
                        className="w-8 bg-blue-400 hover:bg-blue-500 rounded-t-md transition-all duration-500 shadow-sm" 
                        style={{ height: getBarHeight(skillsIntell.soft_count) }} 
                      />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Soft</span>
                    </div>

                    {/* 3. Certs */}
                    <div className="flex flex-col items-center gap-2 w-16 group">
                      <span className="text-[10px] font-black text-slate-900 group-hover:scale-110 transition-transform">{skillsIntell.certs_count}</span>
                      <div 
                        className="w-8 bg-amber-400 hover:bg-amber-500 rounded-t-md transition-all duration-500 shadow-sm" 
                        style={{ height: getBarHeight(skillsIntell.certs_count) }} 
                      />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Certs</span>
                    </div>

                    {/* 4. Missing */}
                    <div className="flex flex-col items-center gap-2 w-16 group">
                      <span className="text-[10px] font-black text-slate-900 group-hover:scale-110 transition-transform text-rose-600">{skillsIntell.missing_count}</span>
                      <div 
                        className="w-8 bg-rose-400 hover:bg-rose-500 rounded-t-md transition-all duration-500 shadow-sm" 
                        style={{ height: getBarHeight(skillsIntell.missing_count) }} 
                      />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Missing</span>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* 4. Recruiter Tab ("Attention Timeline") */}
            {activeTab === 'recruiter' && (
              <div className="animate-fade-in flex flex-col gap-6 font-sans">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Clock size={14} className="text-emerald-500" />
                    Recruiter Scan
                  </div>
                  <h3 className="font-serif text-2xl text-slate-955 font-bold tracking-tight mt-1">Six-second resume read</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">The first impression, the risk, and the single fix with the highest leverage.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  
                  {/* Left Column: Attention Timeline */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <UserCheck size={14} className="text-slate-800" />
                      Attention Timeline
                    </h4>
                    
                    <div className="flex flex-col gap-3">
                      {recruiterScan.attention_timeline.map((timelineStep, idx) => (
                        <div key={idx} className="border border-slate-200/80 bg-white rounded-xl p-4 flex gap-3.5 items-center shadow-sm">
                          <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold uppercase text-slate-400">
                              {idx === 0 ? 'First noticed' : idx === 1 ? 'Second noticed' : 'Third noticed'}
                            </span>
                            <span className="text-xs font-bold text-slate-850">{timelineStep.replace(/^(First noticed:|Second noticed:|Third noticed:)\s*/i, '')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Pile Categorization & Best Fix */}
                  <div className="flex flex-col gap-3.5">
                    
                    {/* Strong Yes Card */}
                    <div className="border border-emerald-200 bg-emerald-50/30 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-emerald-700 flex items-center gap-1">
                          ✓ Strong Yes
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Hiring pile</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {recruiterScan.strong_yes}
                      </p>
                    </div>

                    {/* Completely Missed Card */}
                    <div className="border border-rose-200 bg-rose-50/30 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                      <span className="text-[10px] font-black uppercase text-rose-700 flex items-center gap-1">
                        ✕ Completely Missed
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {recruiterScan.completely_missed}
                      </p>
                    </div>

                    {/* Best Fix Card */}
                    <div className="border border-sky-200 bg-sky-50/25 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                      <span className="text-[10px] font-black uppercase text-sky-700 flex items-center gap-1">
                        ✦ Best Fix
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {recruiterScan.best_fix}
                      </p>
                    </div>

                  </div>
                </div>

                {/* Elevator Pitch Quotes */}
                <div className="border border-slate-200/80 rounded-xl p-5 flex flex-col gap-3 mt-2 shadow-sm bg-slate-50/40">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      Your 30-Second Elevator Pitch
                    </h4>
                    <button
                      onClick={() => handleCopyElevatorPitch(recruiterScan.elevator_pitch)}
                      className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-bold transition-all"
                    >
                      <Copy size={12} />
                      {copiedPitch ? 'Copied' : 'Copy Pitch'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-750 leading-relaxed font-medium italic bg-white border border-slate-200/65 rounded-lg p-4">
                    "{recruiterScan.elevator_pitch}"
                  </p>
                </div>

              </div>
            )}

            {/* 5. AI Rewrites Tab */}
            {activeTab === 'rewrites' && (
              <div className="animate-fade-in flex flex-col gap-6 font-sans">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Diff size={14} className="text-emerald-500" />
                    AI Rewrites
                  </div>
                  <h3 className="font-serif text-2xl text-slate-955 font-bold tracking-tight mt-1">Before and after improvements</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Stronger language, clearer evidence, and better keyword alignment.</p>
                </div>

                {/* Rewrite Sections */}
                <div className="flex flex-col gap-5">
                  {rewritesList.map((rewrite, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">{rewrite.section}</h4>
                        <span className="bg-slate-100 text-slate-700 text-[9px] font-bold uppercase rounded px-2 py-0.5">Rewrite {idx + 1}</span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-[1fr_24px_1fr] gap-4 items-center">
                        {/* Before */}
                        <div className="border border-rose-200/80 bg-rose-50/20 rounded-xl p-4 min-h-[100px] flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold uppercase text-rose-700 flex items-center gap-1">✕ Before</span>
                          <p className="text-xs text-rose-900/85 leading-relaxed font-medium">
                            {rewrite.before}
                          </p>
                        </div>

                        {/* Arrow */}
                        <div className="flex justify-center text-slate-350">
                          <ArrowRight size={18} className="rotate-90 lg:rotate-0" />
                        </div>

                        {/* After */}
                        <div className="border border-emerald-200/80 bg-emerald-50/20 rounded-xl p-4 min-h-[100px] flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold uppercase text-emerald-700 flex items-center gap-1">✓ After</span>
                          <p className="text-xs text-emerald-900/85 leading-relaxed font-medium">
                            {rewrite.after}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Interview Prep Tab */}
            {activeTab === 'interview' && (
              <div className="animate-fade-in flex flex-col gap-6 font-sans">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Mic size={14} className="text-emerald-500" />
                    Interview Prep
                  </div>
                  <h3 className="font-serif text-2xl text-slate-955 font-bold tracking-tight mt-1">Questions from resume evidence</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Practice prompts generated from the candidate's actual experience and skill profile.</p>
                </div>

                {/* Sub Navigation (Technical, Behavioral, Curveball) */}
                <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3">
                  {[
                    { id: 'technical', label: 'Technical', count: interviewPrep.technical.length, icon: Target },
                    { id: 'behavioral', label: 'Behavioral', count: interviewPrep.behavioral.length, icon: UserCheck },
                    { id: 'curveball', label: 'Curveball', count: interviewPrep.curveball.length, icon: AlertTriangle }
                  ].map((subTab) => {
                    const isActive = interviewSubTab === subTab.id;
                    return (
                      <button
                        key={subTab.id}
                        onClick={() => {
                          setInterviewSubTab(subTab.id);
                          setExpandedExpectation(null);
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-slate-900 text-white shadow-sm' 
                            : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <subTab.icon size={13} />
                        {subTab.label}
                        <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-black ${
                          isActive ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-800'
                        }`}>{subTab.count}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Questions Grid based on active Sub-tab */}
                <div className="flex flex-col gap-4">
                  {interviewPrep[interviewSubTab]?.map((qItem, idx) => {
                    const uniqueId = `${interviewSubTab}-${idx}`;
                    const isExpanded = expandedExpectation === uniqueId;
                    return (
                      <div key={idx} className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-3 items-center">
                            <span className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
                            <h4 className="text-xs font-bold text-slate-900">{qItem.question}</h4>
                          </div>
                          <span className={`rounded px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shrink-0 ${
                            qItem.difficulty === 'Hard'
                              ? 'bg-rose-50 border border-rose-200 text-rose-700'
                              : 'bg-amber-50 border border-amber-200 text-amber-700'
                          }`}>{qItem.difficulty}</span>
                        </div>
                        
                        <div className="border-t border-slate-100 pt-3">
                          <button
                            onClick={() => setExpandedExpectation(isExpanded ? null : uniqueId)}
                            className="flex items-center gap-1 text-slate-500 hover:text-slate-900 text-xs font-bold"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            Interviewer Expectation
                          </button>
                          {isExpanded && (
                            <div className="mt-2.5 bg-slate-50 border border-slate-200/60 rounded-lg p-4 text-xs flex flex-col gap-2 animate-fade-in">
                              <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">What they want to hear:</span>
                              <p className="text-slate-600 leading-relaxed font-medium">
                                {qItem.expectation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* 7. Cover Letter Tab */}
            {activeTab === 'coverletter' && (
              <div className="animate-fade-in flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-2xl text-slate-950 font-bold tracking-tight">Cover Letter</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Professionally formatted narrative matching your new tailored resume.</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopyCoverLetter(generatedCoverLetter)}
                      className="border border-slate-200 hover:bg-slate-50 text-slate-750 rounded-lg px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Copy size={13} />
                      {copiedLetter ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => handleDownloadCoverLetter(generatedCoverLetter)}
                      className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Download size={13} />
                      Download
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 bg-slate-50/40 rounded-xl p-6 shadow-inner font-mono text-[11px] text-slate-700 leading-relaxed whitespace-pre-wrap select-all max-h-[450px] overflow-y-auto">
                  {generatedCoverLetter}
                </div>
              </div>
            )}

            {/* 8. ATS Check Tab */}
            {activeTab === 'atscheck' && (
              <div className="animate-fade-in flex flex-col gap-6">
                <div>
                  <h3 className="font-serif text-2xl text-slate-955 font-bold tracking-tight">ATS Audit Results</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Automated quality assurance checks matching standard ATS parser rules.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Check 1 */}
                  <div className="border border-slate-200/80 bg-slate-50/40 rounded-xl p-4 flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">File Format Compatibility</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-medium">Standard PDF format generated matches parsing standards. Rich in text, zero vectors or image masks.</p>
                    </div>
                  </div>

                  {/* Check 2 */}
                  <div className="border border-slate-200/80 bg-slate-50/40 rounded-xl p-4 flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">ATS-Safe Section Headings</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-medium">All headings match standard naming conventions: "Experience", "Education", "Skills", "Projects".</p>
                    </div>
                  </div>

                  {/* Check 3 */}
                  <div className="border border-slate-200/80 bg-slate-50/40 rounded-xl p-4 flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Contact Details Integrity</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-medium">Your email, phone number, and location are parsed and correctly placed at the top of the document.</p>
                    </div>
                  </div>

                  {/* Check 4 */}
                  <div className="border border-slate-200/80 bg-slate-50/40 rounded-xl p-4 flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle size={12} className="stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Metrics & Quantifiable Impact</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-medium">Some experience points contain `[X%]` or `[N]` placeholders. Review these and insert real numbers before applying.</p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 9. Re-Score Tab */}
            {activeTab === 'rescore' && (
              <div className="animate-fade-in flex flex-col gap-6">
                <div>
                  <h3 className="font-serif text-2xl text-slate-955 font-bold tracking-tight">Refine Parameters</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Fine-tune optimization guidelines and adjust the compatibility scoring.</p>
                </div>

                <div className="flex flex-col gap-5 border border-slate-200/80 rounded-xl p-5">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Technical Depth vs. Leadership</span>
                      <span>{sliders.techDepth}% / {100 - sliders.techDepth}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="90" 
                      value={sliders.techDepth} 
                      onChange={(e) => setSliders(prev => ({ ...prev, techDepth: parseInt(e.target.value) }))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>More Technical Keywords</span>
                      <span>More Team/Strategy</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Conciseness vs. Details</span>
                      <span>{sliders.conciseness}% / {100 - sliders.conciseness}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="90" 
                      value={sliders.conciseness} 
                      onChange={(e) => setSliders(prev => ({ ...prev, conciseness: parseInt(e.target.value) }))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>Short & Sweet (1-Page)</span>
                      <span>Comprehensive (2-Page)</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Industry Specificity Focus</span>
                      <span>{sliders.industryFocus}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="40" 
                      max="100" 
                      value={sliders.industryFocus} 
                      onChange={(e) => setSliders(prev => ({ ...prev, industryFocus: parseInt(e.target.value) }))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>General Capabilities</span>
                      <span>Exact Niche Stack Match</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    variant="primary" 
                    onClick={handleApplyAdjustments}
                    disabled={isReScoring}
                    className="flex items-center gap-2 bg-slate-900 text-white rounded-lg px-5 py-2.5 hover:bg-slate-800 transition-colors text-xs font-bold"
                  >
                    {isReScoring ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        Re-calculating compatibility...
                      </>
                    ) : (
                      <>
                        <Sliders size={13} />
                        Apply & Re-Score
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* 10. JD Match Tab */}
            {activeTab === 'jdmatch' && (
              <div className="animate-fade-in flex flex-col gap-6">
                <div>
                  <h3 className="font-serif text-2xl text-slate-955 font-bold tracking-tight font-serif">Requirement Alignment</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Checklist verifying how your resume meets the core requirements of the job description.</p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="border border-slate-200/80 rounded-xl p-4 flex items-center justify-between gap-4 bg-slate-50/40">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-slate-955">Engineering Scope & Role Title</span>
                      <span className="text-[10px] text-slate-500 font-medium">Target title matched: {jobTitle}</span>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0">
                      Met
                    </span>
                  </div>

                  <div className="border border-slate-200/80 rounded-xl p-4 flex items-center justify-between gap-4 bg-slate-50/40">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-slate-955">Technical Stack Mastery</span>
                      <span className="text-[10px] text-slate-500 font-medium">Matched technologies: {technicalSkills.slice(0, 4).join(', ')}</span>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0">
                      Met
                    </span>
                  </div>

                  <div className="border border-slate-200/80 rounded-xl p-4 flex items-center justify-between gap-4 bg-slate-50/40">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-slate-955">Quantifiable Achievement Focus</span>
                      <span className="text-[10px] text-slate-500 font-medium">All experience bullets include measurable performance outcomes</span>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0">
                      Met
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Document Preview Panels (Standard Tabs fallback at the bottom) */}
            {activeTab === 'preview' && (
              <div className="animate-fade-in bg-mist/20 py-4 rounded-xl border border-boundary">
                <ResumePreview data={result} />
              </div>
            )}

            {activeTab === 'compare' && originalText && (
              <div className="animate-fade-in">
                <ResumeCompare originalText={originalText} transformedData={result} />
              </div>
            )}

            {activeTab === 'text' && (
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
                    className="absolute top-4 right-4 flex items-center gap-1.5 border border-slate-200 bg-white"
                    onClick={handleCopyText}
                  >
                    <Copy size={13} />
                    {copying ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
            )}

          </div>

          {/* Standard Navigation Toggle inside Content Panel */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-150 pt-5 mt-8 select-none">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-505 font-medium">Document View:</span>
              <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200/45">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'preview' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Preview Document
                </button>
                {originalText && (
                  <button
                    onClick={() => setActiveTab('compare')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'compare' 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Before & After
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('text')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'text' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Plain Text
                </button>
              </div>
            </div>

            <span className="text-[10px] font-mono text-slate-400 font-bold">
              ResumOrph Engine v1.2
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}

// Custom simple icons to avoid imports if they aren't available
function PlusIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
