import { describe, it, expect, beforeEach, vi } from 'vitest';

const rpcMock = vi.fn();

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: () => ({ rpc: rpcMock }),
}));

import { checkRateLimit } from '@/lib/rateLimit';

/**
 * The limiter must fail CLOSED. It previously destructured `{ count }` without
 * `error`, so a failed query produced count = null -> used = 0 -> unlimited
 * Groq calls. That failure mode is invisible until the bill arrives, which is
 * exactly why it needs a test.
 */
describe('checkRateLimit', () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it('denies the request when the limiter query fails', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'connection refused' } });

    const result = await checkRateLimit('user-1', 'transform');

    expect(result.allowed).toBe(false);
    expect(result.unavailable).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('denies the request when the RPC returns an unexpected shape', async () => {
    rpcMock.mockResolvedValue({ data: [{ nonsense: true }], error: null });

    const result = await checkRateLimit('user-1', 'transform');

    expect(result.allowed).toBe(false);
    expect(result.unavailable).toBe(true);
  });

  it('allows a request below the limit', async () => {
    rpcMock.mockResolvedValue({
      data: [{ used: 3, oldest_at: new Date().toISOString() }],
      error: null,
    });

    const result = await checkRateLimit('user-1', 'transform');

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(7); // transform allows 10/hour
    expect(result.unavailable).toBeUndefined();
  });

  it('allows the request that exactly reaches the limit', async () => {
    rpcMock.mockResolvedValue({
      data: [{ used: 10, oldest_at: new Date().toISOString() }],
      error: null,
    });

    const result = await checkRateLimit('user-1', 'transform');

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('denies the request past the limit', async () => {
    rpcMock.mockResolvedValue({
      data: [{ used: 11, oldest_at: new Date().toISOString() }],
      error: null,
    });

    const result = await checkRateLimit('user-1', 'transform');

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('derives resetAt from the oldest request in the window, not now + window', async () => {
    // A request made 30 minutes ago should reset in ~30 minutes, not 60.
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    rpcMock.mockResolvedValue({
      data: [{ used: 11, oldest_at: thirtyMinutesAgo.toISOString() }],
      error: null,
    });

    const result = await checkRateLimit('user-1', 'transform');

    const minutesUntilReset = (result.resetAt.getTime() - Date.now()) / 60000;
    expect(minutesUntilReset).toBeGreaterThan(25);
    expect(minutesUntilReset).toBeLessThan(35);
  });

  it('applies the rescore bucket independently', async () => {
    rpcMock.mockResolvedValue({
      data: [{ used: 15, oldest_at: new Date().toISOString() }],
      error: null,
    });

    const result = await checkRateLimit('user-1', 'rescore');

    // rescore allows 30/hour, so 15 is still under.
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(15);
  });

  it('passes through unknown actions without consuming a slot', async () => {
    const result = await checkRateLimit('user-1', 'unknown-action');

    expect(result.allowed).toBe(true);
    expect(rpcMock).not.toHaveBeenCalled();
  });
});
