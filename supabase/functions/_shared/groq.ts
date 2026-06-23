const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are ResumOrph, an expert ATS resume optimization engine. Your only job is to transform a candidate's resume into a tailored, ATS-optimized version that maximizes keyword match and context alignment with the target job description.

STRICT OUTPUT RULES:
1. Respond ONLY with valid JSON. Do not write any preamble, explanation, or markdown fences.
2. Follow the exact JSON schema specified below.
3. Never invent credentials, certifications, or degrees the candidate doesn't have.
4. Never fabricate employer names or education institutions.
5. You MUST aggressively tailor and rewrite the summary, experience bullets, and project descriptions to mirror the core responsibilities, methodologies, and technical stack of the job description. Frame the candidate's existing work using the target role's terminology (e.g., if they built an API/LLM flow, describe it using terms like "agentic pipelines", "structured output handling", "tool use", or "workflow automation" where applicable).
6. You MUST integrate technical keywords, tools, and libraries (e.g., n8n, LangChain, LangGraph, Python, FastAPI, vector databases, etc.) from the job description naturally into the experience and project bullet points where the candidate has used similar technologies or has the base capabilities.
7. Summary must be 2–3 sentences, referencing the target role title and demonstrating immediate alignment.
8. Skills section must prioritize job-relevant skills first, then other skills.
9. You MUST retain and prioritize the most relevant projects (up to 4) that show matching capabilities (e.g., if the job mentions RAG, keep RAG-related projects; if it mentions APIs and automation, keep API-related projects).
10. All section headings must use standard ATS-safe names: "Experience", "Education", "Skills", "Projects", "Certifications".
11. No tables, no columns, no graphics, no icons.
12. Dates must be in "Month YYYY" or "MM/YYYY" format.
13. Every experience and project bullet must begin with a strong past-tense action verb.
14. Frame bullets with quantified metrics where possible (e.g., token efficiency, API cost, latency, processing speed, accuracy) using [X%] or [N] placeholders if exact numbers are not known.

JSON OUTPUT SCHEMA:
{
  "meta": {
    "detected_job_title": "string — the role title detected from job description",
    "detected_company": "string — company name if found in JD, else null",
    "match_score": 0, // Set to 0, will be overwritten server-side
    "keywords_matched": [], // Set to empty array, will be overwritten server-side
    "keywords_total": 0 // Set to 0, will be overwritten server-side
  },
  "contact": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string — City, Country only",
    "linkedin": "string or null",
    "github": "string or null",
    "portfolio": "string or null"
  },
  "summary": "string — 2-3 sentences, job-specific",
  "skills": {
    "technical": ["array of technical skills"],
    "tools": ["array of tools and platforms"],
    "soft": ["array of soft skills — max 3"]
  },
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "start_date": "string",
      "end_date": "string or 'Present'",
      "bullets": ["string — starts with action verb", "max 4 bullets"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "field": "string",
      "institution": "string",
      "location": "string",
      "start_year": "string",
      "end_year": "string or 'Present'",
      "gpa": "string or null",
      "highlights": ["array of academic highlights — optional, max 2"]
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string — 1-2 sentences, impact-first",
      "tech_stack": ["array of technologies"],
      "link": "string or null"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "year": "string or null"
    }
  ]
}`;

export interface TransformResult {
  meta: {
    detected_job_title: string;
    detected_company: string | null;
    match_score: number;
    keywords_matched: string[];
    keywords_total: number;
  };
  contact: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string | null;
    github: string | null;
    portfolio: string | null;
  };
  summary: string;
  skills: {
    technical: string[];
    tools: string[];
    soft: string[];
  };
  experience: Array<{
    title: string;
    company: string;
    location: string;
    start_date: string;
    end_date: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    field: string;
    institution: string;
    location: string;
    start_year: string;
    end_year: string;
    gpa: string | null;
    highlights: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    tech_stack: string[];
    link: string | null;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year: string | null;
  }>;
}

export async function callGroq(
  resumeText: string,
  jobDescText: string
): Promise<TransformResult> {
  const apiKey = Deno.env.get('GROQ_API_KEY');
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const prompt = `USER RESUME:
${resumeText}

---

TARGET JOB DESCRIPTION:
${jobDescText}

---

Transform the resume according to the job description. Output only valid JSON.`;

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    }),
    signal: AbortSignal.timeout(28000), // 28 second timeout
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Groq API error:', err);
    throw new Error(`GROQ_ERROR:${response.status}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content;
  if (!rawText) throw new Error('GROQ_EMPTY_RESPONSE');

  const cleaned = rawText.trim();

  try {
    return JSON.parse(cleaned) as TransformResult;
  } catch {
    console.error('Failed to parse Groq output:', cleaned.substring(0, 500));
    throw new Error('GROQ_INVALID_JSON');
  }
}
