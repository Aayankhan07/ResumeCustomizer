import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function parseFile(file) {
  if (!file) throw new Error('NO_FILE');
  if (file.size > MAX_FILE_SIZE) throw new Error('FILE_TOO_LARGE');

  const ext = file.name.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'pdf':  return await parsePDF(file);
    case 'docx': return await parseDOCX(file);
    case 'txt':  return await file.text();
    default:     throw new Error('UNSUPPORTED_FILE_TYPE');
  }
}

async function parsePDF(file) {
  // Lazy load pdfjs-dist (large library — don't include in main bundle)
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map(item => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }

  if (fullText.trim().length < 50) {
    throw new Error('PDF_NO_TEXT');
  }

  return fullText.trim();
}

async function parseDOCX(file) {
  // Lazy load mammoth
  const mammoth = (await import('mammoth')).default;
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });

  if (!result.value || result.value.trim().length < 50) {
    throw new Error('DOCX_EMPTY');
  }

  return result.value.trim();
}

export function getFileParseError(code) {
  const messages = {
    FILE_TOO_LARGE:       'File must be under 5MB.',
    UNSUPPORTED_FILE_TYPE:'Upload a PDF, DOCX, or TXT file.',
    PDF_NO_TEXT:          'This PDF contains images only. Please paste your resume as text instead.',
    DOCX_EMPTY:           'This document appears to be empty.',
    NO_FILE:              'No file selected.',
  };
  return messages[code] ?? 'Could not read this file. Try a different one.';
}
