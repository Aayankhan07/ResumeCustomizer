# ResumOrph — UI/UX Complete Redesign Brief

### Agent Execution Document · Visual Design + Component Overhaul

> **Design Direction:** Clean, professional, neutral. Zinc/slate foundation — no purple, no indigo, no flashy gradients. The single accent is **emerald green** (`#10B981`), inherited from the current brand. Both **dark and light themes** are fully supported. Think Notion, GitHub, or a refined B2B SaaS tool. Every element earns its place.

---

## 1. DESIGN TOKENS — DUAL THEME SYSTEM

Replace `globals.css` entirely with this token system. All component code must use these CSS variables — never hardcode colors.

```css
/* =============================================
   LIGHT THEME (default)
   ============================================= */
:root,
[data-theme="light"] {
  /* Surfaces */
  --bg-base: #ffffff;
  --bg-elevated: #fafafa;
  --bg-subtle: #f4f4f5; /* hover states, selected rows */
  --bg-muted: #e4e4e7; /* input backgrounds, inactive elements */

  /* Borders */
  --border-default: #e4e4e7;
  --border-subtle: #f0f0f1;
  --border-strong: #a1a1aa;

  /* Text */
  --text-primary: #09090b;
  --text-secondary: #52525b;
  --text-muted: #a1a1aa;
  --text-disabled: #d4d4d8;

  /* Accent — Emerald Green (brand color, keep from current app) */
  --accent: #10b981;
  --accent-hover: #059669;
  --accent-fg: #ffffff; /* text ON the accent color */
  --accent-subtle: #d1fae5; /* tinted background */
  --accent-border: #6ee7b7;

  /* Semantic */
  --success: #10b981;
  --success-subtle: #d1fae5;
  --success-fg: #065f46;

  --warning: #f59e0b;
  --warning-subtle: #fef3c7;
  --warning-fg: #92400e;

  --danger: #ef4444;
  --danger-subtle: #fee2e2;
  --danger-fg: #991b1b;

  --neutral: #71717a;
  --neutral-subtle: #f4f4f5;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-card: 0 0 0 1px var(--border-default), 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* =============================================
   DARK THEME
   ============================================= */
[data-theme="dark"] {
  /* Surfaces */
  --bg-base: #09090b;
  --bg-elevated: #111113;
  --bg-subtle: #18181b;
  --bg-muted: #27272a;

  /* Borders */
  --border-default: #27272a;
  --border-subtle: #1c1c1f;
  --border-strong: #3f3f46;

  /* Text */
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --text-muted: #52525b;
  --text-disabled: #3f3f46;

  /* Accent — same green, slightly brighter for dark bg readability */
  --accent: #10b981;
  --accent-hover: #34d399;
  --accent-fg: #ffffff;
  --accent-subtle: #064e3b;
  --accent-border: #065f46;

  /* Semantic */
  --success: #10b981;
  --success-subtle: #064e3b;
  --success-fg: #6ee7b7;

  --warning: #f59e0b;
  --warning-subtle: #451a03;
  --warning-fg: #fcd34d;

  --danger: #ef4444;
  --danger-subtle: #450a0a;
  --danger-fg: #fca5a5;

  --neutral: #71717a;
  --neutral-subtle: #27272a;

  /* Shadows (darker, more pronounced) */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 4px 6px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.4);
  --shadow-card: 0 0 0 1px var(--border-default), 0 1px 3px rgba(0, 0, 0, 0.4);
}

/* =============================================
   SHARED (theme-independent)
   ============================================= */
:root {
  /* Typography */
  --font-sans:
    "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", "Cascadia Code", monospace;

  /* Radius */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Transitions */
  --transition-fast: 100ms ease;
  --transition-base: 150ms ease;
  --transition-slow: 250ms ease;
}
```

**Theme switching:** The existing `data-theme` toggle button in the navbar stays. On click, toggle `document.documentElement.setAttribute('data-theme', 'dark' | 'light')` and persist to `localStorage`.

---

## 2. TYPOGRAPHY

**Font:** `Inter` (already in use — keep it). No new fonts.

Add to `index.html` `<head>` if not already present:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

**Type Scale:**

```
Display:  Inter 700, 42px, --text-primary, line-height 1.15   (landing H1 only)
H1:       Inter 700, 28px, --text-primary, line-height 1.2
H2:       Inter 600, 20px, --text-primary, line-height 1.3
H3:       Inter 600, 15px, --text-primary, line-height 1.4
Body-lg:  Inter 400, 15px, --text-secondary, line-height 1.65
Body:     Inter 400, 14px, --text-secondary, line-height 1.6
Body-sm:  Inter 400, 13px, --text-secondary, line-height 1.55
Label:    Inter 500, 11px, --text-muted, letter-spacing 0.07em, text-transform uppercase
Mono:     JetBrains Mono 400, 13px, --text-secondary
```

---

## 3. NAVBAR (Refine, Don't Rebuild)

The current navbar is close to correct. Make these targeted changes:

**Keep:**

- `ResumOrph` logotype placement (left)
- `Dashboard` nav link
- `+ Transform CV` CTA button
- Avatar/initial circle (right)
- Theme toggle moon icon (right)

