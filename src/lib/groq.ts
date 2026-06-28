const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are ResumOrph, an expert ATS resume optimization engine. Your only job is to transform a candidate's resume into a tailored, ATS-optimized version that maximizes keyword match and context alignment with the target job description.

STRICT OUTPUT RULES:
1. Respond ONLY with valid JSON. Do not write any preamble, explanation, or markdown fences.
2. Follow the exact JSON schema specified below.
3. Never invent credentials, certifications, or degrees the candidate doesn't have.
4. Never fabricate employer names or education institutions.
5. You MUST tailor and rewrite the summary, experience bullets, and project descriptions to mirror the core responsibilities, methodologies, and technical stack of the job description. Frame the candidate's existing work using the target role's terminology.
6. You MUST integrate technical keywords, tools, and libraries from the job description naturally into the experience and project bullet points where the candidate has used similar technologies or has the base capabilities.
7. Summary must be 2–3 sentences, referencing the target role title and demonstrating immediate alignment.
8. Skills section must prioritize job-relevant skills first, then other skills.
9. You MUST retain and prioritize the most relevant projects (up to 4) that show matching capabilities.
10. All section headings must use standard ATS-safe names: "Experience", "Education", "Skills", "Projects", "Certifications".
11. No tables, no columns, no graphics, no icons.
12. Dates must be in "Month YYYY" or "MM/YYYY" format.
13. Every experience and project bullet must begin with a strong past-tense action verb.
14. Frame bullets with quantified metrics where possible (e.g., token efficiency, API cost, latency, processing speed, accuracy) using [X%] or [N] placeholders if exact numbers are not known.
15. In the "rewrites" section, capture the exact original text (before) and the new high-impact version (after) for the Professional Summary and at least 2 experience bullets. Do NOT include sections with no changes.
16. For ats_quality:
    - keyword_density: 'Optimal' if matched keywords > 60% of total, 'Low' if < 30%, else 'High'
    - section_headings: 'Standard' if all sections use standard heading names (Summary, Experience, Education, Skills, Projects)
    - formatting_risk: 'Zero Flags' (default for our output since we enforce clean formatting)

JSON OUTPUT SCHEMA:
{
  "contact": {
    "name": "string",
    "email": "string",
    "phone": "string or null",
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
      "start_year": "string",
      "end_year": "string or 'Present'"
    }
  ],
  "projects": [
    {
      "title": "string",
      "description": "string — 1-2 sentences, impact-first",
      "bullets": ["string — starts with action verb", "max 3 bullets"]
    }
  ],
  "recruiter_scan": {
    "strong_yes": "string - 1-2 sentences explaining why they belong in the hiring pile",
    "completely_missed": "string - 1 sentence explaining the main risk or gap in the profile",
    "elevator_pitch": "string - a highly compelling 30-second spoken pitch tailored to this role"
  },
  "roadmap": {
    "tasks": [
      {
        "task": "string - specific, actionable task to improve fit",
        "type": "string - 'Content' or 'Keywords' or 'Projects' or 'Certifications'",
        "impact": "string - 'High Impact' or 'Medium Impact'",
        "points": 5
      },
      {
        "task": "string - second specific task",
        "type": "string",
        "impact": "string",
        "points": 3
      }
    ]
  },
  "ats_quality": {
    "keyword_density": "Optimal | Low | High",
    "section_headings": "Standard | Non-standard",
    "formatting_risk": "Zero Flags | Minor Issues | At Risk"
  },
  "rewrites": [
    {
      "section": "string - e.g. 'Professional Summary', 'Work Experience 1', 'Work Experience 2'",
      "before": "string - unoptimized text from original resume",
      "after": "string - optimized, high-impact version with keywords"
    }
  ],
  "interview_prep": {
    "technical": [
      {
        "question": "string - technical question based on their stack",
        "difficulty": "string - 'Medium' or 'Hard'",
        "expectation": "string - what the interviewer wants to hear (keywords, STAR details)"
      }
    ],
    "behavioral": [
      {
        "question": "string - behavioral/STAR question based on experience",
        "difficulty": "string - 'Medium' or 'Hard'",
        "expectation": "string - what they want to hear (scale, conflict, ownership)"
      }
    ],
    "curveball": [
      {
        "question": "string - hypothetical or highly challenging problem-solving question",
        "difficulty": "string - 'Hard'",
        "expectation": "string - what they want to hear (diagnostics, fallback systems)"
      }
    ]
  },
  "cover_letter": "string — complete formatted cover letter"
}

Ensure the "interview_prep" object contains exactly 10 questions in total: exactly 4 technical questions, exactly 4 behavioral questions, and exactly 2 curveball questions. All questions must be highly specific to the candidate's actual CV and the target job description.`;

export interface TransformResult {
  contact: {
    name: string;
    email: string;
    phone: string | null;
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
    start_year: string;
    end_year: string;
  }>;
  projects?: Array<{
    title: string;
    description: string;
    bullets: string[];
  }> | null;
  recruiter_scan: {
    strong_yes: string;
    completely_missed: string;
    elevator_pitch: string;
  };
  roadmap: {
    tasks: Array<{
      task: string;
      type: string;
      impact: string;
      points: number;
    }>;
  };
  ats_quality: {
    keyword_density: 'Optimal' | 'Low' | 'High';
    section_headings: 'Standard' | 'Non-standard';
    formatting_risk: 'Zero Flags' | 'Minor Issues' | 'At Risk';
  };
  rewrites: Array<{
    section: string;
    before: string;
    after: string;
  }>;
  interview_prep: {
    technical: Array<{ question: string; difficulty: string; expectation: string }>;
    behavioral: Array<{ question: string; difficulty: string; expectation: string }>;
    curveball: Array<{ question: string; difficulty: string; expectation: string }>;
  };
  cover_letter: string;
  meta?: {
    detected_job_title: string;
    detected_company: string;
    match_score?: number | null;
    keywords_matched?: string[] | null;
    keywords_total?: number | null;
    keywords_missing?: string[] | null;
  };
}

const MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
];

export async function callGroqWithFallback(
  resumeText: string,
  jobDescText: string
): Promise<{ data: TransformResult; model_used: string }> {
  const apiKey = process.env.GROQ_API_KEY || '';
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const prompt = `USER RESUME:
${resumeText}

---

TARGET JOB DESCRIPTION:
${jobDescText}

---

Transform the resume according to the job description. Output only valid JSON.`;

  for (const model of MODELS) {
    try {
      console.log(`Attempting Groq call with model: ${model}`);
      
      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' }
        }),
        signal: AbortSignal.timeout(25000), // 25 second timeout
      });

      if (response.status === 429) {
        console.warn(`Groq model ${model} rate limited (429). Trying next fallback...`);
        continue;
      }

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`GROQ_ERROR:${response.status} Details: ${err}`);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content;
      if (!rawText) throw new Error('GROQ_EMPTY_RESPONSE');

      const cleaned = rawText.trim();
      const parsed = JSON.parse(cleaned) as TransformResult;

      return { data: parsed, model_used: model };
    } catch (err: any) {
      console.error(`Error with model ${model}:`, err.message);
      if (model === MODELS[MODELS.length - 1]) {
        throw err;
      }
    }
  }
  throw new Error('All Groq models exhausted');
}

export async function callGroq(
  resumeText: string,
  jobDescText: string
): Promise<TransformResult> {
  const res = await callGroqWithFallback(resumeText, jobDescText);
  return res.data;
}
