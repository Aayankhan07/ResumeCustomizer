/**
 * Single source of truth for match-score banding and its presentation.
 *
 * Four separate implementations existed before this module, with three
 * different threshold sets (75/50, 70/40, and 40/70), so the same score
 * rendered a different colour depending on which component drew it.
 *
 * The 75/50 thresholds are canonical: they are the strictest of the three,
 * and since match scores are currently inflated by substring keyword matching
 * (see matchScore.ts), loosening the bands on top of that would overstate
 * quality twice over.
 */

export const SCORE_THRESHOLDS = {
  strong: 75,
  moderate: 50,
} as const;

export type ScoreBand = 'strong' | 'moderate' | 'weak';

export function getScoreBand(score: number): ScoreBand {
  if (score >= SCORE_THRESHOLDS.strong) return 'strong';
  if (score >= SCORE_THRESHOLDS.moderate) return 'moderate';
  return 'weak';
}

/** Human-readable label for a score. */
export function getScoreLabel(score: number): string {
  return {
    strong: 'Strong Match',
    moderate: 'Good Match',
    weak: 'Partial Match',
  }[getScoreBand(score)];
}

/** Tailwind utility classes, keyed by band. */
const BAND_CLASSES: Record<ScoreBand, {
  text: string;
  bg: string;
  border: string;
  pill: string;
  dot: string;
  bar: string;
}> = {
  strong: {
    text: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/15',
    border: 'border-emerald-200 dark:border-emerald-500/25',
    pill: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-500/25 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
  },
  moderate: {
    text: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/15',
    border: 'border-amber-200 dark:border-amber-500/25',
    pill: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/15 dark:border-amber-500/25 dark:text-amber-400',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
  },
  weak: {
    text: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-500/15',
    border: 'border-rose-200 dark:border-rose-500/25',
    pill: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/15 dark:border-rose-500/25 dark:text-rose-400',
    dot: 'bg-rose-500',
    bar: 'bg-rose-500',
  },
};

/** Raw hex values, for canvas/SVG contexts that cannot use utility classes. */
const BAND_HEX: Record<ScoreBand, { fill: string; bg: string; border: string }> = {
  strong: { fill: '#16A34A', bg: '#F0FDF4', border: '#DCFCE7' },
  moderate: { fill: '#D97706', bg: '#FFFBEB', border: '#FEF3C7' },
  weak: { fill: '#DC2626', bg: '#FFF5F5', border: '#FEE2E2' },
};

/** Design-token CSS variables, for components styled via tokens. */
const BAND_TOKENS: Record<ScoreBand, string> = {
  strong: 'var(--success)',
  moderate: 'var(--warning)',
  weak: 'var(--danger)',
};

export function getScoreColor(score: number) {
  return BAND_CLASSES[getScoreBand(score)];
}

export function getScoreHex(score: number) {
  return { ...BAND_HEX[getScoreBand(score)], label: getScoreLabel(score) };
}

export function getScoreToken(score: number): string {
  return BAND_TOKENS[getScoreBand(score)];
}