**Change:**

### Height

`64px → 56px`. Tighter, more professional.

### Background + Border

```css
background: var(--bg-base);
border-bottom: 1px solid var(--border-default);
backdrop-filter: blur(8px);
background: color-mix(in srgb, var(--bg-base) 90%, transparent);
position: sticky;
top: 0;
z-index: 100;
```

### `+ Transform CV` Button

Keep the filled dark button concept but use semantic tokens:

```css
/* Light mode */
background: var(--text-primary); /* near-black */
color: var(--bg-base); /* white */

/* Dark mode — inherits text-primary which becomes near-white */
background: var(--text-primary);
color: var(--bg-base);

border-radius: var(--radius-sm);
padding: 8px 16px;
font-size: 13px;
font-weight: 500;
```

This matches the current dark pill in light mode and automatically becomes a near-white pill in dark mode.

### Nav Links

```css
font-size: 14px;
font-weight: 400;
color: var(--text-secondary);

&:hover {
  color: var(--text-primary);
}
```

No underlines, no background on hover. Just the text color shift.

### Theme Toggle

Keep the moon icon. On dark mode, swap to sun icon. No border on the icon button — just the icon itself.

---

## 4. LANDING PAGE

### Hero Section

**Current:** Good heading size and split layout. Problems: too much whitespace between sections, stats are undersized, the terminal mockup code window drifts.

**Changes only — do not rebuild from scratch:**

**H1:** Keep `Your resume. / Tailored for every job.` — it works.

**Subheadline color fix:**

```css
color: var(--text-secondary); /* currently may be hardcoded */
```

**CTA buttons:**

```css
/* Primary: "Optimize My Resume" */
background: var(--accent);
color: var(--accent-fg);
padding: 10px 20px;
border-radius: var(--radius-sm);
font-size: 14px;
font-weight: 500;
border: none;

/* Primary hover */
background: var(--accent-hover);

/* Secondary: "How It Works" */
background: transparent;
color: var(--text-secondary);
border: 1px solid var(--border-default);
padding: 10px 20px;
border-radius: var(--radius-sm);
font-size: 14px;

/* Secondary hover */
background: var(--bg-subtle);
color: var(--text-primary);
```

**Trust line** below CTAs:

```css
font-size: 12px;
color: var(--text-muted);
```

**Terminal mockup window:**

```css
background: #0d0d0d; /* always dark regardless of theme */
border: 1px solid #2a2a2a;
border-radius: var(--radius-lg);
box-shadow: var(--shadow-lg);
```

Inside: keep the red/green BEFORE/AFTER diff. This is good. Just ensure the window doesn't look cut off — add `overflow: hidden` and proper `padding: 24px`.

### How It Works (3 Step Cards)

**Current cards:** plain white with a step badge. Fine structure, needs refinement.

**Changes:**

```css
/* Card */
background: var(--bg-elevated);
border: 1px solid var(--border-default);
border-radius: var(--radius-lg);
padding: 24px;
box-shadow: var(--shadow-sm);

/* Step badge (top right of card) */
background: var(--bg-subtle);
color: var(--text-muted);
font-size: 11px;
font-weight: 500;
padding: 4px 8px;
border-radius: var(--radius-xs);
border: 1px solid var(--border-default);

/* Card icon */
color: var(--accent);
width: 32px;
height: 32px;

/* Card title */
font-size: 15px;
font-weight: 600;
color: var(--text-primary);
margin-top: 12px;

/* Card description */
font-size: 13px;
color: var(--text-secondary);
line-height: 1.6;
margin-top: 6px;
```

### Stats Section

**Current:** `1+`, `83%`, `<30s` — too sparse. Numbers are too small.

**Change to horizontal divider strip:**

```
─────────────────────────────────────────────────────────────────
   1+  resumes optimized   ·   83%  average match score   ·   <30s  processing
─────────────────────────────────────────────────────────────────
```

```css
/* Container */
border-top: 1px solid var(--border-default);
border-bottom: 1px solid var(--border-default);
padding: 20px 0;
display: flex;
align-items: center;
justify-content: center;
gap: 32px;

/* Each stat: number + label inline */
/* Number */
font-size: 20px;
font-weight: 700;
color: var(--text-primary);

/* Label */
font-size: 13px;
color: var(--text-muted);
margin-left: 6px;

/* Separator dots */
color: var(--border-default);
```

### FAQ Section

**Current:** Accordion with cards around each item. Looks heavy.

**Change:** Remove the outer card wrapper from each item. Plain accordion with dividers:

```css
/* Each FAQ item */
border-bottom: 1px solid var(--border-default);
padding: 16px 0;

/* Question text */
font-size: 14px;
font-weight: 500;
color: var(--text-primary);
cursor: pointer;

/* On hover */
color: var(--accent);

/* Answer text */
font-size: 14px;
color: var(--text-secondary);
line-height: 1.7;
padding-top: 10px;

/* Chevron */
color: var(--text-muted);
transition: transform var(--transition-base);
/* Open: */
transform: rotate(180deg);
```

