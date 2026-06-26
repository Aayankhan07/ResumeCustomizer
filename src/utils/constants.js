/**
 * ResumOrph Shared Application Constants
 */

// Comprehensive 200+ word stop-words list for ATS keyword extraction
export const COMPREHENSIVE_STOP_WORDS = new Set([
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

// Premium PDF Templates
export const TEMPLATE_PRESETS = [
  { id: 'classic', name: 'Classic Executive', description: 'Traditional academic style with high information density' },
  { id: 'modern', name: 'Obsidian Modern', description: 'Contemporary tech styling with crisp visual hierarchy' },
  { id: 'minimalist', name: 'Sleek Minimal', description: 'Clean layout with generous whitespace for design roles' }
];

// PDF Page-Budgeting Options
export const PAGE_BUDGET_OPTIONS = [
  { id: 'standard', name: 'Standard Flow', description: 'Natural length based on content height' },
  { id: '1-page', name: 'Strict 1-Page', description: 'Force compress content onto a single page' },
  { id: '2-page', name: 'Strict 2-Pages', description: 'Compress or balance content to exactly 2 pages' }
];
