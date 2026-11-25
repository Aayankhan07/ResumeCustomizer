import type { Metadata } from 'next';
import LegalPage from '../../components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'What ResumOrph stores, who can see it, and how to remove your data.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 25, 2026">
      <section>
        <h2>The short version</h2>
        <p>
          When you tailor a resume, we save the result together with the resume and job description
          you submitted, so you can compare versions and re-score later. Only your account can read
          them, and we never sell them.
        </p>
      </section>

      <section>
        <h2>What we store</h2>
        <ul>
          <li>Your account details: email address and, if you add them, your name and avatar.</li>
          <li>
            Each tailored result: the generated resume and related output, the text of the resume
            and job description you submitted, the detected job title and company, and the match
            score.
          </li>
          <li>Application tracking details you add, such as status and events.</li>
          <li>Timestamps of tailoring requests, used only to apply the hourly limit.</li>
        </ul>
      </section>

      <section>
        <h2>How your content is processed</h2>
        <p>
          To tailor your resume, the text you submit is sent to our AI model provider for that
          single request. The result is returned to you and, if you are signed in, saved to your
          history.
        </p>
      </section>

      <section>
        <h2>Who can see your data</h2>
        <p>
          Saved results are protected by row-level security in our database, so only your signed-in
          account can read them. We do not sell your data.
        </p>
      </section>

      <section>
        <h2>Analytics and error monitoring</h2>
        <p>
          We use privacy-friendly page analytics and performance measurement, and an error
          monitoring service to find and fix crashes. These do not receive your resume content.
        </p>
      </section>

      <section>
        <h2>Deleting your data</h2>
        <p>
          You can remove any result from your history at any time. Removed results are permanently
          deleted from our database within 30 days. You can delete your account, and everything tied
          to it, immediately from your profile page.
        </p>
      </section>
    </LegalPage>
  );
}
