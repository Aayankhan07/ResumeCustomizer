import type { MetadataRoute } from 'next';
import { siteUrl } from '../lib/siteUrl';

/**
 * Only public, indexable routes belong here. The dashboard, profile and
 * transform workspace sit behind auth, and the auth pages themselves now carry
 * `noindex` — a sitemap that lists noindex URLs sends Search Console
 * conflicting signals and reports them as errors, so they are excluded.
 *
 * That leaves the homepage and the two public legal pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
