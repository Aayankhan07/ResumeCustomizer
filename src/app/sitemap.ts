import type { MetadataRoute } from 'next';
import { siteUrl } from '../lib/siteUrl';

/**
 * Only public, indexable routes belong here. The dashboard, profile and
 * transform workspace all sit behind auth — listing them would advertise URLs
 * that return a redirect to every crawler that follows them.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ];
}
