import { useState, useEffect, useCallback } from 'react';
import { getTransformations, getUserStats, deleteTransformation } from '../lib/api';

export function useHistory() {
  const [transformations, setTransformations] = useState([]);
  const [stats,           setStats]           = useState(null);
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
      setTransformations(prev => reset ? histData.data : [...prev, ...histData.data]);
      setTotal(histData.count ?? 0);
      setHasMore((offset + PAGE_SIZE) < (histData.count ?? 0));
      if (statsData) setStats(statsData);
    } catch (err) {
      console.error('History load error:', err);
    } finally {
      setLoading(false);
    }
  }, [transformations.length]);

  useEffect(() => { load(true); }, []); // eslint-disable-line

  const deleteItem = useCallback(async (id) => {
    await deleteTransformation(id);
    setTransformations(prev => prev.filter(t => t.id !== id));
    setTotal(n => n - 1);
    if (stats) setStats(s => ({ ...s, total: s.total - 1 }));
  }, [stats]);

  return { transformations, stats, loading, hasMore, total, reload: () => load(true), loadMore: () => load(false), deleteItem };
}
