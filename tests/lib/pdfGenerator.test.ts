import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { jsPDF as JsPDFType } from 'jspdf';
import { generateResumePDF } from '@/lib/pdfGenerator';
import { TEMPLATES } from '@/lib/templates';
import { validTransformOutput } from '../fixtures/transformOutput';

/**
 * Smoke tests for the jsPDF resume generator.
 *
 * Approach: jsPDF assigns text()/save() per instance inside its constructor,
 * so they cannot be spied on via the prototype. The module is mocked with a
 * subclass of the real jsPDF that records every string passed to text() (the
 * content stream is compressed, so reading text back out of the PDF bytes is
 * not practical) and replaces save() — which would trigger a browser
 * download — with a capture of the document, so its real output can still be
 * checked.
 */

type TextArg = string | string[];

const capture = vi.hoisted(() => ({
  texts: [] as unknown[],
  saved: null as { doc: unknown; filename: string } | null,
}));

vi.mock('jspdf', async (importOriginal) => {
  const actual = await importOriginal<typeof import('jspdf')>();
  class RecordingJsPDF extends actual.jsPDF {
    constructor(...args: ConstructorParameters<typeof actual.jsPDF>) {
      super(...args);
      const realText = this.text.bind(this);
      this.text = ((...textArgs: Parameters<JsPDFType['text']>) => {
        capture.texts.push(textArgs[0]);
        return realText(...textArgs);
      }) as JsPDFType['text'];
      this.save = ((filename: string) => {
        capture.saved = { doc: this, filename };
        return this;
      }) as unknown as JsPDFType['save'];
    }
  }
  return { ...actual, default: RecordingJsPDF, jsPDF: RecordingJsPDF };
});

let saved: { doc: JsPDFType; filename: string } | null;

beforeEach(() => {
  capture.texts.length = 0;
  capture.saved = null;
  saved = null;
});

function lastSaved() {
  saved = capture.saved as { doc: JsPDFType; filename: string } | null;
  return saved;
}

function drawnStrings(): string[] {
  return capture.texts.flatMap((arg) => {
    const a = arg as TextArg;
    return Array.isArray(a) ? a : [a];
  });
}

const fixture = () => structuredClone(validTransformOutput);

const TEMPLATE_IDS = TEMPLATES.map((t) => t.id);
const BUDGETS = ['standard', 'fit'] as const;

describe('generateResumePDF', () => {
  it('covers every registered template', () => {
    expect(TEMPLATE_IDS).toEqual(
      expect.arrayContaining(['classic', 'modern', 'tech', 'executive'])
    );
  });

  describe.each(TEMPLATE_IDS)('template %s', (templateId) => {
    it.each(BUDGETS)('generates a non-empty PDF (%s budget)', (budget) => {
      expect(() => generateResumePDF(fixture(), templateId, budget)).not.toThrow();

      expect(lastSaved()).not.toBeNull();
      expect(saved!.filename).toBe('John_Doe_Software_Engineer_Resume.pdf');
      const bytes = saved!.doc.output('arraybuffer');
      expect(bytes.byteLength).toBeGreaterThan(1000);
      expect(saved!.doc.output().startsWith('%PDF-')).toBe(true);
    });

    it('draws the resume content', () => {
      generateResumePDF(fixture(), templateId);
      const text = drawnStrings().join('\n');
      expect(text).toMatch(/john doe/i);
      expect(text).toContain('Developed code.');
      expect(text).toContain('Bachelor of Science in Computer Science');
      expect(text).toContain('Resume Optimizer');
      for (const heading of ['SUMMARY', 'SKILLS', 'EXPERIENCE', 'EDUCATION', 'PROJECTS']) {
        expect(drawnStrings()).toContain(heading);
      }
    });

    it('never letter-spaces headings with literal spaces (ATS reads them as single letters)', () => {
      generateResumePDF(fixture(), templateId);
      for (const s of drawnStrings()) {
        // e.g. "E X P E R I E N C E" or "J O H N  D O E"
        expect(s).not.toMatch(/\b[A-Z] [A-Z] [A-Z]\b/);
      }
    });

    it('never draws the ▪ marker, which is not in the WinAnsi font encoding', () => {
      generateResumePDF(fixture(), templateId);
      expect(drawnStrings().join('')).not.toContain('▪');
    });

    it('does not print a dangling " in " when the education field is empty', () => {
      const data = fixture();
      data.education[0].field = '';
      generateResumePDF(data, templateId);
      const strings = drawnStrings();
      expect(strings).toContain('Bachelor of Science');
      for (const s of strings) {
        expect(s).not.toMatch(/ in\s*$/);
        expect(s).not.toMatch(/^\s*in /);
      }
    });

    it('does not print a leading "in " when the degree is empty', () => {
      const data = fixture();
      data.education[0].degree = '';
      generateResumePDF(data, templateId);
      const strings = drawnStrings();
      expect(strings).toContain('Computer Science');
      expect(strings.some((s) => /^\s*in /.test(s))).toBe(false);
    });

    it('does not print a dangling dash when an experience date is missing', () => {
      const data = fixture();
      data.experience[0].end_date = '';
      generateResumePDF(data, templateId);
      for (const s of drawnStrings()) {
        expect(s).not.toMatch(/[–-]\s*$/);
      }
    });

    it('tolerates empty optional sections', () => {
      const data = fixture();
      data.summary = '';
      data.projects = [];
      data.skills = { technical: [], tools: [], soft: [] };
      expect(() => generateResumePDF(data, templateId)).not.toThrow();
      expect(drawnStrings()).not.toContain('PROJECTS');
      expect(drawnStrings()).not.toContain('SUMMARY');
    });
  });

  it('falls back to "Resume" / "ATS" in the filename when name and title are missing', () => {
    const data = fixture();
    data.contact.name = '';
    // @ts-expect-error -- simulating a legacy row without meta
    delete data.meta;
    generateResumePDF(data, 'classic');
    expect(lastSaved()!.filename).toBe('Resume_ATS_Resume.pdf');
  });

  it('paginates a long resume instead of drawing off the page', () => {
    const data = fixture();
    data.experience = Array.from({ length: 12 }, (_, i) => ({
      ...data.experience[0],
      company: `Company ${i}`,
      bullets: Array.from({ length: 6 }, (_, j) => `Bullet ${j} `.repeat(15)),
    }));
    generateResumePDF(data, 'modern');
    expect(lastSaved()!.doc.getNumberOfPages()).toBeGreaterThan(1);
  });
});
