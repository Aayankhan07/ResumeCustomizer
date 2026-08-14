export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-3"
      >
        <div className="w-8 h-8 rounded-full border-2 border-[var(--border-default)] border-t-[var(--accent)] animate-spin" />
        <span className="text-sm text-[var(--text-secondary)]">Loading…</span>
      </div>
    </div>
  );
}
