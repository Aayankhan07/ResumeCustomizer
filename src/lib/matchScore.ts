// Comprehensive 200+ word stop-words list for ATS keyword extraction
// Synchronized with the frontend constants.js for absolute scoring accuracy
const STOP_WORDS = new Set([
  // Articles & conjunctions
  'a', 'an', 'the', 'and', 'or', 'but', 'nor', 'so', 'yet', 'if', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
  
  // Pronouns
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
  
  // Contractions & helpers
  're', 'll', 've', 'd', 'm', 's', 't', 'don', 't', 'can', 'will', 'just', 'should', 'would', 'could', 'shouldn', 'wouldn', 'couldn', 'isn', 'aren', 'wasn', 'weren', 'hasn', 'haven', 'hadn', 'doesn', 'don', 'didnt', 'wasnt', 'werent', 'hasnt', 'havent', 'hadnt', 'doesnt', 'dont', 'cant', 'wont', 'shouldnt', 'wouldnt', 'couldnt',
  
  // Common verbs and helpers
  'looking', 'look', 'looks', 'seeking', 'seek', 'seeks', 'scale', 'scaling',
  'combine', 'combining', 'combined', 'intelligent', 'concept', 'concepts',
  'full', 'fully', 'part', 'time', 'date', 'dates', 'year', 'years', 'month',
  'months', 'day', 'days', 'hour', 'hours', 'week', 'weeks', 'want', 'wants',
  'wanted', 'need', 'needs', 'needed', 'find', 'finds', 'found', 'get', 'gets',
  'got', 'make', 'makes', 'made', 'take', 'takes', 'took', 'give', 'gives',
  'given', 'like', 'likes', 'liked', 'love', 'loves', 'loved', 'must', 'should',
  'could', 'would', 'will', 'shall', 'may', 'might', 'can', 'cannot', 'couldnt',
  'shouldnt', 'wouldnt', 'cant', 'wont', 'dont', 'didnt', 'doesnt', 'isnt',
  'arent', 'wasnt', 'werent', 'hasnt', 'havent', 'hadnt', 'had', 'has', 'have',
  'having', 'do', 'does', 'did', 'doing', 'done', 'go', 'goes', 'went', 'gone',
  'going', 'come', 'comes', 'came', 'coming', 'use', 'uses', 'used', 'using',
  'keep', 'keeps', 'kept', 'keeping', 'start', 'starts', 'started', 'starting',
  'stop', 'stops', 'stopped', 'stopping', 'end', 'ends', 'ended', 'ending',
  'show', 'shows', 'showed', 'shown', 'showing', 'tell', 'tells', 'told',
  'telling', 'ask', 'asks', 'asked', 'asking', 'answer', 'answers', 'answered',
  'answering', 'say', 'says', 'said', 'saying', 'think', 'thinks', 'thought',
  'thinking', 'know', 'knows', 'knew', 'known', 'knowing', 'believe', 'believes',
  'believed', 'believing', 'feel', 'feels', 'felt', 'feeling', 'seem', 'seems',
  'seemed', 'seeming', 'appear', 'appears', 'appeared', 'appearing',
  
  // Generic job description verbs, nouns & roles
  'hiring', 'hired', 'join', 'joining', 'build', 'building', 'built',
  'write', 'writing', 'written', 'design', 'designing', 'designed',
  'create', 'creating', 'created', 'develop', 'developing', 'developed',
  'developer', 'developers', 'development', 'developments', 'engineer',
  'engineering', 'engineers', 'role', 'roles', 'job', 'jobs',
  'work', 'working', 'works', 'team', 'teams', 'member', 'members',
  'people', 'person', 'candidate', 'candidates', 'client', 'clients',
  'customer', 'customers', 'business', 'businesses', 'company',
  'companies', 'project', 'projects', 'product', 'products', 'service',
  'services', 'system', 'systems', 'platform', 'platforms', 'tool',
  'tools', 'stack', 'tech', 'technical', 'technology', 'technologies',
  'internship', 'internships', 'intern', 'junior', 'senior', 'level',
  
  // Common business & process actions
  'ability', 'action', 'actions', 'active', 'actively', 'activities',
  'strong', 'practical', 'hands-on', 'hands', 'proven', 'experience',
  'experiences', 'experienced', 'skills', 'skill', 'professional',
  'background', 'required', 'requires', 'requirements', 'responsibility',
  'responsibilities', 'task', 'tasks', 'goal', 'goals', 'deliver',
  'delivering', 'delivered', 'track', 'tracking', 'report', 'reporting',
  'optimize', 'optimizing', 'optimized', 'maintain', 'maintaining',
  'maintained', 'support', 'supporting', 'supported', 'manage', 'managing',
  'managed', 'management', 'lead', 'leading', 'leads', 'leader',
  'collaborate', 'collaborating', 'collaboration', 'collaborative',
  'communicate', 'communicating', 'communication', 'partner', 'partnering',
  'partnered', 'discover', 'discovering', 'discovered', 'identify',
  'identifying', 'identified', 'solve', 'solving', 'solved', 'eliminate',
  'eliminating', 'eliminated', 'improve', 'improving', 'improved',
  'harden', 'hardening', 'hardened', 'secure', 'securing', 'secured',
  'ensure', 'ensuring', 'ensured', 'track', 'tracks', 'reporting',
  
  // Generic modifiers & jargon
  'highly', 'deeply', 'clean', 'cleanly', 'clear', 'clearly',
  'quick', 'quickly', 'fast', 'faster', 'flexible', 'flexibility',
  'complex', 'simple', 'simply', 'basic', 'basically', 'general',
  'generally', 'specific', 'specifically', 'appropriate', 'appropriately',
  'ideal', 'ideally', 'excellent', 'meaningful', 'successful',
  'successfully', 'measurable', 'consistent', 'consistently',
  'operational', 'operationally', 'internal', 'internally', 'external',
  'externally', 'real', 'really', 'different', 'various', 'several',
  'quarterly', 'prioritized', 'structured', 'unparalleled', 'comprehensive',
  'patented', 'valley', 'silicon', 'funded', 'startup', 'market',
  'focus', 'focused', 'focuses', 'focusing', 'harness', 'harnessing',
  'about', 'above', 'across', 'after', 'against', 'along', 'amid', 'among',
  'around', 'at', 'before', 'behind', 'below', 'beneath', 'beside', 'between',
  'beyond', 'but', 'by', 'concerning', 'considering', 'despite', 'down',
  'during', 'except', 'following', 'for', 'from', 'in', 'inside', 'into',
  'like', 'minus', 'near', 'of', 'off', 'on', 'onto', 'opposite', 'out',
  'outside', 'over', 'past', 'pending', 'regarding', 'since', 'through',
  'throughout', 'to', 'toward', 'towards', 'under', 'underneath', 'unlike',
  'until', 'up', 'upon', 'versus', 'via', 'with', 'within', 'without'
]);

