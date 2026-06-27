# ResumOrph — Complete Improvement Plan & AI Agent Execution Guide

> **Project:** ResumOrph (ATS Resume Tailoring System)  
> **Stack:** React 19 + Vite, Supabase (PostgreSQL + Edge Functions), Groq Llama-3.3-70b, jsPDF, PDF.js, Mammoth  
> **Document Purpose:** Detailed per-module improvements + task-by-task agent execution plan

---

## PART 1: IMPROVEMENT ANALYSIS (By System Layer)

---

### 1. AI & Prompt Engineering

#### Current State
- Single monolithic prompt sent to Groq expecting a full structured JSON output covering 10+ sections (contact, summary, skills, experience, projects, recruiter_scan, roadmap, interview_prep, cover_letter, meta).
- Uses Llama-3.3-70b-versatile with no retry/fallback model strategy.
- No streaming — user waits for full response before anything renders.
- No prompt versioning or A/B tracking.

#### Improvements

**1.1 — Split into Chained Micro-Prompts**
Instead of one giant prompt, decompose into sequential or parallel micro-calls:
- **Call 1:** Parse & classify resume sections → structured JSON skeleton
- **Call 2:** Rewrite bullets against JD keywords → `experience` + `projects`
- **Call 3:** Generate auxiliary outputs → `recruiter_scan`, `cover_letter`, `roadmap`, `interview_prep`

This reduces hallucination risk, allows progressive UI rendering, and isolates failure points.

**1.2 — Add Streaming Support**
Groq supports SSE streaming. Pipe the Edge Function response as a stream and render tabs progressively as JSON chunks arrive. The user sees the Overview and Optimized CV within 2–3 seconds instead of waiting 8–12s.

**1.3 — Model Fallback Chain**
```
Primary: llama-3.3-70b-versatile
Fallback: llama-3.1-8b-instant (fast, cheaper)
Emergency: mixtral-8x7b
```
Implement retry logic in `groq.ts` that falls back on timeout (>10s) or 5xx errors.

**1.4 — Structured Output / JSON Schema Enforcement**
Use Groq's `response_format: { type: "json_object" }` parameter and pass the full expected JSON schema in the system prompt as a TypeScript interface comment. Add server-side Zod validation of the returned JSON before saving to DB.

**1.5 — Prompt Versioning**
Add a `prompt_version` field to the `transformations` table. Tag each run with the active prompt hash. Enables A/B comparison of prompt quality via match_score distributions.

**1.6 — Context Compression for Long Resumes**
If `input_resume_chars > 8000`, run a pre-pass to extract only structured data (name, bullets, companies, dates) and send the compressed version to reduce token waste.

---

### 2. ATS Match Score Engine

#### Current State
- Simple substring keyword matching using a 200+ stop-words filter.
- Client-side calculation duplicated server-side (sync needed via `updateTransformationScore`).
- Score can drift between client and DB requiring background healing.

#### Improvements

**2.1 — Semantic Keyword Matching (Embeddings)**
Replace substring check with cosine similarity using `text-embedding-3-small` (OpenAI) or Groq's embedding endpoint. A resume that says "built classification models" would match a JD requiring "machine learning." Pure substring misses this.

**2.2 — Phrase-Level Matching (Bigrams/Trigrams)**
Current: matches individual tokens. Improvement: extract multi-word technical phrases from JD ("cross-functional teams", "CI/CD pipelines", "A/B testing") and score those as higher-weight matches.

**2.3 — Section-Weighted Scoring**
Apply differential weights:
```
Summary section keywords: 1.5x weight
Experience bullets: 2.0x weight  
Skills section: 1.0x weight
Projects: 1.2x weight
```
This reflects how actual ATS parsers weight sections.

**2.4 — Single Source of Truth**
Move `computeMatchScore` exclusively to the Edge Function. The client calls a lightweight `/rescore` endpoint rather than re-implementing math. Eliminates drift entirely.

**2.5 — ATS Parser Simulation**
Add a preprocessing pass that mimics real ATS behavior:
- Strip special characters that ATS systems reject
- Detect table-based layouts that confuse parsers
- Flag headers/footers as ATS risk zones
- Flag graphics/icons as unreadable elements

---

### 3. Database Schema & Backend

#### Current State
- Good foundational schema with RLS, soft-deletes, GIN indexes, triggers.
- `usage_stats` uses a single-row counter (race condition risk under load).
- No caching layer — every history load hits PostgreSQL directly.
- `output_json` stored as `jsonb` (good), but no versioning.
- `rate_limits` table is cleaned by a Deno cron — fragile if cron fails.

#### Improvements

