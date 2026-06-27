# ResumOrph — Feature Specification & Interaction Design
### How Every Feature Works · Data Flow · Interaction Rules

> This document specifies the **behavior** of every feature in ResumOrph post-redesign. Pair this with the UI Agent Brief for visual specs. This document covers: what data each tab receives, how interactions work, what gets deleted, what gets added, and edge case handling.

---

## FEATURE INVENTORY: FINAL STATE

After the redesign, ResumOrph has **6 tabs** in the workspace:

| # | Tab Name | Purpose | Status |
|---|---|---|---|
| 1 | Overview | Score summary, ATS quality, AI analysis, next steps | Redesigned |
| 2 | Resume | Tailored CV preview, before/after, plain text | Redesigned |
| 3 | Keywords | Matched/missing keywords, skill category breakdown | New (merges Skills + ATS Check) |
| 4 | Rewrites | Side-by-side diff of every AI-improved bullet | Redesigned |
| 5 | Interview | Question bank by category with expected answers | Redesigned |
| 6 | Cover Letter | Complete formatted cover letter + elevator pitch | Redesigned + expanded |

**Deleted features:** Recruiter, Roadmap, Re-Score, ATS Check (as standalone tabs)

---

## 1. ANALYSIS CREATION FLOW (Transform Wizard)

### Step 1: Resume Upload
**Input methods (user can pick any one):**
- Drag-and-drop file zone: accepts `.pdf`, `.docx`, `.txt`
- Click to browse (file picker)
- Paste text directly into a textarea (textarea appears on tab click "Paste text")

**On file drop:**
1. Show file name + size in the drop zone: `resume.pdf  ·  124 KB`
2. Immediately parse the file client-side (PDF.js / Mammoth)
3. Show a small "Parsing..." spinner, then "Ready" with a green dot
4. If parse fails: show inline error `Could not read this file. Try a .txt copy.`

**Validation:**
- Max file size: 5MB — show: `File too large. Maximum size is 5MB.`
- Min parsed text: 200 chars — show: `Resume too short to analyze. Paste more content.`
- Max parsed text: 15,000 chars — show: `Resume too long. Consider trimming older roles.`

### Step 2: Job Description Input
**Single textarea:** full-width, 200px minimum height, auto-grows to content

**Validation (client-side, shown inline below textarea):**
- Min: 200 chars — character counter shows `142 / 200 min` in `--warning` when below threshold
- Max: 10,000 chars
- On focus: show helper text `Paste the complete job posting for best results.`
- On blur: validate and show status

