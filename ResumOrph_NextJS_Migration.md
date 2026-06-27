# ResumOrph — Vite/React → Next.js 15 Migration Plan

> **From:** React 19 + Vite SPA + Supabase Deno Edge Functions  
> **To:** Next.js 15 (App Router) + Next.js API Routes + Supabase PostgreSQL  
> **Deployment:** Vercel (same host, zero infra change)  
> **Effort estimate:** ~2 weeks for a solo developer, AI-assisted

---

## WHY MIGRATE (The Case)

| Pain point in current stack | How Next.js solves it |
|---|---|
| Landing page is a client-rendered SPA — bad for SEO | Next.js Server Components render landing page as static HTML |
| Groq API key lives in Deno Edge Function, separate deploy | Groq calls move to Next.js API Routes — one codebase, one deploy |
| Supabase Deno Functions need separate `supabase functions deploy` | All backend logic in `/app/api/` — `git push` is enough |
| No SSR — first paint is slow on cold load | Server Components + streaming eliminate blank flash |
| React Router v7 + Vite routing is a separate mental model | Next.js App Router is file-system routing, simpler to reason about |
| `vercel.json` SPA fallback hack needed | Next.js handles routing natively on Vercel |
| PDF.js worker path requires Vite config workarounds | Worker import works naturally in Next.js with `next/dynamic` |

---

## ARCHITECTURE OVERVIEW: BEFORE vs AFTER

### Before (Current)
```
Browser
  └── React SPA (Vite)
        ├── React Router v7 (client-side routing)
        ├── src/lib/api.js → Supabase JS SDK
        │     └── Supabase Edge Functions (Deno) → Groq API
        └── Client-side: PDF.js, Mammoth, jsPDF
```

### After (Next.js 15)
```
Browser / Vercel Edge
  └── Next.js 15 App Router
        ├── Server Components (Landing, static pages) → HTML on first load
        ├── Client Components ('use client') → existing React logic
        ├── /app/api/ Route Handlers → replaces Deno Edge Functions
        │     ├── /api/transform   → Groq call + DB write
        │     ├── /api/rescore     → lightweight scoring
        │     └── /api/cleanup     → rate limit cleanup (Vercel Cron)
        └── Client-side: PDF.js, Mammoth, jsPDF (unchanged)
```

---

## WHAT STAYS THE SAME (Zero Migration Needed)

- **Supabase PostgreSQL** — DB schema, migrations, RLS, triggers, indexes — untouched
- **All UI components** — every `.jsx` file in `src/components/` — copy as-is
- **All hooks** — `useAuth`, `useHistory`, `useTransform`, etc. — copy as-is
- **All utilities** — `matchScore.js`, `resumeToText.js`, `scoreColor.js`, etc. — copy as-is
- **Tailwind CSS v4** — works identically in Next.js
- **Framer Motion** — works identically with `'use client'` directive
- **Lucide React** — works identically
- **Sonner** — works identically
- **jsPDF** — stays client-side, unchanged
- **PDF.js** — stays client-side with `next/dynamic`
- **Mammoth** — stays client-side, unchanged
- **Supabase JS SDK** — same import, same API

---

## WHAT CHANGES (The Actual Work)

| Current | Next.js Equivalent | Effort |
|---|---|---|
| `vite.config.js` | `next.config.js` | Low |
| `index.html` | `app/layout.tsx` root layout | Low |
| React Router v7 routes | `/app` directory file structure | Medium |
| `src/contexts/AuthContext.jsx` | Same file + `'use client'` | Low |
| `src/lib/supabase.js` | Split: server client + browser client | Medium |
| Supabase Deno `transform/` function | `app/api/transform/route.ts` | Medium |
| Supabase Deno `cleanup/` function | `app/api/cleanup/route.ts` + Vercel Cron | Low |
| `vercel.json` SPA fallback | Delete — not needed | Trivial |
| `src/pages/Landing.jsx` | Server Component (no `'use client'`) | Low |
| All other pages | Client Components (`'use client'`) | Low |
| `optimizeDeps.exclude` for PDF.js | `next/dynamic` with `{ ssr: false }` | Low |