### Footer

```css
/* Container */
background: var(--bg-elevated);
border-top: 1px solid var(--border-default);
padding: 32px 0;

/* Layout: 2 col — brand left, links right */
/* Brand text */
font-size: 13px;
color: var(--text-muted);

/* Links */
font-size: 13px;
color: var(--text-muted);
/* Hover */
color: var(--text-secondary);
```

---

## 5. WORKSPACE — SIDEBAR (Refine)

The current sidebar structure (score bar → nav items → download/share buttons) is correct. Make targeted changes.

### Score Panel (top of sidebar)

**Delete:** the flat progress bar (`ATS COMPATIBILITY 49% ████░░`).

**Replace with:** SVG ring score display.

```jsx
// Component: src/components/ui/ScoreRing.jsx
// SVG circle ring, fills from 0 to score on mount

// Spec:
// Ring diameter: 88px
// Track stroke: 6px, var(--border-default)
// Fill stroke: 6px, color based on score
// Center number: Inter 700, 26px, var(--text-primary)
// Center label: Inter 500, 10px, var(--text-muted), uppercase, "ATS MATCH"

// Score color thresholds:
// >= 70:  var(--success) — green
// 40-69:  var(--warning) — amber
// < 40:   var(--danger)  — red

// Animation: stroke-dashoffset from circumference to (1 - score/100)*circumference
// Duration: 900ms, ease-out
// Only animates once on mount
```

```css
/* Score panel card */
background: var(--bg-elevated);
border: 1px solid var(--border-default);
border-radius: var(--radius-lg);
padding: 20px;
display: flex;
flex-direction: column;
align-items: center;
gap: 4px;
margin-bottom: 16px;
```

### Navigation Items

**Current active state:** dark filled `#1a1a2e` pill — looks fine but doesn't adapt to theme.

**Replace with:**

```css
/* Nav item base */
display: flex;
align-items: center;
gap: 10px;
padding: 8px 10px;
border-radius: var(--radius-sm);
font-size: 14px;
font-weight: 400;
color: var(--text-secondary);
cursor: pointer;
transition:
  background var(--transition-fast),
  color var(--transition-fast);

/* Hover */
background: var(--bg-subtle);
color: var(--text-primary);

/* Active */
background: var(--bg-subtle);
color: var(--text-primary);
font-weight: 500;
/* Left accent bar */
box-shadow: inset 2px 0 0 var(--accent);
```

**Nav items (6 tabs — see Feature Spec for full list):**

```
Overview
Resume          (rename from "Tailored CV")
Keywords        (new — merges Skills + ATS Check)
Rewrites
Interview
Cover Letter
```

**Remove from sidebar nav:** Roadmap, Recruiter, Re-Score, ATS Check, Skills

### Sidebar Buttons

**Delete:** Green "Share Score" button — this feature adds complexity for no user need at launch.

**Keep:** "Download PDF" button.

```css
/* Download PDF button */
width: 100%;
background: transparent;
border: 1px solid var(--border-default);
border-radius: var(--radius-sm);
padding: 8px 14px;
font-size: 13px;
font-weight: 500;
color: var(--text-secondary);
display: flex;
align-items: center;
gap: 8px;

/* Hover */
background: var(--bg-subtle);
color: var(--text-primary);
border-color: var(--border-strong);
```

---

## 6. WORKSPACE HEADER (Refine)

**Current:** Large `ResumeAI Report` heading with `● ANALYSIS ACTIVE` badge, user name/role, `● 100 Match Score` red pill, `+ New Analysis` button. Feels like a marketing page inside a tool.

**Replace the header with a slim contextual bar:**

```
┌──────────────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard     Muhammad Aayan Khan — Senior AI Architect   │
│  height: 52px                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

```css
/* Header bar */
height: 52px;
padding: 0 24px;
display: flex;
align-items: center;
gap: 16px;
border-bottom: 1px solid var(--border-default);
background: var(--bg-base);

/* Back link */
font-size: 13px;
color: var(--text-muted);
display: flex;
align-items: center;
gap: 6px;
/* Hover */
color: var(--text-secondary);

/* Divider between back link and name */
width: 1px;
height: 16px;
background: var(--border-default);

/* Name + role */
font-size: 14px;
font-weight: 500;
color: var(--text-primary);

/* Right side: New Analysis button */
margin-left: auto;
```

**New Analysis button (right side):**

```css
background: var(--text-primary);
color: var(--bg-base);
border: none;
border-radius: var(--radius-sm);
padding: 7px 14px;
font-size: 13px;
font-weight: 500;
```

**Delete:** The `● ANALYSIS ACTIVE` badge, the `● 100 Match Score` red pill, the `LABEL: NONE ✎` label controls.

---

## 7. OVERVIEW TAB (Refine)

**Current issues:** "Compatibility Overview" heading is redundant (we know it's the overview). The two side-by-side cards (Fit Summary / ATS Scan Quality) are fine in structure but need visual cleanup. The metadata bar at the bottom is good.

### Score + ATS Quality Card (full-width, top)

Replace the two separate cards with one unified card:

```
┌─────────────────────────────────────────────────────────────────┐
│  49%  ATS Compatibility          ✓ Keyword Density    Optimal   │
│  ████░░░░░░░░░  49/100           ✓ Section Headings   Standard  │
│                                  ✓ Formatting Risk    Clean     │
└─────────────────────────────────────────────────────────────────┘
```

```css
/* Card */
background: var(--bg-elevated);
border: 1px solid var(--border-default);
border-radius: var(--radius-lg);
padding: 20px 24px;
display: grid;
grid-template-columns: 1fr 1fr;
gap: 24px;
box-shadow: var(--shadow-sm);

