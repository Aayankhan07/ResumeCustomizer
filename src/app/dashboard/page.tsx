'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useHistory } from '../../hooks/useHistory';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import StatsRow from '../../components/dashboard/StatsRow';
import AnalysisRow from '../../components/dashboard/AnalysisRow';
import EmptyDashboard from '../../components/dashboard/EmptyDashboard';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import UpcomingWidget from '../../components/dashboard/UpcomingWidget';

export default function Dashboard() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const { transformations, stats, loading, hasMore, loadMore, deleteItem, updateStatus } = useHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

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
    
    const matchesSearch = labelText.includes(term) || jobTitleText.includes(term) || companyText.includes(term);
    
    let matchesStatus = false;
    if (statusFilter === 'All') {
      matchesStatus = true;
    } else if (statusFilter === 'Overdue') {
      if (item.application_deadline) {
        const today = new Date();
        today.setHours(0,0,0,0);
        const deadlineDate = new Date(item.application_deadline);
        deadlineDate.setHours(0,0,0,0);
        const isFinished = ['Offer', 'Rejected', 'Withdrawn'].includes(item.status || '');
        matchesStatus = deadlineDate < today && !isFinished;
      } else {
        matchesStatus = false;
      }
    } else if (statusFilter === 'This Week') {
      if (item.application_deadline) {
        const today = new Date();
        today.setHours(0,0,0,0);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        const deadlineDate = new Date(item.application_deadline);
        deadlineDate.setHours(0,0,0,0);
        matchesStatus = deadlineDate >= today && deadlineDate <= nextWeek;
      } else {
        matchesStatus = false;
      }
    } else {
      matchesStatus = item.status === statusFilter;
    }
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col font-sans select-none relative overflow-hidden transition-colors duration-300">
      {/* Dark theme glow spotlights */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent blur-3xl pointer-events-none hidden dark:block" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.02] rounded-full blur-[120px] pointer-events-none hidden dark:block" />
      
      <Navbar />
      
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 flex flex-col gap-10 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {getGreeting()}, {displayName}
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
              {transformations.length} {transformations.length === 1 ? 'optimization' : 'optimizations'} total
            </p>
          </div>
          <Link href="/transform" className="w-full md:w-auto">
            <button className="btn-default w-full md:w-auto flex items-center justify-center gap-1.5 py-2 px-4 text-xs">
              <Plus size={14} className="stroke-[2.5]" />
              Transform CV
            </button>
          </Link>
        </div>

        {/* Upcoming widget */}
        <div className="animate-slide-up">
          <UpcomingWidget transformations={transformations} />
        </div>

        {/* Stats Section */}
        <div className="animate-slide-up" style={{ animationDelay: '60ms' }}>
          <StatsRow stats={stats} transformations={transformations} />
        </div>

        {/* Transformations History Section */}
        <div className="flex flex-col gap-5 flex-1 animate-slide-up" style={{ animationDelay: '120ms' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent Optimizations</h2>
            
            {/* Search Input */}
            {transformations.length > 0 && (
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                <input
                  type="text"
                  placeholder="Filter optimizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9.5 pr-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all font-normal"
                />
              </div>
            )}
          </div>

          {/* Status Filter Pills */}
          {transformations.length > 0 && (
            <div className="flex flex-wrap gap-2 select-none">
              {['All', 'Applied', 'Interviewing', 'Offer', 'Saved', 'Rejected', 'Overdue', 'This Week'].map((status) => {
                const isActive = statusFilter === status;
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[var(--text-primary)] text-[var(--bg-base)]' 
                        : 'bg-transparent border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          )}

          {loading && transformations.length === 0 ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-8 h-8 border-2 border-[var(--text-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : transformations.length === 0 ? (
            <EmptyDashboard />
          ) : filteredTransformations.length === 0 ? (
            /* No Search Results */
            <div className="flex flex-col items-center justify-center p-12 text-center border border-[var(--border-default)] bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]">
              <p className="text-sm text-[var(--text-muted)] font-normal">No optimizations match your search term.</p>
            </div>
          ) : (
            /* List View */
            <div className="border border-[var(--border-default)] bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] p-4 shadow-[var(--shadow-sm)]">
              <div className="flex flex-col">
                {filteredTransformations.map((item) => (
                  <AnalysisRow
                    key={item.id}
                    item={item}
                    onDelete={deleteItem}
                    onUpdateStatus={updateStatus}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && !searchTerm && (
                <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex justify-center">
                  <button onClick={loadMore} disabled={loading} className="btn-ghost text-xs px-6 py-2">
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
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