---

## PHASE-BY-PHASE MIGRATION PLAN

---

### PHASE 0 — SETUP (Day 1, ~2 hours)

#### TASK 0.1 — Bootstrap New Next.js Project

```bash
npx create-next-app@latest resumorph-next \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

**Flags explained:**
- `--app` → App Router (not Pages Router)
- `--src-dir` → puts code in `src/` matching current structure
- `--typescript` → migrate to TypeScript incrementally (`.jsx` still works)

#### TASK 0.2 — Install Matching Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr \
  framer-motion lucide-react sonner \
  jspdf pdfjs-dist mammoth \
  zod
```

Note: `react-router-dom` is NOT installed — Next.js handles routing.  
Note: `@supabase/ssr` is new — it replaces the old `@supabase/auth-helpers-nextjs`.

#### TASK 0.3 — Configure `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow PDF.js worker to be served correctly
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  // Server-side packages that must NOT be bundled for browser
  serverExternalPackages: ['pdf-parse'],
};

export default nextConfig;
```

#### TASK 0.4 — Setup Tailwind v4 for Next.js

```bash
npm install tailwindcss@next @tailwindcss/postcss@next
```

`postcss.config.js`:
```javascript
export default {
  plugins: { '@tailwindcss/postcss': {} }
};
```

Copy `src/styles/globals.css` exactly as-is into `src/app/globals.css`.

#### TASK 0.5 — Copy Static Assets

```
public/ → public/   (copy entire folder, no changes)
src/assets/ → src/assets/  (copy entire folder, no changes)
```

---

### PHASE 1 — SUPABASE CLIENT SPLIT (Day 1–2, ~3 hours)

This is the most important architectural change. Next.js needs two separate Supabase clients:

**Why two clients?**
- Server Components run on the server and need to read auth cookies from the HTTP request.
- Client Components run in the browser and use the existing session from `localStorage`/cookies.
- Using a single client for both causes auth state to leak between users on the server.

#### TASK 1.1 — Create Browser Client

**File: `src/lib/supabase/client.ts`**
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

This replaces `src/lib/supabase.js`. All existing `'use client'` components import from here.

#### TASK 1.2 — Create Server Client

**File: `src/lib/supabase/server.ts`**
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
```

Used only in Server Components and API Route Handlers.

#### TASK 1.3 — Create Middleware for Auth Session Refresh

**File: `src/middleware.ts`** (at project root level, next to `src/`)

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — DO NOT remove this
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect unauthenticated users away from protected routes
  const protectedPaths = ['/dashboard', '/transform', '/profile'];
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p));
  
  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from auth pages
  const authPaths = ['/login', '/signup'];
  const isAuthPage = authPaths.some(p => request.nextUrl.pathname.startsWith(p));
  
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

**What this replaces:** `src/components/layout/ProtectedRoute.jsx` and the client-side auth gate in `App.jsx`. The middleware runs on the Edge before the page loads — faster and more secure than client-side redirects.

#### TASK 1.4 — Update AuthContext

**File: `src/contexts/AuthContext.jsx`** — add `'use client'` at top, change import:

```javascript
'use client';
import { createClient } from '@/lib/supabase/client'; // ← changed

// Rest of the file is identical to current version
const supabase = createClient();
```

---

### PHASE 2 — FILE SYSTEM ROUTING (Day 2–3, ~4 hours)

Replace React Router v7 routes with Next.js App Router file structure.

#### TASK 2.1 — New Folder Structure

```
src/app/
├── layout.tsx              ← replaces index.html + App.jsx shell
├── page.tsx                ← replaces Landing.jsx (Server Component)
├── globals.css             ← copied from src/styles/globals.css
│
├── (auth)/                 ← route group (no URL segment)
│   ├── login/
│   │   └── page.tsx        ← replaces Login.jsx
│   ├── signup/
│   │   └── page.tsx        ← replaces Signup.jsx
│   ├── forgot-password/
│   │   └── page.tsx        ← replaces ForgotPassword.jsx
│   ├── reset-password/
│   │   └── page.tsx        ← replaces ResetPassword.jsx
│   └── verify-email/
│       └── page.tsx        ← replaces VerifyEmail.jsx
│
├── dashboard/
│   └── page.tsx            ← replaces Dashboard.jsx
│
├── transform/
│   ├── page.tsx            ← replaces Transform.jsx
│   └── [id]/
│       └── page.tsx        ← replaces TransformDetail.jsx (:id param)
│
├── profile/
│   └── page.tsx            ← replaces Profile.jsx
│
└── not-found.tsx           ← replaces NotFound.jsx (Next.js convention)
```

