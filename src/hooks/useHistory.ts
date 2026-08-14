'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getTransformations,
  getUserStats,
  deleteTransformation,
  updateTransformationStatus,
  type ApplicationEvent,
} from '../lib/api';

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
  application_events?: ApplicationEvent[] | null;
}

export interface UserStats {
  total: number;
  bestScore: number | null;
  thisWeek: number;
}

const PAGE_SIZE = 20;

export function useHistory() {
  const [transformations, setTransformations] = useState<TransformationItem[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  // A failed load previously only reached console.error, so the dashboard
  // showed an empty state indistinguishable from "you have no history".
  const [error, setError] = useState<string | null>(null);

  // Held in a ref so `load` does not depend on the list length. That
  // dependency recreated the callback on every data change, which is why the
  // mount effect needed an eslint-disable to avoid refetch loops. Written in
  // an effect rather than during render, which React forbids.
  const countRef = useRef(0);
  useEffect(() => {
    countRef.current = transformations.length;
  }, [transformations.length]);

  const load = useCallback(async (reset = true) => {
    setLoading(true);
    setError(null);
    const offset = reset ? 0 : countRef.current;

    try {
      const [histData, statsData] = await Promise.all([
        getTransformations(PAGE_SIZE, offset),
        reset ? getUserStats() : Promise.resolve(null),
      ]);

      const newItems = (histData.data ?? []) as unknown as TransformationItem[];
      setTransformations((prev) => (reset ? newItems : [...prev, ...newItems]));
      setTotal(histData.count ?? 0);
      setHasMore(offset + PAGE_SIZE < (histData.count ?? 0));
      if (statsData) setStats(statsData);
    } catch (err) {
      console.error('History load error:', err);
      setError('Could not load your history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(true);
  }, [load]);

  const deleteItem = useCallback(
    async (id: string) => {
      // Snapshot for rollback: the row used to be removed before the request
      // resolved, with no catch, so a failure left the UI claiming a deletion
      // that never happened and produced an unhandled rejection.
      const previous = transformations;
      const previousStats = stats;

      setTransformations((prev) => prev.filter((t) => t.id !== id));
      setTotal((n) => Math.max(0, n - 1));
      setStats((s) => (s ? { ...s, total: Math.max(0, s.total - 1) } : null));

      try {
        await deleteTransformation(id);
      } catch (err) {
        console.error('Failed to delete transformation:', err);
        setTransformations(previous);
        setTotal(previous.length);
        setStats(previousStats);
        throw err;
      }
    },
    [transformations, stats]
  );

  const updateStatus = useCallback(async (id: string, status: string) => {
    let previous: TransformationItem[] = [];
    setTransformations((prev) => {
      previous = prev;
      return prev.map((t) => (t.id === id ? { ...t, status } : t));
    });

    try {
      await updateTransformationStatus(id, status);
    } catch (err) {
      console.error('Failed to update status:', err);
      // Roll back to the known-good list rather than refetching the page.
      setTransformations(previous);
      throw err;
    }
  }, []);

  return {
    transformations,
    stats,
    loading,
    error,
    hasMore,
    total,
    reload: () => load(true),
    loadMore: () => load(false),
    deleteItem,
    updateStatus,
  };
}