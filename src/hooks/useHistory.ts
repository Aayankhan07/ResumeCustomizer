import { useState, useEffect, useCallback } from 'react';
import { getTransformations, getUserStats, deleteTransformation, updateTransformationStatus } from '../lib/api';

export interface TransformationItem {
  id: string;
  detected_job_title: string | null;
  detected_company: string | null;
  match_score: number | null;
  created_at: string;
  label: string | null;
  status: string | null;
  application_deadline?: string | null;
  applied_at?: string | null;
  priority?: string | null;
  application_events?: any[] | null;
}

export interface UserStats {
  total: number;
  bestScore: number | null;
  thisWeek: number;
}

export function useHistory() {
  const [transformations, setTransformations] = useState<TransformationItem[]>([]);
  const [stats,           setStats]           = useState<UserStats | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [hasMore,         setHasMore]         = useState(false);
  const [total,           setTotal]           = useState(0);
  const PAGE_SIZE = 20;

  const load = useCallback(async (reset = true) => {
    setLoading(true);
    const offset = reset ? 0 : transformations.length;
    try {
      const [histData, statsData] = await Promise.all([
        getTransformations(PAGE_SIZE, offset),
        reset ? getUserStats() : Promise.resolve(null),
      ]);
      
      const newItems = (histData.data || []) as unknown as TransformationItem[];
      setTransformations(prev => reset ? newItems : [...prev, ...newItems]);
      setTotal(histData.count ?? 0);
      setHasMore((offset + PAGE_SIZE) < (histData.count ?? 0));
      if (statsData) setStats(statsData as UserStats);
    } catch (err) {
      console.error('History load error:', err);
    } finally {
      setLoading(false);
    }
  }, [transformations.length]);

  useEffect(() => { load(true); }, []); // eslint-disable-line

  const deleteItem = useCallback(async (id: string) => {
    await deleteTransformation(id);
    setTransformations(prev => prev.filter(t => t.id !== id));
    setTotal(n => n - 1);
    if (stats) setStats(s => s ? ({ ...s, total: s.total - 1 }) : null);
  }, [stats]);

  const updateStatus = useCallback(async (id: string, status: string) => {
    // Optimistic update
    setTransformations(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    try {
      await updateTransformationStatus(id, status);
    } catch (err) {
      console.error('Failed to update status:', err);
      // Reload on failure
      load(true);
    }
  }, [load]);

  return { 
    transformations, 
    stats, 
    loading, 
    hasMore, 
    total, 
    reload: () => load(true), 
    loadMore: () => load(false), 
    deleteItem,
    updateStatus
  };
}
