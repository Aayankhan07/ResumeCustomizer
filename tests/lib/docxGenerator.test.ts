import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import JSZip from 'jszip';
import { generateResumeDOCX } from '@/lib/docxGenerator';
import { validTransformOutput } from '../fixtures/transformOutput';

/**
 * Smoke tests for the DOCX generator. It builds the document with `docx`,
 * packs it to a Blob, and triggers a download through an object URL.
 *
 * jsdom has no URL.createObjectURL, so it is stubbed to capture the Blob; the
 * captured .docx is then unzipped and word/document.xml inspected.
 */

let blobs: Blob[];
let clickSpy: ReturnType<typeof vi.spyOn>;
const revoke = vi.fn();

beforeEach(() => {
  blobs = [];
  revoke.mockReset();
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    writable: true,
    value: (blob: Blob) => {
      blobs.push(blob);
      return 'blob:mock-docx';
    },
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    writable: true,
    value: revoke,
  });
  clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
});

afterEach(() => {
  clickSpy.mockRestore();
});

const fixture = () => structuredClone(validTransformOutput);

async function documentXml(): Promise<string> {
  expect(blobs).toHaveLength(1);
  const zip = await JSZip.loadAsync(await blobs[0].arrayBuffer());
  const file = zip.file('word/document.xml');
  expect(file).not.toBeNull();
  return file!.async('string');
}

/** Text runs of document.xml, in order. */
function runs(xml: string): string[] {
  return [...xml.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)].map((m) => m[1]);
}

describe('generateResumeDOCX', () => {
  it('generates a non-empty .docx and triggers a download', async () => {
    await expect(generateResumeDOCX(fixture())).resolves.toBeUndefined();

    expect(blobs[0].size).toBeGreaterThan(1000);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    const anchor = clickSpy.mock.contexts[0] as HTMLAnchorElement;
    expect(anchor.download).toBe('John_Doe_Tailored_Resume.docx');
    // The anchor is removed and the object URL released.
    expect(document.querySelector('a[download]')).toBeNull();
    expect(revoke).toHaveBeenCalledWith('blob:mock-docx');
  });

  it('contains the resume content and plain uppercase headings', async () => {
    await generateResumeDOCX(fixture());
    const xml = await documentXml();
    const text = runs(xml).join('\n');

    expect(text).toContain('John Doe');
    expect(text).toContain('Developed code.');
    expect(text).toContain('Bachelor of Science in Computer Science');
    for (const heading of ['SUMMARY', 'EXPERIENCE', 'EDUCATION', 'PROJECTS']) {
      expect(runs(xml)).toContain(heading);
    }
    expect(text).not.toMatch(/\b[A-Z] [A-Z] [A-Z]\b/);
    expect(text).not.toContain('▪');
  });

  it('does not print a dangling " in " when the education field is empty', async () => {
    const data = fixture();
    data.education[0].field = '';
    await generateResumeDOCX(data);
    const all = runs(await documentXml());

    expect(all).toContain('Bachelor of Science');
    for (const r of all) {
      expect(r).not.toMatch(/ in\s*$/);
      expect(r).not.toMatch(/^\s*in /);
    }
  });

  it('releases the object URL even when the download click throws', async () => {
    clickSpy.mockImplementation(() => {
      throw new Error('blocked');
    });
    await expect(generateResumeDOCX(fixture())).rejects.toThrow('blocked');
    expect(revoke).toHaveBeenCalledWith('blob:mock-docx');
  });

  it('tolerates empty optional sections', async () => {
    const data = fixture();
    data.summary = '';
    data.projects = [];
    data.skills = { technical: [], tools: [], soft: [] };
    await expect(generateResumeDOCX(data)).resolves.toBeUndefined();
    expect(runs(await documentXml())).not.toContain('PROJECTS');
  });
});