#### TASK 2.2 — Root Layout

**File: `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: { template: '%s | ResumOrph', default: 'ResumOrph — AI Resume Tailoring' },
  description: 'ATS-optimized resumes tailored to any job description in seconds.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
```

#### TASK 2.3 — Convert Each Page

**Pattern for all pages except Landing:**

Add `'use client'` at the top. Copy the JSX body exactly. Remove `useNavigate`/`useParams` from React Router and replace with Next.js equivalents.

**React Router → Next.js navigation table:**

| React Router v7 | Next.js 15 |
|---|---|
| `import { useNavigate } from 'react-router-dom'` | `import { useRouter } from 'next/navigation'` |
| `const navigate = useNavigate()` | `const router = useRouter()` |
| `navigate('/dashboard')` | `router.push('/dashboard')` |
| `navigate(-1)` | `router.back()` |
| `import { useParams } from 'react-router-dom'` | `import { useParams } from 'next/navigation'` |
| `const { id } = useParams()` | `const params = useParams(); const id = params.id` |
| `import { Link } from 'react-router-dom'` | `import Link from 'next/link'` |
| `<Navigate to="/login" />` | `redirect('/login')` (server) or `router.replace('/login')` (client) |

**Example — TransformDetail page:**

Current (`src/pages/TransformDetail.jsx`):
```jsx
import { useParams, useNavigate } from 'react-router-dom';
const { id } = useParams();
const navigate = useNavigate();
```

Next.js (`src/app/transform/[id]/page.tsx`):
```tsx
'use client';
import { useParams, useRouter } from 'next/navigation';
const params = useParams();
const id = params.id as string;
const router = useRouter();
```

**Landing page — Server Component:**

`src/app/page.tsx` does NOT get `'use client'`. It renders as a Server Component, which means:
- Instant HTML, excellent SEO
- The usage stats (total transformations, total users) can be fetched server-side:

```tsx
// src/app/page.tsx  — NO 'use client'
import { createClient } from '@/lib/supabase/server';
import { LandingClient } from '@/components/landing/LandingClient'; // client parts

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: stats } = await supabase
    .from('usage_stats')
    .select('total_transformations, total_users')
    .single();

  return <LandingClient initialStats={stats} />;
}
```

Move the client-interactive parts of Landing (hero animation, FAQ accordion) into `LandingClient.jsx` with `'use client'`.

---

### PHASE 3 — MIGRATE DENO EDGE FUNCTIONS → NEXT.JS API ROUTES (Day 3–5, ~6 hours)

This is the biggest architectural shift. The Deno functions become Next.js Route Handlers under `src/app/api/`.

#### TASK 3.1 — Transform API Route

