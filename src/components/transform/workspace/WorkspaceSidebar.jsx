import { useState } from 'react';
import { Download } from 'lucide-react';
import LoadingSpinner from '../../ui/LoadingSpinner';
import ScoreRing from '../../ui/ScoreRing';

export default function WorkspaceSidebar({
  activeTab,
  setActiveTab,
  menuItems,
  currentScore,
  originalText,
  handleDownloadPDF,
  handleDownloadDOCX
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);

  const onDownloadClick = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await handleDownloadPDF();
    } finally {
      setIsDownloading(false);
    }
  };

  const onDocxClick = async () => {
    if (isDownloadingDocx) return;
    setIsDownloadingDocx(true);
    try {
      await handleDownloadDOCX();
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  return (
    <aside className="w-full lg:w-64 shrink-0 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 flex flex-col justify-between select-none shadow-[var(--shadow-sm)]">
      <div className="flex flex-col gap-6">
        
        {/* ATS Score Box */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 flex flex-col items-center gap-1 mb-4">
          <ScoreRing score={currentScore} />
        </div>

        {/* Mobile Tab Navigation (Scrollable Row) */}
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
                    ? 'bg-[var(--text-primary)] text-[var(--bg-base)] font-bold shadow-sm' 
                    : 'bg-transparent border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
                className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-[var(--radius-sm)] text-sm font-normal tracking-tight transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)] font-medium shadow-[inset_2px_0_0_var(--accent)]' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <IconComponent 
                  size={15} 
                  className={`transition-colors ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} 
                />
                {item.label}
              </button>
            );
          })}
        </nav>

      </div>

      {/* Bottom Sidebar Action Buttons */}
      <div className="hidden lg:flex flex-col gap-2 pt-6 border-t border-[var(--border-default)] mt-6">
        <button
          onClick={onDownloadClick}
          disabled={isDownloading || isDownloadingDocx}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium text-[var(--text-secondary)] bg-transparent border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] disabled:opacity-45 disabled:cursor-not-allowed rounded-[var(--radius-sm)] transition-all cursor-pointer"
        >
          {isDownloading ? (
            <>
              <LoadingSpinner size="sm" strokeWidth={2.5} className="text-[var(--text-secondary)]" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download size={13} />
              Download PDF
            </>
          )}
        </button>
        <button
          onClick={onDocxClick}
          disabled={isDownloading || isDownloadingDocx}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium text-[var(--text-secondary)] bg-transparent border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] disabled:opacity-45 disabled:cursor-not-allowed rounded-[var(--radius-sm)] transition-all cursor-pointer"
        >
          {isDownloadingDocx ? (
            <>
              <LoadingSpinner size="sm" strokeWidth={2.5} className="text-[var(--text-secondary)]" />
              Generating DOCX...
            </>
          ) : (
            <>
              <Download size={13} />
              Download DOCX
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