**Smart detection (optional enhancement):** if the user pastes content that starts with a URL, show: `Want to paste the URL instead? We'll extract the job description.` (future feature placeholder — just show the message, don't implement the scraping yet)

### Step 3: Submit Button
**Label:** `Analyze Resume` (not "Transform" — more professional)

**States:**
- `Disabled (gray)`: either resume or JD not yet provided
- `Ready (accent)`: both inputs valid
- `Loading (accent, spinner)`: request in-flight — button disabled, shows spinner icon + `Analyzing...`

**On submit:**
1. Disable button, show loading state
2. Transition to the Processing Status screen (not a spinner — see Section 2 below)
3. On success: navigate to the workspace for that analysis ID
4. On error: show error panel inline (never redirect away)

---

## 2. PROCESSING STATUS SCREEN

When the AI is running, replace the form with a step-progress screen:

```
Analyzing your resume for Senior AI Architect...

  ✓  Resume parsed successfully
  ✓  Job description processed
  ◌  Rewriting experience bullets        ← animated
  ○  Scoring keyword alignment
  ○  Generating cover letter

  This typically takes 15–25 seconds.
```

**Implementation:**
- Steps are driven by a client-side timer (not real server events, since Groq doesn't stream steps)
- Timer schedule: Step 1 at 0s, Step 2 at 1s, Step 3 at 4s, Step 4 at 10s, Step 5 at 16s
- When the API returns (success): all pending steps complete simultaneously, then navigate
- If API returns before step 5 timer: skip remaining timer steps, show all complete, navigate
- If API errors: show the error panel, steps stop animating

**Visual spec (component: `StepProgress.jsx`):**
- `✓` : `--success`, `Check` icon (Lucide, 14px)
- `◌` : `--accent`, `Loader2` icon (Lucide, 14px), `animate-spin`
- `○` : `--text-muted`, `Circle` icon (Lucide, 14px)
- Step label: `Inter 400`, 14px, `--text-secondary` (complete/pending) or `--text-primary` (active)
- Row gap: 12px
- Fade each step in with 150ms delay between them

---

## 3. OVERVIEW TAB — Feature Spec

### Data it receives (from `output_json`):
```javascript
{
  meta: { detected_job_title, detected_company },
  match_score,             // 0–100 integer
  keywords_matched,        // count
  keywords_total,          // count
  recruiter_scan: {
    strong_yes,
    completely_missed,
    best_fix,
    elevator_pitch
  },
  roadmap: {
    tasks: [{ task, impact, points }]  // first 2 tasks only used
  },
  // ATS quality fields (add to AI output schema):
  ats_quality: {
    keyword_density: 'Optimal' | 'Low' | 'High',
    section_headings: 'Standard' | 'Non-standard',
    formatting_risk: 'Zero Flags' | 'Minor Issues' | 'At Risk'
  }
}
```

### Score Panel
- Score value: `match_score` from DB
- Progress bar fill: `(match_score / 100) * 100%`
- Score color: ≥70 → `--success`, 40–69 → `--warning`, <40 → `--danger`

### ATS Quality Panel
Pull from `ats_quality` in output JSON. Three rows:
- Keyword Density: value = `ats_quality.keyword_density`
- Section Headings: value = `ats_quality.section_headings`
- Formatting Risk: value = `ats_quality.formatting_risk`

Each row badge color:
- "Optimal" / "Standard" / "Zero Flags" → `--success` badge
- "Low" / "Non-standard" / "Minor Issues" → `--warning` badge
- "High" / "At Risk" → `--danger` badge

### AI Analysis Panel
**Content:** Combine `recruiter_scan.strong_yes` into a 2-sentence AI summary card. If `recruiter_scan.completely_missed` is non-empty and non-trivial, surface it as a `⚠` warning line below the summary.

**Format:**
```
✦ AI ANALYSIS

[strong_yes text — 1-2 sentences]

⚠ [completely_missed text] — only if present
```

### Next Steps (from roadmap, bottom of tab)
Show first 2 items from `roadmap.tasks`:
```
NEXT STEPS TO IMPROVE YOUR SCORE

→  [task text]                       [impact badge]  [+N pts]
→  [task text]                       [impact badge]  [+N pts]
```
- `HIGH IMPACT` → `--warning-subtle` badge
- `MEDIUM IMPACT` → `--neutral` badge (gray)
- Points: `+5 pts` in `--accent`, `Inter 600`, 12px
- These are **not checkboxes** — they are directional suggestions only

### Metadata Row
- `TARGET ROLE`: `meta.detected_job_title` — if empty, show `Not specified`
- `COMPANY`: `meta.detected_company` — if empty, show `—`
- `KEYWORDS MATCHED`: `{keywords_matched} / {keywords_total}`
- `LAYOUT SAFETY`: Always `ATS Safe` (we enforce ATS-compliant output)

---

## 4. RESUME TAB — Feature Spec

### Three views via sub-tabs:

#### 4a. Resume Preview
- Renders the `output_json` resume data through the selected jsPDF template
- **Interactive template switcher:** 4 options (Classic Serif, Modern, Clean Tech, Executive)
- Template change → re-renders the preview in the panel, no API call needed
- **Page budget toggle:** Standard | 1-Page Fit — same behavior as current

**Download PDF button behavior:**
- In the sidebar: always downloads the currently-selected template
- On click: generate PDF client-side via jsPDF, trigger browser download
- Filename: `{contact.name.replace(/ /g,'_')}_Resume_{detected_job_title.replace(/ /g,'_')}.pdf`
- Show toast: `Resume downloaded` (2 seconds, auto-dismiss)

#### 4b. Before & After (view)
This is a **read-only view** showing the original vs optimized full resume text in two columns.
- Left column: original resume text (stored as `input_plain_text` if we add that DB column, or reconstructed)
- Right column: `output_plain_text` (the AI-optimized version)
- No interactive editing — this is a comparison only

**Note:** Add `input_plain_text` column to the `transformations` table to preserve the original. Store it during the transform call before AI rewrites it.

#### 4c. Plain Text
- Shows `output_plain_text` in a monospace textarea
- Textarea: 100% width, min 400px height, `--bg-muted`, `--font-mono`, 13px, `--text-secondary`
- Read-only with a select-all click (click anywhere → `textarea.select()`)
- Copy button top-right: copies to clipboard, icon swaps to `Check` for 2s

---

## 5. KEYWORDS TAB — Feature Spec (New — replaces Skills + ATS Check)

### Data it receives:
```javascript
{
  skills: {
    technical: string[],
    tools: string[],
    soft: string[]
  },
  ats_check: {
    keywords_found: string[],
    keywords_missing: string[],
    screening_issues: string    // single string, may be empty
  },
  match_score,
  keywords_matched,
  keywords_total
}
```

### Section 1: Score + Status line
```
KEYWORD COVERAGE                     [87%]  ████████████░░░░  87/100
```
- Single-line, full-width
- Bar: 6px height, `--radius-sm`, `--accent` fill, `--bg-muted` track

### Section 2: Two-Column Keyword View

**Left column — MATCHED:**
- Title: `MATCHED ({count})`, `--success`, 11px uppercase
- Content: pill cloud of `ats_check.keywords_found`
- If > 20 keywords: show 20, then `+{N} more` button (expands the rest inline)
- Each pill: `--success-subtle` bg, `--success` text, 11px, `--radius-sm`, `4px 8px` padding

**Right column — MISSING:**
- Title: `MISSING ({count})`, `--warning`, 11px uppercase (if count > 0), else `--success`
- Content: pill cloud of `ats_check.keywords_missing`
- If no missing: show `✓ No critical gaps found` in `--success`, 13px, centered

### Section 3: Skill Categories
Pull from `skills` object:
```
Technical   ████████████████████  {technical.length}
Tools       ████████████          {tools.length}
Soft Skills ████                  {soft.length}
Missing     ░░░░░░░░░░░░░░░░░░░░   0
```
- Bar widths calculated relative to the largest category
- Bar: 4px height, `--accent` fill, `--bg-muted` track
- Labels: 13px `--text-secondary`
- Counts: `Inter 600`, 13px `--text-primary`
- Missing bar: `--danger` fill (if > 0), else shows `✓ none` text

**What's removed:** The "SCREENING ISSUES" narrative box is deleted. That concern ("candidate lacks direct experience") is already covered in the Overview AI Analysis section.

---

## 6. REWRITES TAB — Feature Spec

### Data it receives:
```javascript
// Construct from output_json vs input comparison:
rewrites: [
  {
    section: 'PROFESSIONAL SUMMARY',
    before: string,    // original text
    after: string      // AI-rewritten text
  },
  {
    section: 'WORK EXPERIENCE 1',
    before: string,
    after: string
  },
  // ... one entry per rewritten section/bullet
]
```

**Implementation note:** The `before` text needs to be stored. Add an `input_sections` field to the AI prompt output schema that captures the original sections before rewriting. Alternatively, store the raw input resume text and re-parse it to extract sections.

**Simplest approach:** Add a `rewrites` array to the AI output schema:
```json
{
  "rewrites": [
    { "section": "Professional Summary", "before": "...", "after": "..." },
    { "section": "Work Experience 1", "before": "...", "after": "..." }
  ]
}
```
Include this in the AI system prompt instructions.

### Layout: Side-by-side diff table

**Header row:**
```
ORIGINAL  (left)                    OPTIMIZED  (right)
```
- `ORIGINAL`: `--text-muted`, 11px uppercase
- `OPTIMIZED`: `--success`, 11px uppercase

**Each rewrite row:**
- Section label: full-width strip `--bg-muted`, `--text-muted`, 11px uppercase, `12px` vertical padding
- Left cell: `--text-secondary`, 14px, line-height 1.65, `16px` padding
- Right cell: `--text-primary`, 14px, line-height 1.65, `16px` padding
- Border: `1px solid var(--border-subtle)` between rows
- Column divider: `1px solid var(--border-subtle)` vertical line between left and right

**Word-level diff highlighting:**
- Use the `diff` npm package: `diffWords(before, after)`
- Words removed: `text-decoration: line-through`, `--danger` color
- Words added: `background: var(--success-subtle)`, `--success` text, `border-radius: 2px`, `2px` horizontal padding

### Interaction: none required
This tab is read-only. No editing, no regeneration. The AI output is final.

---

## 7. INTERVIEW TAB — Feature Spec

### Data it receives:
```javascript
interview_prep: {
  technical: [{ question, difficulty, expectation }],  // 2–4 items
  behavioral: [{ question, difficulty, expectation }],  // 2–3 items
  curveball:  [{ question, difficulty, expectation }]   // 1–2 items
}
```

### Tab Switcher (top)
Three tabs: `Technical`, `Behavioral`, `Curveball`
- Each shows count badge: `Technical 2`
- Default open: `Technical`

### Question Accordion

Each question:
- **Collapsed state:** question text + difficulty badge + `∨` chevron
- **Expanded state:** question text + badge + section titled `WHAT THE INTERVIEWER EXPECTS:` + expectation text
- Only one question open at a time (accordion mode — closing others on open is optional, opening multiple is fine)
- Smooth expand/collapse: `max-height` transition 200ms ease-out

**Difficulty badge mapping:**
- `HARD` → `--danger-subtle` bg, `--danger` text
- `MEDIUM` → `--warning-subtle` bg, `--warning` text
- `EASY` → `--success-subtle` bg, `--success` text

### Copy All Questions Button
- Top-right of the tab
- Copies all questions (all categories) to clipboard as plain text:
  ```
  TECHNICAL:
  1. How do you approach designing a scalable AI solution? (HARD)
  
  BEHAVIORAL:
  2. Tell me about a time you had to make a critical technical decision... (MEDIUM)
  ```
- Toast: `Questions copied` (2s, auto-dismiss)

---

## 8. COVER LETTER TAB — Feature Spec

### Data it receives:
```javascript
{
  cover_letter: string,     // full cover letter text from AI
  contact: {
    name, email, phone, location, linkedin
  },
  meta: {
    detected_job_title,
    detected_company
  },
  recruiter_scan: {
    elevator_pitch: string  // moved from deleted Recruiter tab
  }
}
```

### Section 1: Cover Letter Preview Card

**Header:**
```
Contact name at top (from contact.name)
Email · Phone · Location
LinkedIn URL
[blank line]
[Date: formatted as "June 27, 2026"]
[blank line]
Dear Hiring Manager,
[blank line]
[cover_letter body text]
```

**Fixes to implement:**
1. Replace `[Your Name]` with `contact.name` from the output JSON
2. Replace `[Hiring Company]` with `meta.detected_company` (or "the company" if not specified)
3. Date: use the transformation `created_at` date, formatted as "Month DD, YYYY"
4. If `meta.detected_company` is "Not Specified", use `"Hiring Team"` as addressee

**Interaction:**
- `[Copy]` button: copies the full cover letter text to clipboard. Toast: `Cover letter copied`
- `[Download]` button: generates and downloads a `.txt` file. Filename: `Cover_Letter_{detected_job_title}.txt`
- Both buttons top-right of the card

### Section 2: Elevator Pitch (moved from Recruiter tab)

Below the cover letter card, add:
```
┌──────────────────────────────────────────────────────────┐
│  YOUR 30-SECOND PITCH                    [Copy Pitch]    │
│                                                          │
│  "As a highly motivated AI undergraduate with            │
│  production-grade experience..."                         │
└──────────────────────────────────────────────────────────┘
```
- Card: `--bg-elevated`, left border `3px solid var(--accent-border)`, `--radius-md`
- Label: `YOUR 30-SECOND PITCH`, 10px, `--text-muted`, uppercase, tracking-wide
- Text: `Inter 400`, 14px, `--text-secondary`, italic, `"..."` wrapped
- `[Copy Pitch]` button: ghost, `--border-default`, 28px height

---

## 9. SIDEBAR BEHAVIORS

### Score Ring
- **Animates once on mount** — stroke animates from 0 to the score percentage
- **Does NOT re-animate** on tab switches
- **Updates** (re-animates from current to new value) only if the score changes (future: if we add a rescore mechanism)

### Download PDF Button (sidebar)
- Always visible, always functional
- Downloads the last-selected template (default: Classic Serif)
- If template selection changes in the Resume tab, the sidebar button respects that selection
- Share state: `selectedTemplate` lives in the workspace context, read by both the sidebar button and the Resume tab selector

### Navigation State
- Active tab stored in URL: `?tab=keywords` — this allows deep-linking and browser back/forward
- On initial load without `?tab` param: default to `overview`
- Tab names in URL: `overview`, `resume`, `keywords`, `rewrites`, `interview`, `cover-letter`

---

## 10. DASHBOARD — Feature Spec

### Data source:
```javascript
// From: supabase.from('transformations').select('...')
//       .eq('user_id', user.id).eq('is_deleted', false)
//       .order('created_at', { ascending: false })
{
  id,
  detected_job_title,
  detected_company,
  match_score,
  created_at,
  status,        // 'Saved' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected'
}
```

### History List

**Row layout:**
- **Left:** job title (bold) + company + date (secondary)
- **Right:** score badge + status dropdown + navigate chevron

**Score badge:** small circle (20px) colored by score range, shows number inside `Inter 700 10px`

**Status dropdown:**
- Current status shown as a pill
- Click → opens a minimal dropdown with 5 options
- On select: optimistic UI update (change pill immediately), then `PATCH /api/transformations/:id` in background
- Rollback on error: revert to previous status + show error toast

**Navigate chevron:**
- Click → navigate to `/transform/:id`
- Entire row is clickable EXCEPT the status dropdown (to avoid accidental navigation)

**Hover state:** `--bg-subtle` background on the entire row

### Filtering (add to top of dashboard)
```
[All]  [Applied]  [Interviewing]  [Offer]
```
- Simple filter pills — client-side filtering of the already-fetched list
- Default: `All`

### Deletion
- In the `···` menu on each row: `Delete analysis`
- Confirm in a small inline prompt (not a modal): `Are you sure? This cannot be undone. [Cancel] [Delete]`
- On confirm: `PATCH` to soft-delete (`is_deleted: true`), remove row from list with fade-out animation

---

## 11. FEATURES DELETED — SPECIFICATION

### ❌ Re-Score (Slider Panel)
**What it did:** Three sliders (Technical Depth vs Leadership 65/35, Conciseness vs Details 50/50, Industry Specificity 80%) that adjusted scoring weights and triggered a rescore.

**Why deleted:**
- Confusing to most users — what does "65% Technical Depth" mean in practice?
- The output barely changed in response to slider position
- Added a 10th tab to a sidebar already too crowded
- ATS scoring should reflect objective keyword coverage, not user preference

**What replaces it:** Nothing. The score shown is the canonical ATS keyword coverage score.

**What to preserve from its logic:** The `computeMatchScore` function stays (called once at transform time). The `/rescore` Edge Function can stay as backend infrastructure but should not be exposed to users.

---

### ❌ Recruiter Tab
**What it did:** "Six-second resume read" — attention timeline (first/second/third noticed), strong yes, completely missed, best fix, elevator pitch.

**Why deleted:**
- The three-step attention timeline was illustrative but not actionable
- "Completely missed" and "Best fix" are now surfaced in the Overview AI Analysis section
- The theatrical "recruiter's perspective" framing was clever but added a tab that most users skipped

**What's preserved and where:**
- `elevator_pitch` → moved to Cover Letter tab (Section 2 of that tab)
- `strong_yes` → merged into Overview AI Analysis card
- `completely_missed` → merged into Overview AI Analysis card (as warning line)
- `best_fix` → stripped (the same content is covered by "Next Steps" from roadmap tasks)

**Update AI prompt:** Remove `recruiter_scan.best_fix` and `recruiter_scan.attention_timeline` from the output schema. Keep `elevator_pitch`, `strong_yes`, `completely_missed`.

---

### ❌ Roadmap Tab
**What it did:** "Path to Top Tier" — a 4-level progress bar (Beginner → Developing → Competitive → Top Tier), current score, tracked gain, 0/2 tasks done with checkboxes, task progress bar, motivational quote.

**Why deleted:**
- The four-tier gamification was arbitrary and didn't match any real hiring standard
- Checkboxes that weren't persisted (or were persisted?) created false sense of progress
- The motivational quote at the bottom ("With dedication and persistence...") was cliché
- 0/2 tasks done at 49% score made the app feel like it was nagging the user

**What's preserved and where:**
- The 2 tasks → surfaced as "Next Steps" at the bottom of the Overview tab (no checkboxes)
- The current score → already in the sidebar score ring

**Update AI prompt:** Keep `roadmap.tasks` array in the output schema (used for Next Steps in Overview). Remove: `roadmap.current_level`, `roadmap.tracked_gain`, `roadmap.tasks_done` field.

---

### ❌ ATS Check Tab (standalone)
**What it did:** "Parsing and keyword readiness" — keywords found (pill cloud), missing keywords, screening issues text, 49% score badge, action plan (2 items).

**Why deleted:** 100% overlapping with Skills tab. Every piece of information appeared in both places.

**What's preserved:** Fully merged into new Keywords tab.

---

## 12. AI PROMPT SCHEMA CHANGES

Update the system prompt to produce this JSON schema:

### REMOVE from output:
```
recruiter_scan.attention_timeline   → remove
recruiter_scan.pile                 → remove
recruiter_scan.best_fix             → remove (was redundant)
roadmap.current_level               → remove
```

### ADD to output:
```javascript
// Add to schema:
ats_quality: {
  keyword_density:  'Optimal' | 'Low' | 'High',
  section_headings: 'Standard' | 'Non-standard',
  formatting_risk:  'Zero Flags' | 'Minor Issues' | 'At Risk'
},
rewrites: [
  {
    section: string,  // e.g. "Professional Summary", "Work Experience 1"
    before:  string,  // original text
    after:   string   // AI-rewritten version
  }
]
```

### Updated system prompt additions:
```
For ats_quality:
- keyword_density: 'Optimal' if matched keywords > 60% of total, 'Low' if < 30%, else 'High'
- section_headings: 'Standard' if all sections use standard heading names (Summary, Experience, Education, Skills, Projects)
- formatting_risk: 'Zero Flags' (default for our output since we enforce clean formatting)

For rewrites:
- Include one entry per major section you rewrote
- 'before' = the original text as submitted by the user (do not modify before text)
- 'after' = your optimized version
- Include: Professional Summary, each Work Experience, each Project description
- Do NOT include sections with no changes
```

---

## 13. DATABASE CHANGES NEEDED

### New columns on `transformations` table:
```sql
-- Store input text for Before & After view
ALTER TABLE transformations 
ADD COLUMN input_plain_text text;

-- Job application status tracking
ALTER TABLE transformations 
ADD COLUMN status text DEFAULT 'Saved' 
  CHECK (status IN ('Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'));
```

### Update Edge Function to store `input_plain_text`:
In `transform/index.ts`, before calling Groq, store the raw parsed resume text:
```typescript
input_plain_text: resume_text,  // add to the INSERT statement
```

---

## 14. INTERACTION PATTERNS (Global Rules)

### Copy buttons
- Icon: `Copy` (Lucide), swaps to `Check` (Lucide) on success
- Revert after: 2000ms
- Toast: `[Content type] copied` — always auto-dismiss, 2s, no X button

### Toast notifications
- Use `sonner` (already installed)
- Position: top-right
- Duration: 2000ms for success, 4000ms for errors
- Success: no icon, minimal text
- Error: red left border, describes the problem + action

### Empty states (when AI returns no data for a field)
- Interview tab with 0 questions: `No interview questions generated. Try adding more detail to the job description.`
- Keywords with 0 missing: `✓ No missing keywords. Your resume covers the full job spec.`
- Cover letter empty: `Cover letter unavailable for this analysis.`

### Navigation guard
- If user clicks away from the transform wizard while a job is processing: show a confirm dialog:
  `Your analysis is still running. Leave anyway?` — [Stay] [Leave]
- After analysis is complete: no navigation guard

### Error handling (user-visible)
All errors should follow: `[What happened] + [Why] + [What to do]`
- Never: `Something went wrong`
- Always: `Analysis failed — the AI response was unexpected. Try again.`

### Keyboard shortcuts (add to workspace):
- `1–6`: switch tabs (1 = Overview, 2 = Resume... 6 = Cover Letter)
- `Cmd/Ctrl+D`: download PDF
- `Cmd/Ctrl+C` (when in Cover Letter tab): copy cover letter

---

## 15. PERFORMANCE TARGETS

| Metric | Target |
|---|---|
| Landing page LCP | < 1.5s |
| Dashboard load (with history) | < 800ms (with React Query cache) |
| Transform response time | < 25s (Groq, with fallback) |
| Tab switch animation | < 100ms |
| PDF generation | < 2s client-side |
| Score ring animation | exactly 1200ms |

---

## 16. ACCESSIBILITY REQUIREMENTS

- All icon-only buttons must have `aria-label`
- Score ring must have `aria-label="ATS Match Score: 87%"`
- Accordion questions must use `aria-expanded` + `aria-controls`
- Keyboard navigation: all tabs reachable via keyboard, correct focus order
- Color contrast: all text on `--bg-elevated` meets WCAG AA (4.5:1)
- Focus ring: `2px solid var(--accent)`, offset 2px on all interactive elements
- Loading states: `aria-live="polite"` on the step progress container

---

## 17. ANALYTICS EVENTS TO TRACK

Add these events via PostHog or a simple custom logger:

| Event | When to fire | Properties |
|---|---|---|
| `analysis_started` | Submit button clicked | — |
| `analysis_complete` | Navigation to workspace | `{ match_score, job_title, model_used, duration_ms }` |
| `analysis_failed` | Error returned | `{ error_code }` |
| `tab_viewed` | User switches to a tab | `{ tab_name }` |
| `pdf_downloaded` | PDF download triggered | `{ template }` |
| `cover_letter_copied` | Copy button clicked | — |
| `interview_copied` | Copy all questions clicked | — |
| `status_updated` | Job status changed in dashboard | `{ old_status, new_status }` |

---

## 18. COMPONENT FILE MAP (Post-Redesign)

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx              ← full rewrite
│   │   └── Footer.jsx              ← full rewrite
│   │
│   ├── ui/
│   │   ├── Button.jsx              ← full rewrite
│   │   ├── Card.jsx                ← full rewrite
│   │   ├── Badge.jsx               ← rename from StatusBadge, full rewrite
│   │   ├── ScoreRing.jsx           ← NEW: SVG animated ring
│   │   ├── SkeletonLoader.jsx      ← NEW: shimmer loading
│   │   ├── Accordion.jsx           ← update styles
│   │   └── Modal.jsx               ← update styles
│   │
│   ├── workspace/
│   │   ├── WorkspaceSidebar.jsx    ← full rewrite
│   │   ├── WorkspaceHeader.jsx     ← full rewrite (replaces report header)
│   │   └── StepProgress.jsx        ← NEW: processing steps UI
│   │
│   ├── tabs/
│   │   ├── OverviewTab.jsx         ← full rewrite
│   │   ├── ResumeTab.jsx           ← renamed from TailoredCVTab, partial rewrite
│   │   ├── KeywordsTab.jsx         ← NEW: merges SkillsTab + ATSCheckTab
│   │   ├── RewritesTab.jsx         ← full rewrite
│   │   ├── InterviewTab.jsx        ← full rewrite
│   │   └── CoverLetterTab.jsx      ← partial rewrite (+ elevator pitch)
│   │
│   ├── dashboard/
│   │   ├── AnalysisRow.jsx         ← renamed from TransformationRow, rewrite
│   │   ├── StatusDropdown.jsx      ← NEW: job status picker
│   │   └── EmptyDashboard.jsx      ← NEW: empty state
│   │
│   └── landing/
│       ├── Hero.jsx                ← full rewrite
│       ├── HowItWorks.jsx          ← full rewrite
│       ├── StatsBar.jsx            ← full rewrite
│       └── FAQ.jsx                 ← style rewrite only
│
├── pages/
│   ├── Landing.jsx                 ← full rewrite
│   ├── Dashboard.jsx               ← partial rewrite
│   ├── Transform.jsx               ← update submit handling, add StepProgress
│   └── TransformDetail.jsx         ← update layout, tab names, remove old tabs
│
└── styles/
    └── globals.css                 ← full token system replacement
```

**Files to DELETE:**
```
src/components/tabs/RescoreTab.jsx
src/components/tabs/RecruiterTab.jsx
src/components/tabs/RoadmapTab.jsx
src/components/tabs/ATSCheckTab.jsx
src/components/tabs/SkillsTab.jsx
```
