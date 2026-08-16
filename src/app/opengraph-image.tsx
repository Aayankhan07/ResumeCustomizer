import { ImageResponse } from 'next/og';

/**
 * Generated rather than shipped as a binary so the wording stays in source
 * control and in sync with the landing page. Without this, every shared link
 * previewed as a bare URL.
 */
export const runtime = 'edge';
export const alt = 'ResumOrph — tailor your resume to any job description';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#09090b',
          color: '#fafafa',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 30, color: '#10b981', letterSpacing: 4, marginBottom: 28 }}>
          ATS TAILORING SYSTEM
        </div>
        <div style={{ fontSize: 82, fontWeight: 700, lineHeight: 1.05, marginBottom: 12 }}>
          Your resume.
        </div>
        <div style={{ fontSize: 82, fontWeight: 700, lineHeight: 1.05, color: '#10b981' }}>
          Tailored for every job.
        </div>
        <div style={{ fontSize: 30, color: '#a1a1aa', marginTop: 40, maxWidth: 900 }}>
          Rewrites your experience to match the role, scores it against the posting,
          and exports an ATS-ready PDF.
        </div>
        <div style={{ fontSize: 34, fontWeight: 700, marginTop: 'auto' }}>ResumOrph</div>
      </div>
    ),
    size
  );
}
