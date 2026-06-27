import Link from 'next/link';

export default function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-5 text-center select-none">
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">No optimized resumes yet</h3>
      <p className="text-sm text-[var(--text-muted)] mt-2 max-w-xs leading-relaxed">
        Upload your resume and customize it for your first target job description in seconds.
      </p>
      <Link href="/transform">
        <button className="btn-primary mt-6 py-2.5 px-6 text-sm">
          Optimize My Resume
        </button>
      </Link>
    </div>
  );
}
