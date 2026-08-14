import { describe, it, expect } from 'vitest';
import { resumeToPlainText } from '@/lib/resumeToText';
import { validTransformOutput } from '../fixtures/transformOutput';

describe('resumeToPlainText', () => {
  it('concatenates all sections into formatted plain text', () => {
    const res = resumeToPlainText(validTransformOutput);

    expect(res).toContain('JOHN DOE');
    expect(res).toContain('john@example.com | 123-456-7890 | New York, NY');
    expect(res).toContain('SUMMARY');
    expect(res).toContain('SKILLS');
    expect(res).toContain('EXPERIENCE');
    expect(res).toContain('EDUCATION');
    expect(res).toContain('PROJECTS');
  });

  // The bug this pins: renderers read proj.name (not in the schema), so the
  // projects heading was followed by the literal string "undefined" in every
  // exported format. changelog.md records a partial fix that regressed.
  it('never renders the string "undefined"', () => {
    const res = resumeToPlainText(validTransformOutput);
    expect(res).not.toContain('undefined');
  });

  it('renders project titles, descriptions and bullets', () => {
    const res = resumeToPlainText(validTransformOutput);

    expect(res).toContain('Resume Optimizer');
    expect(res).toContain('An ATS-focused resume tailoring tool.');
    expect(res).toContain('• Built the scoring engine.');
  });

  it('omits the projects section entirely when there are no projects', () => {
    const res = resumeToPlainText({ ...validTransformOutput, projects: [] });
    expect(res).not.toContain('PROJECTS');
  });

  it('does not render "undefined" when optional fields are absent', () => {
    const sparse = {
      ...validTransformOutput,
      contact: { name: 'Jane Roe', email: 'jane@example.com' },
      skills: { technical: ['Go'] },
      projects: null,
    } as typeof validTransformOutput;

    const res = resumeToPlainText(sparse);
    expect(res).not.toContain('undefined');
    expect(res).toContain('JANE ROE');
  });
});