/* Left: score */
/* Score number */
font-size: 32px;
font-weight: 700;
color: var(--text-primary);
/* Score label */
font-size: 11px;
font-weight: 500;
color: var(--text-muted);
text-transform: uppercase;
letter-spacing: 0.07em;
margin-top: 2px;
/* Progress bar */
height: 4px;
background: var(--bg-muted);
border-radius: 2px;
margin-top: 10px;
/* Fill (score color) */
background: [score-color-var];
width: [score]%;

/* Right: ATS quality rows */
/* Each row */
display: flex;
justify-content: space-between;
align-items: center;
padding: 6px 0;
border-bottom: 1px solid var(--border-subtle);
/* last row: no border-bottom */

/* Row label */
font-size: 13px;
color: var(--text-secondary);

/* Row status badge */
font-size: 11px;
font-weight: 500;
padding: 2px 8px;
border-radius: var(--radius-xs);
```

**Status badge colors:**

- `OPTIMAL`, `100% STANDARD`, `ZERO FLAGS`, `CLEAN` → `background: var(--success-subtle)`, `color: var(--success-fg)`
- `LOW`, `NON-STANDARD` → `background: var(--warning-subtle)`, `color: var(--warning-fg)`
- `AT RISK` → `background: var(--danger-subtle)`, `color: var(--danger-fg)`

### AI Fit Summary (below the card)

Rename "FIT SUMMARY" to "AI ANALYSIS". Clean up the card:

```css
/* Card */
background: var(--bg-elevated);
border: 1px solid var(--border-default);
border-left: 3px solid var(--accent); /* accent left border only */
border-radius: var(--radius-md);
padding: 16px 20px;

/* Section label */
font-size: 11px;
font-weight: 500;
color: var(--accent);
text-transform: uppercase;
letter-spacing: 0.07em;

/* Body text */
font-size: 14px;
color: var(--text-secondary);
line-height: 1.65;
margin-top: 8px;
```

### Tailoring Metadata (bottom row of 4 stats)

Keep structure. Fix styles:

```css
/* Container */
background: var(--bg-elevated);
border: 1px solid var(--border-default);
border-radius: var(--radius-md);
padding: 16px 20px;
display: grid;
grid-template-columns: repeat(4, 1fr);
gap: 16px;

/* Each stat */
/* Label (TARGET ROLE, COMPANY...) */
font-size: 11px;
font-weight: 500;
color: var(--text-muted);
text-transform: uppercase;
letter-spacing: 0.07em;

/* Value */
font-size: 14px;
font-weight: 600;
color: var(--text-primary);
margin-top: 4px;

/* "ATS Compliant" value specifically */
color: var(--success);
```

### ATS Warning Banner (bottom)

The `ℹ This resume has been restructured...` info block. Keep it, make it minimal:

```css
background: var(--bg-subtle);
border: 1px solid var(--border-default);
border-radius: var(--radius-md);
padding: 12px 16px;
font-size: 13px;
color: var(--text-muted);
display: flex;
gap: 10px;
align-items: flex-start;
/* icon */
color: var(--text-muted);
margin-top: 2px;
flex-shrink: 0;
```

### Next Steps (add at bottom)

Below the info banner, add a minimal "Next Steps" section pulling from `roadmap.tasks[0..1]`:

```
SUGGESTED NEXT STEPS

→  Develop a project showcasing scalability and cloud expertise     HIGH IMPACT
→  Participate in professional communities for keyword presence      MEDIUM IMPACT
```

```css
/* Section label */
font-size: 11px;
font-weight: 500;
color: var(--text-muted);
text-transform: uppercase;
letter-spacing: 0.07em;
margin-bottom: 10px;

/* Each step row */
display: flex;
align-items: center;
gap: 10px;
padding: 10px 0;
border-bottom: 1px solid var(--border-subtle);
font-size: 14px;
color: var(--text-secondary);

/* Arrow */
color: var(--text-muted);
flex-shrink: 0;

/* Impact badge */
margin-left: auto;
font-size: 11px;
font-weight: 500;
padding: 2px 8px;
border-radius: var(--radius-xs);
/* HIGH IMPACT: warning-subtle + warning-fg */
/* MEDIUM IMPACT: neutral-subtle + neutral */
```

---

## 8. RESUME TAB (Refine "Tailored CV")

**Keep:** The three sub-tabs (Tailored CV Preview / Compare Before & After / Raw Plain Text), the template selector, and the page budgeting toggle.

**Rename the tab itself** in the sidebar: `Tailored CV` → `Resume`.

### Sub-navigation tabs

```css
/* Tab container */
border-bottom: 1px solid var(--border-default);
display: flex;
gap: 0;

