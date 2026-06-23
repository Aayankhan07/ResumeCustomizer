import Card from '../ui/Card';
import { BarChart2, Star, Clock } from 'lucide-react';

export default function StatsRow({ stats }) {
  const items = [
    {
      label: 'Resumes Optimized',
      value: stats?.total ?? 0,
      icon: <BarChart2 className="text-slate-600" size={18} />,
      bg: 'bg-slate-55 border-slate-200', // bg-slate-55 is standard via slate theme configuration, but let's use bg-slate-50
      bgClass: 'bg-slate-50 border-slate-200',
    },
    {
      label: 'Best Match Score',
      value: stats?.bestScore !== null && stats?.bestScore !== undefined ? `${stats.bestScore}%` : '—',
      icon: <Star className="text-slate-600" size={18} />,
      bgClass: 'bg-slate-50 border-slate-200',
    },
    {
      label: 'Optimized This Week',
      value: stats?.thisWeek ?? 0,
      icon: <Clock className="text-slate-600" size={18} />,
      bgClass: 'bg-slate-50 border-slate-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 select-none">
      {items.map((item, idx) => (
        <Card key={idx} hoverable className="flex items-center gap-5">
          <div className={`p-2.5 rounded-md border ${item.bgClass} flex items-center justify-center shrink-0 shadow-sm`}>
            {item.icon}
          </div>
          <div>
            <p className="text-2xl font-serif text-slate-900 font-bold tracking-tight">{item.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 font-mono">{item.label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

