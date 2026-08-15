'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
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
// pdfGenerator pulls in jsPDF (~350KB). It is imported dynamically at the
// point of use so it no longer ships in the initial chunk of every route
// that renders a result, whether or not the user ever exports.
import { trackEvent } from '../../utils/analytics';
import useMediaQuery, { DESKTOP_QUERY } from '../../hooks/useMediaQuery';


// UI components
import ErrorBoundary from '../ui/ErrorBoundary';
import SkeletonBlock from '../ui/SkeletonBlock';

// Workspace sub-components
import ScoreBanner from './workspace/ScoreBanner';
import WorkspaceSidebar from './workspace/WorkspaceSidebar';

// Tab components.
//
// Only one tab renders at a time, but all seven were in the initial chunk
// along with their transitive deps (ResumePreview, ResumeCompare,
// StyleControlPanel, AddEventModal). Overview is the default tab so it stays
// eager; the rest load on first visit.
import OverviewTab from './tabs/OverviewTab';

const ResumeTab = dynamic(() => import('./tabs/ResumeTab'), { loading: TabFallback });
const KeywordsTab = dynamic(() => import('./tabs/KeywordsTab'), { loading: TabFallback });
const RewritesTab = dynamic(() => import('./tabs/RewritesTab'), { loading: TabFallback });
const InterviewTab = dynamic(() => import('./tabs/InterviewTab'), { loading: TabFallback });
const CoverLetterTab = dynamic(() => import('./tabs/CoverLetterTab'), { loading: TabFallback });
const TrackingTab = dynamic(() => import('./tabs/TrackingTab'), { loading: TabFallback });

/** Placeholder shown while a lazily-loaded tab chunk arrives. */
function TabFallback() {
  return (
    <div className="flex flex-col gap-3" role="status" aria-live="polite">
      <SkeletonBlock variant="heading" />
      <SkeletonBlock variant="line" />
      <SkeletonBlock variant="line" className="w-4/5" />
      <span className="sr-only">Loading section…</span>
    </div>
  );
}

// Hoisted out of the component: this list is static, but rebuilding it inline
// gave the sidebar a new array identity on every render, so it could never
// bail out of re-rendering.
const MENU_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'tracking', label: 'Tracking', icon: ClipboardList },
  { id: 'resume', label: 'Resume', icon: FileText },
  { id: 'keywords', label: 'Keywords', icon: Target },
  { id: 'rewrites', label: 'Rewrites', icon: Diff },
  { id: 'interview', label: 'Interview', icon: Mic },
  { id: 'cover-letter', label: 'Cover Letter', icon: Mail },
];

const VALID_TABS = [
  'overview',
  'tracking',
  'resume',
  'keywords',
  'rewrites',
  'interview',
  'cover-letter',
];

