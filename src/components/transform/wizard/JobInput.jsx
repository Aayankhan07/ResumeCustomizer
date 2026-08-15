'use client';

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
 <span className="font-mono text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest">Step 2 of 2</span>
 <h3 className="font-serif text-2xl text-[var(--text-primary)] font-bold mt-1">Add Job Details</h3>
 <p className="text-sm text-[var(--text-secondary)]">
 {isTitleMode 
 ?"Enter the target job title/role to customize your resume." 
 :"Paste the complete job posting for best results."}
 </p>
 </div>

 {/* Segmented Mode Control */}
 <div className="flex flex-col gap-2">
 <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider font-mono">Optimization Mode</label>
 <div className="flex bg-[var(--bg-muted)] border border-[var(--border-default)] rounded-lg p-1 max-w-xs select-none">
 <button
 type="button"
 onClick={() => onModeChange && onModeChange('description')}
 className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
 optimizationMode === 'description'
 ? 'bg-[var(--accent)] text-[var(--accent-fg)] shadow-sm font-bold'
 : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:text-[var(--text-secondary)] '
 }`}
 >
 Job Description
 </button>
 <button
 type="button"
 onClick={() => onModeChange && onModeChange('title')}
 className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
 optimizationMode === 'title'
 ? 'bg-[var(--accent)] text-[var(--accent-fg)] shadow-sm font-bold'
 : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:text-[var(--text-secondary)] '
 }`}
 >
 Job Title Only
 </button>
 </div>
 </div>

 <div className="relative w-full">
 <textarea
 placeholder={isTitleMode ?"Enter target job title (e.g. Senior Software Engineer)..." :"Paste target job description details here..."}
 value={value}
 onChange={(e) => onChange(e.target.value)}
 onFocus={() => setIsFocused(true)}
 onBlur={() => {
 setIsFocused(false);
 setHasBeenBlurred(true);
 }}
 className={`w-full ${isTitleMode ? 'min-h-[80px]' : 'min-h-[200px]'} bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 font-mono text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus-visible:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-150 resize-y leading-relaxed ${
 (hasBeenBlurred && isBelowMin) ? 'border-[var(--warning)] focus:border-[var(--warning)] focus:ring-[var(--warning)]/20' : ''
 }`}
 />
 
 {/* Helper info on focus */}
 {isFocused && !isTitleMode && (
 <p className="text-[11px] text-[var(--text-secondary)] font-semibold mt-1">
 Paste the complete job posting for best results.
 </p>
 )}

 {/* Advertised a URL-extraction capability that does not exist. Now
 tells the user what to actually do with the link they pasted. */}
 {isUrl && (
 <div
 role="status"
 className="mt-2 text-xs bg-[var(--warning-subtle)] border border-[var(--warning-fg)]/20 rounded-[var(--radius-md)] p-2.5 text-[var(--warning-fg)] animate-fade-in"
 >
 That looks like a link. Open it and paste the job description text
 itself — we can&apos;t read the page for you.
 </div>
 )}
 </div>

 {/* Validation status / Character Counter */}
 <div className="flex justify-between items-center text-xs font-semibold select-none">
 <div>
 {hasBeenBlurred && isBelowMin && (
 <span className="text-[var(--warning-fg)] flex items-center gap-1">
 {isTitleMode 
 ? 'Job title too short (minimum 3 characters).' 
 : 'Job description too short (minimum 200 characters).'}
 </span>
 )}
 {isAboveMax && (
 <span className="text-[var(--danger-fg)] flex items-center gap-1">
 {isTitleMode 
 ? 'Job title too long (maximum 150 characters).' 
 : 'Job description too long (maximum 10,000 characters).'}
 </span>
 )}
 {hasBeenBlurred && !isBelowMin && !isAboveMax && (
 <span className="text-[var(--success-fg)] flex items-center gap-1">
 ✓ Ready
 </span>
 )}
 </div>
 
 <div className={`font-mono ${isBelowMin ? 'text-[var(--warning-fg)]' : 'text-[var(--text-secondary)]'}`}>
 {value.length} / {MIN_CHARS} min {isBelowMin && '(below threshold)'}
 </div>
 </div>
 </div>
 );
}