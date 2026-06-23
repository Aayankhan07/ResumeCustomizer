import { useState } from 'react';
import { Download, Copy, RefreshCw, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { generateResumePDF } from '../../lib/pdfGenerator';
import Button from '../ui/Button';
import Tabs from '../ui/Tabs';
import ScoreDisplay from './ScoreDisplay';
import ResumePreview from './ResumePreview';
import ResumeCompare from './ResumeCompare';

export default function TransformOutput({ result, plainText, originalText, onReset }) {
  const [activeTab, setActiveTab] = useState('preview');
  const [copying, setCopying] = useState(false);

  const tabs = [
    { id: 'preview', label: 'Preview Document' },
    { id: 'compare', label: 'Before & After' },
    { id: 'text',    label: 'Plain Text' },
  ];

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
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy text.');
    } finally {
      setTimeout(() => setCopying(false), 1500);
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 stagger-children">
      {/* Visual confirmation */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-serif text-2xl text-ink font-bold">Your resume is ready</h3>
      </div>

      {/* Score panel */}
      <ScoreDisplay
        score={result.meta?.match_score ?? 0}
        keywordsMatched={result.meta?.keywords_matched ?? []}
        keywordsTotal={result.meta?.keywords_total ?? 0}
      />

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      <div className="w-full">
        {activeTab === 'preview' && (
          <div className="animate-fade-in bg-mist/20 py-6 rounded-xl border border-boundary">
            <ResumePreview data={result} />
          </div>
        )}
        
        {activeTab === 'compare' && (
          <ResumeCompare originalText={originalText} transformedData={result} />
        )}

        {activeTab === 'text' && (
          <div className="animate-fade-in flex flex-col gap-4 text-left">
            <div className="relative">
              <textarea
                readOnly
                value={plainText}
                className="w-full min-h-[400px] bg-white border border-boundary rounded-xl p-6 font-mono text-xs text-ink leading-relaxed focus:outline-none select-all"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 flex items-center gap-1.5"
                onClick={handleCopyText}
              >
                <Copy size={13} />
                {copying ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-boundary pt-6 mt-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Button
            variant="primary"
            onClick={handleDownloadPDF}
            className="flex-1 sm:flex-initial flex items-center gap-2"
          >
            <Download size={16} />
            Download PDF
          </Button>
          <Button
            variant="ghost"
            onClick={handleCopyText}
            className="flex-1 sm:flex-initial flex items-center gap-2"
          >
            <Copy size={16} />
            Copy Plain Text
          </Button>
        </div>

        <Button
          variant="text"
          onClick={onReset}
          className="flex items-center gap-2 w-full sm:w-auto hover:bg-mist/85 rounded-lg py-2 px-4"
        >
          <RefreshCw size={15} />
          Optimize Another Resume
        </Button>
      </div>
    </div>
  );
}
