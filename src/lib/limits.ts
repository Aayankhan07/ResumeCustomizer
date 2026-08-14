/**
 * Input size limits, defined once.
 *
 * These previously disagreed across three layers: the dropzone and textarea
 * enforced 200/15000, the transform page checked 50 then 200/15000, and the
 * API accepted 50/10000 and then silently truncated anything longer with
 * .substring(). A user pasting 14k characters had their resume tailored
 * against truncated input with no warning.
 *
 * Both the client components and the API request schemas import from here, so
 * the layers cannot drift apart again.
 */
export const RESUME_LIMITS = {
  min: 200,
  max: 10000,
} as const;

export const JD_LIMITS = {
  min: 200,
  max: 10000,
} as const;

/** Title mode takes a job title rather than a full description. */
export const JOB_TITLE_LIMITS = {
  min: 3,
  max: 150,
} as const;
