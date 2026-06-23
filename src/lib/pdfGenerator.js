import jsPDF from 'jspdf';

export function generateResumePDF(data) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter', compress: true });
  const PAGE_W  = 612;
  const PAGE_H  = 792;
  const MARGIN  = 54;      // 0.75"
  const CW      = PAGE_W - MARGIN * 2; // content width
  let y = MARGIN;

  const newPage = () => { doc.addPage(); y = MARGIN; };
  const spaceCheck = (h) => { if (y + h > PAGE_H - MARGIN) newPage(); };

  const setFont  = (style, size) => doc.setFont('times', style).setFontSize(size);
  const setColor = (r, g, b)      => doc.setTextColor(r, g, b);

  const drawRule = () => {
    doc.setDrawColor(100, 100, 100).setLineWidth(0.5);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 8;
  };

  const sectionHead = (title) => {
    spaceCheck(32);
    setFont('bold', 10.5);
    setColor(20, 20, 20);
    doc.text(title.toUpperCase(), MARGIN, y);
    y += 5;
    drawRule();
  };

  // ── NAME
  spaceCheck(22);
  setFont('bold', 20);
  setColor(15, 15, 15);
  doc.text(data.contact.name, PAGE_W / 2, y, { align: 'center' });
  y += 16;

  // ── CONTACT LINE
  const contactParts = [
    data.contact.email,
    data.contact.phone,
    data.contact.location,
    data.contact.linkedin ? data.contact.linkedin.replace('https://','') : null,
    data.contact.github   ? data.contact.github.replace('https://','')   : null,
    data.contact.portfolio,
  ].filter(Boolean);
  setFont('normal', 9);
  setColor(70, 70, 70);
  doc.text(contactParts.join('  |  '), PAGE_W / 2, y, { align: 'center' });
  y += 18;

  // ── SUMMARY
  sectionHead('Summary');
  setFont('normal', 10);
  setColor(40, 40, 40);
  const summaryLines = doc.splitTextToSize(data.summary, CW);
  spaceCheck(summaryLines.length * 13);
  doc.text(summaryLines, MARGIN, y);
  y += summaryLines.length * 13 + 12;

  // ── SKILLS
  sectionHead('Skills');
  const skillGroups = [
    data.skills.technical?.length ? `Technical: ${data.skills.technical.join(' • ')}` : null,
    data.skills.tools?.length     ? `Tools: ${data.skills.tools.join(' • ')}`           : null,
    data.skills.soft?.length      ? `Core: ${data.skills.soft.join(' • ')}`             : null,
  ].filter(Boolean);
  setFont('normal', 10);
  setColor(40, 40, 40);
  skillGroups.forEach(group => {
    const lines = doc.splitTextToSize(group, CW);
    spaceCheck(lines.length * 13);
    doc.text(lines, MARGIN, y);
    y += lines.length * 13 + 4;
  });
  y += 8;

  // ── EXPERIENCE
  sectionHead('Experience');
  data.experience?.forEach(exp => {
    spaceCheck(60);
    setFont('bold', 11);
    setColor(15, 15, 15);
    doc.text(exp.title, MARGIN, y);
    setFont('normal', 9.5);
    setColor(80, 80, 80);
    const dateStr = `${exp.start_date} – ${exp.end_date}`;
    doc.text(dateStr, PAGE_W - MARGIN, y, { align: 'right' });
    y += 13;
    setFont('italic', 10);
    setColor(60, 60, 60);
    const compLine = [exp.company, exp.location].filter(Boolean).join(', ');
    doc.text(compLine, MARGIN, y);
    y += 12;
    exp.bullets?.forEach(bullet => {
      const lines = doc.splitTextToSize(`•  ${bullet}`, CW - 10);
      spaceCheck(lines.length * 12 + 3);
      setFont('normal', 10);
      setColor(40, 40, 40);
      doc.text(lines, MARGIN + 6, y);
      y += lines.length * 12 + 2;
    });
    y += 8;
  });

  // ── EDUCATION
  sectionHead('Education');
  data.education?.forEach(edu => {
    spaceCheck(48);
    setFont('bold', 11);
    setColor(15, 15, 15);
    doc.text(`${edu.degree} in ${edu.field}`, MARGIN, y);
    setFont('normal', 9.5);
    setColor(80, 80, 80);
    doc.text(`${edu.start_year} – ${edu.end_year}`, PAGE_W - MARGIN, y, { align: 'right' });
    y += 13;
    setFont('italic', 10);
    setColor(60, 60, 60);
    const institutionLine = [edu.institution, edu.location].filter(Boolean).join(', ');
    doc.text(institutionLine, MARGIN, y);
    y += 13;
    if (edu.gpa) {
      setFont('normal', 10);
      setColor(80, 80, 80);
      doc.text(`GPA: ${edu.gpa}`, MARGIN, y);
      y += 13;
    }
    edu.highlights?.forEach(h => {
      setFont('normal', 10);
      setColor(40, 40, 40);
      const lines = doc.splitTextToSize(`•  ${h}`, CW - 10);
      doc.text(lines, MARGIN + 6, y);
      y += lines.length * 12;
    });
    y += 8;
  });

  // ── PROJECTS
  if (data.projects?.length) {
    sectionHead('Projects');
    data.projects.forEach(proj => {
      spaceCheck(50);
      setFont('bold', 10.5);
      setColor(15, 15, 15);
      doc.text(proj.name, MARGIN, y);
      y += 13;
      const descLines = doc.splitTextToSize(proj.description, CW);
      setFont('normal', 10);
      setColor(40, 40, 40);
      doc.text(descLines, MARGIN, y);
      y += descLines.length * 12 + 3;
      if (proj.tech_stack?.length) {
        setFont('italic', 9.5);
        setColor(80, 80, 80);
        doc.text(`Tech: ${proj.tech_stack.join(', ')}`, MARGIN, y);
        y += 12;
      }
      y += 6;
    });
  }

  // ── CERTIFICATIONS
  if (data.certifications?.length) {
    sectionHead('Certifications');
    data.certifications.forEach(cert => {
      spaceCheck(18);
      setFont('normal', 10);
      setColor(40, 40, 40);
      const certLine = `•  ${cert.name} — ${cert.issuer}${cert.year ? ' (' + cert.year + ')' : ''}`;
      doc.text(certLine, MARGIN + 6, y);
      y += 14;
    });
  }

  // ── SAVE
  const safeName  = (data.contact.name || 'Resume').replace(/\s+/g, '_');
  const safeTitle = (data.meta?.detected_job_title || 'ATS').replace(/[^a-zA-Z0-9_]/g, '_');
  doc.save(`${safeName}_${safeTitle}_Resume.pdf`);
}
