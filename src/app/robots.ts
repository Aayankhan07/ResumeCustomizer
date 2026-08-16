import type { MetadataRoute } from 'next';
import { siteUrl } from '../lib/siteUrl';

/**
 * Authenticated areas are disallowed so crawlers do not spend budget on routes
 * that only ever redirect to /login. /api is excluded for the same reason and
 * because those responses are never useful search results.
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
