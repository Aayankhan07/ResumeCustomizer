'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { trackEvent } from '../utils/analytics';

interface UseExportArgs {
  /** The validated transform result to render. */
  result: unknown;
  /** Plain-text rendering of the same result, for the clipboard. */
  plainText: string;
  selectedTemplate: string;
  pageBudget: string;
}

/**
 * Owns the three export paths — PDF, DOCX, clipboard — and their loading state.
 *
 * These lived inline in TransformOutput, which already held tab routing,
 * history sync, keyboard handling and score state. Pulling them out keeps the
 * generator imports lazy (jspdf and docx are ~350KB and ~200KB, and neither
 * should ship to a user who never exports) while making the mutual exclusion
 * between the two downloads explicit in one place.
 */
export function useExport({ result, plainText, selectedTemplate, pageBudget }: UseExportArgs) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);
  const [copying, setCopying] = useState(false);

  // Cleared on unmount so a copy that resolves after the user has navigated
  // away does not set state on an unmounted component.
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const busy = isDownloading || isDownloadingDocx;

  const downloadPDF = useCallback(async () => {
    // One export at a time: both write to the same result and would otherwise
    // race, and the spinner state cannot represent both.
    if (busy) return;
    setIsDownloading(true);
    try {
      const { generateResumePDF } = await import('../lib/pdfGenerator');
      generateResumePDF(result, selectedTemplate, pageBudget);
      trackEvent('pdf_downloaded', { template: selectedTemplate });
      toast.success('Resume downloaded');
    } catch (err) {
      // Surfaced to the user and logged for Sentry. Re-throwing would only
      // become an unhandled rejection.
      console.error('PDF generation failed:', err);
      toast.error('Failed to generate PDF. Try copying the plain text.');
    } finally {
      setIsDownloading(false);
    }
  }, [busy, result, selectedTemplate, pageBudget]);

  const downloadDOCX = useCallback(async () => {
    if (busy) return;
    setIsDownloadingDocx(true);
    try {
      const { generateResumeDOCX } = await import('../lib/docxGenerator');
      await generateResumeDOCX(result);
      trackEvent('docx_downloaded');
      toast.success('DOCX saved to downloads');
    } catch (err) {
      console.error('DOCX generation failed:', err);
      toast.error('Failed to generate Word document.');
    } finally {
      setIsDownloadingDocx(false);
    }
  }, [busy, result]);

  const copyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(plainText);
      // Only flag success after the write resolves: `copying` used to be set
      // before the await and cleared on a timer regardless of outcome, so a
      // failed copy still flashed "Copied" beside its own error toast.
      setCopying(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopying(false), 1500);
      toast.success('Resume text copied');
    } catch (err) {
      console.error('Clipboard write failed:', err);
      toast.error('Failed to copy text.');
    }
  }, [plainText]);

  return {
    isDownloading,
    isDownloadingDocx,
    copying,
    downloadPDF,
    downloadDOCX,
    copyText,
  };
}

export default useExport;