**3.1 — Fix usage_stats Race Condition**
Replace single-row increment with `INSERT ... ON CONFLICT DO UPDATE` using atomic counter:
```sql
INSERT INTO usage_stats (id, total_transformations, updated_at)
VALUES (1, 1, NOW())
ON CONFLICT (id) DO UPDATE 
SET total_transformations = usage_stats.total_transformations + 1,
    updated_at = NOW();
```

**3.2 — Add Transformation Versioning**
When a user rescores or relabels a transformation, store a `versions` JSONB array instead of overwriting. Allows undo and history diffing.
```sql
ALTER TABLE transformations ADD COLUMN versions jsonb[] DEFAULT '{}';
```

**3.3 — Add `tags` Column for User Organization**
```sql
ALTER TABLE transformations ADD COLUMN tags text[] DEFAULT '{}';
```
Users can tag runs as "Applied", "Interview Scheduled", "Rejected" — turns history into a job tracker.

**3.4 — Materialized View for Dashboard Stats**
Replace per-request stats aggregation with a materialized view refreshed every 5 minutes:
```sql
CREATE MATERIALIZED VIEW user_dashboard_stats AS
SELECT user_id,
       COUNT(*) FILTER (WHERE NOT is_deleted) as total,
       MAX(match_score) as best_score,
       AVG(match_score)::int as avg_score,
       MAX(created_at) as last_run
FROM transformations
GROUP BY user_id;
```

**3.5 — Add Supabase Realtime for Progress Updates**
Use Supabase Realtime channels to push transformation status from Edge Function → client, enabling a live progress bar instead of a static loading spinner.

**3.6 — Harden Rate Limiting**
Add a `pg_cron` scheduled cleanup as backup to the Deno cron:
```sql
SELECT cron.schedule('cleanup-rate-limits', '*/30 * * * *', 
  $$DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL '2 hours'$$);
```

---

### 4. Edge Functions & API Layer

#### Current State
- Single `transform` edge function handles auth + validation + LLM call + DB write in one pass.
- `matchScore.ts` duplicated between `_shared/` and `src/utils/`.
- No request deduplication — double-click on "Transform" can fire two simultaneous Groq calls.
- Error messages returned to client are generic.

#### Improvements

**4.1 — Idempotency Keys**
Generate an idempotency key client-side (hash of resume text + JD text) and pass it as a header. Edge Function checks if a transformation with matching hash exists in the last 5 minutes and returns cached result instead of re-running Groq.

**4.2 — Split Edge Functions**
```
/transform      → parse + rewrite (core pipeline, heavy)
/rescore        → re-run match scoring only (lightweight)
/cover-letter   → regenerate cover letter only
/interview-prep → regenerate interview questions only
```
This allows individual tab regeneration without re-running the entire pipeline.

**4.3 — Rich Error Taxonomy**
Return structured error codes instead of generic strings:
```typescript
type TransformError = 
  | { code: 'RATE_LIMITED'; retry_after: number }
  | { code: 'CONTENT_TOO_LONG'; max: number; actual: number }
  | { code: 'AI_TIMEOUT'; attempted_model: string }
  | { code: 'PARSE_FAILED'; section: string }
  | { code: 'INVALID_JD' }
```
Map these in `TransformErrorPanel.jsx` to human-friendly, actionable messages.