const BASIC_STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'nor', 'so', 'yet', 'if', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing'
]);

export function computeMatchScore(
  jobDescText: string,
  outputJson: Record<string, unknown>,
  // `conciseness` was accepted here and never read. Removed rather than left
  // in the signature implying an effect it never had; see lib/schemas/api.ts,
  // which still accepts and ignores it for request compatibility.
  weights?: {
    techDepth?: number;
    industryFocus?: number;
    optimizationMode?: 'description' | 'title';
  }
): { score: number; matched: string[]; total: number; missing: string[] } {
  const isTitleMode = weights?.optimizationMode === 'title';
  const isShortText = jobDescText.split(/\s+/).filter(Boolean).length < 15;
  const useBasicStopWords = isTitleMode || isShortText;
  const activeStopWords = useBasicStopWords ? BASIC_STOP_WORDS : STOP_WORDS;

  // Extract meaningful words from JD (minimum 2 characters, exclude numbers and stop words)
  const words = jobDescText
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && !activeStopWords.has(w) && !/^\d+$/.test(w));

  const jdKeywords = [...new Set(words)];

  // How often each keyword appears in the JD. A term repeated across the
  // responsibilities and requirements is a genuine signal; one mentioned once
  // in passing is not, and previously they counted the same. Capped at 3 so a
  // single term repeated a dozen times cannot dominate the whole score.
  const frequency = new Map<string, number>();
  for (const w of words) {
    frequency.set(w, Math.min((frequency.get(w) ?? 0) + 1, 3));
  }

  // Recursively extract all string values from structured JSON
  // to check keyword matching against only actual content values.
  const extractText = (obj: any): string => {
    if (typeof obj === 'string') return obj.toLowerCase();
    if (Array.isArray(obj)) return obj.map(extractText).join(' ');
    if (obj && typeof obj === 'object') {
      return Object.values(obj).map(extractText).join(' ');
    }
    return '';
  };

  // Score the resume itself, not the whole payload.
  //
  // This used to flatten every string in the output — cover_letter, all ten
  // interview_prep questions, recruiter_scan, roadmap — into one ~4000-word
  // blob. Every one of those fields is written by the model *from the job
  // description*, so the score asked "did the model reuse the JD's vocabulary
  // somewhere in its own output?" The answer was almost always yes, which is
  // why real transforms returned 100%.
  //
  // Only the sections a recruiter or ATS actually reads count toward the
  // match. A plain string (the original resume text) is scored as-is.
  const outputText =
    typeof outputJson === 'string'
      ? (outputJson as string).toLowerCase()
      : extractText({
          summary: (outputJson as Record<string, unknown>)?.summary,
          skills: (outputJson as Record<string, unknown>)?.skills,
          experience: (outputJson as Record<string, unknown>)?.experience,
          projects: (outputJson as Record<string, unknown>)?.projects,
          education: (outputJson as Record<string, unknown>)?.education,
          certifications: (outputJson as Record<string, unknown>)?.certifications,
        });

  // Tokenized rather than substring-matched. `outputText.includes(kw)` had no
  // word boundaries, so "ai" matched inside "maintained" and "go" inside
  // "algorithm" — every score shown to users was inflated.
  //
  // A Set lookup is also O(1) per keyword instead of scanning the whole
  // document text once per keyword.
  const outputTokens = new Set(
    outputText
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
  );

  // Multi-word keywords (e.g. "ci/cd" split into parts) still need a phrase
  // check, so fall back to a boundary-anchored search for hyphenated terms.
  const hasKeyword = (kw: string): boolean => {
    if (outputTokens.has(kw)) return true;
    if (!kw.includes('-')) return false;
    return kw.split('-').every((part) => outputTokens.has(part));
  };

  const matched = jdKeywords.filter(hasKeyword);
  const missing = jdKeywords.filter((kw) => !hasKeyword(kw));
  const total = jdKeywords.length;

  // Calculate weights
  const PROCESS_WORDS = new Set([
    'lead', 'leader', 'leadership', 'manage', 'manager', 'management', 'strategy', 'strategic', 
    'collaborate', 'collaboration', 'collaborative', 'agile', 'scrum', 'team', 'product', 'project', 
    'client', 'business', 'stakeholder', 'communication', 'partner', 'partnership', 'organization'
  ]);

  const TECH_WORDS = new Set([
    'python', 'javascript', 'react', 'typescript', 'rust', 'docker', 'kubernetes', 'aws', 'sql', 
    'postgres', 'graphql', 'llm', 'ml', 'ai', 'pipelines', 'inference', 'latency', 'quantization', 
    'telemetry', 'sentry', 'git', 'ci', 'cd', 'ci/cd', 'cloud', 'deployment', 'mlops', 'framework'
  ]);

  // Direct Set lookups. The previous implementation also ran
  // `Array.from(SET).some(p => kw.includes(p))` for every keyword, which was
  // O(keywords x setSize) and classified by substring — so "airflow" counted
  // as technical because it contains "ai".
  const getKeywordWeight = (kw: string) => {
    // Repetition in the JD scales every keyword, independent of the slider
    // weights below, so emphasis in the posting is reflected in the score.
    const significance = frequency.get(kw) ?? 1;

    if (!weights) return significance;
    const techDepth = weights.techDepth ?? 50;
    const industryFocus = weights.industryFocus ?? 80;

    if (PROCESS_WORDS.has(kw)) {
      return Math.max(0.1, (100 - techDepth) / 50) * significance;
    }

    if (TECH_WORDS.has(kw)) {
      return Math.max(0.1, (techDepth / 50) * (industryFocus / 80)) * significance;
    }

    return significance;
  };

  let matchedWeightSum = 0;
  let totalWeightSum = 0;

  jdKeywords.forEach((kw) => {
    const w = getKeywordWeight(kw);
    totalWeightSum += w;
    if (hasKeyword(kw)) {
      matchedWeightSum += w;
    }
  });

  const score = totalWeightSum > 0 ? Math.min(Math.round((matchedWeightSum / totalWeightSum) * 100), 100) : 0;

  // Capitalize for premium display in UI chips
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
  const capitalizedMatched = matched.map(capitalize);
  const capitalizedMissing = missing.map(capitalize);

  return {
    score,
    matched: capitalizedMatched,
    total,
    missing: capitalizedMissing.slice(0, 12)
  };
}

/**
 * Scores the candidate's *original* resume against the same job description,
 * using the identical keyword pool and weighting as the optimized result.
 *
 * A single number ("88% match") is unfalsifiable — the user has nothing to
 * compare it against, and because the optimized resume is generated from the
 * job description it will always score well. The honest, defensible claim is
 * the delta: "we raised your match from 47% to 78%". That is what this
 * enables, and it costs one extra pass over text already in memory.
 */
export function computeBaselineScore(
  jobDescText: string,
  originalResumeText: string,
  weights?: Parameters<typeof computeMatchScore>[2]
): number {
  if (!originalResumeText?.trim()) return 0;
  return computeMatchScore(jobDescText, originalResumeText as unknown as Record<string, unknown>, weights).score;
}
