import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';

// Helper to make a section heading
const createHeading = (text) => {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 180, after: 80 },
    keepWithNext: true,
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 24, // 12pt
        font: "Calibri",
        color: "1A365D", // Dark navy accent
      }),
    ],
  });
};

// Helper for bold run
const boldRun = (text, size = 20) => new TextRun({ text, bold: true, font: "Calibri", size });

// Helper for normal run
const normalRun = (text, size = 20) => new TextRun({ text, font: "Calibri", size });

// Helper for italic run
const italicRun = (text, size = 18) => new TextRun({ text, italic: true, font: "Calibri", size });

export async function generateResumeDOCX(data) {
  const { contact, summary, skills, experience, education, projects, certifications } = data;

  const docChildren = [];

  // 1. Name
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: contact.name,
          bold: true,
          size: 36, // 18pt
          font: "Calibri",
          color: "0F172A",
        }),
      ],
    })
  );

  // 2. Contact details
  const contactParts = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.github,
    contact.portfolio,
  ].filter(Boolean);

  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: contactParts.join("  |  "),
          size: 19, // 9.5pt
          font: "Calibri",
          color: "475569",
        }),
      ],
    })
  );

  // 3. Summary
  if (summary) {
    docChildren.push(createHeading("Summary"));
    docChildren.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [normalRun(summary)],
      })
    );
  }

  // 4. Skills
  if (skills?.technical?.length || skills?.tools?.length || skills?.soft?.length) {
    docChildren.push(createHeading("Skills"));
    
    if (skills.technical?.length > 0) {
      docChildren.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            boldRun("Technical: "),
            normalRun(skills.technical.join(" · ")),
          ],
        })
      );
    }
    
    if (skills.tools?.length > 0) {
      docChildren.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            boldRun("Tools: "),
            normalRun(skills.tools.join(" · ")),
          ],
        })
      );
    }

    if (skills.soft?.length > 0) {
      docChildren.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [
            boldRun("Core: "),
            normalRun(skills.soft.join(" · ")),
          ],
        })
      );
    }
  }

  // 5. Experience
  if (experience?.length > 0) {
    docChildren.push(createHeading("Experience"));
    experience.forEach((exp) => {
      // Title and Date
      docChildren.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [
            boldRun(exp.title),
            new TextRun({ text: "\t", tab: true }),
            boldRun(`${exp.start_date} – ${exp.end_date}`),
          ],
        })
      );

      // Company and Location
      docChildren.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            italicRun([exp.company, exp.location].filter(Boolean).join(", ")),
          ],
        })
      );

      // Bullets
      if (exp.bullets?.length > 0) {
        exp.bullets.forEach((bullet) => {
          docChildren.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 40 },
              children: [normalRun(bullet)],
            })
          );
        });
      }
    });
  }

  // 6. Projects
  if (projects?.length > 0) {
    docChildren.push(createHeading("Projects"));
    projects.forEach((proj) => {
      // Title
      docChildren.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [
            boldRun(proj.name),
            proj.link ? normalRun(` (↗ ${proj.link})`) : normalRun(""),
          ],
        })
      );

      // Description
      docChildren.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [normalRun(proj.description)],
        })
      );

      // Tech Stack
      if (proj.tech_stack?.length > 0) {
        docChildren.push(
          new Paragraph({
            spacing: { after: 85 },
            children: [
              boldRun("Tech Stack: ", 18),
              italicRun(proj.tech_stack.join(", "), 18),
            ],
          })
        );
      }
    });
  }

  // 7. Education
  if (education?.length > 0) {
    docChildren.push(createHeading("Education"));
    education.forEach((edu) => {
      docChildren.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [
            boldRun(`${edu.degree} in ${edu.field}`),
            new TextRun({ text: "\t", tab: true }),
            boldRun(`${edu.start_year} – ${edu.end_year}`),
          ],
        })
      );

      docChildren.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            italicRun([edu.institution, edu.location].filter(Boolean).join(", ")),
            edu.gpa ? normalRun(`  |  GPA: ${edu.gpa}`) : normalRun(""),
          ],
        })
      );

      if (edu.highlights?.length > 0) {
        edu.highlights.forEach((hl) => {
          docChildren.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 30 },
              children: [normalRun(hl, 18)],
            })
          );
        });
      }
    });
  }

  // 8. Certifications
  if (certifications?.length > 0) {
    docChildren.push(createHeading("Certifications"));
    certifications.forEach((cert) => {
      docChildren.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 40 },
          children: [
            boldRun(cert.name),
            normalRun(` — ${cert.issuer}`),
            cert.year ? italicRun(` (${cert.year})`) : normalRun(""),
          ],
        })
      );
    });
  }

  // Compile Document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const element = document.createElement("a");
  element.href = url;
  element.download = `${contact.name.replace(/\s+/g, '_')}_Tailored_Resume.docx`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  URL.revokeObjectURL(url);
}
