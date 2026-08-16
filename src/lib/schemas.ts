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
  // ── Enrichments below.
  //
  // These were all strictly required, so one malformed field — a roadmap task
  // with a string "points", an ats_quality value outside the enum — threw away
  // an otherwise complete resume that cost 20-60s and a paid model call. The
  // tailored resume above is the product; these are extras.
  //
  // `.catch(null)` degrades a malformed enrichment to null instead of failing
  // the whole parse. Every consumer already renders an absent state for these,
  // since fabricated fallbacks were removed earlier.
  recruiter_scan: z.object({
    strong_yes: z.string(),
    completely_missed: z.string(),
    elevator_pitch: z.string(),
  }).nullable().catch(null),
  roadmap: z.object({
    tasks: z.array(z.object({
      task: z.string(),
      type: z.string(),
      impact: z.string(),
      points: z.number(),
    })),
  }).nullable().catch(null),
  ats_quality: z.object({
    keyword_density: z.enum(['Optimal', 'Low', 'High']),
    section_headings: z.enum(['Standard', 'Non-standard']),
    formatting_risk: z.enum(['Zero Flags', 'Minor Issues', 'At Risk']),
  }).nullable().catch(null),
  rewrites: z.array(z.object({
    section: z.string(),
    before: z.string(),
    after: z.string(),
  })).nullable().catch(null),
  interview_prep: z.object({
    technical: z.array(z.object({ question: z.string(), difficulty: z.string(), expectation: z.string() })),
    behavioral: z.array(z.object({ question: z.string(), difficulty: z.string(), expectation: z.string() })),
    curveball: z.array(z.object({ question: z.string(), difficulty: z.string(), expectation: z.string() })),
  }).nullable().catch(null),
  cover_letter: z.string().nullable().catch(null),
  meta: z.object({
    detected_job_title: z.string(),
    detected_company: z.string(),
    match_score: z.number().optional().nullable(),
    // The original resume's score against the same JD, attached server-side.
    // Optional because the model never produces it and older rows predate it.
    baseline_score: z.number().optional().nullable(),
    keywords_matched: z.array(z.string()).optional().nullable(),
    keywords_total: z.number().optional().nullable(),
    keywords_missing: z.array(z.string()).optional().nullable(),
    optimization_mode: z.string().optional().nullable(),
  }),

  // Attached server-side after validation so history and rescoring can reach
  // the original inputs. Optional because the model never produces them; they
  // were previously written via `as any` casts, which is why rescore could
  // silently read undefined from older rows.
  original_resume_text: z.string().optional(),
  original_job_description: z.string().optional(),
});

export type TransformOutput = z.infer<typeof TransformOutputSchema>;
