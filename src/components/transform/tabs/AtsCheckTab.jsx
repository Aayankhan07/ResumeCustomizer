import { Check, AlertTriangle } from 'lucide-react';

export default function AtsCheckTab() {
  return (
    <div className="animate-fade-in flex flex-col gap-6 font-sans">
      <div>
        <h3 className="font-serif text-2xl text-slate-955 font-bold tracking-tight">ATS Audit Results</h3>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Automated quality assurance checks matching standard ATS parser rules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Check 1 */}
        <div className="border border-slate-200/80 bg-slate-50/40 rounded-xl p-4 flex gap-3.5 items-start shadow-sm">
          <div className="w-5.5 h-5.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-emerald-500/10">
            <Check size={12} className="stroke-[3.5]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">File Format Compatibility</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-1.5 font-medium">
              Standard PDF format generated matches parsing standards. Rich in text, zero vectors, image masks, or complex multi-column blocks that disrupt parse ordering.
            </p>
          </div>
        </div>

        {/* Check 2 */}
        <div className="border border-slate-200/80 bg-slate-50/40 rounded-xl p-4 flex gap-3.5 items-start shadow-sm">
          <div className="w-5.5 h-5.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-emerald-500/10">
            <Check size={12} className="stroke-[3.5]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">ATS-Safe Section Headings</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-1.5 font-medium">
              All headings match standard naming conventions: "Experience", "Education", "Skills", "Projects", and "Certifications". Avoids non-standard terminology.
            </p>
          </div>
        </div>

        {/* Check 3 */}
        <div className="border border-slate-200/80 bg-slate-50/40 rounded-xl p-4 flex gap-3.5 items-start shadow-sm">
          <div className="w-5.5 h-5.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-emerald-500/10">
            <Check size={12} className="stroke-[3.5]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Contact Details Integrity</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-1.5 font-medium">
              Your email, phone number, and location are parsed and correctly placed at the top of the document. Standard dividers are used for clean extraction.
            </p>
          </div>
        </div>

        {/* Check 4 */}
        <div className="border border-slate-200/80 bg-slate-50/40 rounded-xl p-4 flex gap-3.5 items-start shadow-sm">
          <div className="w-5.5 h-5.5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-amber-500/10">
            <AlertTriangle size={12} className="stroke-[3.5]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Metrics & Quantifiable Impact</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-1.5 font-medium">
              Some experience points contain standard `[X%]` or `[N]` placeholders. Review these and insert your actual project metrics before finalizing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
