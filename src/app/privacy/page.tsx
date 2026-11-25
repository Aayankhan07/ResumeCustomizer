import type { Metadata } from 'next';
import LegalPage from '../../components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'What ResumOrph stores, what it does not, and how to delete your data. Raw resume text and job descriptions are never saved.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 25, 2026">
      <section>
        <h2>The short version</h2>
        <p>
          The resume and job description you submit are used to produce your result and are not
          saved in our database. We save the tailored result to your account so you can download it
          again, and you can delete it at any time.
        </p>
      </section>

      <section>
        <h2>What we store</h2>
        <ul>
          <li>Your account details: email address and, if you add them, your name and avatar.</li>
          <li>
            Each tailored result: the generated resume and related output, the job title and company
            detected from the job description, and the character counts of what you submitted.
          </li>
          <li>Application tracking details you add, such as status and events.</li>
          <li>Timestamps of tailoring requests, used only to apply the hourly limit.</li>
        </ul>
      </section>

      <section>
        <h2>What we do not store</h2>
        <ul>
          <li>The raw text of the resume you upload or paste.</li>
          <li>The raw text of the job description you paste.</li>
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
          You can delete any saved result from your history at any time. To remove your account and
          everything tied to it, contact us and we will delete it.
        </p>
      </section>
    </LegalPage>
  );
}
