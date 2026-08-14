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
});
