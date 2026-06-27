import { useState } from 'react';
import { FileText } from 'lucide-react';
import StyleControlPanel from '../workspace/StyleControlPanel';
import ResumePreview from '../ResumePreview';
import ResumeCompare from '../ResumeCompare';

export default function ResumeTab({
  result,
  plainText,
  originalText,
  selectedTemplate,
  setSelectedTemplate,
  pageBudget,
  setPageBudget,
  handleCopyText,
  copying
}) {
  const [cvSubTab, setCvSubTab] = useState('optimized'); // 'optimized' | 'compare' | 'plain'

  const handleSelectAllText = (e) => {
    e.target.select();
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6 text-left font-sans text-[var(--text-primary)] bg-transparent">
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Tailored Resume</h3>
        <p className="text-xs text-[var(--text-muted)] mt-1 font-normal">Review and download your newly optimized, ATS-compliant resume.</p>
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
              className="w-full min-h-[420px] bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-[var(--radius-md)] p-6 font-mono text-[13px] text-[var(--text-secondary)] leading-relaxed focus:outline-none select-all"
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