/* Each tab */
padding: 10px 16px;
font-size: 13px;
font-weight: 400;
color: var(--text-muted);
cursor: pointer;
border-bottom: 2px solid transparent;
margin-bottom: -1px;

/* Active tab */
color: var(--text-primary);
font-weight: 500;
border-bottom-color: var(--accent);
```

### Template Selector

```css
/* Container */
background: var(--bg-subtle);
border: 1px solid var(--border-default);
border-radius: var(--radius-md);
padding: 12px 16px;

/* "SELECT DESIGN TEMPLATE" label */
font-size: 11px;
font-weight: 500;
color: var(--text-muted);
text-transform: uppercase;
letter-spacing: 0.07em;

/* Template option */
padding: 8px 12px;
border-radius: var(--radius-sm);
border: 1px solid var(--border-default);
background: var(--bg-base);
font-size: 12px;
font-weight: 500;
color: var(--text-secondary);
cursor: pointer;

/* Active template */
border-color: var(--accent);
color: var(--accent);
background: var(--accent-subtle);

/* Template subtitle */
font-size: 11px;
color: var(--text-muted);
font-weight: 400;
```

### Resume Preview Panel

```css
/* Panel container */
background: var(--bg-subtle);
border-radius: var(--radius-md);
padding: 24px;
display: flex;
justify-content: center;

/* Resume document (the white paper) */
background: #ffffff; /* always white — it's a document */
color: #000000; /* always black text */
border-radius: 2px;
box-shadow:
  0 2px 8px rgba(0, 0, 0, 0.12),
  0 0 0 1px rgba(0, 0, 0, 0.05);
width: 100%;
max-width: 680px;
min-height: 900px;
padding: 48px;
```

---

## 9. KEYWORDS TAB (New — replaces Skills + ATS Check)

This is a new tab merging two previously redundant tabs.

### Score bar (top)

```css
/* Container */
display: flex;
align-items: center;
gap: 16px;
padding: 16px 0;
border-bottom: 1px solid var(--border-default);

/* Label */
font-size: 11px;
font-weight: 500;
color: var(--text-muted);
text-transform: uppercase;
letter-spacing: 0.07em;

/* Bar track */
flex: 1;
height: 6px;
background: var(--bg-muted);
border-radius: 3px;

/* Bar fill */
background: [score-color];
border-radius: 3px;
transition: width 600ms ease-out;

/* Score number */
font-size: 15px;
font-weight: 700;
color: var(--text-primary);
```

### Two-column keyword grid

```css
/* Grid */
display: grid;
grid-template-columns: 1fr 1fr;
gap: 16px;
margin-top: 16px;

/* Each column card */
background: var(--bg-elevated);
border: 1px solid var(--border-default);
border-radius: var(--radius-md);
padding: 16px;

/* Column header */
font-size: 11px;
font-weight: 500;
text-transform: uppercase;
letter-spacing: 0.07em;
margin-bottom: 12px;
/* Matched: var(--success) */
/* Missing: var(--warning) or var(--text-muted) if 0 */

/* Keyword pills */
display: flex;
flex-wrap: wrap;
gap: 6px;

/* Matched pill */
background: var(--success-subtle);
color: var(--success-fg);
font-size: 12px;
font-weight: 500;
padding: 3px 8px;
border-radius: var(--radius-xs);

/* Missing pill */
background: var(--warning-subtle);
color: var(--warning-fg);
font-size: 12px;
font-weight: 500;
padding: 3px 8px;
border-radius: var(--radius-xs);

/* "No critical gaps" state */
color: var(--success);
font-size: 13px;
font-weight: 500;
```

### Skill Category Breakdown

```css
/* Section */
margin-top: 20px;
background: var(--bg-elevated);
border: 1px solid var(--border-default);
border-radius: var(--radius-md);
padding: 16px 20px;

/* Section label */
font-size: 11px;
font-weight: 500;
color: var(--text-muted);
text-transform: uppercase;
letter-spacing: 0.07em;
margin-bottom: 14px;

/* Each category row */
display: grid;
grid-template-columns: 100px 1fr 40px;
align-items: center;
gap: 12px;
padding: 6px 0;

/* Row label */
font-size: 13px;
color: var(--text-secondary);

/* Bar track */
height: 4px;
background: var(--bg-muted);
border-radius: 2px;

/* Bar fill */
background: var(--accent);
height: 4px;
border-radius: 2px;

/* Count */
font-size: 13px;
font-weight: 600;
color: var(--text-primary);
text-align: right;
```

---

## 10. REWRITES TAB (Refine)

**Current:** Two stacked cards side by side with an arrow between them. Works but is cramped.

**Replace with a full-width diff list:**

```
ORIGINAL                    →     OPTIMIZED
────────────────────────────────────────────

PROFESSIONAL SUMMARY
──────────────
[original text]                    [optimized text with word highlights]

