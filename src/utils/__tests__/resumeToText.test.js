import { describe, it, expect } from 'vitest';
import { resumeToPlainText } from '../../lib/resumeToText.ts';

describe('resumeToPlainText', () => {
  it('concatenates all sections into formatted plain text', () => {
    const data = {
      contact: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        location: 'New York, NY',
      },
      summary: 'Talented engineer.',
      skills: {
        technical: ['Python', 'SQL'],
        tools: ['Docker'],
        soft: ['Leadership'],
      },
      experience: [
        {
          title: 'Software Engineer',
          company: 'Aayankhan07 Corp',
          location: 'Remote',
          start_date: 'Jan 2020',
          end_date: 'Present',
          bullets: ['Developed code.', 'Fixed bugs.'],
        }
      ],
      education: [
        {
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          institution: 'MIT',
          location: 'Boston, MA',
          start_year: '2016',
          end_year: '2020',
        }
      ]
    };

    const res = resumeToPlainText(data);
    expect(res).toContain('JOHN DOE');
    expect(res).toContain('john@example.com | 123-456-7890 | New York, NY');
    expect(res).toContain('SUMMARY');
    expect(res).toContain('SKILLS');
    expect(res).toContain('EXPERIENCE');
    expect(res).toContain('EDUCATION');
  });
});
