'use client';

import { useState, useRef, useCallback, useId } from 'react';
import { Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { parseFile, getFileParseError } from '../../../lib/parsers/fileParser';
import { RESUME_LIMITS } from '../../../lib/limits';

export default function FileDropzone({ onTextExtracted, label = 'Drop your file here' }) {
  const [status, setStatus] = useState('idle'); // idle | dragging | parsing | success | error
  const [fileNameInfo, setFileNameInfo] = useState('');
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);
  const inputId = useId();

  const handleFile = useCallback(async (file) => {
    setStatus('parsing');
    setMessage('Parsing...');
    
    // Size check
    if (file.size > 5 * 1024 * 1024) {
      setStatus('error');
      setMessage('File too large. Maximum size is 5MB.');
      return;
    }

    try {
      const text = await parseFile(file);
      
      // Min length check
      if (text.length < 200) {
        setStatus('error');
        setMessage('Resume too short to analyze. Paste more content.');
        return;
      }
      
      // Max length check
      if (text.length > RESUME_LIMITS.max) {
        setStatus('error');
        setMessage('Resume too long. Consider trimming older roles.');
        return;
      }

      const kb = Math.round(file.size / 1024);
      setFileNameInfo(`${file.name}  ·  ${kb} KB`);
      setStatus('success');
      onTextExtracted(text);
    } catch (err) {
      console.error('File parsing error:', err);
      setStatus('error');
      setMessage(getFileParseError(err.message));
    }
  }, [onTextExtracted]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setStatus('idle');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onDragOver = (e) => { e.preventDefault(); setStatus('dragging'); };
  const onDragLeave = () => setStatus('idle');

  const statusStyles = {
    idle:    'bg-slate-50/50 border-slate-200 hover:border-slate-400 hover:bg-white transition-colors',
    dragging:'bg-slate-100 border-slate-900 border-solid shadow-sm',
    parsing: 'bg-slate-50/50 border-slate-200',
    success: 'bg-emerald-50/30 border-emerald-400 border-solid',
    error:   'bg-red-50/30 border-red-400 border-solid',
  };

  const Icon = {
    idle:    <Upload size={18} className="text-slate-500 group-hover:text-slate-800 transition-colors stroke-[2.5]" />,
    dragging:<Upload size={18} className="text-slate-900 animate-pulse stroke-[2.5]" />,
    parsing: <Loader2 size={18} className="text-slate-900 animate-spin stroke-[2.5]" />,
    success: <CheckCircle size={18} className="text-emerald-600 stroke-[2.5]" />,
    error:   <XCircle size={18} className="text-red-600 stroke-[2.5]" />,
  }[status];

  // slate-350, emerald-250 and red-250 are not real Tailwind scale values, so
  // these rendered as no-ops.
  const iconBg = {
    idle:    'bg-white border-slate-200 group-hover:bg-slate-50 group-hover:border-slate-300',
    dragging:'bg-slate-200 border-slate-300',
    parsing: 'bg-white border-slate-200',
    success: 'bg-emerald-100/30 border-emerald-200',
    error:   'bg-red-100/30 border-red-200',
  }[status];

  return (
    // Was a <div onClick>, which made uploading impossible by keyboard. A
    // button gives focus, Enter/Space activation, and a screen-reader role for
    // free; drag handlers still work on it.
    <button
      type="button"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
      aria-describedby={`${inputId}-hint`}
      className={`w-full rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center group select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 ${statusStyles[status]}`}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept=".pdf,.docx,.txt"
        className="sr-only"
        tabIndex={-1}
        aria-label={label}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      
      <div className={`w-10 h-10 rounded-md border flex items-center justify-center shadow-sm mb-4 transition-all duration-150 ${iconBg}`}>
        {Icon}
      </div>

      {/* Status changes are announced: parsing and errors are otherwise
          invisible to screen-reader users. */}
      <div className="flex flex-col items-center gap-1.5 max-w-sm" aria-live="polite">
        {status === 'success' ? (
          <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Ready
          </span>
        ) : (
          <span className={`text-sm font-semibold ${status === 'error' ? 'text-red-600' : 'text-slate-900'}`}>
            {status === 'idle' || status === 'dragging' ? label : message}
          </span>
        )}

        {status === 'idle' && (
          <span id={`${inputId}-hint`} className="text-xs text-slate-500 font-medium">
            PDF, DOCX, or TXT &bull; up to 5MB
          </span>
        )}
        {status === 'success' && (
          <>
            <span className="text-xs text-slate-600 font-semibold">{fileNameInfo}</span>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider font-mono mt-1">Click to replace file</span>
          </>
        )}
      </div>
    </button>
  );
}