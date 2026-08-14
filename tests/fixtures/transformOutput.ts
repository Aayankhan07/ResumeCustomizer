import type { TransformOutput } from '@/lib/schemas';

/**
 * A complete, schema-valid transform result.
 *
 * Typed as TransformOutput so that if the schema changes, this fixture fails
 * to compile rather than silently drifting out of sync with production data.
 * Tests that assert rendering behaviour should build on this rather than
 * hand-rolling partial objects.
 */
export const validTransformOutput: TransformOutput = {
  contact: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    location: 'New York, NY',
    linkedin: 'linkedin.com/in/johndoe',
    github: null,
    portfolio: null,
  },
  summary: 'Talented engineer.',
  skills: {
    technical: ['Python', 'SQL'],
    tools: ['Docker'],
    soft: ['Leadership'],
  },
  experience: [
    {
      company: 'Aayankhan07 Corp',
      title: 'Software Engineer',
      start_date: 'Jan 2020',
      end_date: 'Present',
      bullets: ['Developed code.', 'Fixed bugs.'],
      location: 'Remote',
    },
  ],
  education: [
    {
      institution: 'MIT',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      start_year: '2016',
      end_year: '2020',
    },
  ],
  projects: [
    {
      title: 'Resume Optimizer',
      description: 'An ATS-focused resume tailoring tool.',
      bullets: ['Built the scoring engine.', 'Shipped PDF export.'],
    },
  ],
  recruiter_scan: {
    strong_yes: 'Strong Python background.',
    completely_missed: 'No mention of Kubernetes.',
    elevator_pitch: 'Engineer with data platform depth.',
  },
  roadmap: {
    tasks: [
      { task: 'Add Kubernetes exposure', type: 'skill', impact: 'high', points: 10 },
    ],
  },
  ats_quality: {
    keyword_density: 'Optimal',
    section_headings: 'Standard',
    formatting_risk: 'Zero Flags',
  },
  rewrites: [
    { section: 'summary', before: 'Did stuff.', after: 'Delivered measurable outcomes.' },
  ],
  interview_prep: {
    technical: [
      { question: 'Explain indexing.', difficulty: 'medium', expectation: 'B-tree fundamentals.' },
    ],
    behavioral: [
      { question: 'Describe a conflict.', difficulty: 'easy', expectation: 'STAR format.' },
    ],
    curveball: [
      { question: 'Why manholes round?', difficulty: 'hard', expectation: 'Reasoned answer.' },
    ],
  },
  cover_letter: 'Dear Hiring Manager, ...',
  meta: {
    detected_job_title: 'Software Engineer',
    detected_company: 'Example Inc',
    match_score: 82,
    keywords_matched: ['python'],
    keywords_total: 2,
    keywords_missing: ['kubernetes'],
    optimization_mode: 'description',
  },
};