WORK EXPERIENCE 1
──────────────
[original bullet]                  [optimized bullet]
```

```css
/* Header row */
display: grid;
grid-template-columns: 1fr 32px 1fr;
/* "ORIGINAL" label */
font-size: 11px;
font-weight: 500;
color: var(--text-muted);
text-transform: uppercase;
letter-spacing: 0.07em;
/* Arrow: → */
color: var(--text-muted);
text-align: center;
/* "OPTIMIZED" label */
font-size: 11px;
font-weight: 500;
color: var(--success);
text-transform: uppercase;
letter-spacing: 0.07em;

/* Divider line below header */
border-bottom: 1px solid var(--border-default);
margin: 8px 0 16px;

/* Section label (PROFESSIONAL SUMMARY etc.) */
grid-column: 1 / -1;
font-size: 11px;
font-weight: 500;
color: var(--text-muted);
text-transform: uppercase;
letter-spacing: 0.07em;
padding: 12px 0 8px;
border-bottom: 1px solid var(--border-subtle);
margin-bottom: 12px;

/* Content row */
display: grid;
grid-template-columns: 1fr 32px 1fr;
gap: 16px;
padding: 12px 0;
border-bottom: 1px solid var(--border-subtle);

/* Original text */
font-size: 14px;
color: var(--text-muted);
line-height: 1.65;

/* Optimized text */
font-size: 14px;
color: var(--text-primary);
line-height: 1.65;

/* Added words (from diff library) */
background: var(--success-subtle);
color: var(--success-fg);
border-radius: 2px;
padding: 0 2px;
```

**Install:** `npm install diff` and use `diffWords(before, after)` for inline word-level highlighting.

---

## 11. INTERVIEW TAB (Refine)

**Current:** Good structure. Needs visual polish only.

**Category tabs:**

```css
/* Tab group container */
display: flex;
gap: 4px;
padding: 4px;
background: var(--bg-subtle);
border-radius: var(--radius-md);
margin-bottom: 16px;
width: fit-content;

/* Each tab */
padding: 6px 14px;
border-radius: var(--radius-sm);
font-size: 13px;
font-weight: 400;
color: var(--text-muted);
cursor: pointer;
transition: all var(--transition-fast);

/* Active tab */
background: var(--bg-base);
color: var(--text-primary);
font-weight: 500;
box-shadow: var(--shadow-sm);

/* Count number */
font-size: 11px;
color: var(--text-muted);
margin-left: 4px;
/* Active count */
color: var(--accent);
```

**Question accordion cards:**

```css
/* Card */
background: var(--bg-elevated);
border: 1px solid var(--border-default);
border-radius: var(--radius-md);
overflow: hidden;
margin-bottom: 8px;

/* Question row */
display: flex;
align-items: center;
gap: 12px;
padding: 14px 16px;
cursor: pointer;

/* On hover */
background: var(--bg-subtle);

/* Question number */
font-size: 12px;
font-weight: 600;
color: var(--text-muted);
width: 20px;
flex-shrink: 0;

/* Question text */
font-size: 14px;
font-weight: 500;
color: var(--text-primary);
flex: 1;

/* Difficulty badge */
font-size: 10px;
font-weight: 600;
padding: 2px 7px;
border-radius: var(--radius-xs);
text-transform: uppercase;
letter-spacing: 0.05em;
flex-shrink: 0;
/* HARD: danger-subtle + danger-fg */
/* MEDIUM: warning-subtle + warning-fg */
/* EASY: success-subtle + success-fg */

/* Chevron */
color: var(--text-muted);
width: 16px;
height: 16px;
transition: transform var(--transition-base);
/* Expanded: rotate(180deg) */

/* Expanded content */
padding: 0 16px 14px 48px;
border-top: 1px solid var(--border-subtle);
/* "INTERVIEWER EXPECTATION" label */
font-size: 11px;
font-weight: 500;
color: var(--text-muted);
text-transform: uppercase;
letter-spacing: 0.07em;
padding-top: 12px;
margin-bottom: 8px;
/* Expectation text */
font-size: 14px;
color: var(--text-secondary);
line-height: 1.65;
```

**Copy All Questions button:**

```css
/* Top right of the tab, above the question list */
background: transparent;
border: 1px solid var(--border-default);
border-radius: var(--radius-sm);
padding: 6px 12px;
font-size: 12px;
font-weight: 500;
color: var(--text-secondary);
display: flex;
align-items: center;
gap: 6px;
/* Hover */
background: var(--bg-subtle);
```

---

## 12. COVER LETTER TAB (Refine + Add Elevator Pitch)

**Current:** Monospace text in a white block with `[Your Name]` still present. Fix both.

**Letter preview card:**

```css
background: var(--bg-elevated);
border: 1px solid var(--border-default);
border-radius: var(--radius-lg);
padding: 32px 36px;

/* Contact header */
/* Name */
font-size: 16px;
font-weight: 600;
color: var(--text-primary);
/* Contact line */
font-size: 13px;
color: var(--text-secondary);
margin-top: 2px;
/* Date */
font-size: 13px;
color: var(--text-muted);
margin-top: 16px;

