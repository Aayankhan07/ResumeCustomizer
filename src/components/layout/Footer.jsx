import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900 select-none">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h3 className="font-serif text-white text-xl font-bold tracking-tight mb-2">ResumOrph</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              Tailoring applicant profiles with advanced agentic keyword alignment in seconds.
            </p>
          </div>
          <div className="flex gap-8 text-sm font-semibold">
            <Link href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors duration-200">Terms of Service</Link>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-600">
          <span>&copy; {new Date().getFullYear()} ResumOrph. All rights reserved.</span>
          <span>Engineered for modern career growth.</span>
        </div>
      </div>
    </footer>
  );
}
