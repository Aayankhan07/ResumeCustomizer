'use client';

import { useState, useEffect } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Search and status filtering run server-side (see useHistory/getTransformations),
  // so they cover the whole history rather than only the rows already loaded.
  // Debounced so each keystroke does not fire a query.
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const {
    transformations,
    stats,
    loading,
    total,
    deleteItem,
    updateStatus,
    isFiltering,
    results,
    resultsTotal,
    resultsHasMore,
    resultsLoading,
    resultsError,
    loadMoreResults,
    reloadResults,
  } = useHistory({ search: debouncedSearch, status: statusFilter });

  // Computed after mount: during SSR this used the server's clock and
  // timezone, so the greeting could be wrong and mismatch on hydration.
  const [greeting, setGreeting] = useState('Welcome back');
  useEffect(() => {
    const hour = new Date().getHours();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client clock is only known after mount
    setGreeting(hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening');
  }, []);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  // Whole-history count: stats.total is an exact count query, and `total` is
  // the count returned with the first page. Previously this showed the number
  // of rows loaded so far (at most 20).
  const overallTotal = stats?.total ?? total;
  const hasAnyHistory = overallTotal > 0 || transformations.length > 0;
  const searchPending = searchTerm.trim() !== debouncedSearch;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col font-sans relative overflow-hidden transition-colors duration-300">
      {/* Dark theme glow spotlights */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[var(--accent)]/5 via-transparent to-transparent blur-3xl pointer-events-none hidden dark:block" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.02] rounded-full blur-[120px] pointer-events-none hidden dark:block" />

      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 flex flex-col gap-10 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {greeting}, {displayName}
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
              {overallTotal} {overallTotal === 1 ? 'optimization' : 'optimizations'} total
            </p>
          </div>
          {/* Styled as a button directly: a <button> inside <a> is invalid
              interactive-content nesting. */}
          <Link
            href="/transform"
            className="btn-default w-full md:w-auto flex items-center justify-center gap-1.5 py-2 px-4 text-xs"
          >
            <Plus size={14} className="stroke-[2.5]" />
            Transform CV
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
        <div
          className="flex flex-col gap-5 flex-1 animate-slide-up"
          style={{ animationDelay: '120ms' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Recent Optimizations
            </h2>

            {/* Search Input */}
            {hasAnyHistory && (
              <div className="relative w-full sm:w-72">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  size={14}
                />
                <input
                  type="search"
                  aria-label="Search optimizations by label, job title or company"
                  placeholder="Search optimizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus:border-[var(--accent)] transition-all font-normal"
                />
              </div>
            )}
          </div>

          {/* Status Filter Pills */}
          {hasAnyHistory && (
            <div className="flex flex-wrap gap-2 select-none">
              {[
                'All',
                'Applied',
                'Interviewing',
                'Offer',
                'Saved',
                'Rejected',
                'Overdue',
                'This Week',
              ].map((status) => {
                const isActive = statusFilter === status;
                return (
                  <button
                    key={status}
                    type="button"
                    aria-pressed={isActive}
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

          {isFiltering && !resultsError && (
            <p className="text-xs text-[var(--text-muted)] font-medium -mt-2" aria-live="polite">
              {resultsLoading || searchPending
                ? 'Searching all optimizations…'
                : `${resultsTotal} ${resultsTotal === 1 ? 'match' : 'matches'} across all optimizations`}
            </p>
          )}

          {(
            isFiltering
              ? resultsLoading && results.length === 0
              : loading && transformations.length === 0
          ) ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-8 h-8 border-2 border-[var(--text-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : resultsError && results.length === 0 ? (
            /* A failed load previously fell through to EmptyDashboard, telling
               a user with 40 saved resumes that they had none. */
            <div
              role="alert"
              className="flex flex-col items-center justify-center gap-3 p-12 text-center border border-[var(--border-default)] bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]"
            >
              <p className="text-sm font-semibold text-[var(--text-primary)]">{resultsError}</p>
              <p className="text-xs text-[var(--text-secondary)]">
                Your saved resumes are safe — we just couldn&apos;t load them right now.
              </p>
              <button
                type="button"
                onClick={reloadResults}
                className="btn-ghost text-xs px-6 py-2 mt-1"
              >
                Try again
              </button>
            </div>
          ) : !isFiltering && transformations.length === 0 ? (
            <EmptyDashboard />
          ) : results.length === 0 ? (
            /* No results for the active search/filter */
            <div className="flex flex-col items-center justify-center gap-3 p-12 text-center border border-[var(--border-default)] bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]">
              <p className="text-sm text-[var(--text-secondary)] font-normal">
                {debouncedSearch
                  ? `No resumes match “${debouncedSearch}”${statusFilter !== 'All' ? ` with status “${statusFilter}”` : ''}.`
                  : `No resumes with status “${statusFilter}”.`}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setDebouncedSearch('');
                  setStatusFilter('All');
                }}
                className="btn-ghost text-xs px-6 py-2"
              >
                Clear filters
              </button>
            </div>
          ) : (
            /* List View */
            <div className="border border-[var(--border-default)] bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] p-4 shadow-[var(--shadow-sm)]">
              <div className="flex flex-col">
                {results.map((item) => (
                  <AnalysisRow
                    key={item.id}
                    item={item}
                    onDelete={deleteItem}
                    onUpdateStatus={updateStatus}
                  />
                ))}
              </div>

              {/* Load More pages through filtered results too, since
                  filtering is server-side. */}
              {resultsHasMore && (
                <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex flex-col items-center gap-2">
                  <p className="text-xs text-[var(--text-muted)]">
                    Showing {results.length} of {resultsTotal}
                  </p>
                  <button
                    type="button"
                    onClick={loadMoreResults}
                    disabled={resultsLoading}
                    className="btn-ghost text-xs px-6 py-2"
                  >
                    {resultsLoading ? 'Loading...' : 'Load More'}
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
