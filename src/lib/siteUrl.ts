/**
 * The site's canonical absolute origin, for metadata that cannot be relative:
 * sitemap entries, robots directives, and Open Graph URLs.
 *
 * Vercel exposes the deployment host without a scheme, and only on the server.
 * NEXT_PUBLIC_SITE_URL takes precedence so a custom domain can override the
 * generated *.vercel.app host — otherwise canonical URLs and social previews
 * would point at the deployment URL rather than the real one.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return 'http://localhost:3000';
}
