# Changelog

All notable changes to ResumOrph are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

> **Deploy order:** apply migration `014_security_hardening.sql` (`supabase db push`)
> before deploying this code. The transform route, rate limiter and cleanup cron
> call functions that only exist after 014.

### Added

- Landing page redesign: how-it-works, before/after example, features, privacy, FAQ and final call-to-action sections.
- Privacy policy (`/privacy`) and terms of service (`/terms`) pages.
- Account deletion: `DELETE /api/account` and a confirmation dialog on the profile page.
- Removed history items are permanently purged 30 days after removal (daily cleanup cron).
- Global daily cap on AI calls (`LLM_DAILY_BUDGET`, default 2000).
- Security headers: Content-Security-Policy, HSTS, Referrer-Policy, Permissions-Policy.
- Resend-email button and address display on the verify-email page.
- Server-side search and status filtering on the dashboard.
- Tests for every API route, the proxy, the auth callback and both export generators; Playwright smoke suite (`npm run test:e2e`).
- CI: Node 22, formatting check, migration replay job. Dependabot and a pull request template.

### Changed

- Privacy copy now states that submitted resumes and job descriptions are stored with each result.
- Clients can no longer insert transformations directly or update score/output columns; the API routes write with the service role.
- Rate-limited requests are no longer counted against the limit; cached duplicate requests no longer use quota.
- The app uses the brand sans font (Inter) for headings; DM Serif was removed.
- `middleware.ts` renamed to `proxy.ts` (Next 16). Sign-in keeps the page you were trying to reach.
- Planning documents and screenshots moved to `docs/`.

### Fixed

- Resume text could reach logs and Sentry through Groq error bodies and database error details.
- Open redirect in the post-login `?redirect=` handling (tab-smuggled `//host`).
- Cover Letter tab crash when the recruiter scan is missing; saved-result page crash on load failure.
- Executive PDF template letter-spaced headings by inserting spaces, which ATS parsers read as single letters.
- Empty education and date fields printed dangling "in" and dashes in PDF and DOCX exports.
- Hydration mismatch on the transform wizard; profile name field empty on direct load.
- Malformed JSON request bodies returned 500 instead of 400; PATCH on a missing row returned 500 instead of 404.
- Application events could be attached to another user's transformation through direct database access.

---

## 2026-06-28

Design overhauls, feature additions, bug fixes, and codebase cleanups to align the project with the master specification.

---

### 🎨 1. UI & UX Overhaul

#### Authentication Flow Redesign
* **Unified Theme**: Redesigned all five authentication pages to match the neutral zinc/slate and emerald green (`#10B981`) theme:
  * [Login](src/app/(auth)/login/page.tsx)
  * [Signup](src/app/(auth)/signup/page.tsx)
  * [Forgot Password](src/app/(auth)/forgot-password/page.tsx)
  * [Reset Password](src/app/(auth)/reset-password/page.tsx)
  * [Verify Email](src/app/(auth)/verify-email/page.tsx)
* **Visual Polish**: Replaced legacy indigo spotlights with smooth emerald radial gradients, elevated card borders (`border-[var(--border-default)]`), and embedded grid pattern overlays.
* **Input Styling**: Refactored [Input.tsx](src/components/ui/Input.tsx) to support theme-aware CSS variables and emerald green glow rings on focus.

#### Premium Footer Redesign
* **SaaS Layout**: Upgraded [Footer.jsx](src/components/layout/Footer.jsx) from a simple line to a premium multi-column footer (Product, Legal, Connect).
* **Aesthetics**: Added a glowing gradient accent line at the top, a subtle background grid, and an ambient emerald spotlight in the corner.
* **Stability**: Replaced Lucide social icons with custom inline SVGs to avoid version mismatch compilation errors in Turbopack.

---

### ⚙️ 2. Core Feature Upgrades

#### Interactive 3D Interview Flashcards
* **3D Flip Card**: Redesigned [InterviewTab.jsx](src/components/transform/tabs/InterviewTab.jsx) from a simple accordion into a 3D flipping card interface using CSS perspective transforms.
* **Keyboard Shortcuts**: Integrated full keyboard accessibility:
  * `Arrow Left` / `Arrow Right` to navigate between questions.
  * `Spacebar` / `Enter` to flip the active card.
* **Study Progress**: Added a progress bar at the top and navigation controls at the bottom (`Card X of 10`).
* **10 Q&As Deck**: Updated the AI system prompt in [groq.ts](src/lib/groq.ts) to generate exactly 10 questions total (4 Technical, 4 Behavioral, 2 Curveballs) tailored specifically to the candidate's CV and target job description.

---

### 🐛 3. Critical Bug Fixes

#### Google OAuth Session Loop
* **The Bug**: Google login redirected directly to `/dashboard`, bypassing the server-side callback. This prevented the session cookies from being set, causing the middleware to redirect the user back to `/login`.
* **The Fix**: Updated both `login/page.tsx` and `signup/page.tsx` to route OAuth redirects through the callback path: `/auth/callback?next=/dashboard`.

#### PDF Generator Crash & Layout Alignment
* **The Bug**: The PDF generator looked for `proj.name` which was `undefined` in the new AI schema, causing `jsPDF` to crash. Additionally, section headers (specifically in the Clean Tech template) overlapped with the text below them, and long contact details/links overflowed off the right edge of the page.
* **The Fix**: 
  * Refactored [pdfGenerator.js](src/lib/pdfGenerator.js) to resolve `proj.title || proj.name` safely, and added support to render the `proj.bullets` array.
  * Increased the vertical spacing (`y` position increments) after all section headers and dividers to prevent any text overlaps.
  * Implemented text wrapping (`doc.splitTextToSize`) for contact details to prevent horizontal overflow off the page.
  * Increased bullet point padding and margins for cleaner, more professional alignment.

#### Button Component Visibility
* **The Bug**: The enabled state of the [Button.tsx](src/components/ui/Button.tsx) component relied on legacy `bg-cobalt` classes, causing it to render white-on-white (invisible) when active.
* **The Fix**: Refactored the component to use the new CSS theme tokens (`var(--accent)`, `var(--bg-subtle)`, etc.).

#### PDF Parser Worker 404
* **The Bug**: PDF upload failed with a generic error because the parser loaded the worker from cdnjs using a version number (`6.0.227`) that did not exist on their CDN.
* **The Fix**: Updated [pdfParser.client.js](src/lib/parsers/pdfParser.client.js) to load the worker from `unpkg` using the correct `.mjs` extension.

---

### 🧹 4. Codebase Cleanup & Maintenance

* **Legacy Files Deleted**:
  * `src/components/transform/tabs/JdMatchTab.jsx` (Dead code)
  * `src/components/ui/PremiumModal.jsx` (Dead code)
  * `supabase/functions/` (Legacy Deno Edge Functions folder, now handled by Next.js API routes)
  * `dist/` (Legacy Vite build folder)
  * `temp.css` & `temp.html` (Temporary scratch files)
* **TypeScript Config Rename**: Renamed `vitest.config.js` to `test.config.ts` and updated the `package.json` test scripts.
* **Git & Env Check**: Confirmed `.gitignore` correctly ignores `.env` and `.next/`, and added `GROQ_API_KEY` to the local environment.
