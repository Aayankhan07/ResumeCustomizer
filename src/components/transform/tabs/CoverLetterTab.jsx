import { Copy, Download } from 'lucide-react';

export default function CoverLetterTab({ 
  generatedCoverLetter, 
  copiedLetter, 
  handleCopyCoverLetter, 
  handleDownloadCoverLetter 
}) {
  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl text-slate-955 font-bold tracking-tight">Cover Letter</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Professionally formatted narrative matching your new tailored resume.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 select-none">
          <button
            onClick={() => handleCopyCoverLetter(generatedCoverLetter)}
            className="border border-slate-200 hover:bg-slate-50 text-slate-750 rounded-lg px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Copy size={13} />
            {copiedLetter ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={() => handleDownloadCoverLetter(generatedCoverLetter)}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
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
  );
}
