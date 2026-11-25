'use client';

import { useState, useEffect } from 'react';
import { useTransform } from '../../hooks/useTransform';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ResumeInput from '../../components/transform/wizard/ResumeInput';
import JobInput from '../../components/transform/wizard/JobInput';
import StepProgress from '../../components/transform/workspace/StepProgress';
import TransformOutput from '../../components/transform/TransformOutput';
import TransformErrorPanel from '../../components/transform/workspace/TransformErrorPanel';
import Button from '../../components/ui/Button';
import { trackEvent } from '../../utils/analytics';
import { RESUME_LIMITS, JD_LIMITS, JOB_TITLE_LIMITS } from '../../lib/limits';
import { PENDING_ROLE_KEY } from '../../components/landing/constants';

/**
 * Draft persistence.
 *
 * A refresh at any point in the wizard used to discard everything the user
 * had typed or uploaded — there was no autosave, and the unload guard only
 * covered the brief window while a request was in flight. sessionStorage
 * (not localStorage) keeps the draft for the tab's lifetime without leaving
 * resume text on disk after the browser closes.
 */
const DRAFT_KEY = 'resumorph:draft';

interface Draft {
  resumeText: string;
  jobDescriptionText: string;
  optimizationMode: 'description' | 'title';
  step: number;
}

function readDraft(): Partial<Draft> {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? '{}');
  } catch {
    return {};
  }
}

/**
 * Role typed into the landing-page hero. It arrives as ?role= (signed-in
 * visitors) or via sessionStorage (signed-out visitors, whose query string is
 * dropped by the /login redirect). Read once, after mount.
 */
function readPendingRole(): string {
  let role = '';
  try {
    role = new URLSearchParams(window.location.search).get('role') ?? '';
    if (!role) role = sessionStorage.getItem(PENDING_ROLE_KEY) ?? '';
  } catch {
    // Storage disabled: nothing to restore.
  }
  return role.trim().slice(0, JOB_TITLE_LIMITS.max);
}

