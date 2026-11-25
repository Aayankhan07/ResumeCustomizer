# Landing Page UX/UI Improvement Plan

Source: senior UI/UX review of the landing page (`src/components/landing/Id*.tsx`, `LandingClient.tsx`, `src/app/page.tsx`) and `landing-full-1.png`.

Goal: turn a polished-looking page into one that converts and earns trust. Fix broken flows and unverifiable claims first, then fill the information-architecture gaps, then refine visuals, accessibility and performance.

---

## Phase 0 — Broken flows & trust (P0)

### 0.1 Make the hero input actually work
- **Problem:** `IdHero.tsx` captures a target role, then links to bare `/transform`. Input value is only sent to analytics. Not a `<form>`, Enter does nothing, input has no label.
- **Change:**
  - Wrap capsule in `<form onSubmit>`; navigate to `/transform?role=<encoded>`.
  - Add visually hidden `<label>` for the input.
  - In `src/app/transform/page.tsx` (job step, `JobInput.jsx`), read `role` from `searchParams` and prefill the job title / description context.
  - Alternative (preferred long-term): replace role input with "Upload resume" dropzone or "Paste job description" CTA, since upload is the real first step.
- **Files:** `src/components/landing/IdHero.tsx`, `src/app/transform/page.tsx`, `src/components/transform/wizard/JobInput.jsx`
- **Done when:** typing a role and pressing Enter or clicking lands on `/transform` with the role visible and prefilled.

### 0.2 Use real stats
- **Problem:** `IdInlineStatement.tsx` hard-codes `RollingCounter from={10400} to={12400}`. `initialStats` is fetched in `page.tsx` but ignored in `LandingClient.tsx`.
- **Change:** pass `initialStats` from `LandingClient` to `IdInlineStatement` (and `IdMetrics` where relevant); counter animates to `total_transformations`.
- **Files:** `LandingClient.tsx`, `IdInlineStatement.tsx`
- **Done when:** counter matches `usage_stats` row; fallback values only used when fetch fails.

### 0.3 Remove or qualify unverifiable claims
- **Problem:** "3.8x more recruiter callbacks", "94% average ATS match", "candidates landed offers at Google, Stripe, Meta", Unsplash stock photo captioned "Hired candidate". Conflicts with the product's zero-fabrication promise; legal risk.
- **Change:**
  - `IdMetrics.tsx`: replace callback metric with something the system measures (e.g. average score lift before→after from `/api/rescore` data, average tailoring time, total resumes tailored). Label any illustrative number as "Example".
  - `IdCaseStudies.tsx`: rewrite titles to be guide topics, not outcome claims.
  - `IdInlineStatement.tsx`: drop the stock photo, or use an abstract resume thumbnail.
- **Done when:** every number on the page is either sourced from data or explicitly labelled as an example.

### 0.4 Fix dead-end links
- **Problem:** guide rows link to `/transform`; nav "Resume Guides" links to `#metrics`; footer legal links all go to `/profile`; "How it Works" and "ATS Engine" both point to `#technology`.
- **Change:**
  - Create `/privacy` and `/terms` pages (data retention + zero-fabrication policy content).
  - Either create real guide pages (`/guides/[slug]`) or remove the guides section and nav item until content exists.
  - Map each nav item to a unique, existing anchor (see Phase 1 section IDs).
- **Files:** `IdNavbar.tsx`, `IdFooter.tsx`, `IdCaseStudies.tsx`, new `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `src/app/sitemap.ts`
- **Done when:** no link on the landing page lands somewhere unrelated to its label.

### 0.5 Render the FAQ that the JSON-LD advertises
- **Problem:** `FAQPage` schema is emitted in `page.tsx` but no FAQ is visible. Violates Google structured-data guidelines.
- **Change:** new `IdFaq.tsx` section using existing `src/components/ui/Accordion.tsx` and `FAQ_ITEMS` from `src/lib/faq.ts`. Anchor `#faq`.
- **Done when:** every question in the JSON-LD is visible on the page.

