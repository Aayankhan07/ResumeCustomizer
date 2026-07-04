import GlassPanel from '../ui/GlassPanel';
import { BarChart2, Star, Clock, TrendingUp } from 'lucide-react';

export default function StatsRow({ stats, transformations = [] }) {
  // Compute response rate
  const appliedList = transformations.filter(t => ['Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn'].includes(t.status || ''));
  const respondedList = transformations.filter(t => ['Interviewing', 'Offer', 'Rejected'].includes(t.status || ''));
  const appliedCount = appliedList.length;
  const respondedCount = respondedList.length;
  const responseRate = appliedCount > 0 ? Math.round((respondedCount / appliedCount) * 100) : null;
  const responseRateValue = responseRate !== null ? `${responseRate}%` : '—';
  const responseRateLabel = appliedCount > 0 ? `Response Rate (${respondedCount}/${appliedCount})` : 'Response Rate';

  const items = [
    {
      label: 'Resumes Optimized',
      value: stats?.total ?? 0,
      icon: <BarChart2 className="text-slate-600 dark:text-indigo-400" size={18} />,
      bgClass: 'bg-slate-100/80 border-slate-200 dark:bg-slate-950/40 dark:border-slate-800',
    },
    {
      label: 'Best Match Score',
      value: stats?.bestScore !== null && stats?.bestScore !== undefined ? `${stats.bestScore}%` : '—',
      icon: <Star className="text-slate-600 dark:text-emerald-400" size={18} />,
      bgClass: 'bg-slate-100/80 border-slate-200 dark:bg-slate-950/40 dark:border-slate-800',
    },
    {
      label: 'Optimized This Week',
      value: stats?.thisWeek ?? 0,
      icon: <Clock className="text-slate-600 dark:text-amber-400" size={18} />,
      bgClass: 'bg-slate-100/80 border-slate-200 dark:bg-slate-950/40 dark:border-slate-800',
    },
    {
      label: responseRateLabel,
      value: responseRateValue,
      icon: <TrendingUp className="text-slate-600 dark:text-sky-400" size={18} />,
      bgClass: 'bg-slate-100/80 border-slate-200 dark:bg-slate-950/40 dark:border-slate-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
      {items.map((item, idx) => (
        <GlassPanel key={idx} hoverEffect className="flex items-center gap-5 !p-5">
          <div className={`p-2.5 rounded-md border ${item.bgClass} flex items-center justify-center shrink-0 shadow-sm`}>
            {item.icon}
          </div>
          <div>
            <p className="text-2xl font-serif text-slate-900 dark:text-white font-bold tracking-tight">{item.value}</p>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1 font-mono">{item.label}</p>
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}
