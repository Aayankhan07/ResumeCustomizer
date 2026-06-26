import { COMPREHENSIVE_STOP_WORDS } from './constants';

/**
 * Computes the ATS match score and extracts matched/missing keywords on the client side.
 * Synchronized with the comprehensive stop words list for maximum accuracy.
 * 
 * @param {string} jobDescText - The raw job description text.
 * @param {object} outputJson - The tailored resume JSON output.
 * @returns {object} { score, matched, total, missing }
 */
export function computeMatchScore(jobDescText, outputJson) {
  if (!jobDescText || !outputJson) {
    return { score: 0, matched: [], total: 0, missing: [] };
  }

  // 1. Clean and extract unique keywords from the job description
  const words = jobDescText
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !COMPREHENSIVE_STOP_WORDS.has(w) && !/^\d+$/.test(w));

  const uniqueKeywords = [...new Set(words)];

  // 2. Recursively extract all text values from the tailored JSON
  const extractText = (obj) => {
    if (typeof obj === 'string') return obj.toLowerCase();
    if (Array.isArray(obj)) return obj.map(extractText).join(' ');
    if (obj && typeof obj === 'object') {
      return Object.values(obj).map(extractText).join(' ');
    }
    return '';
  };
  
  const outputText = extractText(outputJson);

  // 3. Separate keywords into matched and missing lists
  const matched = uniqueKeywords.filter(kw => outputText.includes(kw));
  const missing = uniqueKeywords.filter(kw => !outputText.includes(kw));
  const total = uniqueKeywords.length;
  
  const score = total > 0 ? Math.min(Math.round((matched.length / total) * 100), 100) : 0;

  // Capitalize for premium display in UI chips
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  const capitalizedMatched = matched.map(capitalize);
  const capitalizedMissing = missing.map(capitalize);

  return {
    score,
    matched: capitalizedMatched,
    total,
    missing: capitalizedMissing.slice(0, 12) // Limit missing keywords display to avoid clutter
  };
}
