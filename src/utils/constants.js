/**
 * ResumOrph Shared Application Constants
 *
 * Two things used to live here and no longer do:
 *
 * - COMPREHENSIVE_STOP_WORDS: a byte-for-byte duplicate of STOP_WORDS in
 *   src/lib/matchScore.ts, exported but imported by nothing, with a comment
 *   in matchScore.ts asking that the two copies be kept in sync by hand.
 *   matchScore.ts owns the list.
 *
 * - TEMPLATE_PRESETS / PAGE_BUDGET_OPTIONS: named templates the PDF generator
 *   never implemented ('minimalist') and budgets it never understood
 *   ('1-page', '2-page'). Replaced by the typed registry in
 *   src/lib/templates.ts.
 *
 * Input size limits live in src/lib/limits.ts so the client and the API
 * request schemas share one definition.
 */

export {};
