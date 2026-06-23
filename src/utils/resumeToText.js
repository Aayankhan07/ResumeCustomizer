export function resumeToPlainText(data) {
  const lines = [];

  // Header
  lines.push(data.contact.name.toUpperCase());
  const contactLine = [
    data.contact.email,
    data.contact.phone,
    data.contact.location,
    data.contact.linkedin,
    data.contact.github,
    data.contact.portfolio,
  ].filter(Boolean).join(' | ');
  lines.push(contactLine);
  lines.push('');

  // Summary
  lines.push('SUMMARY');
  lines.push('─'.repeat(50));
  lines.push(data.summary);
  lines.push('');

  // Skills
  lines.push('SKILLS');
  lines.push('─'.repeat(50));
  if (data.skills.technical?.length) {
    lines.push(`Technical: ${data.skills.technical.join(', ')}`);
  }
  if (data.skills.tools?.length) {
    lines.push(`Tools & Platforms: ${data.skills.tools.join(', ')}`);
  }
  if (data.skills.soft?.length) {
    lines.push(`Core Competencies: ${data.skills.soft.join(', ')}`);
  }
  lines.push('');

  // Experience
  lines.push('EXPERIENCE');
  lines.push('─'.repeat(50));
  data.experience?.forEach(exp => {
    lines.push(`${exp.title} | ${exp.company}${exp.location ? ', ' + exp.location : ''}`);
    lines.push(`${exp.start_date} – ${exp.end_date}`);
    exp.bullets?.forEach(b => lines.push(`  • ${b}`));
    lines.push('');
  });

  // Education
  lines.push('EDUCATION');
  lines.push('─'.repeat(50));
  data.education?.forEach(edu => {
    lines.push(`${edu.degree} in ${edu.field}`);
    lines.push(`${edu.institution}${edu.location ? ', ' + edu.location : ''}`);
    lines.push(`${edu.start_year} – ${edu.end_year}`);
    if (edu.gpa) lines.push(`GPA: ${edu.gpa}`);
    edu.highlights?.forEach(h => lines.push(`  • ${h}`));
    lines.push('');
  });

  // Projects
  if (data.projects?.length) {
    lines.push('PROJECTS');
    lines.push('─'.repeat(50));
    data.projects.forEach(proj => {
      lines.push(proj.name);
      lines.push(proj.description);
      if (proj.tech_stack?.length) lines.push(`Tech: ${proj.tech_stack.join(', ')}`);
      if (proj.link) lines.push(`Link: ${proj.link}`);
      lines.push('');
    });
  }

  // Certifications
  if (data.certifications?.length) {
    lines.push('CERTIFICATIONS');
    lines.push('─'.repeat(50));
    data.certifications.forEach(cert => {
      lines.push(`• ${cert.name} — ${cert.issuer}${cert.year ? ' (' + cert.year + ')' : ''}`);
    });
  }

  return lines.join('\n');
}