**4.4 — Request Timeout + Circuit Breaker**
Add `AbortController` with 30s timeout on the Groq fetch. Implement exponential backoff for 429 rate-limit responses (Groq's free tier limits apply).

**4.5 — Eliminate Code Duplication**
Remove `matchScore.ts` from `_shared/` — the score should be computed client-side only (or server-side only). Pick one canonical location. Currently both exist and a sync step is needed, which is fragile.

---

### 5. Frontend Architecture

#### Current State
- Good component decomposition with clear separation (wizard → workspace → tabs).
- `useTransform.js` manages wizard states, scoring, and auto-retries — too many responsibilities.
- No global state management (only AuthContext) — prop-drilling risk as features grow.
- No optimistic UI updates.
- No offline handling or service worker.

#### Improvements

**5.1 — Split `useTransform.js` into Focused Hooks**
```
useWizard.js        → step navigation, file upload, JD input state
useTransformSubmit.js → API call, retry, loading/error state
useWorkspace.js     → active tab, style config, template selection
useRescore.js       → slider state, rescore API calls
```

**5.2 — Add Zustand for Shared State**
AuthContext is fine for auth. For the workspace (active transformation, tab state, template selection), add Zustand — lightweight and avoids prop-drilling across `TransformOutput → WorkspaceSidebar → tabs/*`.

**5.3 — Optimistic History Updates**
When a transformation completes, immediately prepend it to the history list in the Dashboard instead of waiting for a refetch. Roll back on error.

**5.4 — Virtual List for History**
If a user has 50+ transformations, the history list will be slow. Use `@tanstack/react-virtual` to virtualize `TransformationRow` rendering.

**5.5 — Keyboard Navigation in Workspace**
Add `ArrowLeft/Right` keyboard shortcuts to switch sidebar tabs. Add `Cmd+D` to download PDF. Power users (developers applying to many jobs) will love this.

**5.6 — Add React Query / TanStack Query**
Replace manual fetch logic in `useHistory.js` and `api.js` with React Query for:
- Automatic background refetch
- Cache invalidation on new transformation
- Pagination + infinite scroll for history
- Optimistic mutations

---

### 6. PDF Generation

#### Current State
- `jsPDF` renders four templates (Classic, Modern, Tech, Executive) client-side.
- Single-page fit via font/margin compression.
- No DOCX export — only PDF and plain text.

#### Improvements

**6.1 — Add DOCX Export**
Many recruiters prefer editable Word documents. Use `docx-js` (npm: `docx`) to generate `.docx` files matching the same four template styles. This is a major differentiator vs competitors.

**6.2 — Fix jsPDF Unicode Support**
jsPDF's default fonts don't support Unicode characters well (em-dashes, bullets, special chars). Embed a subset of Inter or Source Sans Pro via base64 to ensure clean rendering across all resume content.

**6.3 — Multi-Page Budget Controls**
Currently: Standard (overflow) and Strict 1-Page Fit. Add:
- **2-Page Executive**: Expands spacing, allows longer summaries
- **Compact 1-Page**: Reduces to 10pt minimum with tighter leading
- **ATS Plain Text Export**: Strips all formatting, outputs `.txt` optimized for copy-paste into ATS portals

**6.4 — Server-Side PDF Generation (Puppeteer)**
For pixel-perfect output, add an optional Supabase Edge Function that uses Puppeteer/html-to-pdf to generate PDFs from the `ResumePreview.jsx` HTML. Client-side jsPDF has layout quirks; server-side rendering gives exact WYSIWYG output.

**6.5 — LinkedIn-Optimized Profile Text Export**
Generate a formatted plain-text version of each section optimized for LinkedIn's character limits: headline (220 chars), summary (2600 chars), experience bullets.

---

### 7. UI/UX & Design System

#### Current State
- Tailwind v4 with CSS-variable tokens — good foundation.
- GlassPanel component for translucent panels.
- Framer Motion for transitions.
- Four resume templates in preview.

#### Improvements

**7.1 — Score Visualization Upgrade**
The score wheel is the emotional centerpiece. Add:
- Animated count-up on score reveal (e.g., 0 → 87% over 1.5s)
- Color-coded ring segments showing which categories contributed
- "Score improved by +12" delta indicator when rescoring

**7.2 — Before/After Diff Quality**
`RewritesTab.jsx` shows before/after text but likely uses simple string comparison. Implement proper token-level diffing using `diff` npm package to highlight exactly which words changed — green for additions, red for removals, inline.

**7.3 — Skeleton Loading States**
Replace the single `TransformLoading.jsx` spinner with per-tab skeleton screens. When streaming is implemented (see 1.2), tabs appear one at a time with skeleton → real content transitions.

**7.4 — Empty State Design**
Dashboard with zero transformations needs a compelling empty state — not just "No history found." Show a 3-step onboarding prompt: Upload → Paste JD → Transform.

**7.5 — Mobile Responsive Workspace**
The Workspace Workbench sidebar + tabs layout will collapse poorly on mobile. For <768px:
- Collapse sidebar to a horizontal scroll tab bar at top
- Stack content panels vertically
- Move download CTA to a sticky bottom bar

**7.6 — Dark Mode Completeness Audit**
Verify every component in GlassPanel, ScoreBanner, all Tabs correctly applies dark mode tokens. Common issue: hardcoded `text-gray-700` instead of `text-gray-700 dark:text-gray-300`.

---

### 8. Authentication & User Management

#### Current State
- Standard Supabase email/password auth.
- Profile page for name/avatar edits.
- Password reset flow.

#### Improvements

**8.1 — Add Google OAuth**
Groq's free tier requires API key auth, but users need easy onboarding. Google OAuth via Supabase takes ~2 hours to implement and reduces signup friction by ~40%.

**8.2 — Email Verification Enforcement**
Add a soft gate: unverified users can try the tool once, then see a "Verify email to continue" prompt rather than a hard block. Reduces abandonment.

**8.3 — Account Deletion (GDPR)**
Add a "Delete My Account" flow in Profile that: (1) soft-deletes all transformations, (2) deletes the profile row, (3) calls `supabase.auth.admin.deleteUser()` from an Edge Function. Required for GDPR compliance if targeting EU users.

**8.4 — Usage Dashboard in Profile**
Show the user: total transformations used this month, rate limit remaining today, tokens consumed. Builds trust and justifies a future paid tier.

---

### 9. Testing & Quality

#### Current State
- ESLint configured.
- No visible unit or integration tests.
- No E2E tests.

#### Improvements

**9.1 — Unit Tests for Score Logic**
`matchScore.js` and `resumeToText.js` are pure functions — perfect for unit tests. Add Vitest:
```bash
npm install -D vitest @testing-library/react
```
Target: 100% coverage on all `utils/` files.

**9.2 — Edge Function Tests**
Test `transform` edge function with mock Groq responses using Deno's built-in test runner. Test: valid input, malformed JSON from Groq, rate limit exceeded, auth failure.

**9.3 — E2E with Playwright**
Critical user flows to automate:
- Sign up → verify → transform → download PDF
- Rate limit hit → error shown correctly
- Past transformation → load detail → rescore
Target: Run on every push to `main` via GitHub Actions.

**9.4 — Groq Response Contract Tests**
The JSON schema from Groq is a contract. Add Zod schemas that validate every field of the response. Log schema violations to a `transform_errors` table for prompt debugging.

---

### 10. DevOps & Observability

#### Current State
- Vercel deployment with SPA fallback.
- Supabase Deno Edge Functions.
- No visible error tracking or analytics.

#### Improvements

**10.1 — Add Sentry**
Capture client-side JS errors and Edge Function errors. Track: parse failures, Groq timeouts, RLS policy violations. Free tier is sufficient.

**10.2 — Add PostHog or Plausible Analytics**
Track: conversion rate (landing → signup), transformation completion rate, most-used tabs, template preferences, PDF download rate. These metrics will guide which features to build next.

**10.3 — Vercel Speed Insights**
Enable Vercel Speed Insights (free) to track Core Web Vitals per page. Target: LCP < 2.5s on Transform page.

**10.4 — Edge Function Logging**
Add structured logs in `transform/index.ts`:
```typescript
console.log(JSON.stringify({
  event: 'transform_complete',
  user_id: userId,
  duration_ms: Date.now() - startTime,
  model: 'llama-3.3-70b',
  match_score: score,
  tokens: usage.total_tokens
}));
```
Supabase captures these in the Edge Function logs dashboard.

**10.5 — CI/CD Pipeline**
Add GitHub Actions workflow:
```yaml
on: [push, pull_request]
jobs:
  quality:
    - npm run lint
    - npm run test
    - npm run build
  deploy:
    - vercel deploy --prod (on main only)
```

---

## PART 2: AI AGENT EXECUTION PLAN

> Copy each task block below to your AI agent. Each task is self-contained with context, files to edit, and exact deliverable.

---

### PHASE 1 — FOUNDATION HARDENING (Week 1)
*No new features. Fix structural issues that will block future work.*

---

#### TASK 1.1 — Eliminate matchScore Duplication

**Context:** The match score calculation exists in two places: `src/utils/matchScore.js` (client) and `supabase/functions/_shared/matchScore.ts` (server). They can drift. We need a single source of truth.

**Decision:** Keep computation server-side only. Remove client-side math. Client calls `/rescore` endpoint.

**Files to modify:**
- `supabase/functions/_shared/matchScore.ts` — keep as-is, this is the canonical version
- `src/utils/matchScore.js` — DELETE this file
- `src/hooks/useTransform.js` — remove all calls to `computeMatchScore`, instead read `match_score` and `keywords_matched` directly from the API response
- `supabase/functions/transform/index.ts` — ensure `match_score`, `keywords_matched`, `keywords_total` are returned in the response payload

**Deliverable:** `matchScore.js` deleted. `useTransform.js` reads score from API response. No client-side score computation.

---

#### TASK 1.2 — Add Zod Validation to Edge Function Response

**Context:** Groq returns JSON but it can silently omit fields or return wrong types. We need to validate the shape before saving to DB.

**Files to create:**
- `supabase/functions/_shared/schemas.ts`

**Schema to implement:**
```typescript
import { z } from "https://deno.land/x/zod/mod.ts";

export const ContactSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
});

export const TransformOutputSchema = z.object({
  contact: ContactSchema,
  summary: z.string(),
  skills: z.object({
    technical: z.array(z.string()),
    tools: z.array(z.string()).optional(),
    soft: z.array(z.string()).optional(),
  }),
  experience: z.array(z.object({
    company: z.string(),
    title: z.string(),
    start_date: z.string(),
    end_date: z.string(),
    bullets: z.array(z.string()),
    location: z.string().optional(),
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
  })).optional(),
  recruiter_scan: z.object({
    attention_timeline: z.array(z.string()),
    strong_yes: z.string(),
    completely_missed: z.string(),
    best_fix: z.string(),
    pile: z.string().optional(),
    elevator_pitch: z.string(),
  }),
  roadmap: z.object({
    current_level: z.string(),
    tasks: z.array(z.object({
      task: z.string(),
      type: z.string(),
      impact: z.string(),
      points: z.number(),
    })),
  }),
  interview_prep: z.object({
    technical: z.array(z.object({ question: z.string(), difficulty: z.string(), expectation: z.string() })),
    behavioral: z.array(z.object({ question: z.string(), difficulty: z.string(), expectation: z.string() })),
    curveball: z.array(z.object({ question: z.string(), difficulty: z.string(), expectation: z.string() })),
  }),
  cover_letter: z.string(),
  meta: z.object({
    detected_job_title: z.string(),
    detected_company: z.string(),
  }),
});

export type TransformOutput = z.infer<typeof TransformOutputSchema>;
```

**Files to modify:**
- `supabase/functions/transform/index.ts` — after parsing Groq JSON, run `TransformOutputSchema.safeParse(parsed)`. If `.success === false`, return HTTP 422 with `{ code: 'PARSE_FAILED', errors: result.error.issues }`.

**Deliverable:** All Groq responses validated before DB insert. Invalid responses return structured errors.

---

#### TASK 1.3 — Structured Error Taxonomy

**Context:** `TransformErrorPanel.jsx` shows generic error strings. We need typed error codes so the UI can show actionable messages.

**Files to create:**
- `src/utils/errors.js`

```javascript
export const ERROR_MESSAGES = {
  RATE_LIMITED: {
    title: "Daily limit reached",
    description: (retryAfter) => `You've used all your transformations for today. Come back in ${retryAfter}.`,
    action: "Try again tomorrow or upgrade to Pro"
  },
  CONTENT_TOO_LONG: {
    title: "Resume too long",
    description: (max, actual) => `Your resume is ${actual} characters. Maximum is ${max}. Try removing older positions.`,
    action: "Trim your resume and retry"
  },
  AI_TIMEOUT: {
    title: "AI took too long",
    description: () => "The AI model didn't respond in time. This happens during peak hours.",
    action: "Retry in 30 seconds"
  },
  PARSE_FAILED: {
    title: "AI returned unexpected output",
    description: () => "The AI response couldn't be processed. This is rare.",
    action: "Try again — it usually works on the second attempt"
  },
  INVALID_JD: {
    title: "Job description too short",
    description: () => "Paste the full job description for best results (at least 200 characters).",
    action: "Add more job description content"
  },
  AUTH_FAILED: {
    title: "Session expired",
    description: () => "You've been logged out.",
    action: "Log in again"
  },
};
```

**Files to modify:**
- `supabase/functions/transform/index.ts` — return `{ code: 'RATE_LIMITED', retry_after: '18 hours' }` etc.
- `src/components/workspace/TransformErrorPanel.jsx` — import `ERROR_MESSAGES`, look up by `error.code`, render title + description + action button.

**Deliverable:** Every error state in the transform flow shows a specific, actionable message.

---

#### TASK 1.4 — Fix usage_stats Race Condition

**Context:** `usage_stats` uses a single counter row incremented by triggers. Under concurrent signups/transforms, the counter can be incorrect.

**Files to modify:**
- `supabase/migrations/006_fix_usage_stats.sql` (CREATE NEW FILE)

```sql
-- Replace increment functions with atomic upsert approach
CREATE OR REPLACE FUNCTION public.increment_user_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.usage_stats (id, total_users, total_transformations, updated_at)
  VALUES (1, 1, 0, NOW())
  ON CONFLICT (id) DO UPDATE
  SET total_users = usage_stats.total_users + 1,
      updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_transformation_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.usage_stats (id, total_users, total_transformations, updated_at)
  VALUES (1, 0, 1, NOW())
  ON CONFLICT (id) DO UPDATE
  SET total_transformations = usage_stats.total_transformations + 1,
      updated_at = NOW();
  RETURN NEW;
