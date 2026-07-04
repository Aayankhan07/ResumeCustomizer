import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { getEvents } from '../../lib/api';
import { TransformationItem } from '../../hooks/useHistory';

interface UpcomingWidgetProps {
  transformations?: TransformationItem[];
}

export default function UpcomingWidget({ transformations = [] }: UpcomingWidgetProps) {
  const router = useRouter();
  const [events, setEvents] = useState<{ overdue: any[]; upcoming: any[] }>({ overdue: [], upcoming: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await getEvents(14);
        setEvents(data || { overdue: [], upcoming: [] });
      } catch (err) {
        console.error('Failed to load upcoming events for widget:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    if (Notification.permission !== 'granted') return;

    const todayStr = new Date().toDateString();
    const triggerNotification = (id: string, title: string, body: string) => {
      const storageKey = `notified:${id}:${todayStr}`;
      if (localStorage.getItem(storageKey)) return;
      
      try {
        new Notification(title, { body });
        localStorage.setItem(storageKey, 'true');
      } catch (err) {
        console.error('Failed to trigger notification:', err);
      }
    };

    // Notify about overdue events
    events.overdue.forEach((evt: any) => {
      triggerNotification(evt.id, `Overdue: ${evt.title}`, `This event was scheduled in the past.`);
    });

    // Notify about upcoming events in next 24 hours
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    events.upcoming.forEach((evt: any) => {
      const evtDate = new Date(evt.event_date);
      if (evtDate <= tomorrow) {
        const timeStr = evtDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        triggerNotification(evt.id, `Upcoming: ${evt.title}`, `Scheduled for ${evtDate.toDateString()} at ${timeStr}`);
      }
    });

    // Check deadlines from transformations
    transformations.forEach(item => {
      if (!item.application_deadline) return;
      const dl = new Date(item.application_deadline);
      dl.setHours(0,0,0,0);
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const diffTime = dl.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const isFinished = ['Offer', 'Rejected', 'Withdrawn'].includes(item.status || '');
      if (diffDays >= 0 && diffDays <= 2 && !isFinished) {
        triggerNotification(
          `deadline-${item.id}`,
          `Upcoming Deadline for ${item.detected_job_title}`,
          `Application deadline is ${diffDays === 0 ? 'today' : diffDays === 1 ? 'tomorrow' : `in ${diffDays} days`}!`
        );
      }
    });
  }, [events, transformations]);

  if (loading) return null;

  // Process deadlines from transformations list
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const deadlineItems: any[] = [];
  transformations.forEach((item) => {
    if (!item.application_deadline) return;
    const deadlineDate = new Date(item.application_deadline);
    deadlineDate.setHours(0, 0, 0, 0);

    const isFinished = ['Offer', 'Rejected', 'Withdrawn'].includes(item.status || '');
    if (isFinished) return;

    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      deadlineItems.push({
        id: `deadline-overdue-${item.id}`,
        type: 'deadline',
        isOverdue: true,
        date: deadlineDate,
        daysDifference: Math.abs(diffDays),
        label: `Deadline overdue: ${item.detected_job_title || 'CV'} @ ${item.detected_company || 'Unknown Company'} (${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'} ago)`,
        transformationId: item.id
      });
    } else if (diffDays <= 14) {
      deadlineItems.push({
        id: `deadline-upcoming-${item.id}`,
        type: 'deadline',
        isOverdue: false,
        date: deadlineDate,
        daysDifference: diffDays,
        label: `Deadline ${diffDays === 0 ? 'today' : diffDays === 1 ? 'tomorrow' : `in ${diffDays} days`} — ${item.detected_job_title || 'CV'} @ ${item.detected_company || 'Unknown Company'}`,
        transformationId: item.id
      });
    }
  });

  // Process timeline events from GET /api/events
  const overdueEvents = events.overdue.map((evt: any) => {
    const diffTime = now.getTime() - new Date(evt.event_date).getTime();
    const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    const compName = evt.transformations?.detected_company || 'Unknown Company';
    return {
      id: evt.id,
      type: evt.event_type,
      isOverdue: true,
      date: new Date(evt.event_date),
      label: `Overdue: ${evt.title} — ${compName} (${diffDays === 0 ? 'today' : diffDays === 1 ? 'yesterday' : `${diffDays} days ago`})`,
      transformationId: evt.transformation_id
    };
  });

  const upcomingEvents = events.upcoming.map((evt: any) => {
    const date = new Date(evt.event_date);
    const compName = evt.transformations?.detected_company || 'Unknown Company';
    
    // Format date readable
    let dateStr = '';
    const eventDay = new Date(evt.event_date);
    eventDay.setHours(0,0,0,0);
    const today = new Date(now);
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (eventDay.getTime() === today.getTime()) {
      dateStr = 'Today';
    } else if (eventDay.getTime() === tomorrow.getTime()) {
      dateStr = 'Tomorrow';
    } else {
      dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }

    const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const emoji = evt.event_type === 'interview' ? '🎤' : '📅';

    return {
      id: evt.id,
      type: evt.event_type,
      isOverdue: false,
      date,
      label: `${emoji} ${dateStr} at ${timeStr} — ${evt.title} @ ${compName}`,
      transformationId: evt.transformation_id
    };
  });

  // Combine overdue and upcoming
  const allOverdue = [...deadlineItems.filter(d => d.isOverdue), ...overdueEvents].sort((a, b) => b.date.getTime() - a.date.getTime());
  const allUpcoming = [...deadlineItems.filter(d => !d.isOverdue), ...upcomingEvents].sort((a, b) => a.date.getTime() - b.date.getTime());

  if (allOverdue.length === 0 && allUpcoming.length === 0) return null;

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] flex flex-col gap-3.5 select-none relative overflow-hidden transition-all duration-300">
      {/* Decorative accent top line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[radial-gradient(circle_at_center,_var(--accent),_transparent)] opacity-40" />

      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
        <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono flex items-center gap-2">
          <Calendar size={13} className="text-[var(--accent)]" />
          Upcoming Checklist
        </h3>
      </div>

      <div className="flex flex-col gap-2">
        {/* Overdue items (Red) */}
        {allOverdue.map((item) => (
          <div
            key={item.id}
            onClick={() => router.push(`/transform/${item.transformationId}?tab=tracking`)}
            className="flex items-start gap-2.5 px-3 py-2 border border-red-500/10 hover:border-red-500/30 bg-red-500/[0.02] hover:bg-red-500/[0.04] rounded-lg cursor-pointer text-xs text-red-600 dark:text-red-400 font-medium transition-all group duration-150"
          >
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span className="flex-1 line-clamp-1 group-hover:underline">{item.label}</span>
          </div>
        ))}

        {/* Upcoming items */}
        {allUpcoming.map((item) => (
          <div
            key={item.id}
            onClick={() => router.push(`/transform/${item.transformationId}?tab=tracking`)}
            className="flex items-start gap-2.5 px-3 py-2 border border-[var(--border-default)] hover:border-[var(--accent)] bg-[var(--bg-base)]/40 hover:bg-[var(--bg-subtle)] rounded-lg cursor-pointer text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-all group duration-150"
          >
            <Clock size={14} className="shrink-0 mt-0.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
            <span className="flex-1 line-clamp-1 group-hover:underline">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
