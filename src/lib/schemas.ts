import { z } from "zod";

export const ContactSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable(),
  github: z.string().optional().nullable(),
  portfolio: z.string().optional().nullable(),
});

export const TransformOutputSchema = z.object({
  contact: ContactSchema,
  summary: z.string(),
  skills: z.object({
    technical: z.array(z.string()),
    tools: z.array(z.string()).optional().nullable(),
    soft: z.array(z.string()).optional().nullable(),
  }),
  experience: z.array(z.object({
    company: z.string(),
    title: z.string(),
    start_date: z.string(),
    end_date: z.string(),
    bullets: z.array(z.string()),
    location: z.string().optional().nullable(),
  })),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    field: z.string(),
    start_year: z.string(),
    end_year: z.string(),
  })),
  projects: z.array(z.object({
    title: z.string(),
    description: z.string(),
    bullets: z.array(z.string()),
  })).optional().nullable(),
  recruiter_scan: z.object({
    strong_yes: z.string(),
    completely_missed: z.string(),
    elevator_pitch: z.string(),
  }),
  roadmap: z.object({
    tasks: z.array(z.object({
      task: z.string(),
      type: z.string(),
      impact: z.string(),
      points: z.number(),
    })),
  }),
  ats_quality: z.object({
    keyword_density: z.enum(['Optimal', 'Low', 'High']),
    section_headings: z.enum(['Standard', 'Non-standard']),
    formatting_risk: z.enum(['Zero Flags', 'Minor Issues', 'At Risk']),
  }),
  rewrites: z.array(z.object({
    section: z.string(),
    before: z.string(),
    after: z.string(),
  })),
  interview_prep: z.object({
    technical: z.array(z.object({ question: z.string(), difficulty: z.string(), expectation: z.string() })),
    behavioral: z.array(z.object({ question: z.string(), difficulty: z.string(), expectation: z.string() })),
    curveball: z.array(z.object({ question: z.string(), difficulty: z.string(), expectation: z.string() })),
  }),
  cover_letter: z.string(),
  meta: z.object({
    detected_job_title: z.string(),
    detected_company: z.string(),
    match_score: z.number().optional().nullable(),
    keywords_matched: z.array(z.string()).optional().nullable(),
    keywords_total: z.number().optional().nullable(),
    keywords_missing: z.array(z.string()).optional().nullable(),
  }).optional(),
});

export type TransformOutput = z.infer<typeof TransformOutputSchema>;