END;
$$;
```

**Deliverable:** `usage_stats` increments are atomic and race-condition safe.

---

### PHASE 2 — CORE FEATURE UPGRADES (Week 2)

---

#### TASK 2.1 — Add Groq Model Fallback Chain

**Context:** When Groq's primary model is slow or rate-limited, the request fails with no fallback. We need a retry chain.

**Files to modify:**
- `supabase/functions/_shared/groq.ts`

**Implementation:**
```typescript
const MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
];

export async function callGroqWithFallback(
  systemPrompt: string,
  userContent: string,
  maxTokens: number = 4096
): Promise<{ content: string; model_used: string }> {
  for (const model of MODELS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000); // 25s timeout
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
        }),
      });
      
      clearTimeout(timeout);
      
      if (response.status === 429) {
        // Rate limited on this model, try next
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`Groq ${model} returned ${response.status}`);
      }
      
      const data = await response.json();
      return { 
        content: data.choices[0].message.content,
        model_used: model 
      };
    } catch (err) {
      if (model === MODELS[MODELS.length - 1]) throw err;
      // Log and try next model
      console.log(JSON.stringify({ event: 'model_fallback', from: model, error: err.message }));
    }
  }
  throw new Error('All models exhausted');
}
```

**Files to modify:**
- `supabase/functions/transform/index.ts` — replace direct Groq call with `callGroqWithFallback`. Store `model_used` in the `ai_model` field of `transformations`.

**Deliverable:** Groq calls fall back through 3 models before failing. Model used is recorded in DB.

---

#### TASK 2.2 — Add Idempotency Key to Prevent Duplicate Transforms

**Context:** If a user double-clicks "Transform" or the UI retries, two identical Groq calls fire, doubling API costs and creating duplicate history entries.

**Files to modify:**
- `src/lib/api.js` — before calling the Edge Function, compute:
  ```javascript
  const idempotencyKey = await crypto.subtle.digest(
    'SHA-256', 
    new TextEncoder().encode(resumeText + jobDescription)
  ).then(buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join(''));
  ```
  Pass as header: `'X-Idempotency-Key': idempotencyKey`

- `supabase/functions/transform/index.ts` — at the start, before calling Groq:
  ```typescript
  const idempotencyKey = req.headers.get('X-Idempotency-Key');
  if (idempotencyKey) {
    const { data: existing } = await supabase
      .from('transformations')
      .select('id, output_json, match_score')
      .eq('user_id', userId)
      .eq('idempotency_key', idempotencyKey)
      .gt('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // last 5 min
      .single();
    
    if (existing) {
      return new Response(JSON.stringify({ cached: true, data: existing }), { status: 200 });
    }
  }
  ```

- `supabase/migrations/007_idempotency.sql` (NEW FILE):
  ```sql
  ALTER TABLE transformations ADD COLUMN idempotency_key text;
  CREATE INDEX idx_transformations_idempotency ON transformations(user_id, idempotency_key, created_at DESC);
  ```

**Deliverable:** Duplicate submits within 5 minutes return cached result instantly.

---

#### TASK 2.3 — Split `/rescore` into Separate Edge Function

**Context:** Users adjust Rescore sliders and currently have no way to re-run scoring without re-running the full pipeline. A lightweight `/rescore` endpoint fixes this.

**Files to create:**
- `supabase/functions/rescore/index.ts`

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { extractUser } from '../_shared/auth.ts';
import { computeMatchScore } from '../_shared/matchScore.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  
  const { transformation_id, weights } = await req.json();
  const { user, error } = await extractUser(req);
  if (error) return new Response(JSON.stringify({ error: 'AUTH_FAILED' }), { status: 401 });
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  const { data: transform } = await supabase
    .from('transformations')
    .select('output_json, output_plain_text')
    .eq('id', transformation_id)
    .eq('user_id', user.id)
    .single();
  
  if (!transform) return new Response(JSON.stringify({ error: 'NOT_FOUND' }), { status: 404 });
  
  // Apply weights to scoring (pass weights into computeMatchScore)
  const { score, matched, missing, total } = computeMatchScore(
    transform.output_json, 
    transform.output_plain_text,
    weights // { technical_depth: 0.6, team_strategy: 0.4, ... }
  );
  
  await supabase.from('transformations')
    .update({ match_score: score, keywords_matched: matched })
    .eq('id', transformation_id);
  
  return new Response(JSON.stringify({ score, matched, missing, total }), { headers: corsHeaders });
});
```

**Files to modify:**
- `src/hooks/useTransform.js` — connect Rescore sliders to call `/rescore` endpoint
- `src/components/tabs/RescoreTab.jsx` — on slider change debounce (500ms), call rescore and update displayed score

**Deliverable:** Rescore sliders call a lightweight endpoint. No full re-transform needed.

---

#### TASK 2.4 — DOCX Export

**Context:** Users want editable Word documents, not just PDFs. This is a major differentiator.

**Files to create:**
- `src/lib/docxGenerator.js`

**Implementation approach:**
```javascript
// Lazy import to avoid bundle bloat
export async function generateDocx(resumeJson, templateName = 'modern') {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, 
          AlignmentType, LevelFormat } = await import('docx');
  
  const { contact, summary, skills, experience, education, projects } = resumeJson;
  
  const children = [
    // NAME
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: contact.name, bold: true, size: 32 })]
    }),
    // CONTACT LINE
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ 
        text: [contact.email, contact.phone, contact.location, contact.linkedin]
          .filter(Boolean).join(' | '),
        size: 20
      })]
    }),
    // ... continue for each section
  ];
  
  const doc = new Document({
    numbering: {
      config: [{
        reference: 'bullets',
        levels: [{ level: 0, format: LevelFormat.BULLET, text: '•',
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
      }]
    },
    sections: [{ 
      properties: { page: { size: { width: 12240, height: 15840 } } },
      children 
    }]
  });
  
  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${contact.name.replace(/\s+/g, '_')}_Resume.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
```

**Package to install:**
```bash
npm install docx
```

**Files to modify:**
- `src/components/workspace/ScoreBanner.jsx` — add "Export DOCX" button alongside existing download actions
- `vite.config.js` — add `docx` to `optimizeDeps.exclude` for lazy loading

**Deliverable:** Users can download their optimized resume as a `.docx` file.

---

### PHASE 3 — EXPERIENCE UPGRADES (Week 3)

---

#### TASK 3.1 — Animated Score Count-Up on Reveal

**Context:** The score wheel appears instantly after transform. Animating it from 0 to the final score creates a satisfying reveal moment.

**Files to modify:**
- `src/components/transform/ScoreDisplay.jsx`

```jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function ScoreDisplay({ score, size = 'lg' }) {
  const [displayScore, setDisplayScore] = useState(0);
  
  useEffect(() => {
    if (!score) return;
    let start = 0;
    const duration = 1500; // 1.5 seconds
    const increment = score / (duration / 16); // ~60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [score]);
  
  // ... render with displayScore instead of score
}
```

**Deliverable:** Score wheel animates from 0 to final value over 1.5 seconds on reveal.

---

#### TASK 3.2 — Token-Level Diff in RewritesTab

**Context:** The before/after comparison in RewritesTab likely uses string comparison. Token-level diff highlights exact word changes.

**Package to install:**
```bash
npm install diff
```

**Files to modify:**
- `src/components/tabs/RewritesTab.jsx`

```jsx
import { diffWords } from 'diff';

function DiffView({ before, after }) {
  const changes = diffWords(before, after);
  
  return (
    <p className="leading-relaxed">
      {changes.map((part, i) => {
        if (part.added) return (
          <mark key={i} className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded px-0.5">
            {part.value}
          </mark>
        );
        if (part.removed) return (
          <del key={i} className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 line-through rounded px-0.5">
            {part.value}
          </del>
        );
        return <span key={i}>{part.value}</span>;
      })}
    </p>
  );
}
```

**Deliverable:** RewritesTab shows word-level red/green diffs between original and optimized bullets.

---

#### TASK 3.3 — Add Tags to Transformations (Job Tracker)

**Context:** Users apply to many jobs. Adding status tags turns history into a lightweight job tracker.

**Files to create:**
- `supabase/migrations/008_tags.sql`
```sql
ALTER TABLE transformations ADD COLUMN tags text[] DEFAULT '{}';
ALTER TABLE transformations ADD COLUMN status text DEFAULT 'Saved' 
  CHECK (status IN ('Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'));
```

**Files to modify:**
- `src/components/dashboard/TransformationRow.jsx` — add status badge dropdown (pill showing current status, click to cycle through)
- `src/lib/api.js` — add `updateTransformationStatus(id, status)` function
- `src/hooks/useHistory.js` — handle optimistic status updates

**UI for status pills:**
```jsx
const STATUS_STYLES = {
  Saved:        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  Applied:      'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Interviewing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  Offer:        'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Rejected:     'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300',
};
```

**Deliverable:** Each history row has a clickable status badge. Dashboard shows counts by status.

---

#### TASK 3.4 — Google OAuth Integration

**Context:** Email/password signup has friction. Google OAuth reduces signup time to one click.

**Files to modify:**
- `src/pages/Login.jsx` — add "Continue with Google" button:
```jsx
const handleGoogleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/dashboard` }
  });
};
```
- `src/pages/Signup.jsx` — same button

**Supabase config:**
- Enable Google provider in Supabase Dashboard → Authentication → Providers
- Add Google OAuth credentials (Client ID + Secret from Google Cloud Console)
- Add `https://your-project.supabase.co/auth/v1/callback` to Google's authorized redirect URIs

