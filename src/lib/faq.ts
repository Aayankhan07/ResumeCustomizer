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
];
