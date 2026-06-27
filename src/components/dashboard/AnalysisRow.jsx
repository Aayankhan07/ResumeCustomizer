import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, ChevronRight } from 'lucide-react';
import { timeAgo } from '../../utils/formatDate';
import { trackEvent } from '../../utils/analytics';


const STATUS_STYLES = {
  Saved:        'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-default)]',
  Applied:      'bg-[var(--neutral-subtle)] text-[var(--neutral)] border-[var(--border-default)]',
  Interviewing: 'bg-[var(--warning-subtle)] text-[var(--warning-fg)] border-[var(--warning-fg)]/10',
  Offer:        'bg-[var(--success-subtle)] text-[var(--success-fg)] border-[var(--success-fg)]/10',
  Rejected:     'bg-[var(--danger-subtle)] text-[var(--danger-fg)] border-[var(--danger-fg)]/10',
};

export default function AnalysisRow({ item, onDelete, onUpdateStatus }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const menuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    const clickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  // Score badge color based on score range: ≥70 success, 40-69 warning, <40 danger
  const getScoreBadgeStyle = (score) => {
    if (score >= 70) return 'bg-[var(--success-subtle)] text-[var(--success-fg)]';
    if (score >= 40) return 'bg-[var(--warning-subtle)] text-[var(--warning-fg)]';
    return 'bg-[var(--danger-subtle)] text-[var(--danger-fg)]';
  };

  const handleRowClick = () => {
    router.push(`/transform/${item.id}`);
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    const oldStatus = item.status || 'Saved';
    trackEvent('status_updated', { old_status: oldStatus, new_status: newStatus });
    onUpdateStatus(item.id, newStatus);
  };


  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    setShowConfirm(true);
  };

  const confirmDelete = (e) => {
    e.stopPropagation();
    onDelete(item.id);
    setShowConfirm(false);
  };

  const cancelDelete = (e) => {
    e.stopPropagation();
    setShowConfirm(false);
  };

  return (
    <div
      onClick={handleRowClick}
      className="flex flex-col sm:flex-row sm:items-center justify-between p-[14px] px-[18px] bg-[var(--bg-elevated)] hover:bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-[var(--radius-md)] cursor-pointer transition-colors duration-150 select-none group gap-4 relative mb-2"
    >
      {/* Inline Deletion Confirmation Panel */}
      {showConfirm ? (
        <div 
          className="absolute inset-0 bg-[var(--bg-elevated)] flex items-center justify-between px-6 z-20 animate-fade-in rounded-[var(--radius-md)]"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs font-bold text-[var(--text-secondary)]">
            Are you sure? This cannot be undone.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={cancelDelete}
              className="btn-ghost px-3 py-1 text-xs"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="btn-primary bg-[var(--danger)] hover:bg-[var(--danger-fg)] text-white px-3 py-1 text-xs"
            >
              Delete
            </button>
          </div>
        </div>
      ) : null}

      {/* Left Column: Job Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-[var(--text-primary)]">
          {item.label || item.detected_job_title || 'Resume Optimization'}
        </h4>
        <div className="text-xs text-[var(--text-secondary)] truncate mt-1 flex items-center gap-1.5 font-normal">
          <span>{item.detected_company || '—'}</span>
          <span className="text-[var(--text-muted)] select-none">&bull;</span>
          <span className="font-mono text-[11px] text-[var(--text-muted)]">{timeAgo(item.created_at)}</span>
        </div>
      </div>

      {/* Right Column: Score, Status & Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]">
        
        {/* Score Badge: small circle (36px) showing match score */}
        <div 
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold font-sans ${getScoreBadgeStyle(item.match_score)}`}
          title={`Match Score: ${item.match_score}%`}
        >
          {item.match_score}
        </div>

        {/* Status Dropdown */}
        <div 
          className="relative shrink-0" 
          onClick={(e) => e.stopPropagation()}
        >
          <select
            value={item.status || 'Saved'}
            onChange={handleStatusChange}
            className={`px-2.5 py-1 text-[11px] font-medium border rounded-[var(--radius-xs)] cursor-pointer transition-all outline-none text-center appearance-none ${STATUS_STYLES[item.status || 'Saved']}`}
          >
            <option value="Saved">Saved</option>
            <option value="Applied">Applied</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Menu (···) trigger */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] rounded-[var(--radius-sm)] transition-all cursor-pointer"
            aria-label="More options"
          >
            <MoreVertical size={14} className="stroke-[2.5]" />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 top-7 w-32 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] py-1 z-35 animate-fade-in text-left">
              <button
                onClick={handleDeleteClick}
                className="w-full text-left px-3 py-1.5 text-xs font-semibold text-[var(--danger)] hover:bg-[var(--danger-subtle)] hover:text-[var(--danger-fg)] cursor-pointer"
              >
                Delete analysis
              </button>
            </div>
          )}
        </div>

        {/* Navigation Chevron */}
        <div className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors shrink-0">
          <ChevronRight size={16} />
        </div>

      </div>
    </div>
  );
}

