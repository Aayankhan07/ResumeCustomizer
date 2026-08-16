import type { Metadata } from 'next';

/**
 * Metadata for the auth routes.
 *
 * Every page in this group is a client component and so cannot export
 * `metadata` itself — which is why these five routes previously inherited the
 * homepage title and had no robots directive of their own.
 *
 * robots.txt disallows crawling these paths, but that only prevents fetching:
 * a URL discovered through a link can still be indexed, with no snippet, as a
 * bare title. `noindex` is what actually keeps them out of the index. Note the
 * two work against each other — a disallowed page is never crawled, so the
 * noindex is never read. These paths are therefore *allowed* in robots.txt and
 * excluded here instead.
 */
export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
