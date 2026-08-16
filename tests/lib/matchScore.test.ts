import { describe, it, expect } from 'vitest';
import { computeMatchScore, computeBaselineScore } from '@/lib/matchScore';

describe('computeMatchScore', () => {
  // Matching used to be `outputText.includes(kw)` with no word boundaries, so
  // short keywords matched inside unrelated longer words and inflated every
  // score the product displays.
  describe('word-boundary matching', () => {
    it('does not match "ai" inside "maintained"', () => {
      const res = computeMatchScore('ai', { summary: 'Maintained legacy systems' });
      expect(res.matched).toEqual([]);
      expect(res.score).toBe(0);
    });

    it('does not match "go" inside "algorithm"', () => {
      const res = computeMatchScore('go', { summary: 'Designed an algorithm' });
      expect(res.matched).toEqual([]);
      expect(res.score).toBe(0);
    });

    it('still matches a whole word', () => {
      const res = computeMatchScore('ai', { summary: 'Built AI systems' });
      expect(res.matched).toEqual(['Ai']);
      expect(res.score).toBe(100);
    });

    it('matches a keyword adjacent to punctuation', () => {
      const res = computeMatchScore('python', { summary: 'Skills: Python, SQL.' });
      expect(res.matched).toEqual(['Python']);
    });

    it('does not classify "airflow" as a technical keyword via substring', () => {
      // "airflow" contains "ai"; substring classification previously weighted
      // it as a tech term.
      const res = computeMatchScore('airflow', { summary: 'Used Airflow daily' }, {
        techDepth: 100,
        industryFocus: 80,
      });
      expect(res.matched).toEqual(['Airflow']);
    });
  });

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

  describe('scores the resume body only', () => {
    // The scorer used to flatten every string in the output, including
    // cover_letter and interview_prep — all model-written from the job
    // description — so real transforms returned 100%.
    it('ignores keywords that appear only in the cover letter', () => {
      const res = computeMatchScore('kubernetes', {
        summary: 'Frontend developer',
        cover_letter: 'I have extensive kubernetes experience.',
      });
      expect(res.matched).not.toContain('Kubernetes');
      expect(res.score).toBe(0);
    });

    it('ignores keywords that appear only in interview prep', () => {
      const res = computeMatchScore('graphql', {
        summary: 'Frontend developer',
        interview_prep: { technical: [{ question: 'Explain graphql resolvers' }] },
      });
      expect(res.score).toBe(0);
    });

    it('ignores keywords that appear only in recruiter_scan or roadmap', () => {
      const res = computeMatchScore('terraform', {
        summary: 'Frontend developer',
        recruiter_scan: { strong_yes: 'Strong terraform background' },
        roadmap: { tasks: [{ task: 'Learn terraform' }] },
      });
      expect(res.score).toBe(0);
    });

    it('still counts keywords in the resume body', () => {
      const res = computeMatchScore('kubernetes', {
        experience: [{ bullets: ['Deployed services on kubernetes'] }],
        cover_letter: 'unrelated prose',
      });
      expect(res.matched).toContain('Kubernetes');
      expect(res.score).toBe(100);
    });
  });

  describe('keyword significance weighting', () => {
    it('weights a repeated JD keyword above one mentioned once', () => {
      // "react" appears 3x, "fortran" once. Matching only react must beat
      // matching only fortran.
      const jd = 'react react react fortran';
      const reactOnly = computeMatchScore(jd, { summary: 'react work' });
      const fortranOnly = computeMatchScore(jd, { summary: 'fortran work' });
      expect(reactOnly.score).toBeGreaterThan(fortranOnly.score);
    });

    it('caps repetition so one term cannot dominate', () => {
      // 10 repeats is capped at 3, so the single "python" keeps real weight.
      const jd = 'react react react react react react react react react react python';
      const res = computeMatchScore(jd, { summary: 'python only' });
      expect(res.score).toBeGreaterThan(20);
    });
  });

  describe('computeBaselineScore', () => {
    it('scores a plain-text resume against the job description', () => {
      const score = computeBaselineScore('kubernetes docker', 'Deployed with kubernetes and docker');
      expect(score).toBe(100);
    });

    it('returns 0 for empty input rather than throwing', () => {
      expect(computeBaselineScore('kubernetes', '')).toBe(0);
      expect(computeBaselineScore('kubernetes', '   ')).toBe(0);
    });

    it('is lower than the optimized score for an unrelated resume', () => {
      const jd = 'kubernetes docker terraform';
      const baseline = computeBaselineScore(jd, 'I write poetry');
      const optimized = computeMatchScore(jd, {
        skills: { technical: ['kubernetes', 'docker', 'terraform'] },
      }).score;
      expect(baseline).toBeLessThan(optimized);
    });
  });
});
