import { describe, it, expect } from 'vitest';
import { computeMatchScore } from '../../lib/matchScore.ts';

describe('computeMatchScore', () => {
  it('handles empty job description', () => {
    const res = computeMatchScore('', { summary: 'Experienced software engineer' });
    expect(res.score).toBe(0);
    expect(res.matched).toEqual([]);
    expect(res.missing).toEqual([]);
  });

  it('handles full match', () => {
    const res = computeMatchScore('javascript python', {
      summary: 'Javascript developer',
      skills: { technical: ['python'] }
    });
    expect(res.score).toBe(100);
    expect(res.matched).toEqual(['Javascript', 'Python']);
    expect(res.missing).toEqual([]);
  });

  it('filters stop-words and special characters', () => {
    const res = computeMatchScore('React and Node.js developer!', {
      summary: 'React and Node.js developer'
    });
    expect(res.matched).toContain('React');
    expect(res.matched).toContain('Node');
  });

  it('is case insensitive', () => {
    const res = computeMatchScore('PYTHON', { summary: 'python developer' });
    expect(res.score).toBe(100);
    expect(res.matched).toEqual(['Python']);
  });

  it('applies custom weights correctly', () => {
    const jobDesc = 'lead python';
    const outputJson = {
      summary: 'lead python'
    };
    
    // "lead" is a process word (weight changes with techDepth)
    // "python" is a tech word (weight changes with techDepth + industryFocus)
    const res = computeMatchScore(jobDesc, outputJson, { techDepth: 80, industryFocus: 100 });
    expect(res.score).toBe(100);
  });

  it('handles job title mode / short queries without filtering vital keywords', () => {
    // "product" and "manager" are standard stop words, but in title/short mode they should be kept
    const res = computeMatchScore('Product Manager', {
      summary: 'Experienced Product Manager with a track record...'
    }, { optimizationMode: 'title' });
    expect(res.matched).toContain('Product');
    expect(res.matched).toContain('Manager');
    expect(res.score).toBe(100);
  });

  it('automatically falls back to basic stop words if query is short (< 15 words) even if mode is not explicitly passed', () => {
    const res = computeMatchScore('React Developer', {
      summary: 'React Developer with 5 years experience'
    });
    // "developer" is in general STOP_WORDS but since query is short, it should use BASIC_STOP_WORDS and match it
    expect(res.matched).toContain('React');
    expect(res.matched).toContain('Developer');
    expect(res.score).toBe(100);
  });
});
