import { useState } from 'react';

export default function JobInput({ value, onChange, optimizationMode = 'description', onModeChange }) {
  const isTitleMode = optimizationMode === 'title';
  const MIN_CHARS = isTitleMode ? 3 : 200;
  const MAX_CHARS = isTitleMode ? 150 : 10000;
  const [isFocused, setIsFocused] = useState(false);
  const [hasBeenBlurred, setHasBeenBlurred] = useState(false);

  const isBelowMin = value.length < MIN_CHARS;
  const isAboveMax = value.length > MAX_CHARS;
  
  // Smart detection of URL
  const isUrl = !isTitleMode && (/^(http|https):\/\/[^\s]+$/.test(value.trim()) || value.trim().startsWith('www.'));

  return (
    <div className="flex flex-col gap-4 text-left font-sans">
      <div>
        <span className="font-mono text-xs font-semibold text-slate-500 uppercase tracking-widest">Step 2 of 2</span>
        <h3 className="font-serif text-2xl text-slate-900 dark:text-white font-bold mt-1">Add Job Details</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isTitleMode 
            ? "Enter the target job title/role to customize your resume." 
            : "Paste the complete job posting for best results."}
        </p>
      </div>

      {/* Segmented Mode Control */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Optimization Mode</label>
        <div className="flex bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-lg p-1 max-w-xs select-none">
          <button
            type="button"
            onClick={() => onModeChange && onModeChange('description')}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
              optimizationMode === 'description'
                ? 'bg-slate-900 text-white dark:bg-indigo-650 dark:text-white shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Job Description
          </button>
          <button
            type="button"
            onClick={() => onModeChange && onModeChange('title')}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
              optimizationMode === 'title'
                ? 'bg-slate-900 text-white dark:bg-indigo-650 dark:text-white shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Job Title Only
          </button>
        </div>
      </div>

      <div className="relative w-full">
        <textarea
          placeholder={isTitleMode ? "Enter target job title (e.g. Senior Software Engineer)..." : "Paste target job description details here..."}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setHasBeenBlurred(true);
          }}
          className={`w-full ${isTitleMode ? 'min-h-[80px]' : 'min-h-[200px]'} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 font-mono text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-455 focus:outline-none focus:border-slate-900 dark:focus:border-indigo-500 focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-indigo-500/10 transition-all duration-150 resize-y leading-relaxed ${
            (hasBeenBlurred && isBelowMin) ? 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10' : ''
          }`}
        />
        
        {/* Helper info on focus */}
        {isFocused && !isTitleMode && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Paste the complete job posting for best results.
          </p>
        )}

        {/* Smart Detection URL Alert */}
        {isUrl && (
          <div className="mt-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-650 dark:text-slate-350 flex items-center justify-between animate-fade-in select-none">
            <span>Want to paste the URL instead? We'll extract the job description.</span>
            <span className="text-[9px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider font-mono">Future Feature</span>
          </div>
        )}
      </div>

      {/* Validation status / Character Counter */}
      <div className="flex justify-between items-center text-xs font-semibold select-none">
        <div>
          {hasBeenBlurred && isBelowMin && (
            <span className="text-amber-600 dark:text-amber-500 flex items-center gap-1">
              {isTitleMode 
                ? 'Job title too short (minimum 3 characters).' 
                : 'Job description too short (minimum 200 characters).'}
            </span>
          )}
          {isAboveMax && (
            <span className="text-red-650 flex items-center gap-1">
              {isTitleMode 
                ? 'Job title too long (maximum 150 characters).' 
                : 'Job description too long (maximum 10,000 characters).'}
            </span>
          )}
          {hasBeenBlurred && !isBelowMin && !isAboveMax && (
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              ✓ Ready
            </span>
          )}
        </div>
        
        <div className={`font-mono ${isBelowMin ? 'text-amber-600 dark:text-amber-500' : 'text-slate-400'}`}>
          {value.length} / {MIN_CHARS} min {isBelowMin && '(below threshold)'}
        </div>
      </div>
    </div>
  );
}
