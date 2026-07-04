import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Target, 
  Diff, 
  Mic, 
  Mail,
  ClipboardList
} from 'lucide-react';
import { toast } from 'sonner';
import { generateResumePDF } from '../../lib/pdfGenerator';
import { trackEvent } from '../../utils/analytics';


// UI components
import ErrorBoundary from '../ui/ErrorBoundary';

// Workspace sub-components
import ScoreBanner from './workspace/ScoreBanner';
import WorkspaceSidebar from './workspace/WorkspaceSidebar';

// Tab components
import OverviewTab from './tabs/OverviewTab';
import ResumeTab from './tabs/ResumeTab';
import KeywordsTab from './tabs/KeywordsTab';
import RewritesTab from './tabs/RewritesTab';
import InterviewTab from './tabs/InterviewTab';
import CoverLetterTab from './tabs/CoverLetterTab';
import TrackingTab from './tabs/TrackingTab';

export default function TransformOutput({ result: initialResult, plainText, originalText, jobDescriptionText, onReset, transformationId }) {
  const [result, setResult] = useState(initialResult);
  const [transformation, setTransformation] = useState(null);

  // Sync state if initialResult prop changes
  useEffect(() => {
    setResult(initialResult);
  }, [initialResult]);

  useEffect(() => {
    async function fetchTrans() {
      if (!transformationId) return;
      try {
        const { getTransformation } = await import('../../lib/api');
        const data = await getTransformation(transformationId);
        setTransformation(data);
      } catch (err) {
        console.error('Error fetching transformation:', err);
      }
    }
    fetchTrans();
  }, [transformationId]);

  // Read ATS metrics directly from the stateful result payload
  const localScore = result.meta?.match_score ?? 0;
  const localMatched = result.meta?.keywords_matched ?? [];
  const localMissing = result.meta?.keywords_missing ?? [];
  const localTotal = result.meta?.keywords_total ?? 0;

  // Active tab state synced with URL parameter ?tab=
  const [activeTab, setActiveTabState] = useState('overview');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const validTabs = ['overview', 'tracking', 'resume', 'keywords', 'rewrites', 'interview', 'cover-letter'];
    if (tab && validTabs.includes(tab)) {
      setActiveTabState(tab);
    }
  }, []);

  const setActiveTab = (tabId) => {
    setActiveTabState(tabId);
    trackEvent('tab_viewed', { tab_name: tabId });
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    window.history.pushState({}, '', url.toString());
  };


  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') || 'overview';
      setActiveTabState(tab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Shared preview styles configurations
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [pageBudget, setPageBudget] = useState('standard');
  const [copying, setCopying] = useState(false);
  const [score, setScore] = useState(0);

  // Animate score count up on mount
  useEffect(() => {
    let start = 0;
    const duration = 1200; // exactly 1200ms score count-up
    const increment = localScore / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= localScore) {
        setScore(localScore);
        clearInterval(timer);
      } else {
        setScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [localScore]);

  const currentScore = score;

  const getScoreColorInfo = (scoreValue) => {
    if (scoreValue < 40) {
      return {
        pill: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/15 dark:border-rose-500/25 dark:text-rose-400',
        dot: 'bg-rose-500',
        bar: 'bg-rose-500'
      };
    } else if (scoreValue < 70) {
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
  const candidateName = result.contact?.name || 'Candidate';
  
  const technicalSkills = result.skills?.technical || [];
  const toolsSkills = result.skills?.tools || [];
  const softSkills = result.skills?.soft || [];

  const recruiterScan = result.recruiter_scan || {
    strong_yes: `Robust hands-on experience with ${technicalSkills.slice(0, 4).join(', ') || 'essential skills'} and a strong project portfolio makes this candidate a competitive fit.`,
    completely_missed: `Limited direct focus on scalability or specialized infrastructure tools.`,
    elevator_pitch: `Hi, I'm ${candidateName}. I'm a ${jobTitle} specializing in building high-quality, high-performance systems...`
  };

  const roadmapData = result.roadmap || {
    tasks: [
      { task: `Highlight personal projects or experience focusing on ${toolsSkills[0] || 'core stack'}`, impact: 'High Impact', points: 5 }
    ]
  };

  const handleDownloadPDF = async () => {
    try {
      // Simulate a small delay for premium rendering feel
      await new Promise(resolve => setTimeout(resolve, 1000));
      generateResumePDF(result, selectedTemplate, pageBudget);
      trackEvent('pdf_downloaded', { template: selectedTemplate });
      toast.success('Resume downloaded');

    } catch (err) {
      toast.error('Failed to generate PDF. Try copying the plain text.');
      throw err;
    }
  };

  const handleDownloadDOCX = async () => {
    try {
      const { generateResumeDOCX } = await import('../../lib/docxGenerator');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await generateResumeDOCX(result);
      toast.success('DOCX saved to downloads');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate Word document.');
      throw err;
    }
  };

  const handleCopyText = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(plainText);
      toast.success('Resume text copied');
    } catch (err) {
      toast.error('Failed to copy text.');
    } finally {
      setTimeout(() => setCopying(false), 1500);
    }
  };

  // 15. KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore when user is actively typing in inputs or textareas
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        return;
      }

      // Tab switcher: 1-7 keys
      if (e.key >= '1' && e.key <= '7') {
        e.preventDefault();
        const tabMapping = ['overview', 'tracking', 'resume', 'keywords', 'rewrites', 'interview', 'cover-letter'];
        const selectedTab = tabMapping[parseInt(e.key) - 1];
        if (selectedTab) {
          setActiveTab(selectedTab);
        }
      }

      // Cmd/Ctrl + D: Download PDF
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDownloadPDF();
      }

      // Cmd/Ctrl + C: Copy Cover Letter (when in cover-letter tab)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c' && activeTab === 'cover-letter') {
        e.preventDefault();
        if (result.cover_letter) {
          navigator.clipboard.writeText(result.cover_letter);
          trackEvent('cover_letter_copied');
          toast.success('Cover letter copied');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, result]);

  // Strict 7 tabs menu items list
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'tracking', label: 'Tracking', icon: ClipboardList },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'keywords', label: 'Keywords', icon: Target },
    { id: 'rewrites', label: 'Rewrites', icon: Diff },
    { id: 'interview', label: 'Interview', icon: Mic },
    { id: 'cover-letter', label: 'Cover Letter', icon: Mail }
  ];

  return (
    <div className="w-full flex flex-col gap-6 select-none animate-fade-in font-sans text-[var(--text-primary)] bg-[var(--bg-base)]">
      
      {/* Visual Confirmation Header */}
      <ScoreBanner 
        candidateName={candidateName}
        jobTitle={jobTitle}
        onReset={onReset}
      />

      {/* Grid Layout: Sidebar & Content Panel */}
      <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch">
        
        {/* Balanced Light Sidebar */}
        <WorkspaceSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          menuItems={menuItems}
          currentScore={currentScore}
          originalText={originalText}
          handleDownloadPDF={handleDownloadPDF}
          handleDownloadDOCX={handleDownloadDOCX}
        />

        {/* Content Area Panel */}
        <main className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 sm:p-8 shadow-[var(--shadow-sm)] flex flex-col justify-between min-h-[580px] transition-all">
          <div className="w-full">
            
            {activeTab === 'overview' && (
              <ErrorBoundary>
                <OverviewTab 
                  currentScore={localScore}
                  jobTitle={jobTitle}
                  company={company}
                  keywordsMatchedCount={localMatched.length}
                  keywordsTotalCount={localTotal}
                  recruiterScan={recruiterScan}
                  roadmapData={roadmapData}
                  atsQuality={result.ats_quality}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'tracking' && (
              <ErrorBoundary>
                {transformation ? (
                  <TrackingTab transformation={transformation} />
                ) : (
                  <div className="flex justify-center items-center py-24">
                    <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </ErrorBoundary>
            )}

            {activeTab === 'resume' && (
              <ErrorBoundary>
                <ResumeTab 
                  result={result}
                  plainText={plainText}
                  originalText={originalText}
                  selectedTemplate={selectedTemplate}
                  setSelectedTemplate={setSelectedTemplate}
                  pageBudget={pageBudget}
                  setPageBudget={setPageBudget}
                  handleDownloadPDF={handleDownloadPDF}
                  handleCopyText={handleCopyText}
                  copying={copying}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'keywords' && (
              <ErrorBoundary>
                <KeywordsTab 
                  technicalSkills={technicalSkills}
                  toolsSkills={toolsSkills}
                  softSkills={softSkills}
                  keywordsMatched={localMatched}
                  keywordsMissing={localMissing}
                  keywordsTotal={localTotal}
                  matchScore={localScore}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'rewrites' && (
              <ErrorBoundary>
                <RewritesTab 
                  rewritesList={result.rewrites}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'interview' && (
              <ErrorBoundary>
                <InterviewTab 
                  interviewPrep={result.interview_prep}
                  jobTitle={jobTitle}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'cover-letter' && (
              <ErrorBoundary>
                <CoverLetterTab 
                  coverLetter={result.cover_letter}
                  contact={result.contact}
                  meta={result.meta}
                  elevatorPitch={recruiterScan.elevator_pitch}
                  createdAt={result.created_at}
                />
              </ErrorBoundary>
            )}

          </div>

          {/* Simple Clean Footer */}
          <div className="flex justify-end border-t border-slate-150 dark:border-slate-800 pt-5 mt-8 select-none">
            <span className="text-[10px] font-mono text-slate-400 font-bold">
              ResumOrph Engine v1.2
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}
