import { Sliders, RefreshCw } from 'lucide-react';
import Button from '../../ui/Button';

export default function RescoreTab({ 
  sliders, 
  setSliders, 
  isReScoring, 
  handleApplyAdjustments 
}) {
  return (
    <div className="animate-fade-in flex flex-col gap-6 font-sans">
      <div>
        <h3 className="font-serif text-2xl text-slate-955 font-bold tracking-tight">Refine Parameters</h3>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Fine-tune optimization guidelines and adjust the compatibility scoring.
        </p>
      </div>

      <div className="flex flex-col gap-5 border border-slate-200/80 rounded-xl p-5 bg-white shadow-sm">
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
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900 focus:outline-none"
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
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900 focus:outline-none"
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
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900 focus:outline-none"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
            <span>General Capabilities</span>
            <span>Exact Niche Stack Match</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end select-none">
        <Button 
          variant="primary" 
          onClick={handleApplyAdjustments}
          disabled={isReScoring}
          className="flex items-center gap-2 bg-slate-900 text-white rounded-lg px-5 py-2.5 hover:bg-slate-800 transition-all text-xs font-bold cursor-pointer shadow-sm"
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
  );
}
