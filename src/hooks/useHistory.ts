'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getTransformations,
  getUserStats,
  deleteTransformation,
  updateTransformationStatus,
  type ApplicationEvent,
  type TransformationFilters,
} from '../lib/api';

/**
 * Supabase rejects with a PostgrestError — a plain object whose fields are not
 * enumerable, so `console.error('...', err)` renders it as `{}` and hides the
 * cause entirely. Pull the fields off explicitly before logging.
 */
function logSupabaseError(label: string, err: unknown): void {
  const e = err as { message?: string; code?: string; details?: string; hint?: string };
  console.error(label, e?.message ?? String(err), {
    code: e?.code,
    details: e?.details,
    hint: e?.hint,
  });
}

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

/**
 * Dashboard history.
 *
 * `transformations` is always the unfiltered, most-recent page — the upcoming
 * widget and stats row are computed from it and must not change when the user
 * searches. When `filters` are active, a second server-side query backs
 * `results`, so search and status cover the whole history rather than only
 * the rows already loaded. With no filters, `results` mirrors the base list.
 */
export function useHistory(filters: TransformationFilters = {}) {
  const [transformations, setTransformations] = useState<TransformationItem[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  // A failed load previously only reached console.error, so the dashboard
  // showed an empty state indistinguishable from "you have no history".
  const [error, setError] = useState<string | null>(null);

  // Held in a ref so `load` does not depend on the list itself. That
  // dependency recreated the callback on every data change, which is why the
  // mount effect needed an eslint-disable to avoid refetch loops. Written in
  // an effect rather than during render, which React forbids.
  //
  // The optimistic handlers also read the pre-change list from here, so they
  // never have to snapshot state from inside a setState updater.
  const itemsRef = useRef<TransformationItem[]>([]);
  const countRef = useRef(0);
  const statsRef = useRef<UserStats | null>(null);
  useEffect(() => {
    itemsRef.current = transformations;
    countRef.current = transformations.length;
  }, [transformations]);
  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

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
      logSupabaseError('History load error:', err);
      setError('Could not load your history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(true);
  }, [load]);

  // ── Filtered results (server-side)
  const search = (filters.search ?? '').trim();
  const status = filters.status && filters.status !== 'All' ? filters.status : '';
  const isFiltering = Boolean(search || status);

  const [filtered, setFiltered] = useState<TransformationItem[]>([]);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [filteredHasMore, setFilteredHasMore] = useState(false);
  const [filteredLoading, setFilteredLoading] = useState(false);
  const [filteredError, setFilteredError] = useState<string | null>(null);
  const filteredRef = useRef<TransformationItem[]>([]);
  // Responses for a superseded query (the user kept typing) are dropped.
  const requestIdRef = useRef(0);
  useEffect(() => {
    filteredRef.current = filtered;
  }, [filtered]);

  const loadFiltered = useCallback(
    async (reset = true) => {
      const requestId = ++requestIdRef.current;
      if (!search && !status) return;
      setFilteredLoading(true);
      setFilteredError(null);
      if (reset) setFiltered([]);
      const offset = reset ? 0 : filteredRef.current.length;

      try {
        const res = await getTransformations(PAGE_SIZE, offset, { search, status });
        if (requestId !== requestIdRef.current) return;
        const newItems = (res.data ?? []) as unknown as TransformationItem[];
        setFiltered((prev) => (reset ? newItems : [...prev, ...newItems]));
        setFilteredTotal(res.count ?? 0);
        setFilteredHasMore(offset + PAGE_SIZE < (res.count ?? 0));
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        logSupabaseError('History search error:', err);
        setFilteredError('Could not search your history. Please try again.');
      } finally {
        if (requestId === requestIdRef.current) setFilteredLoading(false);
      }
    },
    [search, status]
  );

  useEffect(() => {
    loadFiltered(true);
  }, [loadFiltered]);

  const deleteItem = useCallback(
    async (id: string) => {
      // Snapshot for rollback: the row used to be removed before the request
      // resolved, with no catch, so a failure left the UI claiming a deletion
      // that never happened and produced an unhandled rejection.
      //
      // Read from the ref rather than closed-over state, so this callback does
      // not have to be rebuilt on every data change.
      const previous = itemsRef.current;
      const previousStats = statsRef.current;

      const previousFiltered = filteredRef.current;
      setTransformations((prev) => prev.filter((t) => t.id !== id));
      setFiltered((prev) => prev.filter((t) => t.id !== id));
      if (previousFiltered.some((t) => t.id === id)) {
        setFilteredTotal((n) => Math.max(0, n - 1));
      }
      setTotal((n) => Math.max(0, n - 1));
      setStats((s) => (s ? { ...s, total: Math.max(0, s.total - 1) } : null));

      try {
        await deleteTransformation(id);
      } catch (err) {
        logSupabaseError('Failed to delete transformation:', err);
        setTransformations(previous);
        setTotal(previous.length);
        setStats(previousStats);
        if (previousFiltered.some((t) => t.id === id)) {
          setFiltered(previousFiltered);
          setFilteredTotal((n) => n + 1);
        }
        throw err;
      }
    },
    // Reads its rollback snapshot from refs, so it never needs rebuilding —
    // which previously handed every AnalysisRow a new callback identity on
    // every data change.
    []
  );

  const updateStatus = useCallback(async (id: string, status: string) => {
    // The pre-change list is read from a ref rather than captured inside the
    // setState updater. React may invoke an updater more than once (StrictMode
    // does so deliberately), and the second call receives the already-updated
    // list — so the "previous" snapshot became the optimistic state and a
    // failed update rolled back to the wrong data.
    const previous = itemsRef.current;
    const previousFiltered = filteredRef.current;

    const apply = (list: TransformationItem[]) =>
      list.map((t) => (t.id === id ? { ...t, status } : t));
    setTransformations(apply);
    setFiltered(apply);

    try {
      await updateTransformationStatus(id, status);
    } catch (err) {
      logSupabaseError('Failed to update status:', err);
      // Roll back to the known-good list rather than refetching the page.
      setTransformations(previous);
      setFiltered(previousFiltered);
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
    // Filter-aware view for the history list.
    isFiltering,
    results: isFiltering ? filtered : transformations,
    resultsTotal: isFiltering ? filteredTotal : total,
    resultsHasMore: isFiltering ? filteredHasMore : hasMore,
    resultsLoading: isFiltering ? filteredLoading : loading,
    resultsError: isFiltering ? filteredError : error,
    loadMoreResults: () => (isFiltering ? loadFiltered(false) : load(false)),
    reloadResults: () => (isFiltering ? loadFiltered(true) : load(true)),
    deleteItem,
    updateStatus,
  };
}
