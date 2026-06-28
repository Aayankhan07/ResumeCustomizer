# ResumOrph — Master Project Bible
### Complete Reference: Stack · Architecture · Database · AI · UI/UX · Features · Interactions · Improvements

> **Single source of truth.** Every detail about ResumOrph lives in this document — technical architecture, folder structure, database schema, AI pipeline, UI layout, UX flows, component behavior, design tokens, feature specifications, and planned improvements.

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Folder & File Structure](#3-folder--file-structure)
4. [Database Schema](#4-database-schema)
5. [Backend — Edge Functions & AI Pipeline](#5-backend--edge-functions--ai-pipeline)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Design System & Tokens](#7-design-system--tokens)
8. [Page-by-Page UI Structure](#8-page-by-page-ui-structure)
9. [Workspace Tabs — Full Feature Specification](#9-workspace-tabs--full-feature-specification)
10. [Component Library](#10-component-library)
11. [User Flows & Interactions](#11-user-flows--interactions)
12. [ATS Match Score Engine](#12-ats-match-score-engine)
13. [PDF Generation System](#13-pdf-generation-system)
14. [Auth System](#14-auth-system)
15. [API Layer](#15-api-layer)
16. [Planned UI/UX Redesign](#16-planned-uiux-redesign)
17. [Planned Feature Improvements](#17-planned-feature-improvements)
18. [Next.js Migration Plan](#18-nextjs-migration-plan)
19. [DevOps & Deployment](#19-devops--deployment)
20. [Known Issues & Technical Debt](#20-known-issues--technical-debt)

---

## 1. PROJECT OVERVIEW

**Name:** ResumOrph  
**Type:** AI-powered ATS Resume Tailoring SaaS  
**Status:** Pre-launch (live on Vercel, actively developed)  
**URL:** `resume-customizer-seven.vercel.app`  
**Version:** Engine v1.2  

**What it does:** A user uploads their resume (PDF/DOCX/TXT) and pastes a job description. The app sends both to a Groq LLM which rewrites the resume to maximize ATS keyword alignment for that specific job. The output includes a tailored CV, match score, keyword analysis, before/after rewrites, interview prep questions, and a cover letter — all from one AI call.

**Core value proposition:** ATS-optimized resume tailored to any job description in under 30 seconds. No credit card required. Up to 10 free optimizations.

**Target users:** Job seekers, particularly developers and technical professionals, who need to tailor resumes for different roles without spending hours manually editing.

**Current user:** Muhammad Aayan Khan (the developer and primary test user).

---

## 2. TECHNOLOGY STACK

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework — state sync, rendering |
| Vite | Latest | Build tool, HMR, bundling |
| React Router DOM | v7 | Client-side routing, protected routes |
| Tailwind CSS | v4 | Utility-first styling, CSS-variable tokens |
| Framer Motion | Latest | Micro-animations, transitions |
| Lucide React | Latest | SVG icon library |
| Sonner | Latest | Toast notifications |

### Backend / Services
| Technology | Purpose |
|---|---|
| Supabase Cloud | Auth + PostgreSQL DB + Deno Edge Functions |
| Groq API | LLM inference — `llama-3.3-70b-versatile` |
| Vercel | Hosting, SPA routing |

### Client-Side Libraries
| Library | Purpose | Loading |
|---|---|---|
| pdfjs-dist | Parse PDF files, extract text | Lazy (dynamic import) |
| mammoth | Parse .docx files, extract text | Lazy (dynamic import) |
| jsPDF | Generate PDF resumes client-side | Eager |

### Dev Tooling
| Tool | Purpose |
|---|---|
| ESLint | Code linting |
| `npm run dev` | Local Vite dev server |
| `npm run build` | Production build → `/dist` |
| `npm run lint` | ESLint check |
| `npm run preview` | Preview compiled build |

---

## 3. FOLDER & FILE STRUCTURE

```
ResumeCustomizer/
│
├── .env                              # Local env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── .gitignore
├── .gitattributes
├── README.md
├── package.json                      # Dependencies + npm scripts
├── package-lock.json
├── vercel.json                       # SPA fallback routing: all routes → /index.html
├── vite.config.js                    # pdfjs-dist excluded from initial bundle
├── eslint.config.js
├── index.html                        # HTML shell, CSS/font injection point
│
├── public/                           # Static assets served as-is
│   └── (icons, logo images, fonts)
│
├── supabase/                         # Supabase backend config
│   ├── config.toml                   # Supabase CLI project settings
│   │
│   ├── migrations/                   # SQL migration files (run in order)
│   │   ├── 001_initial_schema.sql    # Tables: profiles, transformations, rate_limits, usage_stats
│   │   ├── 002_indexes.sql           # Partial, compound, GIN indexes
│   │   ├── 003_rls.sql               # Row Level Security policies per table
│   │   ├── 004_functions.sql         # Trigger functions: new_user, updated_at, soft_delete, cleanup
│   │   └── 005_fix_safe_updates.sql  # Safe update overrides
│   │
│   └── functions/                    # Deno serverless Edge Functions
│       ├── _shared/                  # Shared modules used by all functions
│       │   ├── auth.ts               # Extracts + verifies Bearer token from request headers
│       │   ├── cors.ts               # CORS headers for all responses
│       │   ├── groq.ts               # Groq API caller, system prompt builder, model params
│       │   ├── matchScore.ts         # Server-side keyword matching logic
│       │   ├── rateLimit.ts          # Sliding-window rate limit check against rate_limits table
│       │   └── resumeToText.ts       # Converts output_json → plain text string
│       │
│       ├── cleanup/                  # Cron-triggered edge function
│       │   └── index.ts              # Deletes rate_limit rows older than 2 hours
│       │
│       └── transform/                # Main AI pipeline edge function
│           └── index.ts              # Auth → Validate → Rate check → Groq → Score → Save → Respond
│
└── src/                              # All frontend application code
    │
    ├── main.jsx                      # React app mount point (ReactDOM.createRoot)
    ├── App.jsx                       # React Router v7 setup, route definitions, ErrorBoundary wrapper
    │
    ├── assets/                       # Local images, SVGs, animation data
    │
    ├── contexts/
    │   └── AuthContext.jsx           # Supabase session listener, exposes user + auth functions globally
    │
    ├── hooks/
    │   ├── useAuth.js                # Consumes AuthContext: returns { user, signIn, signOut, signUp... }
    │   ├── useDocumentTitle.js       # Sets document.title dynamically per page
    │   ├── useHistory.js             # Fetches transformation history, stats, handles pagination + search
    │   └── useTransform.js           # Wizard state machine: steps, file parsing, API call, scoring, retry
    │
    ├── lib/
    │   ├── api.js                    # All API calls: invokes Supabase Edge Functions, reads/writes DB
    │   ├── pdfGenerator.js           # jsPDF: builds 4 templates from output_json
    │   ├── supabase.js               # Supabase client initialization (uses VITE_* env vars)
    │   └── parsers/
    │       └── fileParser.js         # Lazy-loads pdfjs-dist / mammoth, returns plain text from file
    │
    ├── styles/
    │   └── globals.css               # Tailwind imports, CSS variables, global resets, scrollbar styles
    │
    ├── utils/
    │   ├── constants.js              # Template names, page budget options, stop-words list (200+)
    │   ├── formatDate.js             # Formats ISO dates → "June 27, 2026"
    │   ├── matchScore.js             # Client-side ATS score: keyword extraction → substring match → %
    │   ├── resumeToText.js           # output_json → concatenated plain text string
    │   └── scoreColor.js             # Returns CSS color class based on score: red <40, yellow 40-69, green ≥70
    │
    ├── pages/
    │   ├── Landing.jsx               # Public landing: hero, diff animation, 3-step how-it-works, stats, FAQ
    │   ├── Login.jsx                 # Email/password sign-in form
    │   ├── Signup.jsx                # Email/password sign-up form
    │   ├── ForgotPassword.jsx        # Sends Supabase password reset email
    │   ├── ResetPassword.jsx         # Form to set new password after clicking email link
    │   ├── VerifyEmail.jsx           # Shown after signup, prompts user to check email
    │   ├── Dashboard.jsx             # Protected: shows stats row + history list of transformations
    │   ├── Transform.jsx             # Protected: 3-step wizard → workspace output
    │   ├── TransformDetail.jsx       # Protected: loads past transformation into workspace by ID
    │   ├── Profile.jsx               # Protected: edit name, avatar; change password
    │   └── NotFound.jsx              # 404 page
    │
    └── components/
        │
        ├── dashboard/
        │   ├── StatsRow.jsx          # 3 cards: Total analyses, Best score, This week count
        │   └── TransformationRow.jsx # One history row: job title, company, score, date, label, delete
        │
        ├── layout/
        │   ├── Navbar.jsx            # Logo, Dashboard link, Transform CV CTA, avatar, theme toggle
        │   ├── Footer.jsx            # Brand tagline, Privacy Policy, Terms links, copyright
        │   └── ProtectedRoute.jsx    # Checks auth session; redirects to /login if not authenticated
        │
        ├── ui/
        │   ├── Accordion.jsx         # Expandable container, animates height on toggle
        │   ├── Button.jsx            # Variants: primary, secondary, ghost, danger. Sizes: sm, md, lg
        │   ├── Card.jsx              # Container with border, rounded corners, optional padding
        │   ├── ErrorBoundary.jsx     # React error boundary, shows recovery UI on crash
        │   ├── GlassPanel.jsx        # Translucent frosted panel (used in workspace sections)
        │   ├── Input.jsx             # Single-line text input with label + error state
        │   ├── LoadingSpinner.jsx    # Spinner animation (used inside buttons + full-page loading)
        │   ├── Modal.jsx             # Centered overlay dialog with backdrop + close button
        │   ├── PremiumModal.jsx      # Lock overlay for premium-only features
        │   ├── Tabs.jsx              # Horizontal tab switcher with active underline
        │   └── Textarea.jsx          # Multi-line resizable input with label + error state
        │
        └── transform/
            │
            ├── ResumeCompare.jsx     # Side-by-side: original plain text (left) vs optimized (right)
            ├── ResumePreview.jsx     # Renders output_json as HTML matching the selected PDF template
            ├── ScoreDisplay.jsx      # Circular progress wheel showing match score %
            ├── TransformOutput.jsx   # Root workspace: links sidebar + style panel + tab content
            │
            ├── wizard/
            │   ├── FileDropzone.jsx  # Drag-and-drop zone, file type validation, parse trigger
            │   ├── JobInput.jsx      # Textarea for pasting job description with char counter
            │   ├── ResumeInput.jsx   # Combines FileDropzone + raw paste textarea tab
            │   └── TransformLoading.jsx  # Animated processing screen during AI call
            │
            ├── workspace/
            │   ├── ScoreBanner.jsx        # Top banner: name, job title, score display, actions
            │   ├── StyleControlPanel.jsx  # Template selector + page budget toggle
            │   ├── TransformErrorPanel.jsx # Error display: rate limit, timeout, parse failures
            │   └── WorkspaceSidebar.jsx   # Left nav: score bar + 10 tab links + download/share buttons
            │
            └── tabs/
                ├── AtsCheckTab.jsx    # Keyword found/missing pills, score, formatting risk, next steps
                ├── CoverLetterTab.jsx # Cover letter text, Copy + Download buttons
                ├── InterviewTab.jsx   # Q&A prep: Technical / Behavioral / Curveball accordion
                ├── JdMatchTab.jsx     # Requirement-by-requirement checklist view
                ├── OverviewTab.jsx    # Fit summary, ATS scan quality, tailoring metadata
                ├── RecruiterTab.jsx   # Attention timeline, strong yes, missed, best fix, pitch
                ├── RescoreTab.jsx     # 3 sliders + Apply & Re-Score button
                ├── RewritesTab.jsx    # Before/after card pairs for each rewritten section
                ├── RoadmapTab.jsx     # Path to Top Tier progress bar + task checkboxes
                └── SkillsTab.jsx      # Match % + matched pills + skill category bar chart
```

---

## 4. DATABASE SCHEMA

### Tables Overview

```
auth.users (Supabase built-in)
    id UUID PK
    email TEXT

public.profiles
    id UUID PK → FK auth.users(id) ON DELETE CASCADE
    full_name TEXT
    avatar_url TEXT
    created_at TIMESTAMPTZ DEFAULT NOW()
    updated_at TIMESTAMPTZ DEFAULT NOW()

public.transformations
    id UUID PK DEFAULT gen_random_uuid()
    user_id UUID → FK auth.users(id) ON DELETE CASCADE
    detected_job_title TEXT
    detected_company TEXT
    input_resume_chars INTEGER
    input_jd_chars INTEGER
    output_json JSONB                  ← full AI output (nested resume data)
    output_plain_text TEXT             ← flattened string version
    match_score SMALLINT               ← 0–100
    keywords_matched TEXT[]            ← array of matched keyword strings
    keywords_total INTEGER
    label TEXT                         ← user-defined label string
    ai_model TEXT                      ← e.g. "llama-3.3-70b-versatile"
    tokens_used INTEGER
    is_deleted BOOLEAN DEFAULT FALSE   ← soft delete flag
    deleted_at TIMESTAMPTZ
    created_at TIMESTAMPTZ DEFAULT NOW()
    updated_at TIMESTAMPTZ DEFAULT NOW()

public.rate_limits
    id UUID PK DEFAULT gen_random_uuid()
    user_id UUID → FK auth.users(id) ON DELETE CASCADE
    action TEXT CHECK (action = 'transform')
    created_at TIMESTAMPTZ DEFAULT NOW()

public.usage_stats
    id UUID PK DEFAULT gen_random_uuid()
    total_transformations BIGINT DEFAULT 0
    total_users BIGINT DEFAULT 0
    updated_at TIMESTAMPTZ DEFAULT NOW()
    ← Single-row global counter table
```

### Entity Relationships
```
auth.users ─┬──── 1:1 ────→ profiles
            ├──── 1:N ────→ transformations
            └──── 1:N ────→ rate_limits

usage_stats → standalone singleton table (no FK)
```

### Database Indexes (`002_indexes.sql`)
```sql
-- User transformation queries (most frequent)
CREATE INDEX idx_transformations_user_id
  ON transformations(user_id) WHERE is_deleted = FALSE;

-- Dashboard sorted list
CREATE INDEX idx_transformations_user_created
  ON transformations(user_id, created_at DESC) WHERE is_deleted = FALSE;

-- Score filtering
CREATE INDEX idx_transformations_score
  ON transformations(user_id, match_score) WHERE is_deleted = FALSE;

-- Rate limit sliding window
CREATE INDEX idx_rate_limits_user_action_time
  ON rate_limits(user_id, action, created_at DESC);

-- JSONB full-text search
CREATE INDEX idx_transformations_output_gin
  ON transformations USING GIN(output_json);
```

### Row Level Security (`003_rls.sql`)
```
profiles:
  SELECT  → auth.uid() = id
  INSERT  → auth.uid() = id
  UPDATE  → auth.uid() = id

transformations:
  SELECT  → auth.uid() = user_id AND is_deleted = FALSE
  INSERT  → auth.uid() = user_id
  UPDATE  → auth.uid() = user_id
  DELETE  → BLOCKED at schema level (use soft delete function instead)

rate_limits:
  ALL     → service_role only (no public policies)

usage_stats:
  SELECT  → public (USING TRUE) — for landing page stats
  INSERT/UPDATE → service_role only
```

### Database Trigger Functions (`004_functions.sql`)
```
handle_new_user()
  AFTER INSERT ON auth.users
  → Inserts new row into public.profiles with user's id + metadata

increment_user_count()
  AFTER INSERT ON auth.users
  → Increments usage_stats.total_users += 1

increment_transformation_count()
  AFTER INSERT ON public.transformations
  → Increments usage_stats.total_transformations += 1

handle_updated_at()
  BEFORE UPDATE ON profiles, transformations
  → Sets updated_at = NOW()

soft_delete_transformation(p_id UUID, p_user_id UUID)
  → Sets is_deleted = TRUE, deleted_at = NOW() WHERE id = p_id AND user_id = p_user_id

cleanup_old_rate_limits()
  → DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL '2 hours'
```

---

## 5. BACKEND — EDGE FUNCTIONS & AI PIPELINE

### `transform` Edge Function — Full Pipeline

**File:** `supabase/functions/transform/index.ts`

**Trigger:** POST request from client via `supabase.functions.invoke('transform', { body })`

**Pipeline steps:**

```
1. CORS preflight check (OPTIONS → return 200 with CORS headers)
       ↓
2. AUTH — Extract Bearer token from Authorization header
         → Call Supabase admin.getUserById()
         → If invalid: return 401 { error: 'Unauthorized' }
       ↓
3. VALIDATE INPUTS
         → Parse request body: { resume_text, job_description }
         → Check resume_text.length >= 100 chars → else 400
         → Check job_description.length >= 200 chars → else 400
         → Check resume_text.length <= 15000 chars → else 413
       ↓
4. RATE LIMIT CHECK (via rateLimit.ts)
         → COUNT rows in rate_limits WHERE user_id = userId
           AND action = 'transform' AND created_at > NOW() - INTERVAL '24 hours'
         → If count >= 10: return 429 { error: 'Rate limit exceeded' }
         → If allowed: INSERT new row into rate_limits
       ↓
5. GROQ API CALL (via groq.ts)
         → Build system prompt (structured JSON schema instructions)
         → POST to https://api.groq.com/openai/v1/chat/completions
         → Model: llama-3.3-70b-versatile
         → response_format: { type: 'json_object' }
         → max_tokens: 4096
         → Parse response.choices[0].message.content as JSON
       ↓
6. COMPUTE MATCH SCORE (via matchScore.ts)
         → Extract keywords from job_description (strip stop-words, normalize)
         → Scan output_json text fields for each keyword
         → Calculate: Math.floor((matched / total) * 100)
       ↓
7. CONVERT TO PLAIN TEXT (via resumeToText.ts)
         → Flatten output_json into a readable plain-text string
       ↓
8. SAVE TO DATABASE
         → INSERT into public.transformations:
           { user_id, output_json, output_plain_text, match_score,
             keywords_matched, keywords_total, detected_job_title,
             detected_company, ai_model, input_resume_chars, input_jd_chars }
       ↓
9. RETURN RESPONSE
         → { data: { id, output_json, match_score, keywords_matched, ... } }
```

### `cleanup` Edge Function

**File:** `supabase/functions/cleanup/index.ts`

**Trigger:** Scheduled Deno cron (every 2 hours)

**Action:** Calls `cleanup_old_rate_limits()` SQL function to purge rate_limit rows older than 2 hours, preventing table bloat.

### Groq System Prompt Structure

The prompt instructs the model to return **only valid JSON** (no markdown, no preamble) in this exact schema:

```json
{
  "contact": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "github": "string",
    "portfolio": "string"
  },
  "summary": "string — professional summary optimized with JD keywords",
  "skills": {
    "technical": ["string"],
    "tools": ["string"],
    "soft": ["string"]
  },
  "experience": [
    {
      "company": "string",
      "location": "string",
      "title": "string",
      "start_date": "MM/YYYY",
      "end_date": "MM/YYYY or Present",
      "bullets": ["string — quantified, keyword-rich achievement"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "start_year": "YYYY",
      "end_year": "YYYY"
    }
  ],
  "projects": [
    {
      "title": "string",
      "description": "string",
      "bullets": ["string"]
    }
  ],
  "recruiter_scan": {
    "attention_timeline": ["step 1", "step 2", "step 3"],
    "strong_yes": "string — why this candidate fits",
    "completely_missed": "string — critical gap",
    "best_fix": "string — single highest-leverage action",
    "elevator_pitch": "string — 30-second verbal pitch"
  },
  "roadmap": {
    "current_level": "Beginner | Developing | Competitive | Top Tier",
    "tasks": [
      {
        "task": "string",
        "type": "Project | Course | Certification | Keywords",
        "impact": "High Impact | Medium Impact | Low Impact",
        "points": 5
      }
    ]
  },
  "interview_prep": {
    "technical":  [{ "question": "string", "difficulty": "HARD | MEDIUM | EASY", "expectation": "string" }],
    "behavioral": [{ "question": "string", "difficulty": "HARD | MEDIUM | EASY", "expectation": "string" }],
    "curveball":  [{ "question": "string", "difficulty": "HARD | MEDIUM | EASY", "expectation": "string" }]
  },
  "cover_letter": "string — full cover letter text",
  "meta": {
    "detected_job_title": "string",
    "detected_company": "string"
  }
}
```

### Shared Module Responsibilities

**`_shared/auth.ts`**
- Extracts `Authorization: Bearer <token>` header from request
- Calls `supabase.auth.getUser(token)` to verify and get user object
- Returns `{ user, error }`

**`_shared/cors.ts`**
- Returns standard CORS headers for every response
- Headers: `Access-Control-Allow-Origin: *`, `Allow-Methods: POST, OPTIONS`, `Allow-Headers: authorization, content-type`

**`_shared/groq.ts`**
- Builds system prompt string with JSON schema instructions
- Calls Groq REST API endpoint
- Returns parsed JSON content from Groq's response
- No retry logic currently (improvement planned)

**`_shared/matchScore.ts`**
- Accepts `output_json` and `job_description` string
- Strips stop-words, normalizes, extracts unique keywords from JD
- Scans all string values recursively in output_json
- Returns `{ score, matched: string[], total: number }`

**`_shared/rateLimit.ts`**
- Accepts `userId` + Supabase service client
- Counts rows in `rate_limits` for user in last 24h
- Returns `{ allowed: boolean, remaining: number }`

**`_shared/resumeToText.ts`**
- Converts `output_json` object into a flat plain-text string
- Format: section headers + indented content
- Used for `output_plain_text` field in DB + for `Raw Plain Text` tab

---

## 6. FRONTEND ARCHITECTURE

### Routing (`App.jsx`)

```
/                         → Landing.jsx           (public)
/login                    → Login.jsx             (public, redirect if authed)
/signup                   → Signup.jsx            (public, redirect if authed)
/forgot-password          → ForgotPassword.jsx    (public)
/reset-password           → ResetPassword.jsx     (public)
/verify-email             → VerifyEmail.jsx       (public)
/dashboard                → Dashboard.jsx         (protected)
/transform                → Transform.jsx         (protected)
/transform/:id            → TransformDetail.jsx   (protected)
/profile                  → Profile.jsx           (protected)
*                         → NotFound.jsx
```

**ProtectedRoute logic:** Reads `user` from `AuthContext`. If `user === null` and auth check is complete → `<Navigate to="/login" />`. If auth is loading → renders `<LoadingSpinner />`.

### State Architecture

```
Global State (React Context):
  AuthContext.jsx
    ├── user: { id, email, ... } | null
    ├── loading: boolean
    ├── signIn(email, password)
    ├── signUp(email, password, fullName)
    ├── signOut()
    ├── resetPassword(email)
    └── updatePassword(newPassword)

Page-Level State (hooks):
  useTransform.js          ← owns the entire wizard + output lifecycle
    ├── step: 0 | 1 | 2 | 'loading' | 'output'
    ├── resumeText: string
    ├── jobDescription: string
    ├── transformData: output_json | null
    ├── matchScore: number
    ├── keywordsMatched: string[]
    ├── keywordsTotal: number
    ├── error: string | null
    ├── isLoading: boolean
    └── handleSubmit() → calls api.js → updates state

  useHistory.js            ← dashboard data
    ├── transformations: array
    ├── stats: { total, bestScore, thisWeek }
    ├── loading: boolean
    ├── searchQuery: string
    └── deleteTransformation(id)

Local State (useState):
  Each tab component manages its own UI state
  (accordion open/closed, copy button swap, selected template, etc.)
```

### Hook Detail: `useTransform.js`

This is the most complex hook. It manages the 3-step wizard and the workspace lifecycle:

```
Step 0 — Resume Input
  State: resumeText (string from file parse or textarea)
  Actions: handleFileUpload() → fileParser.js → set resumeText
           handleTextInput()  → set resumeText directly

Step 1 — Job Description Input
  State: jobDescription (string)
  Actions: handleJDInput() → set jobDescription

Step 2 — Processing (after submit)
  Actions: handleSubmit() →
    1. Validate resumeText.length, jobDescription.length
    2. Call api.transform(resumeText, jobDescription)
    3. On success:
       a. computeMatchScore(response.output_json, jobDescription)
       b. If local score ≠ DB score → api.updateTransformationScore(id, score)
       c. Set transformData, matchScore, step = 'output'
    4. On error: set error message, step = 0 (return to form)

Step 'output' — Workspace
  State: transformData, selectedTab, selectedTemplate, pageBudget
  Actions: handleTabChange(), handleTemplateChange(), handleDownloadPDF()

Auto-retry: if Groq returns malformed JSON, retry once before showing error
```

---

## 7. DESIGN SYSTEM & TOKENS

### Color Token System (Both Themes)

All components use CSS variables. No hardcoded hex values anywhere except within `:root` and `[data-theme="dark"]` blocks.

```css
/* ─── LIGHT THEME (default) ─── */
:root, [data-theme="light"] {

  /* Surfaces */
  --bg-base:        #FFFFFF;   /* page background */
  --bg-elevated:    #FAFAFA;   /* cards, panels */
  --bg-subtle:      #F4F4F5;   /* hover states, selected rows */
  --bg-muted:       #E4E4E7;   /* input backgrounds, inactive elements */

  /* Borders */
  --border-default: #E4E4E7;
  --border-subtle:  #F0F0F1;
  --border-strong:  #A1A1AA;

  /* Text */
  --text-primary:   #09090B;
  --text-secondary: #52525B;
  --text-muted:     #A1A1AA;
  --text-disabled:  #D4D4D8;

  /* Accent — Emerald Green (existing brand color) */
  --accent:         #10B981;
  --accent-hover:   #059669;
  --accent-fg:      #FFFFFF;
  --accent-subtle:  #D1FAE5;
  --accent-border:  #6EE7B7;

  /* Semantic */
  --success:        #10B981;   --success-subtle: #D1FAE5;   --success-fg: #065F46;
  --warning:        #F59E0B;   --warning-subtle: #FEF3C7;   --warning-fg: #92400E;
  --danger:         #EF4444;   --danger-subtle:  #FEE2E2;   --danger-fg:  #991B1B;
  --neutral:        #71717A;   --neutral-subtle: #F4F4F5;

  /* Shadows */
  --shadow-sm:   0 1px 2px rgba(0,0,0,0.05);
  --shadow-md:   0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-lg:   0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06);
  --shadow-card: 0 0 0 1px var(--border-default), 0 1px 3px rgba(0,0,0,0.05);
}

/* ─── DARK THEME ─── */
[data-theme="dark"] {

  /* Surfaces */
  --bg-base:        #09090B;
  --bg-elevated:    #111113;
  --bg-subtle:      #18181B;
  --bg-muted:       #27272A;

  /* Borders */
  --border-default: #27272A;
  --border-subtle:  #1C1C1F;
  --border-strong:  #3F3F46;

  /* Text */
  --text-primary:   #FAFAFA;
  --text-secondary: #A1A1AA;
  --text-muted:     #52525B;
  --text-disabled:  #3F3F46;

  /* Accent — slightly brighter for dark bg readability */
  --accent:         #10B981;
  --accent-hover:   #34D399;
  --accent-fg:      #FFFFFF;
  --accent-subtle:  #064E3B;
  --accent-border:  #065F46;

  /* Semantic — dark variants */
  --success:        #10B981;   --success-subtle: #064E3B;   --success-fg: #6EE7B7;
  --warning:        #F59E0B;   --warning-subtle: #451A03;   --warning-fg: #FCD34D;
  --danger:         #EF4444;   --danger-subtle:  #450A0A;   --danger-fg:  #FCA5A5;
  --neutral:        #71717A;   --neutral-subtle: #27272A;

  /* Shadows */
  --shadow-sm:   0 1px 2px rgba(0,0,0,0.4);
  --shadow-md:   0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.4);
  --shadow-lg:   0 4px 6px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.4);
  --shadow-card: 0 0 0 1px var(--border-default), 0 1px 3px rgba(0,0,0,0.4);
}

/* ─── SHARED (theme-independent) ─── */
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;

  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  --transition-fast: 100ms ease;
  --transition-base: 150ms ease;
  --transition-slow: 250ms ease;
}
```

### Theme Toggle Behavior
- Toggle button: moon/sun icon in top-right of Navbar
- On click: `document.documentElement.setAttribute('data-theme', newTheme)`
- Persist to `localStorage('resumorph-theme')`
- On app load: read from localStorage → fallback to `prefers-color-scheme` media query
- Body transition: `transition: background var(--transition-slow), color var(--transition-slow)`

### Typography Scale
```
Display:  Inter 700, 42px, --text-primary,   line-height 1.15  (landing H1 only)
H1:       Inter 700, 28px, --text-primary,   line-height 1.2
H2:       Inter 600, 20px, --text-primary,   line-height 1.3
H3:       Inter 600, 15px, --text-primary,   line-height 1.4
Body-lg:  Inter 400, 15px, --text-secondary, line-height 1.65
Body:     Inter 400, 14px, --text-secondary, line-height 1.6
Body-sm:  Inter 400, 13px, --text-secondary, line-height 1.55
Label:    Inter 500, 11px, --text-muted,     letter-spacing 0.07em, uppercase
Mono:     JetBrains Mono 400, 13px, --text-secondary
```

### Score Color Thresholds (used everywhere)
```
>= 70  → var(--success) — green
40–69  → var(--warning) — amber
< 40   → var(--danger)  — red
```

### Motion System
| Element | Property | Duration | Easing |
|---|---|---|---|
| Tab switch | opacity 0→1 | 120ms | ease-out |
| Card hover | background | 100ms | ease |
| Sidebar nav | background + color | 100ms | ease |
| Accordion | max-height + opacity | 180ms | ease-out |
| Score ring fill | stroke-dashoffset | 900ms | ease-out |
| Button press | scale 0.98 | 70ms | ease |
| Copy icon swap | instant | — | — |
| Toast | translateY + opacity | 180ms | ease-out |
| Skeleton shimmer | opacity | 1500ms | ease-in-out, infinite |
| Processing steps | opacity 0→1 | 200ms | ease-out (staggered 400ms) |
| Theme switch | background + color | 250ms | ease |

**Reduced motion:** `@media (prefers-reduced-motion: reduce) { * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; } }`

---

## 8. PAGE-BY-PAGE UI STRUCTURE

### 8.1 Landing Page (`/`)

**Layout:** Single-column, scrolling, public page.

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR                                                 │
│  Logo (left)  |  Dashboard · Transform CV (right)       │
├─────────────────────────────────────────────────────────┤
│  HERO SECTION                                           │
│  Eyebrow: "ATS TAILORING SYSTEM"                        │
│  H1: "Your resume. Tailored for every job."             │
│  Subline: description copy                              │
│  CTAs: [Optimize My Resume →]  [How It Works]           │
│  Trust line: "No credit card required. 10 free/day."   │
│  Terminal diff mockup (animated)                        │
├─────────────────────────────────────────────────────────┤
│  HOW IT WORKS ("Three steps. One perfect resume.")      │
│  3 step cards: Upload → Add JD → Download              │
├─────────────────────────────────────────────────────────┤
│  STATS BAR                                              │
│  [N+ resumes]  ·  [83% avg score]  ·  [<30s speed]    │
├─────────────────────────────────────────────────────────┤
│  FAQ ACCORDION                                          │
│  5 questions, expandable                                │
├─────────────────────────────────────────────────────────┤
│  FOOTER                                                 │
│  Brand + tagline (left)  |  Privacy · Terms (right)     │
└─────────────────────────────────────────────────────────┘
```

**Landing page FAQ questions:**
1. Is my resume stored anywhere permanently?
2. Will the AI make up experience I don't have?
3. Why is ATS optimization important?
4. What file formats do you support for upload?
5. How many resumes can I optimize?

**Stats data source:** Pulled from `usage_stats` table via Supabase client on page load (public read access). Shows real numbers.

**Terminal mockup:** Static or animated diff showing "BEFORE" in red vs "AFTER" in green. Always dark background regardless of theme.

---

### 8.2 Auth Pages (`/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`)

**Layout:** Centered card on `--bg-base` background.

```
┌────────────────────────────────────────┐
│  ResumOrph logo (top, centered)        │
│                                        │
│  ┌────────────────────────────────┐    │
│  │  Heading (Sign in / Create...) │    │
│  │  Subtext                       │    │
│  │  [Email input]                 │    │
│  │  [Password input]              │    │
│  │  [Submit button — full width]  │    │
│  │  Alternate link (Login/Signup) │    │
│  └────────────────────────────────┘    │
└────────────────────────────────────────┘
```

**Card spec:** `--bg-elevated`, `--border-default` border, `--radius-lg`, `32px 36px` padding, `--shadow-md`, max-width `400px`.

**Submit button:** Green filled (`--accent`), full width, shows spinner + "Signing in..." when loading.

**Redirect logic:**
- Authenticated user visiting `/login` or `/signup` → redirected to `/dashboard`
- After successful login → redirected to `/dashboard`
- After signup → redirected to `/verify-email`

---

### 8.3 Dashboard (`/dashboard`)

**Layout:** Protected page, full-width content.

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR                                                 │
├─────────────────────────────────────────────────────────┤
│  PAGE HEADER                                            │
│  "Your Analyses"          [+ New Analysis button]       │
│  "12 total · 3 this week"                               │
├─────────────────────────────────────────────────────────┤
│  STATS ROW (StatsRow.jsx)                               │
│  [Total: 12]  [Best Score: 87%]  [This Week: 3]        │
├─────────────────────────────────────────────────────────┤
│  FILTER ROW                                             │
│  [All] [Applied] [Interviewing] [Offer]                 │
├─────────────────────────────────────────────────────────┤
│  HISTORY LIST (TransformationRow.jsx per item)          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Senior AI Architect    [87%] [Applied ▾]      ›  │   │
│  │ Not Specified  ·  Jun 27, 2026                   │   │
│  └──────────────────────────────────────────────────┘   │
│  (repeating cards)                                      │
├─────────────────────────────────────────────────────────┤
│  FOOTER                                                 │
└─────────────────────────────────────────────────────────┘
```

**Empty state (zero analyses):**
```
Centered in content area:
  Icon (FileText, 48px, --text-muted)
  "No analyses yet."
  "Upload your resume to get started."
  [Start your first analysis →]
```

**StatsRow cards:** 3 cards in a row, each: label + large number. Uses `--bg-elevated` card style.

**TransformationRow card:**
- Full-width card, `--bg-elevated`, `--border-default`, `--radius-md`, `14px 18px` padding
- Click anywhere on card → navigate to `/transform/:id`
- `···` hover menu (top-right): options for Delete
- Status pill: clickable dropdown (Saved / Applied / Interviewing / Offer / Rejected)
- Status pill click → `stopPropagation()` to prevent card navigation

---

### 8.4 Transform Wizard (`/transform`)

**Layout:** Multi-step centered form (steps 0 and 1), then full-page workspace (step 'output').

#### Step 0 — Resume Upload
```
┌──────────────────────────────────────────────────────┐
│  "Upload your resume"                                │
│  Step 1 of 2                                         │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │                                                │  │
│  │   [Upload icon]                                │  │
│  │   Drop your PDF, DOCX, or TXT here            │  │
│  │   or click to browse                           │  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ─── or ───                                          │
│                                                      │
│  [Paste text] tab → shows textarea                   │
│                                                      │
│  [Next →]  (disabled until resume text is ready)     │
└──────────────────────────────────────────────────────┘
```

#### Step 1 — Job Description
```
┌──────────────────────────────────────────────────────┐
│  "Add the job description"                           │
│  Step 2 of 2                                         │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  [Textarea — full job posting goes here]       │  │
│  │                                                │  │
│  │  Paste the complete job posting...             │  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
│  248 characters (min 200)                            │
│                                                      │
│  [← Back]  [Analyze Resume →]                        │
└──────────────────────────────────────────────────────┘
```

#### Loading State — TransformLoading.jsx
```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  Analyzing for Senior AI Architect...                │
│                                                      │
│  ✓  Resume parsed                                    │
│  ✓  Job description read                             │
│  ◌  Rewriting your content...                        │
│  ○  Scoring keyword alignment                        │
│  ○  Drafting cover letter                            │
│                                                      │
│  This usually takes 15–25 seconds.                   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Step timer schedule:**
- 0ms: steps 1+2 complete immediately
- 2000ms: step 3 starts
- 9000ms: step 4 starts
- 16000ms: step 5 starts
- On API return: all steps complete → 400ms delay → navigate to workspace

---

### 8.5 Workspace / TransformOutput (`/transform` after success, `/transform/:id`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  NAVBAR                                                             │
├─────────────────────────────────────────────────────────────────────┤
│  WORKSPACE HEADER (52px)                                            │
│  ← Back to Dashboard  │  Muhammad Aayan Khan — Senior AI Architect  │
│                                               [+ New Analysis]      │
├──────────────────┬──────────────────────────────────────────────────┤
│  SIDEBAR (220px) │  CONTENT PANEL (flex-1, scrollable)              │
│                  │                                                  │
│  ┌────────────┐  │  ← Renders active tab component                  │
│  │ Score Ring │  │                                                  │
│  │   87%      │  │                                                  │
│  │ ATS MATCH  │  │                                                  │
│  └────────────┘  │                                                  │
│                  │                                                  │
│  ─────────────   │                                                  │
│                  │                                                  │
│  Overview        │                                                  │
│  Resume          │                                                  │
│  Keywords        │                                                  │
│  Rewrites        │                                                  │
│  Interview       │                                                  │
│  Cover Letter    │                                                  │
│                  │                                                  │
│  ─────────────   │                                                  │
│  [↓ Download PDF]│                                                  │
│                  │                                                  │
└──────────────────┴──────────────────────────────────────────────────┘
│  FOOTER                                                             │
└─────────────────────────────────────────────────────────────────────┘
```

**Sidebar score ring:** SVG circle, 88px diameter, 6px stroke. Animates 0 → score on mount, 900ms ease-out. Color by threshold.

**Sidebar nav active state:** `--bg-subtle` background + `2px solid var(--accent)` left inset border + `--text-primary` + `Inter 500`.

**Active tab in URL:** Stored as `?tab=overview`. Valid values: `overview`, `resume`, `keywords`, `rewrites`, `interview`, `cover-letter`.

---

### 8.6 Profile Page (`/profile`)

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR                                                 │
├─────────────────────────────────────────────────────────┤
│  "Profile Settings"                                     │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  PERSONAL INFO                                  │    │
│  │  [Avatar circle — initials or photo]            │    │
│  │  [Full Name input]                              │    │
│  │  Email: user@email.com (read-only)              │    │
│  │  [Save Changes button]                          │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  CHANGE PASSWORD                                │    │
│  │  [New Password input]                           │    │
│  │  [Confirm Password input]                       │    │
│  │  [Update Password button]                       │    │
│  └─────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────┤
│  FOOTER                                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 9. WORKSPACE TABS — FULL FEATURE SPECIFICATION

### FINAL TAB LIST (post-redesign: 6 tabs)

The original 10 tabs are reduced to 6. Four tabs are deleted or merged (see Section 17 for deletion rationale).

---

### Tab 1: Overview

**Data consumed:**
```javascript
output_json.meta                 // detected_job_title, detected_company
output_json.recruiter_scan       // strong_yes, completely_missed, elevator_pitch
output_json.roadmap.tasks        // first 2 tasks for "Next Steps"
// From DB record:
match_score, keywords_matched, keywords_total
// New field to add to AI schema:
output_json.ats_quality          // keyword_density, section_headings, formatting_risk
```

**Layout:**
```
┌────────────────────────────────────────────────────────────────┐
│  SCORE + ATS QUALITY CARD (full width, two columns)            │
│  Left: 87%  ATS Compatibility   Right: ✓ Keyword Density Opt. │
│         ████████████░░  87/100          ✓ Section Headings Std │
│                                         ✓ Formatting Risk Clean│
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  AI ANALYSIS PANEL (left accent border)                        │
│  ✦ AI ANALYSIS                                                 │
│  [strong_yes text]                                             │
│  ⚠ [completely_missed text — only if non-empty]               │
└────────────────────────────────────────────────────────────────┘

┌─────────────┬──────────────┬────────────────┬─────────────────┐
│ TARGET ROLE │   COMPANY    │ KEYWORDS       │ LAYOUT SAFETY   │
│ Senior AI   │ Not Spec.    │ 164 / 164      │ ATS Safe        │
│ Architect   │              │                │                 │
└─────────────┴──────────────┴────────────────┴─────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  ATS INFO BANNER                                               │
│  ℹ Resume restructured using single-column standard layout...  │
└────────────────────────────────────────────────────────────────┘

SUGGESTED NEXT STEPS
→ [roadmap.tasks[0].task]    [HIGH IMPACT]
→ [roadmap.tasks[1].task]    [MEDIUM IMPACT]
```

---

### Tab 2: Resume

**Sub-navigation:** `Tailored CV Preview` | `Compare Before & After` | `Raw Plain Text`

#### 2a — Tailored CV Preview

**Template selector (4 options):**
- Classic Serif — Times New Roman style, traditional layout
- Modern Minimalist — clean, left-aligned, sans-serif
- Clean Tech — monospace accents, structured
- Executive Elegant — centered header, formal

**Page budget toggle:**
- Standard Spacing — natural overflow, multi-page allowed
- Auto-Fit (1 Page) — compresses font, margins to fit one page

**Resume document panel:** White `#FFFFFF` background paper, always white regardless of theme. `--shadow-lg` to simulate paper on surface. Renders `output_json` via `ResumePreview.jsx`.

**Download PDF button:** Appears in sidebar AND at top-right of tab. Uses currently selected template. Filename: `{contact.name}_Resume.pdf`.

#### 2b — Compare Before & After
Side-by-side columns: `input_plain_text` (left) vs `output_plain_text` (right). Read-only. If `input_plain_text` is null: show notice in left column.

#### 2c — Raw Plain Text
`output_plain_text` in read-only monospace textarea. Click → select all. Copy button top-right.

---

### Tab 3: Keywords (NEW — merges Skills + ATS Check)

**Data consumed:**
```javascript
output_json.skills               // technical[], tools[], soft[]
// New field to add to AI schema:
output_json.ats_check            // keywords_found[], keywords_missing[]
match_score, keywords_matched, keywords_total
```

**Layout:**
```
KEYWORD COVERAGE                 87%  ████████████░░  87/100

┌─────────────────────────────────────┬─────────────────────────────┐
│  ✓ MATCHED (164)                    │  ✗ MISSING (0)              │
│                                     │                             │
│  [Python] [TensorFlow] [Keras]      │  ✓ No missing keywords.     │
│  [Docker] [Kubernetes] +154 more    │                             │
└─────────────────────────────────────┴─────────────────────────────┘

SKILLS BY CATEGORY
  Technical   ████████████████████   24
  Tools       ████████████           12
  Soft Skills ████                    3
  Missing     ░░░░░░░░░░░░░░░░░░░░    0  ✓
```

**Matched pills:** `--success-subtle` bg, `--success-fg` text. Show first 20, then `+N more` inline expand.

**Missing pills:** `--warning-subtle` bg, `--warning-fg` text. If empty: green "No missing keywords" message.

---

### Tab 4: Rewrites

**Data consumed:** `output_json.rewrites[]` (new field — see AI schema changes)

**Layout:** Full-width two-column diff list:
```
ORIGINAL                             OPTIMIZED

PROFESSIONAL SUMMARY
──────────────────────────────────────────────────────
[original text, muted color,        [AI text, primary color,
 strikethrough on removed words]     green highlight on added words]

WORK EXPERIENCE 1
──────────────────────────────────────────────────────
[original bullet]                   [rewritten bullet]
```

**Word diff:** Uses `diffWords(before, after)` from `diff` npm package.
- Removed words: `text-decoration: line-through`, `var(--danger)` color
- Added words: `background: var(--success-subtle)`, `var(--success-fg)` color, 2px border-radius

**Fallback:** If `rewrites` array is empty or absent: `"Rewrite comparison data not available for this analysis."`

---

### Tab 5: Interview

**Data consumed:** `output_json.interview_prep.technical[]`, `.behavioral[]`, `.curveball[]`

**Layout:**
```
Interview Preparation             [Copy All Questions]
Questions from your resume evidence.

[Technical 2]  [Behavioral 2]  [Curveball 1]   ← segmented tab selector

┌────────────────────────────────────────────────────────────────┐
│  1  How do you design a scalable AI solution?          [HARD] ∨│
├────────────────────────────────────────────────────────────────┤
│  WHAT THE INTERVIEWER EXPECTS:                                 │
│  Demonstrate system design thinking: trade-offs between...     │
└────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────┐
│  2  Can you explain RAG vs retrieval-based systems?    [MED] ∨ │
└────────────────────────────────────────────────────────────────┘
```

**Difficulty colors:**
- HARD → `--danger-subtle` bg, `--danger-fg` text
- MEDIUM → `--warning-subtle` bg, `--warning-fg` text
- EASY → `--success-subtle` bg, `--success-fg` text

**Copy All:** Copies all questions (all three categories) as formatted plain text.

---

### Tab 6: Cover Letter

**Data consumed:** `output_json.cover_letter`, `output_json.contact`, `output_json.meta`, `output_json.recruiter_scan.elevator_pitch`

**Layout:**
```
Cover Letter                                [Copy]  [↓ Download]
Tailored for Senior AI Architect.

┌────────────────────────────────────────────────────────────────┐
│  Muhammad Aayan Khan                                           │
│  khnayn07@gmail.com  ·  +92 334 345 5458  ·  Karachi, PK      │
│  linkedin.com/in/muhammad-aayan-khan                           │
│                                                                │
│  June 27, 2026                                                 │
│                                                                │
│  Dear Hiring Manager,                                          │
│                                                                │
│  [cover_letter body text from output_json]                     │
└────────────────────────────────────────────────────────────────┘

YOUR 30-SECOND PITCH                              [Copy Pitch]
┌────────────────────────────────────────────────────────────────┐
│  "[elevator_pitch text]"                                       │
└────────────────────────────────────────────────────────────────┘
```

**Bug fix:** Replace the AI-generated `[Your Name]` placeholder in cover_letter text with `output_json.contact.name`. Render the header programmatically from structured fields, not from the AI string.

**Download:** Generates and downloads a `.txt` file. Filename: `Cover_Letter_{meta.detected_job_title}.txt`.

---

### DELETED TABS (with rationale)

#### ❌ Recruiter Tab
**Had:** Attention timeline (1st/2nd/3rd noticed), Strong Yes, Completely Missed, Best Fix, Elevator Pitch.

**Why deleted:** The attention timeline was speculation dressed as insight. Strong Yes and Completely Missed are more useful in the Overview where they're concise. The theatrical "recruiter persona" framing adds noise.

**Content preserved:**
- `elevator_pitch` → Cover Letter tab, Section 2
- `strong_yes` + `completely_missed` → Overview AI Analysis panel

#### ❌ Roadmap Tab
**Had:** 4-tier progress bar (Beginner → Top Tier), task checkboxes, progress %, motivational quote.

**Why deleted:** Arbitrary tier system, gamification doesn't fit a focused professional tool, checkboxes that feel persistent but aren't.

**Content preserved:**
- `roadmap.tasks[0..1]` → Overview tab "Suggested Next Steps" section

#### ❌ Re-Score Tab (Sliders)
**Had:** 3 sliders (Technical Depth vs Leadership, Conciseness vs Details, Industry Specificity) + Apply & Re-Score button.

**Why deleted:** Users don't know what "65% Technical Depth" means in ATS context. The score barely changed with slider movement. Undermines trust in the core metric.

**Nothing preserved.** One canonical score.

#### ❌ ATS Check Tab (standalone)
**Had:** Keywords found pills, missing keywords, screening issues text, score badge, action plan.

**Why deleted:** 100% data duplication with Skills tab. Every piece of information existed in both tabs.

**Content preserved:** Fully merged into new Keywords tab.

#### ❌ Skills Tab (standalone)
**Had:** Match % score, matched skill pills, skills-to-add pills, skill coverage by category bar chart.

**Why deleted:** Merged entirely into Keywords tab.

---

## 10. COMPONENT LIBRARY

### Button (`src/components/ui/Button.jsx`)

**Variants:**
```
primary   — --accent bg, --accent-fg text, no border
default   — --text-primary bg, --bg-base text (dark pill) — used for primary nav actions
ghost     — transparent bg, --border-default border, --text-secondary text
danger    — --danger-subtle bg, --danger-fg text
```

**Sizes:**
```
sm   — 28px height, 10px/14px padding, 12px font
md   — 36px height, 12px/18px padding, 13px font  (default)
lg   — 44px height, 14px/22px padding, 15px font
```

**States:**
- Loading: spinner replaces left icon, text changes to loading label, disabled
- Disabled: `opacity: 0.45`, `cursor: not-allowed`
- Focus: `outline: 2px solid var(--accent)`, `outline-offset: 2px`
- Press: `transform: scale(0.98)`, 70ms

### Card (`src/components/ui/Card.jsx`)

```
Default:
  background: var(--bg-elevated)
  border: 1px solid var(--border-default)
  border-radius: var(--radius-lg)
  padding: 20px

Variants:
  flush    — no padding
  accent   — left border: 3px solid var(--accent-border)
  success  — left border: 3px solid var(--success)
  danger   — left border: 3px solid var(--danger)
```

### Score Ring (`src/components/ui/ScoreRing.jsx`) — NEW

SVG animated progress ring:
```
Diameter: 88px (sidebar) or 120px (large variant)
Track stroke: 6px, --border-default color
Fill stroke: 6px, score-color
Center: score number (Inter 700, 26px, --text-primary)
        "ATS MATCH" label (Inter 500, 10px, --text-muted, uppercase)
Animation: stroke-dashoffset from circumference to (1 - score/100)*circumference
Duration: 900ms ease-out, once on mount
```

### Badge/Status Pill (`src/components/ui/Badge.jsx`)

```
All: 10px font, Inter 500, 4px/8px padding, --radius-xs
neutral — --neutral-subtle bg, --neutral text
success — --success-subtle bg, --success-fg text
warning — --warning-subtle bg, --warning-fg text
danger  — --danger-subtle bg, --danger-fg text
accent  — --accent-subtle bg, --accent text
```

### Accordion (`src/components/ui/Accordion.jsx`)

- `max-height` transition for expand: 180ms ease-out
- Chevron rotates 180° on open: 180ms ease
- Only one item open at a time (optional, configurable via `allowMultiple` prop)

### Input / Textarea

```css
background: var(--bg-subtle);
border: 1px solid var(--border-default);
border-radius: var(--radius-sm);
color: var(--text-primary);
font-size: 14px;
padding: 10px 14px;

/* Focus */
border-color: var(--accent);
outline: none;
box-shadow: 0 0 0 3px var(--accent-subtle);

/* Placeholder */
color: var(--text-muted);

/* Error state */
border-color: var(--danger);
box-shadow: 0 0 0 3px var(--danger-subtle);
```

### Skeleton Loader (`src/components/ui/SkeletonBlock.jsx`) — NEW

```css
background: var(--bg-muted);
border-radius: var(--radius-sm);
animation: shimmer 1.5s ease-in-out infinite;

@keyframes shimmer {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1; }
}
```

### Step Progress (`src/components/workspace/StepProgress.jsx`) — NEW

Used in the TransformLoading screen. Shows sequential AI steps with animated state icons.

```
Props: steps: [{ label, status: 'complete' | 'running' | 'pending' }]
Icons:
  complete → Check icon, --success color
  running  → Loader2 icon, --accent color, animate-spin
  pending  → Circle icon, --text-disabled color
```

---

## 11. USER FLOWS & INTERACTIONS

### Full User Journey (New User)

```
1. Lands on / (Landing page)
2. Clicks "Optimize My Resume →"
3. Redirected to /login (or /signup if new)
4. Signs up with email/password
5. Supabase sends verification email
6. User redirected to /verify-email
7. Clicks link in email → redirected to /dashboard
8. Dashboard empty state shows "Start your first analysis"
9. Clicks "Start your first analysis →" → navigates to /transform
10. Step 0: uploads resume (PDF/DOCX) or pastes text
11. Step 1: pastes job description
12. Clicks "Analyze Resume" → TransformLoading screen shows
13. ~20 seconds → workspace loads at ?tab=overview
14. User browses tabs: Overview → Resume → Keywords → etc.
15. Clicks "Download PDF" → PDF downloads to device
16. User navigates to Dashboard → sees new history entry
17. Can click entry to reload workspace for that analysis
```

### Copy Button Flow (Universal)

```
1. User clicks [Copy]
2. navigator.clipboard.writeText(content)
3. Icon: Copy → Check (green), text: "Copy" → "Copied"
4. After 2000ms: revert icon + text
5. On clipboard API failure: toast "Could not copy — select manually"
```

### File Upload Flow

```
1. User drops file onto FileDropzone
2. FileDropzone: validate type (.pdf/.docx/.txt), validate size (<5MB)
3. If invalid: show inline error in dropzone
4. If valid: call fileParser.js
   a. .pdf → lazy-load pdfjs-dist → extract text page by page
   b. .docx → lazy-load mammoth → extractRawText()
   c. .txt → FileReader.readAsText()
5. While parsing: "Parsing..." spinner in dropzone
6. On success: show "✓ filename.pdf · 124 KB" in dropzone
7. Set resumeText state → enable Next button
8. On parse failure: "Could not read this file. Try saving as .txt."
```

### Transform Submission Flow

```
1. User clicks "Analyze Resume"
2. Client validates: resumeText.length >= 100, jobDescription.length >= 200
3. Compute idempotencyKey = SHA-256(resumeText + jobDescription)
4. Set step = 'loading', show TransformLoading
5. Call api.js: supabase.functions.invoke('transform', { body: { resume_text, job_description, idempotency_key } })
6. Edge function processes (see Section 5)
7. On success:
   a. Receive { data: { id, output_json, match_score, keywords_matched, keywords_total } }
   b. Compute client-side score for verification: computeMatchScore(output_json, jobDescription)
   c. If client score ≠ DB score: call api.updateTransformationScore(id, clientScore) in background
   d. Set transformData = output_json, matchScore, step = 'output'
   e. Navigate to ?tab=overview
8. On error:
   a. Parse error code from response
   b. Set error message, step = 0
   c. Show TransformErrorPanel with specific message
```

### Status Update Flow (Dashboard)

```
1. User clicks status pill on a history card
2. Dropdown opens with 5 options: Saved / Applied / Interviewing / Offer / Rejected
3. User selects new status
4. Optimistic update: pill changes immediately in UI
5. PATCH to Supabase: transformations.update({ status: newStatus }).eq('id', id)
6. On success: no visible change (already updated optimistically)
7. On error: revert pill to previous status + toast "Status update failed"
```

### Delete Flow

```
1. User hovers over history card → "···" menu appears (top-right)
2. User clicks "···" → dropdown shows "Delete"
3. User clicks "Delete"
4. Inline confirmation expands within row: "This cannot be undone. [Cancel] [Delete]"
5. User clicks [Delete]
6. Optimistic: fade row out (200ms opacity transition), remove from list
7. API call: soft_delete_transformation(id, user_id)
8. On error: re-add row to list + toast "Delete failed"
```

### Theme Toggle Flow

```
1. User clicks moon/sun icon in Navbar
2. Toggle: if current = 'light' → set 'dark', vice versa
3. document.documentElement.setAttribute('data-theme', newTheme)
4. localStorage.setItem('resumorph-theme', newTheme)
5. CSS variables update instantly via attribute selector
6. Body transition: background + color 250ms ease
7. On next page load: read localStorage → set before React renders
   (put in index.html <head> to prevent flash)
```

---

## 12. ATS MATCH SCORE ENGINE

### Algorithm (Current — `utils/matchScore.js` + `_shared/matchScore.ts`)

Both implementations follow identical logic. Currently duplicated (improvement planned: consolidate to server-only).

```javascript
function computeMatchScore(outputJson, jobDescription) {
  // 1. Normalize job description
  const jdText = jobDescription
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/);

  // 2. Filter stop-words (200+ word list in constants.js)
  //    Includes: common verbs, pronouns, prepositions, generic biz words
  //    e.g. "seeking", "proven", "ability", "experience", "team", "work"
  const filtered = jdText.filter(word =>
    word.length >= 3 &&
    !/^\d+$/.test(word) &&
    !STOP_WORDS.has(word)
  );

  // 3. Unique keywords only
  const keywords = [...new Set(filtered)];

  // 4. Convert output_json to plain text for matching
  const resumeText = resumeToText(outputJson).toLowerCase();

  // 5. Check each keyword (substring match)
  const matched = keywords.filter(kw => resumeText.includes(kw));
  const missing = keywords.filter(kw => !resumeText.includes(kw));

  // 6. Calculate score
  const score = Math.min(Math.floor((matched.length / keywords.length) * 100), 100);

  return { score, matched, missing, total: keywords.length };
}
```

### Score Healing

After a successful transform, client computes its own score and compares it to the DB value. If they differ by more than 1 point (floating point tolerance), client calls `api.updateTransformationScore(id, clientScore)` as a background PATCH to sync the DB. This prevents drift between server-side and client-side calculations.

### Planned Improvements

1. **Phrase-level matching** — bigrams/trigrams for multi-word tech terms ("machine learning", "CI/CD pipelines")
2. **Semantic matching** — embeddings via `text-embedding-3-small` for synonyms ("built" ≈ "engineered")
3. **Section-weighted scoring** — experience bullets get 2x weight, skills 1x, summary 1.5x
4. **Single source of truth** — remove client-side `matchScore.js`, compute only in Edge Function

---

## 13. PDF GENERATION SYSTEM

**File:** `src/lib/pdfGenerator.js`

**Library:** `jsPDF`

**Four templates:**

| Template | Style | Font | Headers |
|---|---|---|---|
| Classic Serif | Traditional | Times New Roman | Bold uppercase |
| Modern Minimalist | Contemporary | Helvetica | Light weight |
| Clean Tech | Developer-focused | Courier + Helvetica | Monospace accents |
| Executive Elegant | Formal | Times New Roman | Centered, ruled |

**Generation flow:**
```
1. Receive: output_json, selectedTemplate, pageBudget
2. Configure jsPDF: { format: 'letter', unit: 'pt' }
3. Set font based on template
4. Render sections in order:
   a. Contact header (name, email, phone, location, links)
   b. Summary paragraph
   c. Skills (technical, tools, soft — comma separated)
   d. Experience (company, title, dates, bullets)
   e. Education (institution, degree, dates)
   f. Projects (title, description, bullets)
   g. Certifications (if present)
5. If pageBudget = '1-page':
   a. Calculate total content height
   b. If overflows: reduce font size by 0.5pt, reduce line height
   c. Repeat until fits within page height
6. Return Blob → trigger browser download
```

**Known limitations:**
- Unicode characters (em-dashes, bullets, special chars) may render inconsistently with default jsPDF fonts
- Multi-page documents can have section orphaning (heading at bottom, content on next page)
- Template fidelity in PDF doesn't always match the HTML preview in ResumePreview.jsx

---

## 14. AUTH SYSTEM

**Provider:** Supabase Auth (email/password)

### AuthContext (`src/contexts/AuthContext.jsx`)

```javascript
// Exposed values:
{
  user: User | null,              // Supabase user object
  loading: boolean,               // true during initial session check
  signIn(email, password),        // → { error }
  signUp(email, password, name),  // → { error }
  signOut(),
  resetPassword(email),           // Sends Supabase magic link email
  updatePassword(newPassword),    // For /reset-password page
  updateProfile({ full_name, avatar_url })
}

// On mount:
supabase.auth.getSession() → set user
supabase.auth.onAuthStateChange((event, session) => set user)
```

### Session Persistence

Supabase JS SDK automatically persists session tokens to `localStorage`. On app reload, `getSession()` retrieves the active session. Session auto-refreshes before expiry.

### Password Reset Flow

```
1. User visits /forgot-password, enters email
2. supabase.auth.resetPasswordForEmail(email, { redirectTo: '/reset-password' })
3. Supabase sends email with magic link
4. User clicks link → browser opens /reset-password?token=...
5. Supabase SDK automatically exchanges token for session
6. User enters new password → supabase.auth.updateUser({ password })
7. Redirect to /dashboard
```

### Route Protection

`ProtectedRoute.jsx` wraps all authenticated pages. On render:
- If `loading === true` → show `<LoadingSpinner />`
- If `user === null` → `<Navigate to="/login" />`
- If `user !== null` → render children

---

## 15. API LAYER

**File:** `src/lib/api.js`

All client-server communication goes through this module. No direct Supabase calls from components or hooks.

```javascript
// All functions exported from api.js:

// Transform
transform(resumeText, jobDescription)
  → supabase.functions.invoke('transform', { body: { resume_text, job_description } })
  → Returns: { data: { id, output_json, match_score, keywords_matched, keywords_total, ... } }

// History
getTransformations(userId, options = { limit, offset, search })
  → supabase.from('transformations').select(...).eq('user_id', userId).order(...)

getTransformationById(id, userId)
  → supabase.from('transformations').select('*').eq('id', id).eq('user_id', userId).single()

deleteTransformation(id, userId)
  → supabase.rpc('soft_delete_transformation', { p_id: id, p_user_id: userId })

updateTransformationLabel(id, userId, label)
  → supabase.from('transformations').update({ label }).eq('id', id).eq('user_id', userId)

updateTransformationStatus(id, userId, status)
  → supabase.from('transformations').update({ status }).eq('id', id).eq('user_id', userId)

updateTransformationScore(id, score)
  → supabase.from('transformations').update({ match_score: score }).eq('id', id)

// Stats
getUsageStats()
  → supabase.from('usage_stats').select('total_transformations, total_users').single()

getUserStats(userId)
  → custom query: count, max score, count this week

// Profile
getProfile(userId)
  → supabase.from('profiles').select('*').eq('id', userId).single()

updateProfile(userId, { full_name, avatar_url })
  → supabase.from('profiles').update({ full_name, avatar_url }).eq('id', userId)
```

---

## 16. PLANNED UI/UX REDESIGN

### Summary of Changes

| Element | Current | Target |
|---|---|---|
| Color scheme | White base, mixed greens/teals, inconsistent | Zinc/slate neutrals, single `#10B981` green accent |
| Dark mode | `data-theme="dark"` already exists | Fully token-driven, complete coverage |
| Score display | Flat red progress bar in sidebar | SVG ring, color-coded by threshold, animated |
| Tab count | 10 tabs | 6 tabs (4 removed/merged) |
| Workspace header | Large report heading + badges + red score pill | Slim 52px contextual breadcrumb bar |
| Cover letter | Monospace `[Your Name]` placeholder | Real structured header from contact data |
| FAQ | Cards per item | Plain divider accordion |
| Stats bar on landing | Isolated large numbers | Inline horizontal strip |
| Share Score button | Green CTA in sidebar | Deleted (not needed at launch) |
| Loading state | Spinner | Sequential step list showing progress |
| Sidebar active state | Dark filled pill (hardcoded) | Token-driven: --bg-subtle + accent left border |

### New Components to Build

```
src/components/ui/ScoreRing.jsx        — SVG animated ring (replaces flat progress bar)
src/components/ui/SkeletonBlock.jsx    — Shimmer loading placeholder
src/components/tabs/KeywordsTab.jsx    — Merges Skills + ATS Check
src/components/workspace/StepProgress.jsx — Processing step list
src/components/dashboard/EmptyDashboard.jsx — Empty state for Dashboard
```

### Files to Delete

```
src/components/tabs/RescoreTab.jsx     — feature deleted
src/components/tabs/RecruiterTab.jsx   — content moved to Overview + Cover Letter
src/components/tabs/RoadmapTab.jsx     — content moved to Overview
src/components/tabs/ATSCheckTab.jsx    — merged into KeywordsTab
src/components/tabs/SkillsTab.jsx      — merged into KeywordsTab
```

### Files to Rename

```
AtsCheckTab.jsx + SkillsTab.jsx    → KeywordsTab.jsx (new merged component)
TailoredCVTab.jsx                  → ResumeTab.jsx
TransformationRow.jsx              → AnalysisRow.jsx
```

---

## 17. PLANNED FEATURE IMPROVEMENTS

### Priority 1 — Foundation (Fix before anything else)

**1. Eliminate matchScore duplication**
- Delete `src/utils/matchScore.js`
- Move all score computation to Edge Function exclusively
- Client reads score from API response — never recomputes it
- Eliminates score drift + background healing hack

**2. Add Zod validation to Edge Function**
- Install: `https://deno.land/x/zod/mod.ts`
- Create `_shared/schemas.ts` with `TransformOutputSchema`
- After Groq JSON parse: `TransformOutputSchema.safeParse(parsed)`
- On failure: return HTTP 422 `{ code: 'PARSE_FAILED', errors: [...] }`
- Prevents malformed AI responses from being saved to DB

**3. Structured error taxonomy**
- Create `src/utils/errors.js` with `ERROR_MESSAGES` map
- Error codes: `RATE_LIMITED`, `CONTENT_TOO_LONG`, `AI_TIMEOUT`, `PARSE_FAILED`, `INVALID_JD`, `AUTH_FAILED`
- Edge Function returns `{ code: string, ...details }` instead of generic strings
- `TransformErrorPanel.jsx` maps codes to user-friendly title + description + action

**4. Fix usage_stats race condition**
- Current: simple `+= 1` increment — race condition under concurrent inserts
- Fix: `INSERT ... ON CONFLICT DO UPDATE SET total = total + 1`
- Apply to both `increment_user_count` and `increment_transformation_count` triggers

### Priority 2 — Core Upgrades

**5. Groq model fallback chain**
```
Primary:   llama-3.3-70b-versatile
Fallback:  llama-3.1-8b-instant (on timeout or 429)
Emergency: mixtral-8x7b
```
Add `AbortController` with 25s timeout per model. Log which model was used.

**6. Idempotency keys**
- Client: hash of `resumeText + jobDescription` sent as `X-Idempotency-Key` header
- Edge Function: check `transformations` for matching hash in last 5 minutes
- If found: return cached result → no duplicate Groq call, no duplicate history entry

**7. Add DB columns**
```sql
ALTER TABLE transformations ADD COLUMN input_plain_text text;
ALTER TABLE transformations ADD COLUMN status text DEFAULT 'Saved'
  CHECK (status IN ('Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'));
ALTER TABLE transformations ADD COLUMN idempotency_key text;
CREATE INDEX idx_transformations_idempotency 
  ON transformations(user_id, idempotency_key, created_at DESC);
```

**8. DOCX export**
- Install `docx` npm package
- Create `src/lib/docxGenerator.js` matching the 4 jsPDF templates
- Add "Export DOCX" button alongside existing PDF download
- `Packer.toBuffer(doc)` → Blob → browser download

### Priority 3 — Experience Upgrades

**9. Animated score count-up**
- `ScoreDisplay.jsx`: count from 0 to final score over 1.5s
- `useEffect` + `setInterval` at 16ms intervals
- Triggers once on mount, respects `prefers-reduced-motion`

**10. Word-level diff in Rewrites tab**
- Install `diff` npm package
- Use `diffWords(before, after)` for inline highlights
- Removed: strikethrough + danger color
- Added: success-subtle background highlight

**11. Job status tracking in Dashboard**
- New status dropdown on history cards (see DB column above)
- Status: Saved → Applied → Interviewing → Offer / Rejected
- Optimistic UI + rollback on API error

**12. Google OAuth**
```javascript
supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: `${origin}/dashboard` }
})
```
- Enable in Supabase Dashboard → Authentication → Providers
- Add button to Login + Signup pages

**13. Unit tests**
- Install Vitest + @testing-library/react
- Test files: `utils/__tests__/matchScore.test.js`, `utils/__tests__/resumeToText.test.js`
- Target: 100% coverage on all `utils/` pure functions

**14. GitHub Actions CI**
```yaml
on: [push, pull_request]
jobs:
  quality:
    - npm run lint
    - npm run test
    - npm run build
```

**15. Sentry error tracking**
- Install `@sentry/react`
- Initialize in `main.jsx` with DSN from env
- Wrap app in `Sentry.ErrorBoundary`
- Log Edge Function errors via `console.error(JSON.stringify({ sentry: true, ... }))`

### AI Schema Additions (for new features)

Add to the Groq system prompt and AI output schema:

```json
// Add to output:
"ats_quality": {
  "keyword_density":  "Optimal | Low | High",
  "section_headings": "Standard | Non-standard",
  "formatting_risk":  "Zero Flags | Minor Issues | At Risk"
},
"ats_check": {
  "keywords_found":   ["string"],
  "keywords_missing": ["string"]
},
"rewrites": [
  {
    "section": "Professional Summary",
    "before": "original text exactly as user provided",
    "after": "AI-rewritten version"
  }
]

// Remove from output:
recruiter_scan.attention_timeline
recruiter_scan.pile
recruiter_scan.best_fix
roadmap.current_level
roadmap.tracked_gain
```

---

## 18. NEXT.JS MIGRATION PLAN

### Why Migrate

| Pain Point | Next.js Fix |
|---|---|
| SPA — bad SEO on landing page | Server Components render landing as static HTML |
| Groq API key in separate Deno deploy | API Routes — one codebase, one `git push` |
| `supabase functions deploy` separate step | No longer needed |
| No SSR — blank flash on load | Server Components eliminate it |
| `vercel.json` SPA fallback hack | Next.js handles routing natively |

### What Stays the Same (Zero Migration)
- Supabase PostgreSQL schema, migrations, RLS
- All `src/components/` JSX files (copy as-is)
- All `src/hooks/` (copy as-is)
- All `src/utils/` (copy as-is)
- Tailwind CSS v4
- Framer Motion, Lucide, Sonner
- jsPDF, PDF.js, Mammoth

### New App Directory Structure

```
src/app/
├── layout.tsx              ← Root layout (replaces index.html + App.jsx)
├── page.tsx                ← Landing (Server Component, no 'use client')
├── globals.css
├── (auth)/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   └── verify-email/page.tsx
├── dashboard/page.tsx
├── transform/
│   ├── page.tsx
│   └── [id]/page.tsx
├── profile/page.tsx
├── auth/callback/route.ts  ← OAuth + magic link callback handler
└── not-found.tsx

src/app/api/
├── transform/route.ts      ← Replaces Deno transform function
├── rescore/route.ts        ← Lightweight rescore endpoint
└── cleanup/route.ts        ← Vercel Cron (replaces Deno cleanup function)

src/middleware.ts           ← Auth session refresh + route protection
                              (replaces ProtectedRoute.jsx)
```

### Supabase Client Split

```typescript
// src/lib/supabase/client.ts — browser components
import { createBrowserClient } from '@supabase/ssr';
export const createClient = () => createBrowserClient(url, key);

// src/lib/supabase/server.ts — server components + API routes
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export async function createClient() { ... }
```

### React Router → Next.js Navigation

| React Router v7 | Next.js 15 |
|---|---|
| `useNavigate()` | `useRouter()` from `next/navigation` |
| `navigate('/path')` | `router.push('/path')` |
| `useParams()` | `useParams()` from `next/navigation` |
| `<Link to="...">` | `<Link href="...">` from `next/link` |
| `<Navigate to="...">` | `redirect('...')` (server) or `router.replace(...)` (client) |

### Environment Variables

| Variable | Current | Next.js |
|---|---|---|
| Supabase URL | `VITE_SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` |
| Supabase Key | `VITE_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Groq API Key | Deno env (secret) | `GROQ_API_KEY` (no `NEXT_PUBLIC_`) |
| Cron Secret | N/A | `CRON_SECRET` (Vercel Cron auth) |

### Migration Timeline (7 Days)

```
Day 1: Bootstrap, Supabase client split, middleware
Day 2: Root layout, landing page (Server Component), auth pages
Day 3: Dashboard, Transform, TransformDetail pages + navigation swap
Day 4: API routes (transform, rescore, cleanup) + shared utilities ported
Day 5: 'use client' directives, PDF.js dynamic import, env vars, api.js update
Day 6: Vercel settings, Supabase OAuth redirect URLs, smoke testing
Day 7: next/image, ISR for landing, parallel data fetching, fix hydration warnings
```

### Critical Gotchas

| Issue | Symptom | Fix |
|---|---|---|
| Missing `'use client'` | Build error: "needs useState/hooks" | Add to top of any component using hooks or browser APIs |
| Hydration mismatch | Console warning: "Text content did not match" | Don't read `localStorage`/`window` during render — use `useEffect` |
| PDF.js SSR crash | "window is not defined" on server | Dynamic import inside event handler only |
| `maxDuration` not set | Vercel times out at 10s | `export const maxDuration = 60` in `/api/transform/route.ts` (Pro tier needed) |
| GROQ key exposed | Key in browser source | Never use `NEXT_PUBLIC_` prefix on secret keys |

### What to Delete After Migration

```
supabase/functions/transform/   — replaced by /app/api/transform/route.ts
supabase/functions/cleanup/     — replaced by /app/api/cleanup/route.ts
vite.config.js                  — replaced by next.config.js
index.html                      — replaced by app/layout.tsx
src/main.jsx                    — replaced by app/layout.tsx
src/App.jsx                     — replaced by app/layout.tsx + middleware
src/components/layout/ProtectedRoute.jsx — replaced by middleware.ts
```

---

## 19. DEVOPS & DEPLOYMENT

### Current Deployment

**Frontend:** Vercel
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 18+

**Database:** Supabase Cloud (hosted PostgreSQL)
- Project region: likely us-east-1 or auto
- Free tier (subject to limits)

**Edge Functions:** Supabase Deno Edge Functions (auto-deployed via Supabase CLI)
- `supabase functions deploy transform`
- `supabase functions deploy cleanup`

### Vercel Config (`vercel.json`)

```json
{
  "cleanUrls": true,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

All routes (including `/dashboard`, `/transform/:id`) rewrite to `/index.html` for client-side React Router to handle.

### Environment Variables (Vercel Dashboard)

```
VITE_SUPABASE_URL        = https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY   = eyJ...
```

(Groq API key lives in Supabase Edge Function env, not Vercel)

### Supabase Environment Variables

```
GROQ_API_KEY   = gsk_...
```
Set in Supabase Dashboard → Edge Functions → Secrets.

### Local Development

```bash
# Terminal 1: Frontend
npm run dev         # Vite dev server at localhost:5173

# Terminal 2: Supabase Edge Functions (optional — can use prod)
supabase start      # Local Supabase instance
supabase functions serve transform --env-file .env.local

# .env (local)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Planned CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
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
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run test      # after Vitest is set up
      - run: npm run build
```

---

## 20. KNOWN ISSUES & TECHNICAL DEBT

### Active Bugs

| Issue | Location | Severity |
|---|---|---|
| Cover letter renders `[Your Name]` placeholder | `CoverLetterTab.jsx` | High — embarrassing in production |
| matchScore computed twice (client + server) can drift | `matchScore.js` + `_shared/matchScore.ts` | Medium — causes background API call to heal |
| `usage_stats` counter has race condition under concurrent load | `004_functions.sql` | Medium — counter may be slightly off |
| Score ring/display in sidebar hardcoded to show red for all scores | `ScoreBanner.jsx` or `WorkspaceSidebar.jsx` | Medium — should be threshold-based |
| PDF.js may fail silently on some PDF formats | `fileParser.js` | Medium — no fallback |
| `GlassPanel.jsx` translucent effect breaks in some dark mode combinations | `GlassPanel.jsx` | Low |

### Technical Debt

| Debt | Impact | Fix |
|---|---|---|
| `matchScore.js` exists in both `utils/` and `_shared/` | Score drift, maintenance burden | Delete `utils/matchScore.js`, server-only |
| No Zod schema validation on Groq response | Malformed JSON saved to DB | Add `_shared/schemas.ts` + validate in transform function |
| Generic error messages in `TransformErrorPanel.jsx` | Poor UX, users don't know what went wrong | Implement error code taxonomy |
| No retry logic in `groq.ts` | Single model, single attempt | Add fallback chain + AbortController |
| No idempotency — double click fires two Groq calls | Wasted API credits, duplicate history entries | Add SHA-256 hash key check |
| No test coverage | Can't safely refactor | Add Vitest + RTL |
| No error tracking (Sentry) | Silent failures in production | Add Sentry DSN |
| Share Score button in sidebar: feature not fully built | Unclear what it does | Remove for launch |
| `JdMatchTab.jsx` — unclear if this tab is even accessible | May be dead code | Audit and remove if unused |
| `PremiumModal.jsx` exists but no premium tier is configured | Dead code | Remove before launch |

### Performance Notes

| Metric | Current | Target |
|---|---|---|
| Transform response time | ~15–25s (Groq cold start) | <20s with fallback |
| Landing page LCP | ~2.5–3.5s (SPA, JS-rendered) | <1.5s (after Next.js migration) |
| PDF generation | ~2–3s client-side | <2s |
| Dashboard load | ~1–2s (fetch on mount) | <1s with React Query cache |
| Tab switch | Instant (client-side only) | Keep |

---

*Document last updated: June 2026*
*Version: ResumOrph Engine v1.2*
