'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks a CSS media query from JS.
 *
 * Starts false on the server and on first client render so markup matches
 * across hydration, then syncs in an effect. Components that need to *render*
 * differently per breakpoint (rather than just style differently) should use
 * this instead of duplicating a subtree and hiding one copy with `lg:hidden`,
 * which leaves the hidden copy in the accessibility tree.
 */
export default function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const sync = () => setMatches(mql.matches);
    sync();
    mql.addEventListener('change', sync);
    return () => mql.removeEventListener('change', sync);
  }, [query]);

  return matches;
}

/** Matches Tailwind's `lg` breakpoint, where the workspace switches layout. */
export const DESKTOP_QUERY = '(min-width: 1024px)';
