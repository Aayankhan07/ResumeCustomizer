const STOP_WORDS = new Set([
  // Pronouns, prepositions, conjunctions, articles, basic helpers
  'with', 'that', 'this', 'have', 'from', 'they', 'will', 'been',
  'more', 'also', 'into', 'than', 'your', 'their', 'about', 'which',
  'when', 'what', 'were', 'would', 'could', 'should', 'must', 'shall',
  'very', 'just', 'some', 'such', 'each', 'most', 'over', 'work',
  'team', 'role', 'year', 'years', 'time', 'using', 'used', 'other',
  'there', 'about', 'above', 'after', 'before', 'under', 'below',
  'their', 'these', 'those', 'them', 'then', 'than', 'into', 'only',
  'also', 'here', 'when', 'who', 'whom', 'whose', 'why', 'how',
  'both', 'each', 'few', 'down', 'once', 'much', 'many', 'same',
  'some', 'such', 'very', 'just', 'only', 'than', 'then', 'once',
  'here', 'very', 'just', 'much', 'any', 'own', 'same', 'should',
  'your', 'mine', 'self', 'the', 'and', 'but', 'nor', 'off', 'out',
  
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
  
  // Generic modifiers, adverbs, and jargon
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
]);

export function computeMatchScore(
  jobDescText: string,
  outputJson: Record<string, unknown>
): { score: number; matched: string[]; total: number } {
  // Extract meaningful words from JD (minimum 2 characters, exclude numbers and stop words)
  const words = jobDescText
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));

  const jdKeywords = [...new Set(words)];

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
  
  const outputText = extractText(outputJson);

  const matched = jdKeywords.filter(kw => outputText.includes(kw));
  const total = jdKeywords.length;
  const score = total > 0 ? Math.min(Math.round((matched.length / total) * 100), 100) : 0;

  // Return top 20 most meaningful matched keywords for UI chips
  const topMatched = matched.slice(0, 20);

  return { score, matched: topMatched, total };
}
