'use client';
import { useRouter } from 'next/navigation';
import { Download, Trash2 } from 'lucide-react';
import { timeAgo } from '../../utils/formatDate';
import { getScoreColor } from '../../utils/scoreColor';
import { getTransformation } from '../../lib/api';
import { generateResumePDF } from '../../lib/pdfGenerator';
import { toast } from 'sonner';
import { useState } from 'react';

const STATUS_STYLES = {
  Saved:        'bg-slate-100 text-slate-650 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  Applied:      'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-955/20 dark:text-blue-300 dark:border-blue-900/30',
  Interviewing: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-955/20 dark:text-amber-300 dark:border-amber-900/30',
  Offer:        'bg-emerald-50 text-emerald-755 border-emerald-200/80 dark:bg-emerald-955/20 dark:text-emerald-300 dark:border-emerald-900/30',
  Rejected:     'bg-rose-50 text-rose-650 border-rose-200/80 dark:bg-rose-955/20 dark:text-rose-300 dark:border-rose-900/30',
};

export default function TransformationRow({ item, onDelete, onUpdateStatus }) {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);
  const { text: scoreText, bg: scoreBg, border: scoreBorder } = getScoreColor(item.match_score);

  const handleDownload = async (e) => {
    e.stopPropagation();
    setDownloading(true);
    try {
      const fullData = await getTransformation(item.id);
      generateResumePDF(fullData.output_json);
      toast.success('PDF downloaded');
    } catch (err) {
      toast.error('Failed to download PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this resume optimization from your history?')) {
      onDelete(item.id);
    }
  };

  return (
    <div
      onClick={() => router.push(`/transform/${item.id}`)}
      className="flex flex-col sm:flex-row sm:items-center justify-between p-5.5 bg-white dark:bg-slate-900/10 hover:bg-slate-50/60 dark:hover:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800/60 cursor-pointer transition-colors duration-200 select-none group gap-3 sm:gap-6"
    >
      {/* Job Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-[15px] text-slate-800 dark:text-slate-200 group-hover:text-blue-650 dark:group-hover:text-indigo-400 transition-colors">
          {item.label || item.detected_job_title || 'Unnamed Optimization'}
        </h4>
        <p className="text-xs text-slate-450 dark:text-slate-500 truncate mt-1 flex items-center gap-1.5 font-medium">
          <span>{item.detected_company || 'Target Company'}</span>
          <span className="text-slate-300 dark:text-slate-800 select-none">&bull;</span>
          <span className="font-mono text-[10px]">{timeAgo(item.created_at)}</span>
        </p>
      </div>

      {/* Score and actions */}
      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-5 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60 pt-3.5 sm:pt-0">
        {/* Status Dropdown Pill */}
        <select
          value={item.status || 'Saved'}
          onChange={(e) => {
            e.stopPropagation();
            onUpdateStatus(item.id, e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
          className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border rounded-md cursor-pointer transition-all outline-none focus:ring-1 focus:ring-slate-900/10 focus:border-slate-350 dark:focus:ring-indigo-500/10 dark:focus:border-indigo-500 shrink-0 appearance-none text-center ${STATUS_STYLES[item.status || 'Saved']}`}
        >
          <option value="Saved" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white uppercase font-bold">Saved</option>
          <option value="Applied" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white uppercase font-bold">Applied</option>
          <option value="Interviewing" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white uppercase font-bold">Interviewing</option>
          <option value="Offer" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white uppercase font-bold">Offer</option>
          <option value="Rejected" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white uppercase font-bold">Rejected</option>
        </select>

        {/* Score Badge */}
        <span
          className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border shrink-0 ${scoreBg} ${scoreText} ${scoreBorder}`}
        >
          {item.match_score}% Match
        </span>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-md transition-all cursor-pointer shrink-0 disabled:opacity-50"
            title="Download PDF"
          >
            <Download size={14} className={`stroke-[2.5] ${downloading ? 'animate-bounce' : ''}`} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border border-transparent hover:border-red-200 dark:hover:border-red-900/30 rounded-md transition-all cursor-pointer shrink-0"
            title="Delete"
          >
            <Trash2 size={14} className="stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
