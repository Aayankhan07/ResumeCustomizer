/**
 * Landing-page FAQ content.
 *
 * Kept here rather than inside LandingClient so the server component can emit
 * FAQPage structured data from the same source. The accordion unmounts closed
 * answers, so without this the answers never appear in the HTML at all — the
 * strongest long-tail content on the site was invisible to crawlers and to the
 * AI assistants that quote FAQ answers directly.
 */
export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Is my resume stored anywhere permanently?',
    answer:
      'No. To ensure candidate privacy, your raw resume text and job descriptions are never saved in our database. We only persist the finalized, structured AI output for re-download purposes, which you can delete at any time.',
  },
  {
    question: "Will the AI make up experience I don't have?",
    answer:
      'Absolutely not. ResumOrph strictly adheres to the facts listed in your original resume. It rewrites and reframes existing bullet points for maximum relevance and impact, but it will never fabricate employer names, dates, degrees, or credentials.',
  },
  {
    question: 'Why is ATS optimization important?',
    answer:
      'Applicant Tracking Systems parse resumes and filter candidates based on keyword matching and semantic relevance. If your resume lacks the specific terminology and standard layout required by the system, it may be automatically rejected before reaching human recruiters.',
  },
  {
    question: 'What file formats do you support for upload?',
    answer:
      'You can upload resumes and job descriptions in PDF (.pdf), Microsoft Word (.docx), or plain text (.txt) formats. You can also paste text directly into the wizard.',
  },
  {
    question: 'How many resumes can I optimize?',
    answer:
      'Free account holders are allowed up to 10 resume optimizations per hour. This rolling rate limit keeps AI operations within healthy margins.',
  },
  {
    question: 'What do I get as a result?',
    answer:
      'A full, tailored resume — summary, skills, experience bullets, projects, and education — rewritten to match the job description. You also get a match score, a list of the keywords you are missing, before/after rewrites of your summary and bullets, a recruiter scan, interview prep questions, and a cover letter. Export as PDF, DOCX, or plain text.',
  },
  {
    question: 'What formats can I download?',
    answer:
      'You can download the tailored resume as a PDF, a Word (.docx) file, or plain text. The PDF and DOCX use clean, ATS-safe layouts — no columns, tables, graphics, or icons.',
  },
  {
    question: 'Is it free?',
    answer:
      'Yes. The free tier lets any account holder tailor up to 10 resumes per hour, with no credit card required. There is no trial and no hidden paywall for the core tailoring flow.',
  },
  {
    question: 'How is the match score calculated?',
    answer:
      'The match score is computed server-side, not reported by the AI. We extract the meaningful keywords from the job description, weight them by how often they appear, and check how many of those keywords actually appear in your tailored resume. That gives a real percentage — and we also score your original resume the same way so you can see the improvement, not just the final number.',
  },
  {
    question: 'Who is this for?',
    answer:
      'Anyone applying to jobs with a written description: engineers, designers, product managers, data roles, operations, and career-changers. We support both technical and non-technical roles because the tailoring is based on the actual job description, not a fixed template.',
  },
];
