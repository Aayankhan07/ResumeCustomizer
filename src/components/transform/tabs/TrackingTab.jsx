import { useState, useEffect } from 'react';
import { Calendar, Link as LinkIcon, MapPin, User, Mail, DollarSign, Tag, Clock, Trash2, CheckCircle2, MessageSquare, Plus, Award } from 'lucide-react';
import { toast } from 'sonner';
import {
  updateTransformationTracking,
  getTransformationEvents,
  createEvent,
  updateEvent,
  deleteEvent
} from '../../../lib/api';
import AddEventModal from '../workspace/AddEventModal';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

const STATUS_OPTIONS = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn'];

const STATUS_STYLES = {
  Saved:        'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-default)]',
  Applied:      'bg-[var(--neutral-subtle)] text-[var(--neutral)] border-[var(--border-default)]',
  Interviewing: 'bg-[var(--warning-subtle)] text-[var(--warning-fg)] border-[var(--warning-fg)]/10',
  Offer:        'bg-[var(--success-subtle)] text-[var(--success-fg)] border-[var(--success-fg)]/10',
  Rejected:     'bg-[var(--danger-subtle)] text-[var(--danger-fg)] border-[var(--danger-fg)]/10',
  Withdrawn:    'bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--border-default)] line-through opacity-75',
};

const PRIORITY_STYLES = {
  High: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/25',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/25',
  Low: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/25',
};

