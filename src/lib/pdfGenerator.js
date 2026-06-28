import jsPDF from 'jspdf';

export function generateResumePDF(data, templateId = 'classic', pageBudget = 'standard') {
  const doc = new jsPDF({ unit: 'pt', format: 'letter', compress: true });
  const PAGE_W  = 612;
  const PAGE_H  = 792;
  
  // ── BUDGET CONFIGURATION
  const isFit = pageBudget === 'fit';
  const MARGIN = isFit ? 36 : 54; // 0.5" (36pt) vs 0.75" (54pt)
  const CW = PAGE_W - MARGIN * 2;
  let y = MARGIN;

  const newPage = () => { doc.addPage(); y = MARGIN; };
  const spaceCheck = (h) => { if (y + h > PAGE_H - MARGIN) newPage(); };

  // ── TYPOGRAPHY & SPACING SETUP
  const fontMain = (templateId === 'classic' || templateId === 'executive') ? 'times' : 'helvetica';
  const fontHeader = (templateId === 'tech') ? 'courier' : fontMain;

  // Spacing scales based on page budget
  const hText = isFit ? 10.5 : 13;       // line height for normal text
  const hBullet = isFit ? 9.5 : 12;      // line height for bullet points
  const gapSection = isFit ? 8 : 15;     // gap after sections
  const gapBullet = isFit ? 1 : 2.5;     // gap between bullet points
  const gapItem = isFit ? 4 : 10;        // gap between experiences/projects
  const gapTitle = isFit ? 10 : 16;      // gap after main header name

  // Helper to set font and size quickly
  const setFont = (style, size) => doc.setFont(fontMain, style).setFontSize(size);
  const setHeaderFont = (style, size) => doc.setFont(fontHeader, style).setFontSize(size);
  const setColor = (r, g, b) => doc.setTextColor(r, g, b);

  // ── DRAW RULE / DIVIDER BASED ON TEMPLATE
  const drawSectionDivider = () => {
    if (templateId === 'classic') {
      doc.setDrawColor(30, 30, 30).setLineWidth(0.75);
      doc.line(MARGIN, y, PAGE_W - MARGIN, y);
      y += isFit ? 10 : 14;
    } else if (templateId === 'modern') {
      doc.setDrawColor(203, 213, 225).setLineWidth(0.5); // light slate border
      doc.line(MARGIN, y, PAGE_W - MARGIN, y);
      y += isFit ? 10 : 14;
    } else if (templateId === 'executive') {
      doc.setDrawColor(148, 163, 184).setLineWidth(0.5); // very thin border
      doc.line(MARGIN, y, PAGE_W - MARGIN, y);
      y += isFit ? 10 : 14;
    } else if (templateId === 'tech') {
      // Clean Tech template uses a vertical sidebar accent instead of a horizontal rule
      y += isFit ? 6 : 10;
    }
  };

  // ── DRAW SECTION HEADER
  const sectionHead = (title) => {
    spaceCheck(isFit ? 30 : 45); // prevent orphaning headers
    y += isFit ? 6 : 10;

    if (templateId === 'tech') {
      // Clean Tech: Vertical Accent Block on left
      doc.setFillColor(15, 23, 42); // dark slate/black solid bar
      const barH = isFit ? 11 : 13;
      doc.rect(MARGIN, y - 9, 3, barH, 'F');
      
      setHeaderFont('bold', isFit ? 9.5 : 10.5);
      setColor(15, 23, 42);
      doc.text(title.toUpperCase(), MARGIN + 8, y);
      y += isFit ? 14 : 18;
    } else if (templateId === 'executive') {
      // Executive: Centered elegant header
      setFont('normal', isFit ? 9.5 : 10.5);
      setColor(30, 41, 59);
      // Letter spacing simulation for centered title
      const spacedTitle = title.toUpperCase().split('').join(' ');
      doc.text(spacedTitle, PAGE_W / 2, y, { align: 'center' });
      y += isFit ? 4 : 6;
      drawSectionDivider();
    } else if (templateId === 'modern') {
      // Modern: Left-aligned clean bold
      setFont('bold', isFit ? 9.5 : 10.5);
      setColor(15, 23, 42);
      doc.text(title.toUpperCase(), MARGIN, y);
      y += isFit ? 4 : 6;
      drawSectionDivider();
    } else {
      // Classic: Traditional centered or left serif
      setFont('bold', isFit ? 9.5 : 10.5);
      setColor(15, 15, 15);
      doc.text(title.toUpperCase(), MARGIN, y);
      y += isFit ? 4 : 6;
      drawSectionDivider();
    }
  };

  // ── DRAW HEADER (NAME & CONTACT INFO)
  spaceCheck(isFit ? 40 : 60);

  // Name Drawing
  if (templateId === 'classic') {
    setFont('bold', isFit ? 18 : 22);
    setColor(15, 15, 15);
    doc.text(data.contact.name, PAGE_W / 2, y, { align: 'center' });
    y += isFit ? 12 : 16;
  } else if (templateId === 'executive') {
    setFont('normal', isFit ? 18 : 22);
    setColor(30, 41, 59);
    const spacedName = data.contact.name.toUpperCase().split('').join(' ');
    doc.text(spacedName, PAGE_W / 2, y, { align: 'center' });
    y += isFit ? 12 : 16;
  } else if (templateId === 'modern') {
    setFont('bold', isFit ? 18 : 22);
    setColor(15, 23, 42);
    doc.text(data.contact.name, MARGIN, y);
    y += isFit ? 11 : 15;
  } else if (templateId === 'tech') {
    setHeaderFont('bold', isFit ? 18 : 22);
    setColor(15, 23, 42);
    doc.text(data.contact.name, MARGIN, y);
    y += isFit ? 11 : 15;
  }

  // Contact Details Drawing
  const contactParts = [
    data.contact.email,
    data.contact.phone,
    data.contact.location,
    data.contact.linkedin ? data.contact.linkedin.replace(/^(https?:\/\/)?(www\.)?/, '') : null,
    data.contact.github ? data.contact.github.replace(/^(https?:\/\/)?(www\.)?/, '') : null,
    data.contact.portfolio ? data.contact.portfolio.replace(/^(https?:\/\/)?(www\.)?/, '') : null,
  ].filter(Boolean);

  const contactText = contactParts.join(templateId === 'executive' ? '  ·  ' : '  |  ');
  const isCentered = templateId === 'classic' || templateId === 'executive';

  if (templateId === 'tech') {
    setHeaderFont('normal', isFit ? 8 : 9);
  } else {
    setFont('normal', isFit ? 8 : 9);
  }
  setColor(71, 85, 105); // slate-600

  const contactLines = doc.splitTextToSize(contactText, CW);
  contactLines.forEach((line) => {
    if (isCentered) {
      doc.text(line, PAGE_W / 2, y, { align: 'center' });
    } else {
      doc.text(line, MARGIN, y);
    }
    y += isFit ? 10 : 13;
  });
  y += isFit ? 8 : 12;

  // ── SUMMARY SECTION
  if (data.summary) {
    sectionHead('Summary');
    setFont('normal', isFit ? 9 : 10);
    setColor(30, 41, 59);
    
    const summaryLines = doc.splitTextToSize(data.summary, CW);
    spaceCheck(summaryLines.length * hText);
    doc.text(summaryLines, MARGIN, y);
    y += summaryLines.length * hText + gapSection;
  }

  // ── SKILLS SECTION
  if (data.skills?.technical?.length || data.skills?.tools?.length || data.skills?.soft?.length) {
    sectionHead('Skills');
    setFont('normal', isFit ? 9 : 10);
    setColor(30, 41, 59);

    const skillGroups = [
      data.skills.technical?.length ? { label: 'Technical', list: data.skills.technical.join(', ') } : null,
      data.skills.tools?.length ? { label: 'Tools & Platforms', list: data.skills.tools.join(', ') } : null,
      data.skills.soft?.length ? { label: 'Core Capabilities', list: data.skills.soft.join(', ') } : null
    ].filter(Boolean);

    skillGroups.forEach(group => {
      const fullText = `${group.label}: ${group.list}`;
      const lines = doc.splitTextToSize(fullText, CW);
      spaceCheck(lines.length * hText);
      doc.text(lines, MARGIN, y);
      y += lines.length * hText + 3;
    });
    y += gapSection - 3;
  }

  // ── EXPERIENCE SECTION
  if (data.experience?.length) {
    sectionHead('Experience');
    data.experience.forEach((exp, idx) => {
      spaceCheck(isFit ? 45 : 60); // check space for heading + at least 1 bullet
      
      // Job Title and Date
      setFont('bold', isFit ? 9.5 : 10.5);
      setColor(15, 23, 42);
      doc.text(exp.title, MARGIN, y);

      setFont('normal', isFit ? 8.5 : 9.5);
      setColor(100, 116, 139); // gray-500
      const dateStr = `${exp.start_date} – ${exp.end_date}`;
      doc.text(dateStr, PAGE_W - MARGIN, y, { align: 'right' });
      
      y += isFit ? 11 : 13;

      // Company and Location
      setFont('italic', isFit ? 9 : 10);
      setColor(71, 85, 105);
      const compLine = [exp.company, exp.location].filter(Boolean).join(', ');
      doc.text(compLine, MARGIN, y);
      y += isFit ? 10 : 12;

      // Bullets
      exp.bullets?.forEach(bullet => {
        let bulletMarker = '•  ';
        if (templateId === 'modern') bulletMarker = '–  ';
        if (templateId === 'tech') bulletMarker = '>  ';
        if (templateId === 'executive') bulletMarker = '▪  ';

        const lines = doc.splitTextToSize(`${bulletMarker}${bullet}`, CW - 20);
        spaceCheck(lines.length * hBullet + gapBullet);
        
        // Bullet styling
        if (templateId === 'tech') {
          setHeaderFont('normal', isFit ? 9 : 10);
        } else {
          setFont('normal', isFit ? 9 : 10);
        }
        setColor(30, 41, 59);
        doc.text(lines, MARGIN + 10, y);
        y += lines.length * hBullet + gapBullet;
      });

      y += gapItem;
    });
    y += gapSection - gapItem;
  }

  // ── EDUCATION SECTION
  if (data.education?.length) {
    sectionHead('Education');
    data.education.forEach((edu, idx) => {
      spaceCheck(isFit ? 35 : 45);

      // Degree/Field and Dates
      setFont('bold', isFit ? 9.5 : 10.5);
      setColor(15, 23, 42);
      doc.text(`${edu.degree} in ${edu.field}`, MARGIN, y);

      setFont('normal', isFit ? 8.5 : 9.5);
      setColor(100, 116, 139);
      doc.text(`${edu.start_year} – ${edu.end_year}`, PAGE_W - MARGIN, y, { align: 'right' });
      
      y += isFit ? 11 : 13;

      // Institution and Location
      setFont('italic', isFit ? 9 : 10);
      setColor(71, 85, 105);
      const instLine = [edu.institution, edu.location].filter(Boolean).join(', ');
      doc.text(instLine, MARGIN, y);
      y += isFit ? 10 : 12;

      if (edu.gpa) {
        setFont('normal', isFit ? 9 : 10);
        setColor(71, 85, 105);
        doc.text(`GPA: ${edu.gpa}`, MARGIN, y);
        y += isFit ? 10 : 12;
      }

      edu.highlights?.forEach(h => {
        let bulletMarker = '•  ';
        if (templateId === 'modern') bulletMarker = '–  ';
        if (templateId === 'tech') bulletMarker = '>  ';
        if (templateId === 'executive') bulletMarker = '▪  ';

        const lines = doc.splitTextToSize(`${bulletMarker}${h}`, CW - 12);
        spaceCheck(lines.length * hBullet + gapBullet);
        setFont('normal', isFit ? 9 : 10);
        setColor(30, 41, 59);
        doc.text(lines, MARGIN + 8, y);
        y += lines.length * hBullet + gapBullet;
      });

      y += gapItem;
    });
    y += gapSection - gapItem;
  }

  // ── PROJECTS SECTION
  if (data.projects?.length) {
    sectionHead('Projects');
    data.projects.forEach((proj, idx) => {
      spaceCheck(isFit ? 35 : 45);

      // Project Name/Title and Link
      const projectTitle = proj.title || proj.name || 'Project';
      setFont('bold', isFit ? 9.5 : 10.5);
      setColor(15, 23, 42);
      doc.text(projectTitle, MARGIN, y);
      
      if (proj.link) {
        setFont('normal', isFit ? 8 : 9);
        setColor(15, 23, 42); // slate link
        const cleanLink = proj.link.replace(/^(https?:\/\/)?(www\.)?/, '');
        doc.text(cleanLink, PAGE_W - MARGIN, y, { align: 'right' });
      }

      y += isFit ? 11 : 13;

      // Description
      if (proj.description) {
        const descLines = doc.splitTextToSize(proj.description, CW);
        spaceCheck(descLines.length * hText + 3);
        setFont('normal', isFit ? 9 : 10);
        setColor(30, 41, 59);
        doc.text(descLines, MARGIN, y);
        y += descLines.length * hText + 3;
      }

      // Bullets (if present)
      proj.bullets?.forEach(bullet => {
        let bulletMarker = '•  ';
        if (templateId === 'modern') bulletMarker = '–  ';
        if (templateId === 'tech') bulletMarker = '>  ';
        if (templateId === 'executive') bulletMarker = '▪  ';

        const lines = doc.splitTextToSize(`${bulletMarker}${bullet}`, CW - 12);
        spaceCheck(lines.length * hBullet + gapBullet);
        setFont('normal', isFit ? 9 : 10);
        setColor(30, 41, 59);
        doc.text(lines, MARGIN + 8, y);
        y += lines.length * hBullet + gapBullet;
      });

      // Tech Stack
      if (proj.tech_stack?.length) {
        setFont('italic', isFit ? 8.5 : 9.5);
        setColor(100, 116, 139);
        doc.text(`Tech: ${proj.tech_stack.join(', ')}`, MARGIN, y);
        y += isFit ? 10 : 12;
      }

      y += gapItem;
    });
    y += gapSection - gapItem;
  }

  // ── CERTIFICATIONS SECTION
  if (data.certifications?.length) {
    sectionHead('Certifications');
    data.certifications.forEach((cert, idx) => {
      spaceCheck(isFit ? 12 : 16);

      let bulletMarker = '•  ';
      if (templateId === 'modern') bulletMarker = '–  ';
      if (templateId === 'tech') bulletMarker = '>  ';
      if (templateId === 'executive') bulletMarker = '▪  ';

      setFont('normal', isFit ? 9 : 10);
      setColor(30, 41, 59);
      const certText = `${cert.name} — ${cert.issuer}${cert.year ? ' (' + cert.year + ')' : ''}`;
      const lines = doc.splitTextToSize(`${bulletMarker}${certText}`, CW - 12);
      doc.text(lines, MARGIN + 8, y);
      y += lines.length * hBullet + gapBullet;
    });
  }

  // ── SAVE OPERATIONS
  const safeName = (data.contact.name || 'Resume').replace(/\s+/g, '_');
  const safeTitle = (data.meta?.detected_job_title || 'ATS').replace(/[^a-zA-Z0-9_]/g, '_');
  doc.save(`${safeName}_${safeTitle}_Resume.pdf`);
}
