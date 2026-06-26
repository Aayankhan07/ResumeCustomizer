import { useState } from 'react';
import { Download, Copy } from 'lucide-react';
import LoadingSpinner from '../../ui/LoadingSpinner';

export default function WorkspaceSidebar({
  activeTab,
  setActiveTab,
  menuItems,
  currentScore,
  scoreColors,
  originalText,
  handleDownloadPDF,
  handleCopyText,
  copying
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  const onDownloadClick = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await handleDownloadPDF();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <aside className="w-full lg:w-64 shrink-0 bg-slate-50/70 border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between select-none shadow-inner animate-fade-in">
      <div className="flex flex-col gap-6">
        
        {/* ATS Score Box */}
        <div className="bg-white border border-slate-200/70 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ATS Compatibility</span>
            <span className="text-xs font-bold text-slate-900">{currentScore}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${scoreColors.bar}`} 
              style={{ width: `${currentScore}%` }}
            />
          </div>
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
            if (item.hideIfNoOriginal && !originalText) return null;
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm font-semibold tracking-tight transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-sm font-bold animate-pulse-subtle' 
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

      {/* Bottom Sidebar Action Buttons */}
      <div className="hidden lg:flex flex-col gap-2 pt-6 border-t border-slate-200/80 mt-6">
        <button
          onClick={onDownloadClick}
          disabled={isDownloading}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-70 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
        >
          {isDownloading ? (
            <>
              <LoadingSpinner size="sm" strokeWidth={2.5} className="text-slate-600" />
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
          onClick={handleCopyText}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm cursor-pointer active:scale-95"
        >
          <Copy size={13} />
          {copying ? 'Copied Link' : 'Share Score'}
        </button>
      </div>
    </aside>
  );
}