**File: `src/app/api/transform/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callGroqWithFallback } from '@/lib/groq';
import { computeMatchScore } from '@/lib/matchScore';
import { TransformOutputSchema } from '@/lib/schemas';
import { checkRateLimit } from '@/lib/rateLimit';

export const maxDuration = 60; // Vercel Pro: 60s, Free: 10s — IMPORTANT

export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ code: 'AUTH_FAILED' }, { status: 401 });
    }

    // 2. Parse body
    const { resume_text, job_description, idempotency_key } = await request.json();

    // 3. Validate inputs
    if (!resume_text || resume_text.length < 100) {
      return NextResponse.json({ code: 'INVALID_RESUME' }, { status: 422 });
    }
    if (!job_description || job_description.length < 200) {
      return NextResponse.json({ code: 'INVALID_JD' }, { status: 422 });
    }
    if (resume_text.length > 15000) {
      return NextResponse.json({ 
        code: 'CONTENT_TOO_LONG', max: 15000, actual: resume_text.length 
      }, { status: 422 });
    }

    // 4. Idempotency check
    if (idempotency_key) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: existing } = await supabase
        .from('transformations')
        .select('id, output_json, match_score, keywords_matched')
        .eq('user_id', user.id)
        .eq('idempotency_key', idempotency_key)
        .gt('created_at', fiveMinutesAgo)
        .single();
      
      if (existing) return NextResponse.json({ cached: true, data: existing });
    }

    // 5. Rate limiting — use server-side Supabase client with service role for this
    const { allowed, retry_after } = await checkRateLimit(user.id, supabase);
    if (!allowed) {
      return NextResponse.json({ code: 'RATE_LIMITED', retry_after }, { status: 429 });
    }

    // 6. Call Groq
    const systemPrompt = buildSystemPrompt(); // extracted from groq.ts
    const { content, model_used } = await callGroqWithFallback(
      systemPrompt, 
      `RESUME:\n${resume_text}\n\nJOB DESCRIPTION:\n${job_description}`
    );

    // 7. Parse + validate JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json({ code: 'PARSE_FAILED', section: 'json_parse' }, { status: 422 });
    }

    const validated = TransformOutputSchema.safeParse(parsed);
    if (!validated.success) {
      return NextResponse.json({ 
        code: 'PARSE_FAILED', 
        errors: validated.error.issues 
      }, { status: 422 });
    }

    // 8. Score
    const { score, matched, missing, total } = computeMatchScore(
      validated.data, job_description
    );

    // 9. Convert to plain text
    const plain_text = resumeToText(validated.data);

    // 10. Save to DB
    const { data: saved, error: dbError } = await supabase
      .from('transformations')
      .insert({
        user_id: user.id,
        output_json: validated.data,
        output_plain_text: plain_text,
        match_score: score,
        keywords_matched: matched,
        keywords_total: total,
        detected_job_title: validated.data.meta.detected_job_title,
        detected_company: validated.data.meta.detected_company,
        ai_model: model_used,
        idempotency_key: idempotency_key ?? null,
        input_resume_chars: resume_text.length,
        input_jd_chars: job_description.length,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ 
      data: { ...saved, keywords_missing: missing } 
    });

  } catch (err) {
    console.error('Transform error:', err);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
```

**Key difference from Deno:** The Supabase client reads auth from cookies automatically via the server client — no manual token extraction needed.

#### TASK 3.2 — Rescore API Route

**File: `src/app/api/rescore/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { computeMatchScore } from '@/lib/matchScore';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ code: 'AUTH_FAILED' }, { status: 401 });

  const { transformation_id, weights } = await request.json();

  const { data: transform } = await supabase
    .from('transformations')
    .select('output_json, output_plain_text')
    .eq('id', transformation_id)
    .eq('user_id', user.id)
    .single();

  if (!transform) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });

  const { score, matched, missing, total } = computeMatchScore(
    transform.output_json, transform.output_plain_text, weights
  );

  await supabase.from('transformations')
    .update({ match_score: score, keywords_matched: matched })
    .eq('id', transformation_id);

  return NextResponse.json({ score, matched, missing, total });
}
```

#### TASK 3.3 — Cleanup API Route (Vercel Cron)

**File: `src/app/api/cleanup/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  // Verify this is called by Vercel Cron (not public)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('rate_limits')
    .delete()
    .lt('created_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
```

**File: `vercel.json`** (replaces SPA fallback config entirely):

```json
{
  "crons": [
    {
      "path": "/api/cleanup",
      "schedule": "0 */2 * * *"
    }
  ]
}
```

This replaces the Supabase Deno `cleanup/` function. Vercel Cron runs it every 2 hours automatically.

#### TASK 3.4 — Shared Utilities (Port from Deno to Node/TypeScript)

These files move from `supabase/functions/_shared/` to `src/lib/`:

