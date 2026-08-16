import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validTransformOutput } from '../fixtures/transformOutput';

/**
 * End-to-end smoke test for the transform pipeline.
 *
 * Unlike transform.test.ts, this does *not* mock lib/groq — it runs the real
 * prompt construction, fallback loop, JSON parsing, schema validation, scoring
 * and persistence, stubbing only `fetch` at the network boundary.
 *
 * This is the test that would have caught the shipped `meta` bug: the prompt
 * never asked for the object the schema required, so every transform in
 * production returned 422 while all unit tests passed.
 */

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  insert: vi.fn(),
  checkRateLimit: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: mocks.getUser },
    from: () => ({
      insert: (row: unknown) => {
        mocks.insert(row);
        return { select: () => ({ single: async () => ({ data: { id: 'txn-1' }, error: null }) }) };
      },
    }),
  }),
}));

vi.mock('@/lib/rateLimit', () => ({ checkRateLimit: mocks.checkRateLimit }));

const { POST } = await import('@/app/api/transform/route');

const RESUME = `Aayan Khan
Karachi, Pakistan | aayan@example.com

SUMMARY
Frontend developer with three years building React and Next.js applications.

EXPERIENCE
Frontend Developer, Nexus Systems (Jan 2023 - Present)
- Built dashboards in React.
- Worked on making pages load faster.

EDUCATION
BS Computer Science, NED University, 2018 - 2022

SKILLS
JavaScript, React, Next.js, CSS, Git`;

const JD = `Senior Frontend Engineer at Northwind Labs.
Build and maintain large-scale React and TypeScript applications.
Own performance work including Core Web Vitals and bundle size.
Mentor junior engineers and lead code review.
Requirements: 3+ years React, strong TypeScript, Next.js experience.`;

/** A Groq chat-completion envelope wrapping the given JSON payload. */
function groqResponse(payload: unknown): Response {
  return new Response(
    JSON.stringify({ choices: [{ message: { content: JSON.stringify(payload) } }] }),
    { status: 200, headers: { 'content-type': 'application/json' } }
  );
}

function request(): Request {
  return new Request('http://localhost/api/transform', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resume_text: RESUME,
      job_description_text: JD,
      optimization_mode: 'description',
    }),
  });
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('GROQ_API_KEY', 'gsk_test_key');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key');

  mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
  mocks.checkRateLimit.mockResolvedValue({
    allowed: true,
    remaining: 9,
    resetAt: new Date(Date.now() + 3600000),
  });

  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

describe('transform pipeline (real groq module, mocked network)', () => {
  it('carries a well-formed model response through to a persisted row', async () => {
    fetchMock.mockImplementation(async () => groqResponse(validTransformOutput));

    const res = await POST(request());
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.meta.detected_job_title).toBe('Software Engineer');
    expect(mocks.insert).toHaveBeenCalledTimes(1);
  });

  it('asks the model for every field the schema requires', async () => {
    // The prompt and the schema drifted apart once already: `meta` was
    // required but never requested, so no transform could ever succeed.
    fetchMock.mockImplementation(async () => groqResponse(validTransformOutput));
    await POST(request());

    const [, init] = fetchMock.mock.calls[0];
    const sent = JSON.parse((init as RequestInit).body as string);
    const systemPrompt = sent.messages[0].content as string;

    for (const field of [
      'contact',
      'summary',
      'skills',
      'experience',
      'education',
      'cover_letter',
      'meta',
      'detected_job_title',
      'detected_company',
    ]) {
      expect(systemPrompt).toContain(field);
    }
  });

  it('recovers when the first model omits a required field', async () => {
    // Validation runs per attempt, so a bad response costs one model rather
    // than the whole request.
    const { meta: _meta, ...missingMeta } = validTransformOutput;
    fetchMock
      .mockResolvedValueOnce(groqResponse(missingMeta))
      .mockResolvedValueOnce(groqResponse(validTransformOutput));

    const res = await POST(request());
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('recovers when the first model returns malformed JSON', async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ choices: [{ message: { content: '{"broken"' } }] }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(groqResponse(validTransformOutput));

    const res = await POST(request());
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('returns 422 only after every model has been tried', async () => {
    const { meta: _meta, ...missingMeta } = validTransformOutput;
    // A fresh Response per call: a body can only be consumed once, so a single
    // shared instance makes attempts 2 and 3 fail for the wrong reason.
    fetchMock.mockImplementation(async () => groqResponse(missingMeta));

    const res = await POST(request());
    expect(res.status).toBe(422);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('salvages the resume when only an enrichment is malformed', async () => {
    fetchMock.mockImplementation(async () =>
      groqResponse({
        ...validTransformOutput,
        roadmap: { tasks: [{ task: 'x', type: 'skill', impact: 'high', points: 'not a number' }] },
      })
    );

    const res = await POST(request());
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.roadmap).toBeNull();
    expect(body.data.experience).toHaveLength(1);
  });

  it('scores the tailored resume above the original', async () => {
    fetchMock.mockImplementation(async () =>
      groqResponse({
        ...validTransformOutput,
        summary: 'Senior frontend engineer specialising in React and TypeScript.',
        skills: { technical: ['React', 'TypeScript', 'Next.js'], tools: [], soft: [] },
      })
    );

    const res = await POST(request());
    const body = await res.json();

    expect(body.data.meta.match_score).toBeGreaterThan(body.data.meta.baseline_score);
  });

  it('never sends the raw job description as an instruction', async () => {
    // Prompt-injection guard: user text must stay inside the data fence.
    fetchMock.mockImplementation(async () => groqResponse(validTransformOutput));
    await POST(request());

    const [, init] = fetchMock.mock.calls[0];
    const sent = JSON.parse((init as RequestInit).body as string);
    const userPrompt = sent.messages[1].content as string;

    expect(userPrompt).toContain('<<<END_OF_USER_DATA>>>');
  });
});
