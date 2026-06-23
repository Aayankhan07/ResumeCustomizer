import FileDropzone from './FileDropzone';
import Textarea from '../ui/Textarea';

export default function ResumeInput({ value, onChange }) {
  const MAX_CHARS = 10000;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <span className="font-mono text-xs font-semibold text-cobalt uppercase tracking-widest">Step 1 of 2</span>
        <h3 className="font-serif text-2xl text-ink font-bold mt-1">Add Your Resume</h3>
        <p className="text-sm text-graphite">Upload your current resume or paste the raw text below.</p>
      </div>

      <FileDropzone
        label="Upload your resume (PDF, DOCX, or TXT)"
        onTextExtracted={onChange}
      />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-boundary"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-graphite/50 font-semibold font-mono">Or paste text</span>
        </div>
      </div>

      <div className="relative">
        <Textarea
          placeholder="Paste your current resume details here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={MAX_CHARS}
        />
        <div className="absolute bottom-3 right-3 text-xs font-mono text-graphite/60 bg-white/80 px-2 py-0.5 rounded">
          {value.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars
        </div>
      </div>
    </div>
  );
}