---

## Phase 1 — Information architecture (P1)

### Target section order

| # | Section | Anchor | Status |
|---|---------|--------|--------|
| 1 | Hero (headline + working CTA) | — | Modify |
| 2 | ATS systems strip | — | Modify |
| 3 | How it works (3 steps) | `#how-it-works` | **New** |
| 4 | Before / after product demo | `#demo` | **New** |
| 5 | Features bento | `#features` | Modify (was `#technology`) |
| 6 | Metrics (real data) | `#metrics` | Modify |
| 7 | Privacy & data handling | `#privacy` | **New** (promoted from bento card) |
| 8 | FAQ | `#faq` | **New** (0.5) |
| 9 | Final CTA band | — | **New** |
| 10 | Footer | — | Modify |

`IdInlineStatement` either moves below the demo as a social-proof line or is cut; `IdCaseStudies` stays only if real guides exist.

### 1.1 How it works
- New `IdHowItWorks.tsx`: 3 numbered steps — Upload resume (PDF/DOCX) → Paste job description → Get tailored resume, score, cover letter, export.
- Each step: icon, one-line title, one sentence.

### 1.2 Before / after demo
- New `IdDemo.tsx`: side-by-side original vs tailored bullet, highlighted added keywords, score ring moving from e.g. 62 → 88 (labelled "Example").
- Evaluate reusing `ChronoAppPreview.tsx` and `src/components/ui/ScoreRing.tsx`.

### 1.3 Final CTA band
- New `IdFinalCta.tsx`: headline ("Tailor your next application"), primary button to `/transform`, free-tier line.

### 1.4 Pricing / limits clarity
- State free tier once, clearly (in final CTA or a small block). Remove repeated tiny-print mentions from hero, footer.

### 1.5 Navbar
- Items: How it works · Features · Privacy · FAQ (unique anchors).
- Remove "ATS-Ready" badge (looks like a button, competes with CTA).
- Hide "Sign in" in the mobile drawer when the user is logged in.

---

## Phase 2 — Visual refinement (P1)

### 2.1 Clay shapes overlap the subtitle at tablet widths
- `IdHero.tsx`: change shape clusters from `hidden sm:block` to `hidden lg:block`, and constrain them to the gutters outside the `max-w-3xl` text column.
- **Done when:** no decorative element overlaps text at 640, 768, 1024, 1280px.

### 2.2 Reduce decoration noise
- Keep clay shapes as the single signature motif: hero + at most one bento card.
- Remove: 🏆 floating emoji (`IdCaseStudies`), sparkle chip and photo inline in headline (`IdInlineStatement`), "Groq LLaMA 3.3 Engine" tag.

### 2.3 Bento cards: no fake controls
- Card 5 (Tailoring mode): remove non-functional "Apply mode" button and "Profile saved" chip; render as a static illustration or label "Preview".
- Card 3 (Before/Tailored toggle): keep, add "Interactive example" label, clearer caption.
- Card 6 (Privacy): replace decoration-only space with concrete facts, or move content to the new `#privacy` section and replace the card.
- Standardize card structure: visual on top, title + body below, for all 6.

### 2.4 Typography scale
- Define a scale in `globals.css` / Tailwind config: display (H1), H2, H3, body, small. Minimum 12px; remove `text-[10px]` and `text-[11px]`.
- Consistent heading weights (pick `font-medium` or `font-semibold` per level, apply everywhere).

### 2.5 Contrast
- ATS strip: remove `opacity-65`, use `text-slate-500` minimum; consider monochrome logos instead of plain text.
- Small helper text: `text-slate-500` minimum, not `slate-400`.
- Verify all text ≥ 4.5:1 (WCAG AA).

### 2.6 CTA copy consistency
- One primary label everywhere (e.g. "Tailor my resume"). Currently: "Tailor Resume", "Tailor Now", "Tailor My Resume", "Start Tailoring Free".

