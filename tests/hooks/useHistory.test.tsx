import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

/**
 * useHistory owns the dashboard's data. A failed load used to reach only
 * console.error, so the dashboard rendered "No optimized resumes yet" — telling
 * a user with forty saved resumes that they had none.
 */

const mocks = vi.hoisted(() => ({
  getTransformations: vi.fn(),
  getUserStats: vi.fn(),
  deleteTransformation: vi.fn(),
  updateTransformationStatus: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  getTransformations: mocks.getTransformations,
  getUserStats: mocks.getUserStats,
  deleteTransformation: mocks.deleteTransformation,
  updateTransformationStatus: mocks.updateTransformationStatus,
}));

const { useHistory } = await import('@/hooks/useHistory');

const ITEM = (id: string) => ({
  id,
  detected_job_title: 'Engineer',
  detected_company: 'Acme',
  match_score: 80,
  created_at: new Date().toISOString(),
  label: null,
  status: 'Saved',
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getTransformations.mockResolvedValue({ data: [ITEM('a')], count: 1 });
  mocks.getUserStats.mockResolvedValue({ total: 1, bestScore: 80, thisWeek: 1 });
  mocks.deleteTransformation.mockResolvedValue(undefined);
  mocks.updateTransformationStatus.mockResolvedValue(undefined);
});

afterEach(() => vi.restoreAllMocks());

describe('useHistory', () => {
  it('loads transformations and stats on mount', async () => {
    const { result } = renderHook(() => useHistory());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.transformations).toHaveLength(1);
    expect(result.current.stats?.bestScore).toBe(80);
    expect(result.current.error).toBeNull();
  });

  it('surfaces an error instead of an empty list when the load fails', async () => {
    // Without this the dashboard cannot tell "no data" from "failed to load".
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.getTransformations.mockRejectedValue(
      Object.assign(new Error('boom'), { code: 'PGRST301' })
    );

    const { result } = renderHook(() => useHistory());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toMatch(/could not load/i);
    expect(result.current.transformations).toEqual([]);
  });

  it('logs the cause of a Supabase failure rather than an empty object', async () => {
    // PostgrestError fields are not enumerable, so `console.error(err)` printed
    // "{}" and hid the reason entirely.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const pgError = { message: 'permission denied', code: '42501', details: 'x', hint: 'y' };
    mocks.getTransformations.mockRejectedValue(pgError);

    const { result } = renderHook(() => useHistory());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const logged = spy.mock.calls[0];
    expect(logged[1]).toBe('permission denied');
    expect(logged[2]).toMatchObject({ code: '42501' });
  });

  it('clears a previous error on a successful reload', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.getTransformations.mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => useHistory());
    await waitFor(() => expect(result.current.error).toBeTruthy());

    mocks.getTransformations.mockResolvedValue({ data: [ITEM('a')], count: 1 });
    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.transformations).toHaveLength(1);
  });

  it('removes a row optimistically and restores it when the delete fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useHistory());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mocks.deleteTransformation.mockRejectedValue(new Error('nope'));

    await act(async () => {
      await result.current.deleteItem('a').catch(() => {});
    });

    // Rolled back rather than left showing a row that still exists server-side.
    expect(result.current.transformations).toHaveLength(1);
  });

  it('rolls back an optimistic status change when the update fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useHistory());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mocks.updateTransformationStatus.mockRejectedValue(new Error('nope'));

    await act(async () => {
      await result.current.updateStatus('a', 'Offer').catch(() => {});
    });

    expect(result.current.transformations[0].status).toBe('Saved');
  });

  it('reports hasMore only while a further page exists', async () => {
    mocks.getTransformations.mockResolvedValue({ data: [ITEM('a')], count: 50 });

    const { result } = renderHook(() => useHistory());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.hasMore).toBe(true);
  });
});
