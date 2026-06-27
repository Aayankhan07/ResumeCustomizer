
import { useEffect, useRef } from 'react';

/**
 * Custom hook to dynamically manage the document.title (browser tab title).
 * Supports setting a title on mount and restoring the previous title on unmount.
 * 
 * @param {string} title - The title to set.
 * @param {boolean} [retainOnUnmount=false] - Whether to keep the title when the component unmounts.
 */
export default function useDocumentTitle(title, retainOnUnmount = false) {
  const defaultTitle = 'ResumOrph | AI-Tailored Resume Workspace';
  const prevTitleRef = useRef(typeof document !== 'undefined' ? document.title : '');

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const formattedTitle = title ? `${title} | ResumOrph` : defaultTitle;
    document.title = formattedTitle;
  }, [title]);

  useEffect(() => {
    const prevTitle = prevTitleRef.current;
    return () => {
      if (typeof document !== 'undefined' && !retainOnUnmount) {
        document.title = prevTitle || defaultTitle;
      }
    };
  }, [retainOnUnmount]);
}