export default function TransformOutput({ result: initialResult, plainText, originalText, jobDescriptionText: _jobDescriptionText, onReset, transformationId }) {
  const [result, setResult] = useState(initialResult);
  const [transformation, setTransformation] = useState(null);

  // WorkspaceSidebar renders the mobile row and the desktop rail from the same
  // breakpoint, and only one of them carries role="tab". The panel's
  // aria-labelledby has to name whichever set is live.
  const isDesktopTabs = useMediaQuery(DESKTOP_QUERY);

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
    if (tab && VALID_TABS.includes(tab)) {
      setActiveTabState(tab);
    }
  }, []);

  const setActiveTab = (tabId) => {
    setActiveTabState(tabId);
    trackEvent('tab_viewed', { tab_name: tabId });
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    // replaceState rather than pushState: pushing meant clicking through all
    // seven tabs required seven Back presses to leave the page.
    window.history.replaceState({}, '', url.toString());
  };

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      // Validated, unlike before: navigating back to ?tab=garbage matched no
      // panel and rendered an empty content area.
      setActiveTabState(tab && VALID_TABS.includes(tab) ? tab : 'overview');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Shared preview styles configurations
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [pageBudget, setPageBudget] = useState('standard');
  const [copying, setCopying] = useState(false);
  // Owned here so the sidebar and the in-tab export bar stay in sync.
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);

  // The score count-up lives in ScoreRing, which runs its own rAF loop.
  // Duplicating it here with a 16ms setInterval re-rendered this entire
  // component ~75 times over 1.2s — every child with it, none memoized — and
  // the two animations disagreed: OverviewTab received the final value while
  // the ring received the animated one.
  const currentScore = localScore;

  // Derive dynamic fields from results.
  //
  // These fall back to neutral placeholders rather than invented specifics.
  // jobTitle previously defaulted to the literal 'Machine Learning Engineer',
  // so when detection failed an accountant was told their resume had been
  // optimized for an ML role.
  const jobTitle = result.meta?.detected_job_title || 'this role';
  const company = result.meta?.detected_company || 'this company';
  const candidateName = result.contact?.name || 'Candidate';

  const technicalSkills = result.skills?.technical || [];
  const toolsSkills = result.skills?.tools || [];
  const softSkills = result.skills?.soft || [];

  // No fabricated fallback: this used to synthesise recruiter commentary
  // ("Robust hands-on experience… a competitive fit") and render it under an
  // "AI Analysis" heading, attributing invented text to the model. If the
  // model did not return a scan, the tab shows an absent state instead.
  const recruiterScan = result.recruiter_scan ?? null;

  // Same reasoning as recruiterScan: an invented roadmap task is worse than
  // no roadmap, because the user cannot tell it apart from real advice.
  const roadmapData = result.roadmap ?? null;

  // The artificial 1s delay that used to precede each export ("premium
  // rendering feel") is gone — it added a full second to every download for
  // no benefit. The spinner now reflects real generation time.
  const handleDownloadPDF = async () => {
    if (isDownloading || isDownloadingDocx) return;
    setIsDownloading(true);
    try {
      const { generateResumePDF } = await import('../../lib/pdfGenerator');
      generateResumePDF(result, selectedTemplate, pageBudget);
      trackEvent('pdf_downloaded', { template: selectedTemplate });
      toast.success('Resume downloaded');
    } catch (err) {
      // Reported to the user via toast and logged for Sentry. Re-throwing
      // here would only surface as an unhandled promise rejection.
      console.error('PDF generation failed:', err);
      toast.error('Failed to generate PDF. Try copying the plain text.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadDOCX = async () => {
    if (isDownloading || isDownloadingDocx) return;
    setIsDownloadingDocx(true);
    try {
      const { generateResumeDOCX } = await import('../../lib/docxGenerator');
      await generateResumeDOCX(result);
      trackEvent('docx_downloaded');
      toast.success('DOCX saved to downloads');
    } catch (err) {
      console.error('DOCX generation failed:', err);
      toast.error('Failed to generate Word document.');
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(plainText);
      // Only flag success after the write resolves: `copying` was previously
      // set before the await and cleared on a timer regardless of outcome, so
      // a failed copy still flashed "Copied" next to its own error toast.
      setCopying(true);
      setTimeout(() => setCopying(false), 1500);
      toast.success('Resume text copied');
    } catch (err) {
      console.error('Clipboard write failed:', err);
      toast.error('Failed to copy text.');
    }
  };

  // 15. KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore when user is actively typing in inputs or textareas
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        return;
      }

      // Tab switcher: 1-7. Ignored when a modifier is held so it cannot
      // shadow browser shortcuts.
      if (!e.metaKey && !e.ctrlKey && !e.altKey && e.key >= '1' && e.key <= '7') {
        e.preventDefault();
        const tabMapping = ['overview', 'tracking', 'resume', 'keywords', 'rewrites', 'interview', 'cover-letter'];
        const selectedTab = tabMapping[parseInt(e.key) - 1];
        if (selectedTab) {
          setActiveTab(selectedTab);
        }
      }

      // Cmd/Ctrl+D and Cmd/Ctrl+C were bound here and have been removed.
      // Ctrl+D overrode the browser's bookmark shortcut, and Ctrl+C hijacked
      // copy on the one tab whose content is marked select-all — so selecting
      // a paragraph and copying silently grabbed the entire letter instead.
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, result]);

  // Strict 7 tabs menu items list
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
          menuItems={MENU_ITEMS}
          currentScore={currentScore}
          originalText={originalText}
          onDownloadClick={handleDownloadPDF}
          onDocxClick={handleDownloadDOCX}
          isDownloading={isDownloading}
          isDownloadingDocx={isDownloadingDocx}
        />

        {/* Content Area Panel.
            A <section> rather than <main>: the page already renders a <main>
            around this component, and two main landmarks per page is invalid.
            role="tabpanel" pairs it with the tablist in WorkspaceSidebar. */}
        <section className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 sm:p-8 shadow-[var(--shadow-sm)] flex flex-col justify-between min-h-[580px] transition-all">
          <div
            className="w-full"
            role="tabpanel"
            id={`panel-${activeTab}`}
            // Points at whichever tablist is live for the current breakpoint;
            // the other one is aria-hidden, so naming it here would label the
            // panel with a hidden element.
            aria-labelledby={isDesktopTabs ? `tab-desktop-${activeTab}` : `tab-${activeTab}`}
            tabIndex={0}
          >

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
                  handleDownloadDOCX={handleDownloadDOCX}
                  isDownloading={isDownloading}
                  isDownloadingDocx={isDownloadingDocx}
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

          {/* Keyboard shortcuts were entirely undiscoverable. Surfacing them
              here also gives the footer a reason to exist, replacing an
              internal version string that meant nothing to users. */}
          <div className="flex justify-end border-t border-[var(--border-subtle)] pt-5 mt-8 select-none">
            <span className="text-[11px] font-mono text-[var(--text-secondary)] hidden sm:block">
              Press <kbd className="px-1 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-default)]">1</kbd>–
              <kbd className="px-1 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-default)]">7</kbd> to switch tabs
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}