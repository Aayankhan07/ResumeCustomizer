/**
 * Shared landing-page constants.
 *
 * One label for every primary call to action, so the hero, navbar, feature
 * grid and closing band never drift apart again.
 */
export const PRIMARY_CTA_LABEL = 'Tailor my resume';

/**
 * sessionStorage key carrying the role typed into the hero across the login
 * redirect. The middleware drops query strings when it bounces an anonymous
 * visitor from /transform to /login, so the query param alone is not enough.
 */
export const PENDING_ROLE_KEY = 'resumorph:pending-role';

export const FREE_TIER_LINE = 'Free: up to 10 tailored resumes per hour. No credit card.';

/** Section anchors, used by the navbar and footer. Each points to one section. */
export const SECTION_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#privacy', label: 'Privacy' },
  { href: '#faq', label: 'FAQ' },
] as const;
