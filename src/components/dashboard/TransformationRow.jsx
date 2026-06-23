import { useNavigate } from 'react-router-dom';
import { Download, Trash2 } from 'lucide-react';
import { timeAgo } from '../../utils/formatDate';
import { getScoreColor } from '../../utils/scoreColor';
import { getTransformation } from '../../lib/api';
import { generateResumePDF } from '../../lib/pdfGenerator';
import { toast } from 'sonner';
import { useState } from 'react';

export default function TransformationRow({ item, onDelete }) {
  const navigate = useNavigate();
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
      onClick={() => navigate(`/transform/${item.id}`)}
      className="flex flex-col sm:flex-row sm:items-center justify-between p-5.5 bg-white hover:bg-slate-50/65 cursor-pointer transition-colors duration-200 select-none group gap-3 sm:gap-6"
    >
      {/* Job Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-[15px] text-slate-800 truncate group-hover:text-blue-600 transition-colors">
          {item.label || item.detected_job_title || 'Unnamed Optimization'}
        </h4>
        <p className="text-xs text-slate-400 truncate mt-1 flex items-center gap-1.5 font-medium">
          <span>{item.detected_company || 'Target Company'}</span>
          <span className="text-slate-300 select-none">&bull;</span>
          <span className="font-mono text-[10px]">{timeAgo(item.created_at)}</span>
        </p>
      </div>

      {/* Score and actions */}
      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-5 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-3.5 sm:pt-0">
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
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-md transition-all cursor-pointer shrink-0 disabled:opacity-50"
            title="Download PDF"
          >
            <Download size={14} className={`stroke-[2.5] ${downloading ? 'animate-bounce' : ''}`} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-slate-400 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-md transition-all cursor-pointer shrink-0"
            title="Delete"
          >
            <Trash2 size={14} className="stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
