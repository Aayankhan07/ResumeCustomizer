import type { MetadataRoute } from 'next';
import { siteUrl } from '../lib/siteUrl';

/**
 * Authenticated areas are disallowed so crawlers do not spend budget on routes
 * that only ever redirect to /login. /api is excluded for the same reason and
 * because those responses are never useful search results.
 *
 * The auth pages (/login, /signup, …) are deliberately *not* listed here. They
 * carry `noindex` via (auth)/layout.tsx, and a disallowed page is never
 * fetched — so the directive would never be read and the URLs could still be
 * indexed as bare titles. Crawlable + noindex is what actually removes them.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard', '/profile', '/transform'],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