/* Letter body */
font-size: 14px;
color: var(--text-secondary);
line-height: 1.8;
font-family: var(--font-sans); /* NOT monospace — this is a letter */
```

**Fixes to make in the component:**

1. Replace `[Your Name]` with `contact.name` from `output_json.contact`
2. Replace `[Hiring Company]` → `output_json.meta.detected_company` or `"the company"`
3. Replace `Hiring Company` addressee → `output_json.meta.detected_company` or `"Hiring Team"`
4. Date: format `transformation.created_at` as `"June 27, 2026"`

**Action buttons (top-right of tab):**

```css
/* Copy button */
background: transparent;
border: 1px solid var(--border-default);
border-radius: var(--radius-sm);
padding: 6px 12px;
font-size: 12px;
font-weight: 500;
color: var(--text-secondary);

/* Download button */
background: var(--accent);
border: none;
border-radius: var(--radius-sm);
padding: 6px 14px;
font-size: 12px;
font-weight: 500;
color: var(--accent-fg);
```

**Add Elevator Pitch panel below the letter** (moved from deleted Recruiter tab):

```css
/* Panel */
background: var(--bg-elevated);
border: 1px solid var(--border-default);
border-left: 3px solid var(--accent);
border-radius: var(--radius-md);
padding: 16px 20px;
margin-top: 16px;

/* Label */
font-size: 11px;
font-weight: 500;
color: var(--text-muted);
text-transform: uppercase;
letter-spacing: 0.07em;

/* Pitch text */
font-size: 14px;
color: var(--text-secondary);
font-style: italic;
line-height: 1.65;
margin-top: 8px;

/* Copy Pitch button */
float: right;
font-size: 12px;
color: var(--text-muted);
```

---

## 13. DASHBOARD PAGE (Refine)

**Page header:**

```css
/* Title */
font-size: 22px;
font-weight: 700;
color: var(--text-primary);

/* Subtitle: "12 total · 3 this week" */
font-size: 13px;
color: var(--text-muted);
margin-top: 4px;
```

**History cards (replace table rows with cards):**

```css
/* Card */
background: var(--bg-elevated);
border: 1px solid var(--border-default);
border-radius: var(--radius-md);
padding: 14px 18px;
display: flex;
align-items: center;
gap: 12px;
cursor: pointer;
transition: background var(--transition-fast);
margin-bottom: 6px;

/* Hover */
background: var(--bg-subtle);

/* Job title */
font-size: 14px;
font-weight: 600;
color: var(--text-primary);

/* Meta line: company · date */
font-size: 12px;
color: var(--text-muted);
margin-top: 2px;

/* Score badge (right side, circular) */
width: 36px;
height: 36px;
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
font-size: 12px;
font-weight: 700;
/* Color: same as score ring thresholds */
/* >=70: success-subtle bg, success text */
/* 40-69: warning-subtle bg, warning text */
/* <40: danger-subtle bg, danger text */

/* Status pill (after score badge) */
font-size: 11px;
font-weight: 500;
padding: 3px 8px;
border-radius: var(--radius-xs);
cursor: pointer;
/* Colors per status: see Feature Spec */

/* Navigate chevron (far right) */
color: var(--text-muted);
```

**Empty state:**

```css
/* Centered in page */
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
padding: 80px 20px;
text-align: center;

/* Heading */
font-size: 18px;
font-weight: 600;
color: var(--text-primary);

/* Subtext */
font-size: 14px;
color: var(--text-muted);
margin-top: 8px;
max-width: 320px;

/* CTA button */
margin-top: 24px;
background: var(--accent);
color: var(--accent-fg);
border: none;
border-radius: var(--radius-sm);
padding: 10px 20px;
font-size: 14px;
font-weight: 500;
```

---

## 14. LOADING & PROCESSING STATES

### Transform Processing (replaces spinner)

While Groq is running, show a sequential step list instead of a static spinner:

```
Analyzing your resume for Senior AI Architect...

  ✓  Resume parsed             (complete)
  ✓  Job description read      (complete)
  ◌  Rewriting content...      (running — spinner icon)
  ○  Scoring alignment         (pending)
  ○  Generating cover letter   (pending)

  Takes about 15–25 seconds.
```

```css
/* Container */
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
padding: 60px 20px;

/* Heading */
font-size: 16px;
font-weight: 500;
color: var(--text-primary);
margin-bottom: 32px;
text-align: center;

/* Step list */
display: flex;
flex-direction: column;
gap: 12px;
width: 280px;

/* Each step */
display: flex;
align-items: center;
gap: 12px;
/* Icon area */
width: 20px;
height: 20px;
flex-shrink: 0;
/* Step text */
font-size: 14px;

/* Complete: */
icon-color: var(--success);
text-color: var(--text-secondary);

/* Running: */
icon-color: var(--accent);
/* icon: Loader2, animated spin */
text-color: var(--text-primary);
font-weight: 500;

/* Pending: */
icon-color: var(--text-disabled);
text-color: var(--text-muted);