| Deno file | Next.js file | Changes needed |
|---|---|---|
| `_shared/groq.ts` | `src/lib/groq.ts` | Change `Deno.env.get()` → `process.env.` |
| `_shared/matchScore.ts` | `src/lib/matchScore.ts` | No changes |
| `_shared/resumeToText.ts` | `src/lib/resumeToText.ts` | No changes |
| `_shared/rateLimit.ts` | `src/lib/rateLimit.ts` | Update Supabase client import |
| `_shared/schemas.ts` | `src/lib/schemas.ts` | Change `zod` import from Deno CDN to npm |
| `_shared/cors.ts` | DELETE | Next.js handles CORS via `next.config.js` |
| `_shared/auth.ts` | DELETE | Auth handled by server client + middleware |

**`src/lib/groq.ts`** — only change:
```typescript
// Before (Deno):
const apiKey = Deno.env.get('GROQ_API_KEY');

// After (Next.js):
const apiKey = process.env.GROQ_API_KEY; // server-only (no NEXT_PUBLIC_ prefix)
```

**Add CORS to `next.config.js`** (if API routes need to be called from external clients):
```javascript
async headers() {
  return [{
    source: '/api/:path*',
    headers: [
      { key: 'Access-Control-Allow-Origin', value: '*' },
      { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
    ]
  }];
}
```

---

### PHASE 4 — CLIENT COMPONENTS & LAZY LOADING (Day 5–6, ~3 hours)

#### TASK 4.1 — Add `'use client'` Directives

Any component that uses: `useState`, `useEffect`, `useContext`, browser APIs (PDF.js, File API, `URL.createObjectURL`), Framer Motion, event handlers — needs `'use client'`.

**Files that need `'use client'` added at top:**

```
src/contexts/AuthContext.jsx        ← already noted
src/components/layout/Navbar.jsx
src/components/layout/Footer.jsx    (if it has any interactivity)
src/components/ui/Button.jsx
src/components/ui/Modal.jsx
src/components/ui/Accordion.jsx
src/components/ui/Tabs.jsx
src/components/transform/*          ← all of these
src/components/workspace/*          ← all of these
src/components/tabs/*               ← all of these
src/components/dashboard/*          ← all of these
src/pages/Login.jsx → app/login/page.tsx
src/pages/Signup.jsx → app/signup/page.tsx
src/pages/Dashboard.jsx → app/dashboard/page.tsx
src/pages/Transform.jsx → app/transform/page.tsx
src/pages/TransformDetail.jsx → app/transform/[id]/page.tsx
src/pages/Profile.jsx → app/profile/page.tsx
```

**Rule of thumb:** If you're unsure, add `'use client'`. Next.js throws a clear error if you use client APIs in a Server Component, making it easy to find missing directives.

#### TASK 4.2 — PDF.js Dynamic Import (SSR-safe)

PDF.js accesses `window` and `document` — it must not run on the server.

**Current (`src/lib/parsers/fileParser.js`):**
```javascript
const pdfjsLib = await import('pdfjs-dist');
pdfjsLib.GlobalWorkerOptions.workerSrc = `...`;
```

**Next.js replacement — create `src/lib/parsers/pdfParser.client.js`:**
```javascript
// This file is only ever imported dynamically from client components
let pdfjsLib = null;

export async function parsePDF(file) {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
  // ... rest of parsing logic unchanged
}
```

In the component that calls this:
```jsx
'use client';
// Instead of: import { parsePDF } from '@/lib/parsers/fileParser';
// Use lazy import inside the handler:
const handleFile = async (file) => {
  const { parsePDF } = await import('@/lib/parsers/pdfParser.client');
  const text = await parsePDF(file);
};
```

#### TASK 4.3 — Environment Variables

| Variable | Current | Next.js |
|---|---|---|
| Supabase URL | `VITE_SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` |
| Supabase Anon Key | `VITE_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Groq API Key | In Deno env (secret) | `GROQ_API_KEY` (no NEXT_PUBLIC_ — server only) |
| Cron Secret | N/A | `CRON_SECRET` (new, Vercel Cron auth) |

Update `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
GROQ_API_KEY=gsk_...
CRON_SECRET=your-random-secret-here
```

**Important:** `GROQ_API_KEY` does NOT have `NEXT_PUBLIC_` prefix. It is only accessible in API Routes (server), never exposed to the browser. This is more secure than the current setup where it lives in Supabase env.

#### TASK 4.4 — Update `api.js`

`src/lib/api.js` currently calls Supabase Edge Functions via their URL. Replace those calls with fetch to the new Next.js API routes:

```javascript
// Before:
const { data } = await supabase.functions.invoke('transform', { body: payload });

