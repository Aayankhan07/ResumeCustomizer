import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '../../components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms for using ResumOrph, including the free-tier limit and our no-fabrication commitment.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="November 25, 2026">
      <section>
        <h2>Using ResumOrph</h2>
        <p>
          ResumOrph rewrites the resume you provide to fit a job description you provide. You need
          an account to use it, and you are responsible for the content you submit.
        </p>
      </section>

      <section>
        <h2>No fabrication</h2>
        <p>
          ResumOrph is designed to reword and reorder your existing experience, not to invent it. It
          does not add employers, dates, degrees, credentials or skills that are not in your resume.
          AI output can still contain mistakes, so review every line before you send a resume. You
          are responsible for the accuracy of what you submit to employers.
        </p>
      </section>

      <section>
        <h2>Free tier</h2>
        <p>
          The free tier allows up to 10 tailored resumes per hour per account. We may change this
          limit to keep the service reliable.
        </p>
      </section>

      <section>
        <h2>Scores and results</h2>
        <p>
          The match score measures keyword overlap between your resume and the job description. It
          is a guide, not a prediction of whether you will get an interview or a job.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <ul>
          <li>Do not submit content you do not have the right to use.</li>
          <li>Do not try to get around rate limits or disrupt the service.</li>
          <li>Do not use the service to create misleading or fraudulent applications.</li>
        </ul>
      </section>

      <section>
        <h2>Your data</h2>
        <p>
          How we handle your content is described in our <Link href="/privacy">privacy policy</Link>
          .
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          We may update these terms. The date at the top of this page shows when they last changed.
        </p>
      </section>
    </LegalPage>
  );
}
