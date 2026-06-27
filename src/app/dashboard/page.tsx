'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useHistory } from '../../hooks/useHistory';
import Link from 'next/link';
import { Plus, Search, Sparkles, ArrowRight } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import StatsRow from '../../components/dashboard/StatsRow';
import TransformationRow from '../../components/dashboard/TransformationRow';
import Button from '../../components/ui/Button';
import useDocumentTitle from '../../hooks/useDocumentTitle';

function Step({ n, label }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <span className="w-5.5 h-5.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-indigo-400 font-mono">
        {n}
      </span>
      <span className="text-xs font-bold text-slate-650 dark:text-slate-400">{label}</span>
    </div>
  );
}

export default function Dashboard() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const { transformations, stats, loading, hasMore, loadMore, deleteItem, updateStatus } = useHistory();
  const [searchTerm, setSearchTerm] = useState('');

  // Determine greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const filteredTransformations = transformations.filter((item) => {
    const labelText = (item.label || '').toLowerCase();
    const jobTitleText = (item.detected_job_title || '').toLowerCase();
    const companyText = (item.detected_company || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return labelText.includes(term) || jobTitleText.includes(term) || companyText.includes(term);
  });

  return (
    <div className="min-h-screen bg-mist dark:bg-[#0B0F19] text-slate-900 dark:text-slate-200 flex flex-col font-sans select-none relative overflow-hidden transition-colors duration-300">
      {/* Dark theme glow spotlights */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent blur-3xl pointer-events-none hidden dark:block" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.02] rounded-full blur-[120px] pointer-events-none hidden dark:block" />
      
      <Navbar />
      
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 flex flex-col gap-10 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in">
          <div>
            <h1 className="font-serif text-3xl sm:text-4.5xl text-slate-900 dark:text-white font-extrabold tracking-tight">
              {getGreeting()}, {displayName}
            </h1>
            <p className="text-sm text-slate-550 dark:text-slate-400 mt-1 font-semibold">Optimize your resumes to fit any job specification.</p>
          </div>
          <Link href="/transform" className="w-full md:w-auto">
            <Button className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-850 dark:bg-indigo-650 dark:hover:bg-indigo-500 text-white border-0 font-bold rounded-lg shadow-md transition-all active:scale-95 cursor-pointer">
              <Plus size={16} className="stroke-[2.5]" />
              Transform CV
            </Button>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="animate-slide-up">
          <StatsRow stats={stats} />
        </div>

        {/* Transformations History Section */}
        <div className="flex flex-col gap-5 flex-1 animate-slide-up" style={{ animationDelay: '120ms' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-serif text-2xl text-slate-900 dark:text-white font-bold">Recent Optimizations</h2>
            
            {/* Search Input */}
            {transformations.length > 0 && (
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={15} />
                <input
                  type="text"
                  placeholder="Filter optimizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9.5 pr-4 py-2 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-455 focus:outline-none focus:border-slate-900 dark:focus:border-indigo-500 focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-indigo-500/10 transition-all font-semibold"
                />
              </div>
            )}
          </div>

          {loading && transformations.length === 0 ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-9 h-9 border-3 border-slate-900 dark:border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : transformations.length === 0 ? (
            /* Empty State Onboarding */
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed border-slate-250 dark:border-slate-800/80 bg-white dark:bg-slate-900/10 rounded-2xl shadow-sm animate-fade-in">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mb-6 shadow-md shadow-indigo-500/10 shrink-0">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Your first tailored resume is one step away
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8 font-semibold">
                Upload your resume, paste a job description, and get an ATS-optimized version in under 30 seconds.
              </p>
              
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-10">
                <Step n={1} label="Upload Resume" />
                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-700 hidden md:block" />
                <Step n={2} label="Paste Job Description" />
                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-700 hidden md:block" />
                <Step n={3} label="Get Optimized CV" />
              </div>
              
              <Link href="/transform">
                <Button className="flex items-center gap-2 rounded-lg px-7 py-3 bg-slate-900 hover:bg-slate-850 dark:bg-indigo-650 dark:hover:bg-indigo-500 text-white border-0 font-bold cursor-pointer shadow-md text-sm active:scale-95 transition-all">
                  <Plus size={16} className="stroke-[2.5]" />
                  Start First Transformation
                </Button>
              </Link>
            </div>
          ) : filteredTransformations.length === 0 ? (
            /* No Search Results */
            <div className="flex flex-col items-center justify-center p-12 text-center border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/10 rounded-2xl shadow-sm">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">No optimizations match your search term.</p>
            </div>
          ) : (
            /* List View */
            <div className="border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900/10 rounded-2xl overflow-hidden shadow-card dark:shadow-2xl">
              <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredTransformations.map((item) => (
                  <TransformationRow
                    key={item.id}
                    item={item}
                    onDelete={deleteItem}
                    onUpdateStatus={updateStatus}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && !searchTerm && (
                <div className="p-4 bg-slate-50/50 dark:bg-slate-950/15 border-t border-slate-100 dark:border-slate-800/60 flex justify-center">
                  <Button variant="ghost" onClick={loadMore} disabled={loading} className="text-sm px-6 rounded-lg font-bold">
                    {loading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