**Deliverable:** Login and Signup pages show "Continue with Google" button that works end-to-end.

---

#### TASK 3.5 — Empty State for Dashboard

**Context:** New users see a blank dashboard. Guide them to their first transformation.

**Files to modify:**
- `src/pages/Dashboard.jsx`

```jsx
// When transformations.length === 0 and !loading:
function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-6">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
        Your first tailored resume is one step away
      </h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
        Upload your resume, paste a job description, and get an ATS-optimized version in under 30 seconds.
      </p>
      <div className="flex items-center gap-6 mb-10 text-sm text-gray-400">
        <Step n={1} label="Upload resume" />
        <ArrowRight className="w-4 h-4" />
        <Step n={2} label="Paste job description" />
        <ArrowRight className="w-4 h-4" />
        <Step n={3} label="Get optimized CV" />
      </div>
      <Link to="/transform">
        <Button variant="primary" size="lg">Start your first transformation</Button>
      </Link>
    </div>
  );
}
```

**Deliverable:** Empty dashboard shows onboarding prompt with 3 steps and a CTA instead of blank space.

---

### PHASE 4 — TESTING & OBSERVABILITY (Week 4)

---

#### TASK 4.1 — Setup Vitest + Unit Tests for Utils

**Installation:**
```bash
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
```