export default function TrackingTab({ transformation }) {
  const [status, setStatus] = useState(transformation.status || 'Saved');
  
  // Tracking form fields
  const [appliedAt, setAppliedAt] = useState('');
  const [deadline, setDeadline] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [recruiterName, setRecruiterName] = useState('');
  const [recruiterContact, setRecruiterContact] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [source, setSource] = useState('');
  
  const [savingTracking, setSavingTracking] = useState(false);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  // Initialize form fields on mount/prop change
  useEffect(() => {
    if (transformation) {
      setStatus(transformation.status || 'Saved');
      setAppliedAt(transformation.applied_at ? new Date(transformation.applied_at).toISOString().split('T')[0] : '');
      setDeadline(transformation.application_deadline || '');
      setJobUrl(transformation.application_url || '');
      setJobLocation(transformation.job_location || '');
      setSalaryRange(transformation.salary_range || '');
      setRecruiterName(transformation.recruiter_name || '');
      setRecruiterContact(transformation.recruiter_contact || '');
      setPriority(transformation.priority || 'Medium');
      setSource(transformation.source || '');
    }
  }, [transformation]);

  // Load events
  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      const data = await getTransformationEvents(transformation.id);
      setEvents(data || []);
    } catch (err) {
      console.error('Failed to load events', err);
      toast.error('Failed to load events timeline.');
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (transformation?.id) {
      loadEvents();
    }
  }, [transformation?.id]);

  const handleStatusChange = async (newStatus) => {
    const previousStatus = status;
    setStatus(newStatus); // Optimistic update
    try {
      await updateTransformationTracking(transformation.id, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      setStatus(previousStatus); // Rollback
      toast.error('Failed to update status.');
    }
  };

  const handleSaveTrackingDetails = async (e) => {
    e.preventDefault();
    setSavingTracking(true);
    try {
      const trackingData = {
        applied_at: appliedAt ? new Date(appliedAt).toISOString() : null,
        application_deadline: deadline || null,
        application_url: jobUrl.trim() || null,
        job_location: jobLocation.trim() || null,
        salary_range: salaryRange.trim() || null,
        recruiter_name: recruiterName.trim() || null,
        recruiter_contact: recruiterContact.trim() || null,
        priority,
        source: source.trim() || null,
      };

      await updateTransformationTracking(transformation.id, trackingData);
      toast.success('Tracking details saved successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save tracking details.');
    } finally {
      setSavingTracking(false);
    }
  };

  const handleAddEvent = async (eventData) => {
    try {
      const data = await createEvent({
        transformation_id: transformation.id,
        ...eventData
      });
      setEvents(prev => [data, ...prev]);
      toast.success('Event logged successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create event.');
      throw err;
    }
  };

  const handleToggleEventDone = async (event) => {
    try {
      const updated = await updateEvent(event.id, { is_done: !event.is_done });
      setEvents(prev => prev.map(e => e.id === event.id ? updated : e));
    } catch (err) {
      console.error(err);
      toast.error('Failed to update event status.');
    }
  };

  const handleEventOutcomeChange = async (event, outcome) => {
    try {
      const updated = await updateEvent(event.id, { outcome });
      setEvents(prev => prev.map(e => e.id === event.id ? updated : e));
      toast.success(`Interview outcome updated to ${outcome}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update outcome.');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Are you sure you want to delete this event from the timeline?')) return;
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      toast.success('Event removed');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete event.');
    }
  };

  const formatEventDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Application Status Bar */}
      <div className="bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Application Status</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Where is this resume in the application lifecycle?</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => {
            const isActive = status === opt;
            return (
              <button
                key={opt}
                onClick={() => handleStatusChange(opt)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  isActive
                    ? STATUS_STYLES[opt] + ' ring-2 ring-[var(--accent)]/15 border-[var(--accent)]'
                    : 'bg-transparent border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Form fields (left) & Timeline Events (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column: Tracking Details Form */}
        <form onSubmit={handleSaveTrackingDetails} className="lg:col-span-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 space-y-5">
          <div className="border-b border-[var(--border-subtle)] pb-3">
            <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">Job & Contact Details</h4>
            <p className="text-xs text-[var(--text-muted)] mt-1">Keep track of job info and recruiter contact info.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-graphite uppercase tracking-wide flex items-center gap-1.5">
                <Clock size={13} />
                Date Applied
              </label>
              <input
                type="date"
                value={appliedAt}
                onChange={(e) => setAppliedAt(e.target.value)}
                className="w-full bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg px-3 py-2 font-sans text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-graphite uppercase tracking-wide flex items-center gap-1.5">
                <Calendar size={13} />
                Application Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg px-3 py-2 font-sans text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location (e.g. Remote, Hybrid)"
              type="text"
              value={jobLocation}
              onChange={(e) => setJobLocation(e.target.value)}
              placeholder="Karachi, Hybrid, Remote"
            />
            <Input
              label="Salary Range"
              type="text"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              placeholder="e.g., $100k - $120k / yr"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-graphite uppercase tracking-wide">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg px-3 py-2 font-sans text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all cursor-pointer"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <Input
              label="Source / Referral"
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. LinkedIn, Company Website, Referral"
            />
          </div>

          <Input
            label="Job Posting URL"
            type="url"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            placeholder="https://company.com/careers/job"
          />

          <div className="pt-2 border-t border-[var(--border-subtle)] space-y-4">
            <h5 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono">Recruiter Contact</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Name"
                type="text"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                placeholder="e.g., Sarah Jenkins"
              />
              <Input
                label="Email / LinkedIn"
                type="text"
                value={recruiterContact}
                onChange={(e) => setRecruiterContact(e.target.value)}
                placeholder="e.g., s.jenkins@company.com"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={savingTracking}
              className="px-6"
            >
              {savingTracking ? 'Saving...' : 'Save Tracking Info'}
            </Button>
          </div>
        </form>

        {/* Right Column: Timeline Events */}
        <div className="lg:col-span-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 flex flex-col justify-between min-h-[450px]">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4">
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">Timeline Events</h4>
                <p className="text-xs text-[var(--text-muted)] mt-1">Log interviews, follow-ups, and notes.</p>
              </div>
              <button
                onClick={() => setIsAddEventOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-all cursor-pointer font-mono uppercase tracking-wider border border-[var(--accent)]/30 hover:border-[var(--accent)] px-2 py-1.5 rounded-lg bg-[var(--bg-base)]"
              >
                <Plus size={12} className="stroke-[3]" />
                Event
              </button>
            </div>

            {loadingEvents ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-6 h-6 border-2 border-[var(--text-primary)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[var(--border-default)] rounded-[var(--radius-md)] bg-[var(--bg-base)]/50">
                <p className="text-xs text-[var(--text-muted)] font-normal">No timeline events logged yet.</p>
                <button
                  onClick={() => setIsAddEventOpen(true)}
                  className="mt-2 text-[11px] text-[var(--accent)] font-semibold hover:underline"
                >
                  Log your first event
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="p-3.5 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg relative group transition-colors hover:border-[var(--border-strong)]"
                  >
                    {/* Delete Trigger */}
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="absolute top-3.5 right-3.5 text-[var(--text-muted)] hover:text-[var(--danger-fg)] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-0.5 hover:bg-[var(--bg-subtle)] rounded"
                    >
                      <Trash2 size={13} />
                    </button>

                    {/* Timeline Item Content */}
                    <div className="flex items-start gap-2.5">
                      {event.event_type === 'interview' && (
                        <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                          <Award size={14} />
                        </div>
                      )}
                      {event.event_type === 'follow_up' && (
                        <button
                          onClick={() => handleToggleEventDone(event)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                            event.is_done
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
                              : 'bg-transparent border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--accent)]'
                          }`}
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                      {event.event_type === 'note' && (
                        <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-500/10 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                          <MessageSquare size={14} />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h5 className={`text-xs font-semibold text-[var(--text-primary)] ${
                            event.event_type === 'follow_up' && event.is_done ? 'line-through text-[var(--text-muted)]' : ''
                          }`}>
                            {event.title}
                          </h5>
                          {event.event_type === 'interview' && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200/20 uppercase tracking-tight">
                              {event.interview_round}
                            </span>
                          )}
                        </div>

                        {/* Date/Time */}
                        {event.event_date && (
                          <div className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5 flex items-center gap-1">
                            <Clock size={10} />
                            <span>{formatEventDate(event.event_date)}</span>
                            {event.event_type === 'interview' && event.interview_format && (
                              <>
                                <span>&bull;</span>
                                <span>{event.interview_format}</span>
                              </>
                            )}
                          </div>
                        )}

                        {/* Interviewer */}
                        {event.event_type === 'interview' && event.interviewer_name && (
                          <div className="text-[10px] text-[var(--text-secondary)] font-normal mt-1 flex items-center gap-1">
                            <User size={10} />
                            <span>Interviewer: {event.interviewer_name}</span>
                          </div>
                        )}

                        {/* Notes */}
                        {event.notes && (
                          <p className="text-[11px] text-[var(--text-secondary)] font-normal mt-1.5 bg-[var(--bg-subtle)] p-2 rounded border border-[var(--border-default)]/40 break-words whitespace-pre-wrap">
                            {event.notes}
                          </p>
                        )}

                        {/* Interview Outcome Dropdown */}
                        {event.event_type === 'interview' && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <span className="text-[10px] text-[var(--text-muted)] font-medium">Outcome:</span>
                            <select
                              value={event.outcome || 'Pending'}
                              onChange={(e) => handleEventOutcomeChange(event, e.target.value)}
                              className="bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-primary)] focus:outline-none transition-all cursor-pointer"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Completed">Completed</option>
                              <option value="Passed">Passed</option>
                              <option value="Failed">Failed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        onSubmit={handleAddEvent}
      />
    </div>
  );
}
