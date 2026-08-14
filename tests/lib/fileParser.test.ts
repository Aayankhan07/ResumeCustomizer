import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseFile, getFileParseError } from '@/lib/parsers/fileParser';

/** Minimal File stand-in: jsdom's File does not implement .text(). */
function makeFile(name: string, content: string, type = '', size?: number): File {
  return {
    name,
    type,
    size: size ?? content.length,
    text: async () => content,
    arrayBuffer: async () => new TextEncoder().encode(content).buffer,
  } as unknown as File;
}

const LONG_TEXT = 'a'.repeat(200);

describe('parseFile', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('rejects a missing file', async () => {
    await expect(parseFile(null as unknown as File)).rejects.toThrow('NO_FILE');
  });

  it('rejects a file over 5MB', async () => {
    const big = makeFile('resume.pdf', 'x', 'application/pdf', 6 * 1024 * 1024);
    await expect(parseFile(big)).rejects.toThrow('FILE_TOO_LARGE');
  });

  it('rejects an unsupported extension', async () => {
    await expect(parseFile(makeFile('resume.exe', LONG_TEXT))).rejects.toThrow(
      'UNSUPPORTED_FILE_TYPE'
    );
  });

  it('rejects a file whose MIME type contradicts its extension', async () => {
    // Dispatch used to trust the filename extension alone.
    const spoofed = makeFile('resume.txt', LONG_TEXT, 'application/x-msdownload');
    await expect(parseFile(spoofed)).rejects.toThrow('FILE_TYPE_MISMATCH');
  });

  it('accepts a file with no MIME type, which some platforms omit', async () => {
    await expect(parseFile(makeFile('resume.txt', LONG_TEXT, ''))).resolves.toBe(LONG_TEXT);
  });

  it('parses a valid txt file', async () => {
    const result = await parseFile(makeFile('resume.txt', LONG_TEXT, 'text/plain'));
    expect(result).toBe(LONG_TEXT);
  });

  it('rejects an almost-empty txt file', async () => {
    // The other formats enforced a minimum; plain text previously did not, so
    // a near-empty file passed straight through to the API.
    await expect(parseFile(makeFile('resume.txt', 'hi', 'text/plain'))).rejects.toThrow(
      'TXT_EMPTY'
    );
  });
});

describe('getFileParseError', () => {
  it('maps every code the parsers can throw', () => {
    const codes = [
      'FILE_TOO_LARGE',
      'UNSUPPORTED_FILE_TYPE',
      'FILE_TYPE_MISMATCH',
      'NO_FILE',
      'FILE_READ_FAILED',
      'PDF_NO_TEXT',
      'PDF_PASSWORD_PROTECTED',
      'PDF_CORRUPT',
      'PDF_LOAD_FAILED',
      'PDF_EXTRACTION_FAILED',
      'DOCX_EMPTY',
      'DOCX_CORRUPT',
      'TXT_EMPTY',
    ];

    const fallback = getFileParseError('SOMETHING_UNKNOWN');
    for (const code of codes) {
      expect(getFileParseError(code), `${code} should have its own message`).not.toBe(fallback);
    }
  });

  it('falls back for an unrecognized code', () => {
    expect(getFileParseError('NOPE')).toMatch(/Could not read this file/);
  });
});