export default function Transform() {
  // Server-safe defaults. The draft and hero role live in sessionStorage and
  // the URL, which the server cannot see, so reading them in lazy initialisers
  // made the first client render disagree with the server HTML (hydration
  // mismatch). They are restored in a mount effect instead, and the wizard is
  // held behind a skeleton until then so empty fields never flash.
  const [restored, setRestored] = useState(false);
  const [step, setStep] = useState(1);
  const [resumeText, setResumeText] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [optimizationMode, setOptimizationMode] = useState<'description' | 'title'>('description');
  const {
    status,
    isRetrying,
    persisted,
    result,
    plainText,
    transformationId,
    error,
    errorDetails,
    rateLimit,
    transform,
    reset,
  } = useTransform();
  const [showLoading, setShowLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState('idle');

  useEffect(() => {
    if (status === 'loading') {
      setShowLoading(true);
      setLocalStatus('loading');
    } else if (status === 'success') {
      setLocalStatus('success');
      if (result) {
        const res = result as any;
        trackEvent('analysis_complete', {
          match_score: res.meta?.match_score,
          job_title: res.meta?.detected_job_title,
          model_used: res.ai_model || 'unknown',
        });
      }
      // Results are shown as soon as they arrive. The previous 800ms delay
      // held a finished result behind the loading screen for no reason.
      setShowLoading(false);
    } else if (status === 'error') {
      trackEvent('analysis_failed', { error_code: error });
      setShowLoading(false);
      setLocalStatus(status);
    } else {
      setShowLoading(false);
      setLocalStatus(status);
    }
  }, [status, result, error]);

  // Restore the draft and the landing-page hero role once, after mount.
  useEffect(() => {
    const draft = readDraft();
    // The hero role prefills job-title mode, but never overwrites a job
    // description already in the draft.
    const pendingRole = draft.jobDescriptionText ? '' : readPendingRole();

    /* eslint-disable react-hooks/set-state-in-effect -- one-time restore of
       client-only state (sessionStorage / URL) after hydration. */
    if (draft.step === 1 || draft.step === 2) setStep(draft.step);
    if (draft.resumeText) setResumeText(draft.resumeText);
    if (pendingRole) {
      setJobDescriptionText(pendingRole);
      setOptimizationMode('title');
    } else {
      if (draft.jobDescriptionText) setJobDescriptionText(draft.jobDescriptionText);
      if (draft.optimizationMode === 'title' || draft.optimizationMode === 'description') {
        setOptimizationMode(draft.optimizationMode);
      }
    }
    setRestored(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    // The hero role is consumed once: clear the handoff key and the query
    // string so a refresh or a later visit does not re-apply it.
    try {
      sessionStorage.removeItem(PENDING_ROLE_KEY);
    } catch {
      // Storage disabled: nothing to clear.
    }
    const url = new URL(window.location.href);
    if (url.searchParams.has('role')) {
      url.searchParams.delete('role');
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    }
  }, []);

  // Persist the draft as it changes so a refresh does not lose it.
  useEffect(() => {
    // Until the restore above has run, state still holds the empty defaults;
    // writing (or clearing) now would clobber the stored draft.
    if (!restored) return;
    // Nothing worth keeping once a result exists — that lives in history.
    if (status === 'success') {
      sessionStorage.removeItem(DRAFT_KEY);
      return;
    }
    if (!resumeText && !jobDescriptionText) return;

    try {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ resumeText, jobDescriptionText, optimizationMode, step })
      );
    } catch {
      // Quota exceeded or storage disabled — drafts are a convenience, not a
      // requirement, so a failure here must not break the flow.
    }
  }, [resumeText, jobDescriptionText, optimizationMode, step, status, restored]);

  // Navigation guard.
  //
  // Previously this fired only while a request was in flight, so a refresh
  // with a filled-in wizard — or with an unsaved result on screen — silently
  // discarded everything. The result case matters most: when a save fails,
  // the copy on screen is the only one that exists.
  useEffect(() => {
    const hasUnsavedResult = status === 'success' && !persisted;
    const hasDraft = status === 'idle' && (resumeText.length > 0 || jobDescriptionText.length > 0);

    const message =
      status === 'loading'
        ? 'Your analysis is still running. Leave anyway?'
        : hasUnsavedResult
          ? 'Your resume was not saved to history. Download it before leaving.'
          : 'You have an unfinished resume. Leave anyway?';

    const shouldGuard = status === 'loading' || hasUnsavedResult || hasDraft;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!shouldGuard) return;
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    const handleAnchorClick = (e: MouseEvent) => {
      // Only intercept in-app navigation for the two states where leaving
      // destroys something: a running request, or an unsaved result. A draft
      // survives in sessionStorage, so it needs no prompt.
      if (status !== 'loading' && !hasUnsavedResult) return;
      const target = (e.target as HTMLElement)?.closest('a');
      if (target && target.getAttribute('href')) {
        if (!window.confirm(message)) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleAnchorClick, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleAnchorClick, true);
    };
  }, [status, persisted, resumeText, jobDescriptionText]);

  const handleNext = () => {
    if (step === 1 && resumeText.trim().length >= RESUME_LIMITS.min) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleTransform = () => {
    const minLen = optimizationMode === 'title' ? JOB_TITLE_LIMITS.min : JD_LIMITS.min;
    if (
      resumeText.trim().length >= RESUME_LIMITS.min &&
      jobDescriptionText.trim().length >= minLen
    ) {
      trackEvent('analysis_started', { optimization_mode: optimizationMode });
      transform({ resumeText, jobDescriptionText, optimizationMode });
    }
  };

  // Returns to the wizard with both fields intact. Without this, errors that
  // can only be fixed by editing the input (too long, too short, invalid job
  // description) were unrecoverable: the panel replaced the wizard, and the
  // only exits were retrying identical input or discarding everything.
  const handleBackToEditor = () => {
    reset();
    setStep(2);
  };

  const handleReset = () => {
    // Starting over discards the result. When the save failed, the copy on
    // screen is the only one there is — so confirm before destroying it.
    if (status === 'success' && !persisted) {
      const confirmed = window.confirm(
        'This resume was not saved to your history. Starting a new analysis will discard it permanently. Continue?'
      );
      if (!confirmed) return;
    }

    reset();
    setStep(1);
    setResumeText('');
    setJobDescriptionText('');
    setOptimizationMode('description');
    if (typeof window !== 'undefined') sessionStorage.removeItem(DRAFT_KEY);
  };

  // Switching mode used to silently wipe a pasted job description. The text
  // is kept instead — the two modes accept different lengths, but discarding
  // input without warning is worse than a validation message.
  const handleModeChange = (mode: 'description' | 'title') => {
    setOptimizationMode(mode);
  };

  const isStep1Valid =
    resumeText.trim().length >= RESUME_LIMITS.min && resumeText.trim().length <= RESUME_LIMITS.max;
  const isStep2Valid =
    optimizationMode === 'title'
      ? jobDescriptionText.trim().length >= JOB_TITLE_LIMITS.min &&
        jobDescriptionText.trim().length <= JOB_TITLE_LIMITS.max
      : jobDescriptionText.trim().length >= JD_LIMITS.min &&
        jobDescriptionText.trim().length <= JD_LIMITS.max;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <main
        className={`flex-1 ${status === 'success' && !showLoading ? 'max-w-6xl' : 'max-w-4xl'} w-full mx-auto px-4 py-12 flex flex-col justify-start transition-all duration-300`}
      >
        {showLoading && (
          <div className="my-auto">
            <StepProgress
              jobDescriptionText={jobDescriptionText}
              apiStatus={localStatus}
              isRetrying={isRetrying}
            />
          </div>
        )}

        {!showLoading && status === 'success' && result && (
          <TransformOutput
            result={result}
            plainText={plainText}
            originalText={resumeText}
            jobDescriptionText={jobDescriptionText}
            onReset={handleReset}
            transformationId={transformationId}
          />
        )}

        {!showLoading && status === 'error' && (
          <TransformErrorPanel
            errorCode={error}
            errorDetails={errorDetails}
            rateLimit={rateLimit}
            onRetry={handleTransform}
            onBackToEditor={handleBackToEditor}
          />
        )}

        {status === 'idle' && !restored && (
          <div className="w-full flex flex-col gap-4" role="status" aria-live="polite">
            <div className="h-7 w-48 rounded-md bg-[var(--bg-subtle)] animate-pulse" />
            <div className="h-64 w-full rounded-lg bg-[var(--bg-subtle)] animate-pulse" />
            <span className="sr-only">Loading your draft…</span>
          </div>
        )}

        {status === 'idle' && restored && (
          <div className="w-full flex flex-col gap-8 stagger-children">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Tailor your resume</h1>
              <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                Transform your resume to match the requirements of the job description.
              </p>
            </div>

            {/* Step progress bar */}
            <div className="flex items-center justify-between max-w-sm w-full mx-auto mb-6 select-none px-4">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-all duration-150 ${
                    step === 1
                      ? 'bg-[var(--accent)] text-[var(--accent-fg)] shadow-sm'
                      : 'bg-[var(--success)] text-white border border-[var(--success)]'
                  }`}
                >
                  {step > 1 ? '✓' : '1'}
                </div>
                <span
                  className={`text-xs font-semibold tracking-wide uppercase ${step === 1 ? 'text-slate-900 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  Resume
                </span>
              </div>

              <div className="flex-1 h-0.5 mx-4 bg-slate-200 dark:bg-slate-800 relative rounded-full">
                <div
                  className="absolute inset-y-0 left-0 bg-[var(--accent)] transition-all duration-300 ease-in-out rounded-full"
                  style={{ width: step > 1 ? '100%' : '0%' }}
                />
              </div>

              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-all duration-150 border ${
                    step === 2
                      ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-transparent'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-xs font-semibold tracking-wide uppercase ${step === 2 ? 'text-slate-900 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  Job description
                </span>
              </div>
            </div>

            {/* Step Content */}
            <div className="w-full">
              {step === 1 ? (
                <div className="flex flex-col gap-6 animate-fade-in">
                  <ResumeInput value={resumeText} onChange={setResumeText} />
                  <div className="flex justify-end mt-2">
                    <Button
                      onClick={handleNext}
                      disabled={!isStep1Valid}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold"
                    >
                      Next: Job Description
                      <ArrowRight size={14} className="stroke-[2.5]" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6 animate-fade-in">
                  <JobInput
                    value={jobDescriptionText}
                    onChange={setJobDescriptionText}
                    optimizationMode={optimizationMode}
                    onModeChange={handleModeChange}
                  />
                  <div className="flex justify-between mt-2">
                    <Button
                      variant="ghost"
                      onClick={handleBack}
                      className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      <ArrowLeft size={14} className="stroke-[2.5]" />
                      Back to Resume
                    </Button>
                    <Button
                      onClick={handleTransform}
                      disabled={!isStep2Valid}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-md shadow-emerald-600/10"
                    >
                      Tailor resume
                      <ArrowRight size={14} className="stroke-[2.5]" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
