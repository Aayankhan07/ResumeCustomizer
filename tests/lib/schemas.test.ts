import { describe, it, expect } from 'vitest';
import { TransformOutputSchema } from '@/lib/schemas';
import { validTransformOutput } from '../fixtures/transformOutput';

describe('TransformOutputSchema', () => {
  it('accepts a complete, realistic transform result', () => {
    const result = TransformOutputSchema.safeParse(validTransformOutput);
    expect(result.success).toBe(true);
  });

  describe('projects shape', () => {
    // The renderers (resumeToText, pdfGenerator, docxGenerator, ResumePreview)
    // used to read proj.name / proj.tech_stack / proj.link, which the schema
    // never produced, so every export rendered "undefined" as the title.
    // These tests pin the real field names at the source.
    it('requires title, description and bullets', () => {
      const parsed = TransformOutputSchema.parse(validTransformOutput);
      const project = parsed.projects?.[0];

      expect(project).toBeDefined();
      expect(project).toHaveProperty('title');
      expect(project).toHaveProperty('description');
      expect(project).toHaveProperty('bullets');
    });

    it('rejects a project that uses "name" instead of "title"', () => {
      const drifted = {
        ...validTransformOutput,
        projects: [{ name: 'Legacy Field', description: 'x', bullets: [] }],
      };

      const result = TransformOutputSchema.safeParse(drifted);
      expect(result.success).toBe(false);
    });
  });

  describe('meta', () => {
    // meta was .optional(), so the route did `meta = meta || {}` and then read
    // detected_job_title / detected_company off it, writing undefined into the
    // DB and producing blank history rows.
    it('is required', () => {
      const { meta: _meta, ...withoutMeta } = validTransformOutput;
      const result = TransformOutputSchema.safeParse(withoutMeta);
      expect(result.success).toBe(false);
    });

    it('requires detected_job_title and detected_company', () => {
      const result = TransformOutputSchema.safeParse({
        ...validTransformOutput,
        meta: { match_score: 50 },
      });
      expect(result.success).toBe(false);
    });
  });

  it('rejects education entries missing required fields', () => {
    const result = TransformOutputSchema.safeParse({
      ...validTransformOutput,
      education: [{ institution: 'MIT' }],
    });
    expect(result.success).toBe(false);
  });

  describe('partial-result salvage', () => {
    // A malformed enrichment used to discard the whole result, throwing away a
    // complete tailored resume that cost a 20-60s paid model call. The resume
    // body still fails hard; the extras degrade to null.
    it('salvages the resume when roadmap is malformed', () => {
      const result = TransformOutputSchema.safeParse({
        ...validTransformOutput,
        roadmap: { tasks: [{ task: 'x', type: 'skill', impact: 'high', points: 'ten' }] },
      });
      expect(result.success).toBe(true);
      expect(result.data?.roadmap).toBeNull();
      expect(result.data?.experience).toHaveLength(1);
    });

    it('salvages the resume when ats_quality is outside the enum', () => {
      const result = TransformOutputSchema.safeParse({
        ...validTransformOutput,
        ats_quality: { keyword_density: 'Excellent', section_headings: 'Standard', formatting_risk: 'Zero Flags' },
      });
      expect(result.success).toBe(true);
      expect(result.data?.ats_quality).toBeNull();
    });

    it('salvages the resume when interview_prep is malformed', () => {
      const result = TransformOutputSchema.safeParse({
        ...validTransformOutput,
        interview_prep: { technical: 'not an array' },
      });
      expect(result.success).toBe(true);
      expect(result.data?.interview_prep).toBeNull();
    });

    it('salvages the resume when the cover letter is the wrong type', () => {
      const result = TransformOutputSchema.safeParse({
        ...validTransformOutput,
        cover_letter: { body: 'object instead of string' },
      });
      expect(result.success).toBe(true);
      expect(result.data?.cover_letter).toBeNull();
      expect(result.data?.summary).toBe(validTransformOutput.summary);
    });

    it('still rejects a malformed resume body', () => {
      // The tailored resume is the product. It must not degrade silently.
      const result = TransformOutputSchema.safeParse({
        ...validTransformOutput,
        experience: 'not an array',
      });
      expect(result.success).toBe(false);
    });

    it('still rejects a missing meta object', () => {
      const { meta: _meta, ...withoutMeta } = validTransformOutput;
      const result = TransformOutputSchema.safeParse(withoutMeta);
      expect(result.success).toBe(false);
    });
  });
});
