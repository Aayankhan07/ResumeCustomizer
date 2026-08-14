# ResumOrph

AI resume tailoring. Upload a resume and paste a job description; a Groq LLM returns an ATS-optimized CV, a keyword match score, before/after rewrites, interview prep, and a cover letter — exportable as PDF, DOCX, or plain text.

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript (strict-null; `allowJs` for the remaining `.jsx`) |
| Styling | Tailwind CSS v4 (CSS-first — tokens live in `src/app/globals.css`, no `tailwind.config`) |
| Auth & data | Supabase (Postgres + RLS, `@supabase/ssr`) |
| LLM | Groq REST (`llama-3.3-70b-versatile`, with fallbacks) |
| Parsing | `pdfjs-dist` (self-hosted worker), `mammoth` |
| Export | `jspdf`, `docx` |
| Observability | Sentry (`@sentry/nextjs`), Vercel Analytics + Speed Insights |
| Tests | Vitest + jsdom |
| Hosting | Vercel |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

`GROQ_API_KEY` and the Supabase keys are required — the app throws on boot without them rather than failing later with confusing auth errors. See `.env.example` for what each variable does.

### Database

Migrations live in `supabase/migrations/` and apply in numeric order:

```bash
supabase db push
```

Migration `011` adds `consume_rate_limit`, which the rate limiter calls on every transform. **Until it is applied, `/api/transform` and `/api/rescore` return 503** — the limiter fails closed by design.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint (JS, JSX, TS, TSX) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (single run) |
| `npm run test:watch` | Vitest (watch) |
| `npm run test:coverage` | Coverage report |
| `npm run format` | Prettier |

CI runs lint → typecheck → test → build on pushes to `main`/`develop` and PRs to `main`.

## Architecture

```
src/
  app/                 App Router routes
    api/               Route handlers (transform, rescore, events, cleanup)
    (auth)/            Login, signup, password reset
  components/          UI, organised by feature
  contexts/            AuthContext
  hooks/               useTransform, useHistory
  lib/                 Core logic
    schemas.ts         LLM output validation (zod)
    schemas/api.ts     Request validation for every mutating route
    limits.ts          Input size limits, shared by client and server
    scoring.ts         Match-score bands and colours (single source of truth)
    templates.ts       PDF template registry
    env.ts             Validated environment access
    groq.ts            LLM client and prompts
    matchScore.ts      ATS keyword scoring
  utils/               Formatting, error copy, analytics
supabase/migrations/   Schema, RLS, functions
tests/                 Vitest suites
```

### Request flow

1. The client parses the uploaded file **in the browser** (`lib/parsers/`), so only text reaches the server.
2. `POST /api/transform` authenticates, rate limits, then validates the body against `transformRequestSchema`.
3. `callGroqWithFallback` tries each model in turn; user text is fenced so it cannot be read as instructions.
4. The response is validated against `TransformOutputSchema` — the LLM's output is never trusted.
5. A match score is computed server-side, overriding the model's self-reported figure.
6. The result is saved. If the save fails the response is **207** with `persisted: false`: the user still receives their resume, but the UI tells them it was not stored.

### Conventions

- Input limits are defined once in `lib/limits.ts` and imported by both the UI and the request schemas.
- API routes return stable error codes, never raw database errors. `utils/errors.js` maps codes to user-facing copy.
- PATCH bodies use `z.strictObject`, so unknown keys are rejected rather than written.
- New files under `src/` should be `.ts`/`.tsx`; the remaining `.jsx` files are migrated as they are touched.