/* Footer */
font-size: 12px;
color: var(--text-muted);
margin-top: 24px;
```

### Skeleton Loading (for content panels on initial load)

```css
/* Skeleton block */
background: var(--bg-muted);
border-radius: var(--radius-sm);

/* Shimmer animation */
@keyframes shimmer {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}
animation: shimmer 1.5s ease-in-out infinite;

/* Skeleton text line: full width, height 14px */
/* Skeleton heading: 60% width, height 20px */
/* Skeleton pill: 80px width, height 24px, radius-sm */
```

---

## 15. UI COMPONENTS SUMMARY

### Button variants:

```css
/* primary */
background: var(--accent);
color: var(--accent-fg);
border: none;
border-radius: var(--radius-sm);
padding: 8px 16px;
font-size: 13px;
font-weight: 500;

/* default (was "secondary") */
background: var(--text-primary);
color: var(--bg-base);
border: none;
/* Used for primary actions like "New Analysis", "Transform CV" */

/* ghost */
background: transparent;
border: 1px solid var(--border-default);
color: var(--text-secondary);
/* Used for secondary actions */

/* All sizes: sm(28px), md(36px, default), lg(44px) */

/* Focus ring (all buttons) */
outline: 2px solid var(--accent);
outline-offset: 2px;

/* Disabled (all buttons) */
opacity: 0.45;
cursor: not-allowed;

/* Hover transition */
transition:
  background var(--transition-fast),
  opacity var(--transition-fast);
```

### Copy button behavior (universal):

- Initial: `Copy` icon (Lucide `Copy`, 14px)
- On click: trigger clipboard write, swap icon to `Check` (Lucide, green), change text to `Copied`
- After 2000ms: revert back to `Copy`
- On fail: icon stays, show toast `Could not copy — try selecting manually`

---

## 16. MOTION & TRANSITIONS

**Philosophy:** Functional motion only. Transitions should help users track state changes, not entertain them.

| Element                   | Property             | Duration | Easing         |
| ------------------------- | -------------------- | -------- | -------------- |
| Tab switch                | opacity 0→1          | 120ms    | ease-out       |
| Card hover                | background           | 100ms    | ease           |
| Sidebar nav active        | background, color    | 100ms    | ease           |
| Accordion expand          | max-height + opacity | 180ms    | ease-out       |
| Score ring                | stroke-dashoffset    | 900ms    | ease-out       |
| Button press              | scale 0.98           | 70ms     | ease           |
| Copy icon swap            | instant              | —        | —              |
| Toast appear              | translateY + opacity | 180ms    | ease-out       |
| Skeleton shimmer          | opacity              | 1500ms   | ease-in-out, ∞ |
| Step progress item appear | opacity 0→1          | 200ms    | ease-out       |
| Processing step complete  | icon swap            | 100ms    | ease           |

All animations: `@media (prefers-reduced-motion: reduce) { * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; } }`

---

## 17. DELETED COMPONENTS

```
src/components/tabs/RescoreTab.jsx      → DELETE
src/components/tabs/RecruiterTab.jsx    → DELETE (elevator pitch moved to CoverLetterTab)
src/components/tabs/RoadmapTab.jsx      → DELETE (tasks moved to OverviewTab)
src/components/tabs/ATSCheckTab.jsx     → DELETE (merged into KeywordsTab)
src/components/tabs/SkillsTab.jsx       → DELETE (merged into KeywordsTab)
```

```
New files to create:
src/components/ui/ScoreRing.jsx         (SVG animated ring)
src/components/ui/SkeletonBlock.jsx     (shimmer skeleton)
src/components/tabs/KeywordsTab.jsx     (merged replacement)
src/components/workspace/StepProgress.jsx  (processing steps)
src/components/dashboard/EmptyDashboard.jsx
```

---

## 18. SUMMARY TABLE

| Element              | Before                                    | After                                              | What changed                                                      |
| -------------------- | ----------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------- |
| Color scheme         | White base, inconsistent greens and teals | Zinc/slate neutrals, single `#10B981` green accent | Unified token system, dark+light both clean                       |
| Score display        | Flat red progress bar in sidebar          | SVG ring, color-coded by threshold                 | More visual, clearer at a glance                                  |
| Tab count            | 10 tabs in sidebar                        | 6 tabs                                             | Removed Roadmap, Recruiter, Re-Score, ATS Check (merged or moved) |
| Workspace header     | Large report heading + badges + red pill  | Slim 52px breadcrumb bar                           | Removes clutter                                                   |
| Cover letter         | Monospace `[Your Name]` placeholder       | Real name/date, proper letter formatting           | Fixes embarrassing bug                                            |
| FAQ                  | Cards around each item                    | Plain divider accordion                            | Lighter, more readable                                            |
| Stats bar on landing | Isolated large numbers                    | Inline strip with labels                           | More compact, more readable                                       |
| Share Score button   | Green CTA in sidebar                      | Deleted                                            | Not needed at launch                                              |
| Loading state        | Spinner                                   | Sequential step list                               | Shows progress, reduces anxiety                                   |

ENDDOC
echo "File written: $(wc -l < /mnt/user-data/outputs/ResumOrph_UI_Agent_Brief.md) lines"