// After:
const response = await fetch('/api/transform', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
const data = await response.json();
```

No auth headers needed — Next.js API Routes read auth from cookies automatically via the server client.

---

### PHASE 5 — VERCEL DEPLOYMENT (Day 6–7, ~2 hours)

#### TASK 5.1 — Update Vercel Project Settings

In Vercel dashboard:
1. Change **Framework Preset** from "Vite" → "Next.js"
2. Change **Root Directory** to the new Next.js project folder
3. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GROQ_API_KEY`, `CRON_SECRET`
4. Remove old `VITE_*` variables

#### TASK 5.2 — Update `vercel.json`

Delete the SPA fallback rewrite. Replace with just the cron:
```json
{
  "crons": [
    {
      "path": "/api/cleanup",
      "schedule": "0 */2 * * *"
    }
  ]
}
```

#### TASK 5.3 — Supabase Auth Redirect URLs

Update in Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://your-domain.vercel.app`
- Add redirect URL: `https://your-domain.vercel.app/auth/callback`

Create **`src/app/auth/callback/route.ts`**:
```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
```

This handles the OAuth callback (Google OAuth, magic link, password reset links). Previously this was handled by client-side URL hash parsing — the server route is more reliable.

---

### PHASE 6 — PERFORMANCE OPTIMIZATIONS (Day 7, ~2 hours)

These are Next.js-specific wins unavailable in the Vite SPA:

#### TASK 6.1 — Optimize `next/image` for Avatar

Replace any `<img>` tags for user avatars with `next/image`:
```tsx
import Image from 'next/image';
<Image src={avatarUrl} alt="User avatar" width={40} height={40} className="rounded-full" />
```

#### TASK 6.2 — Landing Page Static Generation

The landing page (`app/page.tsx`) is now a Server Component. Add revalidation for the stats counter:
```typescript
// Revalidate stats every 60 seconds (ISR)
export const revalidate = 60;
```

The landing page will be pre-rendered as static HTML and re-generated every 60 seconds on Vercel. First load is instant — served from CDN.

#### TASK 6.3 — Prefetch Dashboard on Login

```tsx
// In Login page, prefetch dashboard so navigation is instant after login
import { useRouter } from 'next/navigation';
const router = useRouter();

const handleSuccess = () => {
  router.prefetch('/dashboard');
  router.push('/dashboard');
};
```

#### TASK 6.4 — Parallel Data Fetching on Dashboard

With Server Components, dashboard data can be fetched in parallel server-side:
```tsx
// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Fetch in parallel — not waterfall
  const [transformations, profile] = await Promise.all([
    supabase.from('transformations').select('*').eq('is_deleted', false).order('created_at', { ascending: false }).limit(20),
    supabase.from('profiles').select('*').single(),
  ]);

  return <DashboardClient initialData={transformations.data} profile={profile.data} />;
}
```

---

## MIGRATION CHECKLIST (Day-by-Day)

```
Day 1:
  ☐ Bootstrap Next.js project (Task 0.1–0.5)
  ☐ Create Supabase browser + server clients (Task 1.1–1.2)
  ☐ Create middleware (Task 1.3)
  ☐ Update AuthContext (Task 1.4)

Day 2:
  ☐ Create app/layout.tsx (Task 2.2)
  ☐ Convert Landing to Server Component (Task 2.3)
  ☐ Convert Login, Signup, ForgotPassword, ResetPassword, VerifyEmail pages (Task 2.3)

Day 3:
  ☐ Convert Dashboard, Transform, TransformDetail, Profile pages (Task 2.3)
  ☐ Port matchScore, resumeToText, rateLimit utilities (Task 3.4)
  ☐ Port groq.ts with Deno.env → process.env (Task 3.4)

Day 4:
  ☐ Build /api/transform route handler (Task 3.1)
  ☐ Build /api/rescore route handler (Task 3.2)
  ☐ Build /api/cleanup + Vercel Cron (Task 3.3)
  ☐ Build /auth/callback route (Task 5.3)

Day 5:
  ☐ Add 'use client' to all interactive components (Task 4.1)
  ☐ Fix PDF.js dynamic import (Task 4.2)
  ☐ Update env variables (Task 4.3)
  ☐ Update api.js to use fetch('/api/...') (Task 4.4)

Day 6:
  ☐ Update Vercel project settings (Task 5.1–5.2)
  ☐ Update Supabase redirect URLs (Task 5.3)
  ☐ Full end-to-end smoke test (sign up → transform → download)

Day 7:
  ☐ next/image for avatars (Task 6.1)
  ☐ ISR revalidation on landing page (Task 6.2)
  ☐ Parallel data fetching on dashboard (Task 6.4)
  ☐ Fix any hydration warnings
  ☐ Deploy to production
```

---

## COMMON GOTCHAS & HOW TO AVOID THEM

| Gotcha | Symptom | Fix |
|---|---|---|
| Forgot `'use client'` on a component with hooks | Next.js build error: "You're importing a component that needs useState..." | Add `'use client'` at the top of the file |
| Hydration mismatch | Console warning: "Text content did not match" | Don't read `localStorage`, `window`, or `document` during render. Use `useEffect` |
| PDF.js accessing `window` during SSR | Server-side crash: "window is not defined" | Dynamic import inside event handler (Task 4.2) |
| Supabase auth not persisting | User logged out on page refresh | Ensure middleware is set up correctly (Task 1.3) |
| Groq API key exposed in browser | `NEXT_PUBLIC_GROQ_API_KEY` visible in source | Never prefix server secrets with `NEXT_PUBLIC_` |
| `maxDuration` not set on transform route | Vercel times out at 10s (free tier) | Set `export const maxDuration = 60` in route file (requires Vercel Pro for >10s) |
| Vercel Cron hitting cleanup without auth | `401` errors in cron logs | Set `CRON_SECRET` env var and verify `authorization` header in route |
| Cookie not set after OAuth callback | User redirected to login after OAuth | Implement `/auth/callback/route.ts` (Task 5.3) |
| Framer Motion crashing on Server Component | "framer-motion is not compatible with Server Components" | Add `'use client'` to any component using `motion.*` |

---

## WHAT YOU CAN DELETE AFTER MIGRATION

```
supabase/functions/          ← entire folder (replaced by /app/api/)
vite.config.js               ← replaced by next.config.js
index.html                   ← replaced by app/layout.tsx
src/main.jsx                 ← replaced by app/layout.tsx
src/App.jsx                  ← replaced by app/layout.tsx + middleware
src/components/layout/ProtectedRoute.jsx  ← replaced by middleware.ts
```

The `supabase/` folder (migrations, config.toml) stays — you still use Supabase as your database.

---

## SUPABASE DENO FUNCTIONS — KEEP OR DELETE?

After migration, you no longer need to deploy Deno Edge Functions for `transform` or `cleanup`. However:

- Keep the `supabase/migrations/` folder — you still apply these to your DB.
- Keep `supabase/config.toml` — used by Supabase CLI for local development.
- **Delete** `supabase/functions/transform/` and `supabase/functions/cleanup/` — their logic is now in `/app/api/`.
- Run `supabase functions delete transform` and `supabase functions delete cleanup` to remove deployed functions from Supabase cloud.

---

## PERFORMANCE COMPARISON (Expected)

| Metric | Vite SPA (current) | Next.js (after) |
|---|---|---|
| Landing page LCP | ~2.5–3.5s (client renders) | ~0.8–1.2s (SSR/static) |
| Dashboard first load | ~1.8s (JS bundle + fetch) | ~0.9s (server data pre-fetched) |
| Transform page | Same (client-heavy) | Same |
| SEO indexability | Poor (SPA) | Excellent (SSR) |
| API security | Groq key in Deno env | Groq key in server-only process.env |
| Deploy complexity | Vite build + Supabase deploy | Single `git push` |
```
