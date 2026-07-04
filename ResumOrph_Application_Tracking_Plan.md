# ResumOrph — Application Tracking Feature Plan
### Track Applied · Deadlines · Interviews · Follow-ups (+ extras)

> Companion to `ResumOrph_MASTER.md`. This extends the existing `status` column (already planned in Section 17, #11) into a full application-tracking system instead of duplicating it.

**Stack note:** `changelog.md` shows the app is already on **Next.js App Router + TypeScript** (`src/app/(auth)/login/page.tsx`), not the Vite/React Router structure in Master Section 3. This plan is written against the current Next.js reality.

---

## 1. CONCEPT

Every row in `transformations` already represents one tailored resume for one specific job — that *is* an application. Rather than bolting on a separate "applications" table, we:

1. **Extend `transformations`** with tracking fields (deadline, applied date, contact info, priority).
2. **Add one new table, `application_events`**, as a flexible timeline — it holds interviews, follow-ups, and notes as typed events against a transformation. One table, three event types, instead of three tables.

This keeps the data model small and keeps "Tracking" naturally living inside the existing workspace (`TransformOutput`) as a new tab, right next to Overview/Resume/Interview Prep.

---

## 2. DATABASE SCHEMA

### 2.1 Extend `transformations`

```sql
-- Migration: 006_application_tracking.sql

ALTER TABLE transformations ADD COLUMN status text DEFAULT 'Saved'
  CHECK (status IN ('Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn'));
  -- (from Master Section 17 #11 — added 'Withdrawn' as a useful 6th state)

ALTER TABLE transformations ADD COLUMN applied_at timestamptz;
ALTER TABLE transformations ADD COLUMN application_deadline date;
ALTER TABLE transformations ADD COLUMN application_url text;
ALTER TABLE transformations ADD COLUMN job_location text;              -- "Remote", "Karachi, PK", "Hybrid"
ALTER TABLE transformations ADD COLUMN salary_range text;
ALTER TABLE transformations ADD COLUMN recruiter_name text;
ALTER TABLE transformations ADD COLUMN recruiter_contact text;         -- email or LinkedIn URL
ALTER TABLE transformations ADD COLUMN priority text DEFAULT 'Medium'
  CHECK (priority IN ('High', 'Medium', 'Low'));
ALTER TABLE transformations ADD COLUMN source text;                    -- "LinkedIn", "Referral", "Company Site"
ALTER TABLE transformations ADD COLUMN is_archived boolean DEFAULT false;
```

### 2.2 New table: `application_events`

```sql
CREATE TABLE public.application_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transformation_id UUID NOT NULL REFERENCES transformations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,  -- denormalized for RLS

  event_type TEXT NOT NULL CHECK (event_type IN ('interview', 'follow_up', 'note')),

  title TEXT NOT NULL,                 -- "Technical Screen", "Follow up with recruiter"
  event_date TIMESTAMPTZ,              -- scheduled date/time (null for plain notes)

  -- interview-specific (null for follow_up/note)
  interview_round TEXT,                -- Phone Screen | Technical | Onsite | Final | HR
  interview_format TEXT,               -- Remote | Onsite | Phone
  interviewer_name TEXT,

  -- shared outcome/state
  outcome TEXT DEFAULT 'Pending'
    CHECK (outcome IN ('Pending', 'Completed', 'Passed', 'Failed', 'Cancelled')),
  is_done BOOLEAN DEFAULT FALSE,       -- for follow-up checkboxes

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.3 Indexes

```sql
CREATE INDEX idx_events_transformation ON application_events(transformation_id, event_date);
CREATE INDEX idx_events_user_upcoming ON application_events(user_id, event_date)
  WHERE is_done = FALSE AND event_type IN ('interview', 'follow_up');
CREATE INDEX idx_transformations_deadline ON transformations(user_id, application_deadline)
  WHERE is_deleted = FALSE AND application_deadline IS NOT NULL;
```

This last index is what makes the dashboard's "Upcoming" widget (Section 5) cheap to query — one indexed scan across all active applications sorted by deadline.

### 2.4 RLS Policies

```sql
ALTER TABLE application_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select own events" ON application_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own events" ON application_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own events" ON application_events
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own events" ON application_events
  FOR DELETE USING (auth.uid() = user_id);
```

### 2.5 Trigger

```sql
CREATE TRIGGER set_updated_at BEFORE UPDATE ON application_events
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();  -- reuse existing function
```

---

## 3. API LAYER (Next.js App Router)

```
src/app/api/
├── transformations/
│   └── [id]/
│       └── route.ts          # PATCH — update status, deadline, applied_at, contact info, priority
│
└── events/
    ├── route.ts               # GET (upcoming, ?days=14) · POST (create event)
    └── [id]/
        └── route.ts           # PATCH (update/complete) · DELETE
```

**`PATCH /api/transformations/[id]`** — body is a partial object of any tracked field:
```ts
{ status?, applied_at?, application_deadline?, application_url?,
  job_location?, salary_range?, recruiter_name?, recruiter_contact?,
  priority?, source?, is_archived? }
```
Server verifies `user_id = auth.uid()` before writing (same pattern as `updateTransformationStatus` already in Master §15).

**`POST /api/events`** — creates an interview / follow-up / note:
```ts
{ transformation_id, event_type, title, event_date?, interview_round?,
  interview_format?, interviewer_name?, notes? }
```

**`GET /api/events?days=14`** — powers the dashboard "Upcoming" widget. Returns all non-`is_done` interview/follow-up events in the next N days, joined with `transformations.detected_job_title` + `detected_company`, ordered by `event_date ASC`. Also returns overdue items (event_date < now, is_done = false) separately so the UI can flag them red.

**`PATCH /api/events/[id]`** — toggle `is_done`, update `outcome`, edit notes/date.

**`DELETE /api/events/[id]`** — remove an event.

---

## 4. WORKSPACE UI — New "Tracking" Tab

Add a 6th sidebar entry in `WorkspaceSidebar.jsx`, between "Overview" and "Interview":

```
Overview
Tracking          ← NEW
Resume
Keywords
...
```

### `tabs/TrackingTab.jsx` — layout

```
┌─────────────────────────────────────────────────────────┐
│  Application Status                                     │
│  [Saved ▾ → Applied → Interviewing → Offer/Rejected]     │
│                                                           │
│  Applied on: [date picker]     Deadline: [date picker]   │
│  Job URL: [input]              Priority: [High/Med/Low]  │
│  Location: [input]             Source: [dropdown]        │
│  Salary range: [input]                                   │
│  Recruiter: [name] [email/LinkedIn]                      │
├───────────────────────────────────────────────────────────┤
│  Timeline                          [+ Add Event ▾]       │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 🎤 Technical Screen — Jul 8, 2:00 PM      [Pending]  │ │
│  │    with Sarah Khan · Remote                          │ │
│  │    Notes: focus on system design...        [Edit]    │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │ ✉️ Follow up with recruiter — Jul 5        [☐ Done]  │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │ 📝 Note — Jun 30                                     │ │
│  │    "Hiring manager mentioned team is 4 people"        │ │
│  └─────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

**"+ Add Event" dropdown** opens `AddEventModal.jsx` with a 3-way tab switcher (Interview / Follow-up / Note), each showing only the relevant fields (interviews get round/format/interviewer; follow-ups just need a date + title; notes just need text).

**Status changer** reuses the same optimistic-update + rollback pattern already specced in Master §11 (Status Update Flow) — just now also lives here, not only on the dashboard card.

---

## 5. DASHBOARD UI CHANGES

### 5.1 "Upcoming" widget (new, top of Dashboard, above Stats Row)

```
┌─────────────────────────────────────────────────────────┐
│  UPCOMING                                     [View all] │
│  🔴 Overdue: Follow up — TechCorp (2 days ago)           │
│  🎤 Tomorrow, 2:00 PM — Technical Screen @ Acme Inc      │
│  📅 Deadline in 3 days — Senior AI Architect @ Beta Co   │
└─────────────────────────────────────────────────────────┘
```
- Pulls from `GET /api/events?days=14` + deadline query.
- Overdue items always shown in red regardless of the 14-day window.
- Empty state: hide the widget entirely (no "nothing upcoming" clutter).
- Each row is clickable → navigates to that transformation's Tracking tab.

### 5.2 `TransformationRow.jsx` — extend existing card

Add small inline badges next to the existing status pill:
```
Senior AI Architect   [87%]  [Applied ▾]  🎤 Jul 8   📅 Due Jul 12   ›
```
- Deadline badge turns red/amber using the same threshold pattern as score colors (`scoreColor.js` logic, reused for date proximity: <2 days = danger, <7 days = warning).
- Only render badges that have data — don't show empty date chips.

### 5.3 Filter row — extend existing filters

Current: `[All] [Applied] [Interviewing] [Offer]`
Add: `[Overdue] [This Week]` as additional quick filters (client-side filter over the already-fetched list, no new query needed).

---

## 6. REMINDERS (lightweight, no new infra required)

Two tiers, cheapest first:

**Tier 1 — In-app only (ship first):** The Upcoming widget above *is* the reminder system. No extra infra. Zero cost, works immediately.

**Tier 2 — Browser notifications (optional, Priority 3):**
- On dashboard mount, check `Notification.permission`; if granted, compare today's date against events due today/tomorrow and fire a native browser notification once per session (dedupe via `localStorage` key `notified:{event_id}:{date}`).
- No backend change needed — this is pure client-side, using data already fetched for the Upcoming widget.

**Tier 3 — Email reminders (stretch, needs infra):**
- A daily Vercel Cron hitting `/api/cron/reminders` (same pattern as the existing `cleanup` edge function, just as a Next.js Route Handler + `vercel.json` cron entry).
- Queries events with `event_date` = tomorrow, sends via Resend/SendGrid.
- Only worth building once you have real usage — skip until Tier 1/2 feel insufficient.

---

## 7. EXTRA FEATURES WORTH ADDING (your "anything else")

Ranked by effort-to-value:

1. **Auto follow-up nudge** — if `status = 'Applied'` and `applied_at` is 7+ days ago with zero events logged since, show a subtle "It's been a week — consider following up" prompt on that card. Pure client-side date math, no schema change.
2. **Kanban board view** — toggle button on Dashboard (List / Board). Columns = status values, cards draggable between them using `dnd-kit` (already have Framer Motion in the stack, `dnd-kit` pairs well). Dragging a card = same `PATCH` status call as the dropdown.
3. **Tags** — free-text tags array (`text[]` column on `transformations`, GIN index) like "Referral", "Dream Job", "Remote-only" for filtering beyond the fixed status enum.
4. **Response-rate analytics** — a 4th stat card: *"Response rate: 40% (2/5 applied got interview)"* computed from status distribution. Cheap query, high perceived value on a job-search tool.
5. **.ics export** — "Add to Calendar" button on each interview event, generates a downloadable `.ics` file client-side (no library needed, it's a small text template) so interviews land in Google/Outlook calendar.
6. **Archive instead of delete** — `is_archived` (already in schema above) lets rejected/withdrawn applications disappear from the default dashboard view without losing history, separate from the existing soft-delete.

---

## 8. BUILD ORDER

```
Phase 1 — Data layer
  • Write + run migration 006 (transformations columns + application_events table + RLS + indexes)
  • Update lib/api.js (or Next.js equivalent data-access module) with typed helpers

Phase 2 — API routes
  • PATCH /api/transformations/[id]
  • POST/GET /api/events, PATCH/DELETE /api/events/[id]

Phase 3 — Tracking tab
  • TrackingTab.jsx: status + metadata fields
  • AddEventModal.jsx (3-way: interview/follow-up/note)
  • Event timeline list with edit/delete/complete

Phase 4 — Dashboard integration
  • UpcomingWidget.jsx
  • Extend TransformationRow.jsx with badges
  • Extend filter row (Overdue / This Week)

Phase 5 — Polish
  • Browser notification tier
  • Auto follow-up nudge
  • Response-rate stat card

Phase 6 — Stretch
  • Kanban view
  • .ics export
  • Tags
  • Email reminders via cron
```

Phases 1–4 give you the four things you asked for end-to-end. Phase 5–6 are the "anything else" additions — build only what you'll actually use; the auto follow-up nudge and response-rate card are the highest value-per-effort of the stretch list.