**Files to create:**
- `vitest.config.js`
```javascript
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { environment: 'jsdom', globals: true }
});
```

- `src/utils/__tests__/matchScore.test.js` — test: empty JD, full match, partial match, case insensitivity, stop-words filtered correctly
- `src/utils/__tests__/resumeToText.test.js` — test: null fields handled, all sections concatenated
- `src/utils/__tests__/scoreColor.test.js` — test: <40 = red, 40-69 = yellow, ≥70 = green

**package.json update:**
```json
"scripts": {
  "test": "vitest",
  "test:coverage": "vitest --coverage"
}
```

**Deliverable:** `npm run test` passes all utility unit tests. Coverage report generated.

---

#### TASK 4.2 — Add GitHub Actions CI

**Files to create:**
- `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

**Deliverable:** Every push and PR runs lint + test + build automatically.

---

#### TASK 4.3 — Add Sentry Error Tracking

**Installation:**
```bash
npm install @sentry/react
```

**Files to modify:**
- `src/main.jsx`
```javascript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 0.1, // 10% of transactions
});
```

- `src/components/ui/ErrorBoundary.jsx` — wrap with `Sentry.ErrorBoundary`
- `.env` — add `VITE_SENTRY_DSN=your-dsn-here`
- Vercel dashboard — add `VITE_SENTRY_DSN` environment variable

**Edge Function error tracking:**
- In `supabase/functions/transform/index.ts`, add to catch blocks:
```typescript
console.error(JSON.stringify({ 
  sentry: true, 
  error: err.message, 
  stack: err.stack,
  user_id: userId 
}));
```

**Deliverable:** Client JS errors + Edge Function errors are captured in Sentry dashboard.

---

## PART 3: QUICK WINS CHECKLIST
*These can be done in under 2 hours each. Assign to agent as one-liners.*

| # | Task | File(s) | Effort |
|---|------|---------|--------|
| Q1 | Add `loading="lazy"` to all `<img>` tags | `Landing.jsx`, `Dashboard.jsx` | 15 min |
| Q2 | Add `title` attribute to all `<button>` icon-only buttons | All workspace components | 20 min |
| Q3 | Compress `pdfjs-dist` worker URL to use CDN instead of local copy | `vite.config.js`, `fileParser.js` | 30 min |
| Q4 | Add `rel="noopener noreferrer"` to all `target="_blank"` links | All components | 15 min |
| Q5 | Add `aria-label` to ScoreDisplay progress circle | `ScoreDisplay.jsx` | 20 min |
| Q6 | Debounce Rescore slider onChange (currently fires on every pixel) | `RescoreTab.jsx` | 30 min |
| Q7 | Add `<meta name="description">` to all pages via `useDocumentTitle` | All page components | 45 min |
| Q8 | Move hardcoded color strings in `scoreColor.js` to CSS variables | `scoreColor.js`, `globals.css` | 30 min |
| Q9 | Add `autocomplete="email"` and `autocomplete="current-password"` to auth forms | `Login.jsx`, `Signup.jsx` | 10 min |
| Q10 | Add keyboard shortcut `Cmd/Ctrl+Enter` to submit Transform form | `JobInput.jsx` | 20 min |

---

## SUMMARY: EXECUTION ORDER

```
Week 1: Tasks 1.1 → 1.2 → 1.3 → 1.4 (Foundation)
         + Quick Wins Q1–Q5

Week 2: Tasks 2.1 → 2.2 → 2.3 → 2.4 (Core Upgrades)
         + Quick Wins Q6–Q10

Week 3: Tasks 3.1 → 3.2 → 3.3 → 3.4 → 3.5 (Experience)

Week 4: Tasks 4.1 → 4.2 → 4.3 (Testing & Observability)
```

**Portfolio impact notes:**
- Tasks 2.4 (DOCX Export) and 3.3 (Job Tracker Tags) are the highest-visibility features for users.
- Tasks 1.1 and 1.2 (duplication fix + Zod validation) are the most important for code quality and will impress technical reviewers of the codebase.
- Task 2.1 (Model Fallback) directly demonstrates MLOps thinking — good to mention in internship applications.
- Adding CI (Task 4.2) + Sentry (Task 4.3) makes ResumOrph look production-grade, not a side project.
