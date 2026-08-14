const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/** MIME types accepted per extension, used to cross-check the file. */
const ACCEPTED = {
  pdf: ['application/pdf'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  txt: ['text/plain'],
};

export async function parseFile(file) {
  if (!file) throw new Error('NO_FILE');
  if (file.size > MAX_FILE_SIZE) throw new Error('FILE_TOO_LARGE');

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !(ext in ACCEPTED)) throw new Error('UNSUPPORTED_FILE_TYPE');

  // Dispatch used to rely on the filename extension alone. Browsers do not
  // always report a type (empty string is common on some platforms), so a
  // mismatch is only rejected when a type is actually present.
  if (file.type && !ACCEPTED[ext].includes(file.type)) {
    throw new Error('FILE_TYPE_MISMATCH');
  }

  switch (ext) {
    case 'pdf':
      return await parsePDF(file);
    case 'docx':
      return await parseDOCX(file);
    case 'txt':
      return await parseTXT(file);
    default:
      throw new Error('UNSUPPORTED_FILE_TYPE');
  }
}

async function parsePDF(file) {
  const { parsePDF } = await import('./pdfParser.client');
  return await parsePDF(file);
}

async function parseDOCX(file) {
  let result;
  try {
    const mammoth = (await import('mammoth')).default;
    const arrayBuffer = await file.arrayBuffer();
    result = await mammoth.extractRawText({ arrayBuffer });
  } catch (err) {
    console.error('DOCX parse failed:', err);
    throw new Error('DOCX_CORRUPT', { cause: err });
  }

  if (!result.value || result.value.trim().length < 50) {
    throw new Error('DOCX_EMPTY');
  }

  return result.value.trim();
}

async function parseTXT(file) {
  let text;
  try {
    text = await file.text();
  } catch (err) {
    console.error('TXT read failed:', err);
    throw new Error('FILE_READ_FAILED', { cause: err });
  }

  // The other two formats enforce a minimum; plain text previously did not,
  // so an almost-empty .txt passed straight through to the API.
  if (!text || text.trim().length < 50) {
    throw new Error('TXT_EMPTY');
  }

  return text.trim();
}

export function getFileParseError(code) {
  const messages = {
    FILE_TOO_LARGE: 'File must be under 5MB.',
    UNSUPPORTED_FILE_TYPE: 'Upload a PDF, DOCX, or TXT file.',
    FILE_TYPE_MISMATCH: "This file's contents do not match its extension.",
    NO_FILE: 'No file selected.',
    FILE_READ_FAILED: 'The file could not be opened. It may have been moved or renamed.',

    PDF_NO_TEXT:
      'This PDF contains images only. Please paste your resume as text instead.',
    PDF_PASSWORD_PROTECTED:
      'This PDF is password protected. Remove the password and try again.',
    PDF_CORRUPT: 'This PDF appears to be damaged. Try re-exporting it.',
    PDF_LOAD_FAILED: 'Could not open this PDF. Try re-exporting it.',
    PDF_EXTRACTION_FAILED: 'Could not read the text in this PDF.',

    DOCX_EMPTY: 'This document appears to be empty.',
    DOCX_CORRUPT: 'This document appears to be damaged. Try re-saving it.',

    TXT_EMPTY: 'This file is too short to analyze.',
  };
  return messages[code] ?? 'Could not read this file. Try a different one.';
}
