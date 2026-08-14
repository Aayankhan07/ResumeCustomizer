import type { TransformOutput } from './schemas';

const DIVIDER = '─'.repeat(50);

/**
 * Renders a validated transform result as plain text.
 *
 * Typed against TransformOutput rather than `any`: the previous signature let
 * this read fields the schema never produces (proj.name, proj.tech_stack,
 * edu.gpa, data.certifications), which rendered "undefined" into the output.
 * Keeping the parameter typed makes that class of drift a compile error.
 */
export function resumeToPlainText(data: TransformOutput): string {
  const lines: string[] = [];

  // Header
  lines.push((data.contact?.name || '').toUpperCase());
  const contactLine = [
    data.contact?.email,
    data.contact?.phone,
    data.contact?.location,
    data.contact?.linkedin,
    data.contact?.github,
    data.contact?.portfolio,
  ].filter(Boolean).join(' | ');
  lines.push(contactLine);
  lines.push('');

  // Summary
  lines.push('SUMMARY');
  lines.push(DIVIDER);
  lines.push(data.summary || '');
  lines.push('');

  // Skills
  lines.push('SKILLS');
  lines.push(DIVIDER);
  if (data.skills?.technical?.length) {
    lines.push(`Technical: ${data.skills.technical.join(', ')}`);
  }
  if (data.skills?.tools?.length) {
    lines.push(`Tools & Platforms: ${data.skills.tools.join(', ')}`);
  }
  if (data.skills?.soft?.length) {
    lines.push(`Core Competencies: ${data.skills.soft.join(', ')}`);
  }
  lines.push('');

  // Experience
  lines.push('EXPERIENCE');
  lines.push(DIVIDER);
  data.experience?.forEach((exp) => {
    lines.push(`${exp.title} | ${exp.company}${exp.location ? ', ' + exp.location : ''}`);
    lines.push(`${exp.start_date} – ${exp.end_date}`);
    exp.bullets?.forEach((b) => lines.push(`  • ${b}`));
    lines.push('');
  });

  // Education
  lines.push('EDUCATION');
  lines.push(DIVIDER);
  data.education?.forEach((edu) => {
    lines.push(`${edu.degree} in ${edu.field}`);
    lines.push(edu.institution);
    lines.push(`${edu.start_year} – ${edu.end_year}`);
    lines.push('');
  });

  // Projects
  if (data.projects?.length) {
    lines.push('PROJECTS');
    lines.push(DIVIDER);
    data.projects.forEach((proj) => {
      lines.push(proj.title);
      lines.push(proj.description);
      proj.bullets?.forEach((b) => lines.push(`  • ${b}`));
      lines.push('');
    });
  }

  return lines.join('\n');
}
