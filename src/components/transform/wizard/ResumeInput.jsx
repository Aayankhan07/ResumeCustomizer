import FileDropzone from './FileDropzone';
import Textarea from '../../ui/Textarea';

export default function ResumeInput({ value, onChange }) {
  const MIN_CHARS = 200;
  const MAX_CHARS = 15000;

  const isBelowMin = value.length > 0 && value.length < MIN_CHARS;
  const isAboveMax = value.length > MAX_CHARS;

  return (
    <div className="flex flex-col gap-5 text-left font-sans">
      <div>
        <span className="font-mono text-xs font-semibold text-slate-500 uppercase tracking-widest">Step 1 of 2</span>
        <h3 className="font-serif text-2xl text-slate-900 dark:text-white font-bold mt-1">Add Your Resume</h3>
        <p className="text-sm text-slate-505 dark:text-slate-400">Upload your current resume or paste the raw text below.</p>
      </div>

      <FileDropzone
        label="Upload your resume (PDF, DOCX, or TXT)"
        onTextExtracted={onChange}
      />

      <div className="relative select-none">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200 dark:border-slate-800"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-mist dark:bg-[#030712] px-3 text-slate-405 font-bold font-mono">Or paste text</span>
        </div>
      </div>

      <div className="relative">
        <Textarea
          placeholder="Paste your current resume details here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={MAX_CHARS}
          className={isBelowMin ? 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/10' : ''}
        />
        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 px-2 py-0.5 rounded shadow-sm select-none">
          {value.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} max chars
        </div>
      </div>

      {isBelowMin && (
        <div className="text-xs text-amber-600 dark:text-amber-500 font-semibold -mt-2 select-none">
          Resume too short to analyze. Paste more content (minimum 200 characters).
        </div>
      )}
    </div>
  );
}
