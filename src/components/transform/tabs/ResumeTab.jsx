'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import StyleControlPanel from '../workspace/StyleControlPanel';
import ResumePreview from '../ResumePreview';
import ResumeCompare from '../ResumeCompare';
import LoadingSpinner from '../../ui/LoadingSpinner';

export default function ResumeTab({
  result,
  plainText,
  originalText,
  selectedTemplate,
  setSelectedTemplate,
  pageBudget,
  setPageBudget,
  handleCopyText,
  copying,
  handleDownloadPDF,
  handleDownloadDOCX,
  isDownloading,
  isDownloadingDocx,
}) {
  const [cvSubTab, setCvSubTab] = useState('optimized'); // 'optimized' | 'compare' | 'plain'

  const handleSelectAllText = (e) => {
    e.target.select();
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6 text-left font-sans text-[var(--text-primary)] bg-transparent">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Tailored Resume</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-normal">
            Review and download your newly optimized, ATS-compliant resume.
          </p>
        </div>

        {/* The sidebar's download buttons are hidden below lg, and no other
            export trigger existed — so on phones and tablets the app's main
            output could not be obtained at all. */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isDownloading || isDownloadingDocx}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-[var(--accent-fg)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-45 disabled:cursor-not-allowed rounded-[var(--radius-sm)] transition-all cursor-pointer"
          >
            {isDownloading ? (
              <>
                <LoadingSpinner size="sm" strokeWidth={2.5} className="text-[var(--accent-fg)]" />
                Generating…
              </>
            ) : (
              <>
                <Download size={13} />
                PDF
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleDownloadDOCX}
            disabled={isDownloading || isDownloadingDocx}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-[var(--text-secondary)] bg-transparent border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:opacity-45 disabled:cursor-not-allowed rounded-[var(--radius-sm)] transition-all cursor-pointer"
          >
            {isDownloadingDocx ? (
              <>
                <LoadingSpinner size="sm" strokeWidth={2.5} className="text-[var(--text-secondary)]" />
                Generating…
              </>
            ) : (
              <>
                <Download size={13} />
                DOCX
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sub-tabs Switcher */}
      <div className="flex border-b border-[var(--border-default)] pb-px gap-6 select-none">
        <button
          onClick={() => setCvSubTab('optimized')}
          className={`pb-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer ${
            cvSubTab === 'optimized'
              ? 'border-[var(--text-primary)] text-[var(--text-primary)] font-semibold'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Resume Preview
        </button>
        {originalText && (
          <button
            onClick={() => setCvSubTab('compare')}
            className={`pb-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer ${
              cvSubTab === 'compare'
                ? 'border-[var(--text-primary)] text-[var(--text-primary)] font-semibold'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Before & After
          </button>
        )}
        <button
          onClick={() => setCvSubTab('plain')}
          className={`pb-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer ${
            cvSubTab === 'plain'
              ? 'border-[var(--text-primary)] text-[var(--text-primary)] font-semibold'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Plain Text
        </button>
      </div>

      {/* Sub-tab Content */}
      {cvSubTab === 'optimized' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          <StyleControlPanel 
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            pageBudget={pageBudget}
            setPageBudget={setPageBudget}
          />

          <div className="bg-[var(--bg-muted)] py-6 rounded-[var(--radius-lg)] border border-[var(--border-default)]">
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
              onClick={handleSelectAllText}
              value={plainText}
              className="w-full min-h-[420px] bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-[var(--radius-md)] p-6 font-mono text-[13px] text-[var(--text-secondary)] leading-relaxed focus-visible:outline-none select-all"
            />
            <button
              className="absolute top-4 right-4 flex items-center gap-1.5 btn-default py-1.5 px-3.5 text-xs font-medium"
              onClick={handleCopyText}
            >
              {copying ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}