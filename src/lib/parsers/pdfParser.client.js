let pdfjsLib = null;

/**
 * Extracts text from a PDF in the browser.
 *
 * The worker is served from our own origin (see scripts/copy-pdf-worker.mjs).
 * It was previously fetched from unpkg.com at runtime, which executed
 * third-party code in the user's browser on every upload.
 */
export async function parsePDF(file) {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';
  }

  let pdf;
  try {
    const arrayBuffer = await file.arrayBuffer();
    pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  } catch (err) {
    // pdf.js throws its own error shapes; map them to codes that
    // getFileParseError knows how to explain.
    if (err?.name === 'PasswordException') {
      throw new Error('PDF_PASSWORD_PROTECTED', { cause: err });
    }
    if (err?.name === 'InvalidPDFException') {
      throw new Error('PDF_CORRUPT', { cause: err });
    }
    console.error('PDF load failed:', err);
    throw new Error('PDF_LOAD_FAILED', { cause: err });
  }

  let fullText = '';

  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map((item) => item.str).join(' ') + '\n';
    }
  } catch (err) {
    console.error('PDF text extraction failed:', err);
    throw new Error('PDF_EXTRACTION_FAILED', { cause: err });
  } finally {
    // Release the worker's copy of the document rather than waiting for GC.
    pdf.destroy?.();
  }

  if (fullText.trim().length < 50) {
    // Almost always a scanned/image-only PDF with no text layer.
    throw new Error('PDF_NO_TEXT');
  }

  return fullText.trim();
}
