import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-base)]">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-center mb-5">
          <FileQuestion className="w-7 h-7 text-[var(--text-secondary)]" />
        </div>

        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Page not found</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          This page does not exist or may have been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center px-4 py-2 rounded-[var(--radius-md)] bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
