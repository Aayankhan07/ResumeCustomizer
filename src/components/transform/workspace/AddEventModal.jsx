import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

export default function AddEventModal({ isOpen, onClose, onSubmit }) {
  const [eventType, setEventType] = useState('interview'); // interview | follow_up | note
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [interviewRound, setInterviewRound] = useState('Technical');
  const [interviewFormat, setInterviewFormat] = useState('Remote');
  const [interviewerName, setInterviewerName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const eventData = {
        event_type: eventType,
        title: title.trim(),
        event_date: eventDate ? new Date(eventDate).toISOString() : null,
        notes: notes.trim() || null,
        ...(eventType === 'interview' && {
          interview_round: interviewRound,
          interview_format: interviewFormat,
          interviewer_name: interviewerName.trim() || null,
        }),
      };
      await onSubmit(eventData);
      
      // Reset form
      setTitle('');
      setEventDate('');
      setInterviewerName('');
      setNotes('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="w-full max-w-md bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-default)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider font-mono">
            Add Timeline Event
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Tab Switcher */}
          <div className="flex bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[var(--radius-md)] p-1">
            {['interview', 'follow_up', 'note'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setEventType(type);
                  // Set default titles for convenience
                  if (type === 'interview') setTitle('');
                  else if (type === 'follow_up') setTitle('Follow up with recruiter');
                  else if (type === 'note') setTitle('Note');
                }}
                className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-[var(--radius-sm)] transition-all cursor-pointer capitalize ${
                  eventType === type
                    ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-default)] shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Title */}
          <Input
            label="Title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              eventType === 'interview'
                ? 'e.g., Technical Screen'
                : eventType === 'follow_up'
                ? 'e.g., Follow up with Hiring Manager'
                : 'e.g., General notes about team size'
            }
          />

          {/* Event Date (optional for Note, recommended for others) */}
          {eventType !== 'note' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-graphite uppercase tracking-wide">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg px-3.5 py-2.5 font-sans text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all"
                required={eventType === 'interview'}
              />
            </div>
          )}

          {/* Interview specific fields */}
          {eventType === 'interview' && (
            <div className="space-y-4 pt-2 border-t border-[var(--border-subtle)]">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-graphite uppercase tracking-wide">
                    Round
                  </label>
                  <select
                    value={interviewRound}
                    onChange={(e) => setInterviewRound(e.target.value)}
                    className="w-full bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg px-3 py-2 font-sans text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all cursor-pointer"
                  >
                    <option value="Phone Screen">Phone Screen</option>
                    <option value="Technical">Technical</option>
                    <option value="Onsite">Onsite</option>
                    <option value="Final">Final</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-graphite uppercase tracking-wide">
                    Format
                  </label>
                  <select
                    value={interviewFormat}
                    onChange={(e) => setInterviewFormat(e.target.value)}
                    className="w-full bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg px-3 py-2 font-sans text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all cursor-pointer"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Onsite">Onsite</option>
                    <option value="Phone">Phone</option>
                  </select>
                </div>
              </div>

              <Input
                label="Interviewer Name"
                type="text"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
                placeholder="e.g. Sarah Khan"
              />
            </div>
          )}

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-graphite uppercase tracking-wide">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide extra details, interview links, preparation tips, or conversation summaries..."
              rows={3}
              className="w-full bg-[var(--bg-base)] border border-[var(--border-default)] rounded-lg px-3.5 py-2.5 font-sans text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all resize-none"
            />
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--border-default)]">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !title.trim()}
              className="py-2 px-6"
            >
              {loading ? 'Adding...' : 'Add Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
