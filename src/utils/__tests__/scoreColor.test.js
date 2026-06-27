import { describe, it, expect } from 'vitest';
import { getScoreColor } from '../scoreColor';

describe('getScoreColor', () => {
  it('returns emerald color schemes for score >= 75', () => {
    const res = getScoreColor(80);
    expect(res.text).toContain('emerald');
    expect(res.bg).toContain('emerald');
    expect(res.border).toContain('emerald');
  });

  it('returns amber color schemes for score >= 50 and < 75', () => {
    const res = getScoreColor(60);
    expect(res.text).toContain('amber');
    expect(res.bg).toContain('amber');
    expect(res.border).toContain('amber');
  });

  it('returns rose color schemes for score < 50', () => {
    const res = getScoreColor(35);
    expect(res.text).toContain('rose');
    expect(res.bg).toContain('rose');
    expect(res.border).toContain('rose');
  });
});
