import { z } from 'zod';
import { RESUME_LIMITS, JD_LIMITS, JOB_TITLE_LIMITS } from '../limits';

/**
 * Request schemas for every mutating API route.
 *
 * Validation used to be inverted here: the LLM's *output* was rigorously
 * zod-validated while user *input* was hand-checked or not checked at all.
 * The PATCH routes in particular copied every provided key straight into the
 * update object, so a client could write columns the UI never exposes.
 *
 * PATCH bodies use .strictObject() so unknown keys are rejected rather than
 * silently forwarded to the database.
 */

// ── /api/transform

export const transformRequestSchema = z
  .object({
    resume_text: z
      .string()
      .trim()
      .min(RESUME_LIMITS.min, `Resume must be at least ${RESUME_LIMITS.min} characters`)
      .max(RESUME_LIMITS.max, `Resume must be at most ${RESUME_LIMITS.max} characters`),
    job_description_text: z.string().trim().min(1),
    optimization_mode: z.enum(['description', 'title']).default('description'),
  })
  .superRefine((data, ctx) => {
    // The job description field carries either a full description or a bare
    // job title, with very different length expectations.
    const limits = data.optimization_mode === 'title' ? JOB_TITLE_LIMITS : JD_LIMITS;
    const length = data.job_description_text.length;

    if (length < limits.min || length > limits.max) {
      ctx.addIssue({
        code: 'custom',
        path: ['job_description_text'],
        message:
          data.optimization_mode === 'title'
            ? `Job title must be ${limits.min}-${limits.max} characters`
            : `Job description must be ${limits.min}-${limits.max} characters`,
      });
    }
  });

// ── /api/rescore

export const rescoreRequestSchema = z.strictObject({
  transformation_id: z.string().uuid(),
  // Bounded: unbounded weights let a client fabricate any score they like.
  weights: z
    .strictObject({
      techDepth: z.number().min(0).max(2).optional(),
      conciseness: z.number().min(0).max(2).optional(),
      industryFocus: z.number().min(0).max(2).optional(),
    })
    .optional(),
});

// ── /api/events

const EVENT_TYPES = ['interview', 'follow_up', 'note'] as const;
const OUTCOMES = ['Pending', 'Completed', 'Passed', 'Failed', 'Cancelled'] as const;

export const createEventSchema = z.strictObject({
  transformation_id: z.string().uuid(),
  event_type: z.enum(EVENT_TYPES),
  title: z.string().trim().min(1).max(200),
  event_date: z.string().datetime({ offset: true }).nullish(),
  interview_round: z.string().trim().max(100).nullish(),
  interview_format: z.string().trim().max(100).nullish(),
  interviewer_name: z.string().trim().max(200).nullish(),
  notes: z.string().trim().max(5000).nullish(),
});

export const updateEventSchema = z
  .strictObject({
    title: z.string().trim().min(1).max(200).optional(),
    event_date: z.string().datetime({ offset: true }).nullish(),
    interview_round: z.string().trim().max(100).nullish(),
    interview_format: z.string().trim().max(100).nullish(),
    interviewer_name: z.string().trim().max(200).nullish(),
    notes: z.string().trim().max(5000).nullish(),
    outcome: z.enum(OUTCOMES).optional(),
    is_done: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const eventsQuerySchema = z.object({
  // parseInt with no guard previously let ?days=abc through as NaN.
  days: z.coerce.number().int().min(1).max(365).default(14),
});

// ── /api/transformations/[id]

const STATUSES = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn'] as const;
const PRIORITIES = ['High', 'Medium', 'Low'] as const;

export const updateTransformationSchema = z
  .strictObject({
    status: z.enum(STATUSES).optional(),
    applied_at: z.string().datetime({ offset: true }).nullish(),
    application_deadline: z.string().datetime({ offset: true }).nullish(),
    // Validated as a URL and restricted to http(s): this value is later
    // rendered as a link, so javascript: and data: must not reach the DB.
    application_url: z
      .string()
      .url()
      .refine((u) => /^https?:\/\//i.test(u), 'Must be an http(s) URL')
      .nullish(),
    job_location: z.string().trim().max(200).nullish(),
    salary_range: z.string().trim().max(100).nullish(),
    recruiter_name: z.string().trim().max(200).nullish(),
    recruiter_contact: z.string().trim().max(200).nullish(),
    priority: z.enum(PRIORITIES).optional(),
    source: z.string().trim().max(100).nullish(),
    is_archived: z.boolean().optional(),
    label: z.string().trim().max(200).nullish(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const uuidParamSchema = z.string().uuid();
