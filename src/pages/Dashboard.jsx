import { useAuth } from '../contexts/AuthContext';
import { useHistory } from '../hooks/useHistory';
import { Link } from 'react-router-dom';
import { Plus, FileText, Search } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import StatsRow from '../components/dashboard/StatsRow';
import TransformationRow from '../components/dashboard/TransformationRow';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useState } from 'react';

export default function Dashboard() {
  const { user } = useAuth();
  const { transformations, stats, loading, hasMore, loadMore, deleteItem } = useHistory();
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
    <div className="min-h-screen bg-mist flex flex-col font-sans select-none">
      <Navbar />
      
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in">
          <div>
            <h1 className="font-serif text-3xl sm:text-4.5xl text-slate-900 font-extrabold tracking-tight">
              {getGreeting()}, {displayName}
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">Optimize your resumes to fit any job specification.</p>
          </div>
          <Link to="/transform" className="w-full md:w-auto">
            <Button variant="primary" className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors">
              <Plus size={16} className="stroke-[2.5]" />
              New Transform
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
            <h2 className="font-serif text-2xl text-slate-900 font-bold">Recent Optimizations</h2>
            
            {/* Search Input */}
            {transformations.length > 0 && (
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Filter optimizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9.5 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 transition-all font-medium"
                />
              </div>
            )}
          </div>

          {loading && transformations.length === 0 ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-9 h-9 border-3 border-slate-900 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : transformations.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center border border-dashed border-slate-300 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-slate-50 text-slate-700 rounded-lg flex items-center justify-center mb-6 border border-slate-200">
                <FileText size={28} />
              </div>
              <h3 className="font-serif text-xl text-slate-900 font-bold mb-2">No Optimizations Yet</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm leading-relaxed">
                Transform your first resume against a job description to optimize it for Applicant Tracking Systems (ATS).
              </p>
              <Link to="/transform">
                <Button variant="primary" className="flex items-center gap-2 rounded-md px-6 py-2.5 bg-slate-900 text-white hover:bg-slate-800">
                  <Plus size={16} className="stroke-[2.5]" />
                  Optimize Resume
                </Button>
              </Link>
            </div>
          ) : filteredTransformations.length === 0 ? (
            /* No Search Results */
            <div className="flex flex-col items-center justify-center p-12 text-center border border-slate-200 bg-white rounded-xl shadow-sm">
              <p className="text-sm text-slate-500">No optimizations match your search term.</p>
            </div>
          ) : (
            /* List View */
            <div className="border border-slate-200/70 bg-white rounded-lg overflow-hidden shadow-card">
              <div className="flex flex-col divide-y divide-slate-100">
                {filteredTransformations.map((item) => (
                  <TransformationRow
                    key={item.id}
                    item={item}
                    onDelete={deleteItem}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && !searchTerm && (
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-center">
                  <Button variant="ghost" onClick={loadMore} disabled={loading} className="text-sm px-6 rounded-lg">
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