### 2.7 Copy
- Replace model/vendor names in marketing copy ("Groq LLaMA 3.3", footer "Built with...") with benefits.
- Bento H2: shorten "The ResumOrph Engine: Engineering High-Impact Resumes" to a benefit-led line.

---

## Phase 3 — Accessibility, UX & performance (P2)

### 3.1 Reduced motion
- `LandingClient.tsx`: skip Lenis init when `prefers-reduced-motion: reduce`.
- `IdHero.tsx`, `IdInlineStatement.tsx`, `IdCaseStudies.tsx`: gate parallax / infinite animations with framer-motion `useReducedMotion()`.
- Ensure anchor links work with Lenis (`lenis.scrollTo` on hash links, or `anchors: true` option).

### 3.2 Text selection
- Remove `select-none` from sections (`IdHero`, `IdInlineStatement`, `IdBentoGrid`, `IdMetrics`, `IdFooter`); keep it only on decorative wrappers.

### 3.3 Mobile menu
- `IdNavbar.tsx`: add `aria-expanded`, `aria-controls`; close on Escape and on route/anchor change; trap focus while open; return focus to toggle on close.

### 3.4 LCP
- Render H1 and subtitle without an opacity-0 initial state (or move them into a server component); animate only decorations.
- Run Lighthouse before/after; target LCP < 2.5s on mobile.

### 3.5 Mobile frame
- `LandingClient.tsx`: drop outer padding / rounded frame below `sm` so content gets full width.

### 3.6 Cleanup
- Delete unused `Chrono*` components after extracting anything reused in 1.2 / 1.4.

---

## Suggested order of execution

1. 0.1, 0.2, 2.1, 3.1 — small, high-impact code fixes.
2. 0.3, 0.4, 0.5 — trust and link integrity (needs copy decisions + privacy/terms content).
3. 1.1, 1.2, 1.3, 1.5 — new sections and nav restructure.
4. 2.2–2.7 — visual polish.
5. 3.2–3.6 — accessibility, performance, cleanup.

## Open decisions (owner input needed)
- Hero: keep role input (prefilled into `/transform`) or switch to upload / paste-JD entry?
- Which real metrics are available from Supabase to replace the current figures?
- Guides: write real content now, or remove the section until it exists?
- Is a paid tier planned? Determines whether a pricing block is added.

## Verification checklist
- [ ] Hero CTA carries user input into `/transform`
- [ ] All numbers sourced from data or labelled "Example"
- [ ] No link lands on an unrelated page
- [ ] Visible FAQ matches JSON-LD
- [ ] No overlap of decoration and text at 640 / 768 / 1024 / 1280px
- [ ] All text ≥ 12px and ≥ 4.5:1 contrast
- [ ] Reduced-motion users get no smooth scroll or parallax
- [ ] Mobile menu keyboard-operable, Escape closes
- [ ] Lighthouse mobile: Accessibility ≥ 95, LCP < 2.5s
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` pass

---

## Implementation status (2026-11-25)

All phases implemented. Decisions taken on the open questions:
- **Hero:** kept the role input. It submits as a real form, passes `?role=` to `/transform`, and also stores the role in sessionStorage (`resumorph:pending-role`) so it survives the `/login` redirect. `/transform` prefills job-title mode with it unless a draft job description already exists.
- **Metrics:** only real `usage_stats` counts, shown once they pass a threshold (1,000 resumes / 250 users). Below that the section is hidden. No fallback numbers.
- **Guides:** section removed until real content exists.
- **Pricing:** no pricing block; the free tier is stated once in the hero and once in the final CTA.

Not done / follow-ups:
- `/privacy` and `/terms` are plain-language drafts written from the codebase. Have them legally reviewed and add a contact address for account-removal requests (account deletion is currently disabled in `/profile`).
- `npm run build` could not be verified in the sandbox (Google Fonts fetch blocked). Typecheck, lint (0 errors) and all 138 tests pass; the page was checked in a browser at 500, 800 and 1280px.
- Lighthouse run still to do on a deployed preview.
