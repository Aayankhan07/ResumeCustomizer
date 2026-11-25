import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { AuthProvider } from '../contexts/AuthContext';
import { siteUrl } from '../lib/siteUrl';
import './globals.css';

// Self-hosted via next/font rather than a render-blocking <link> to Google
// Fonts: removes a third-party round trip on first paint and eliminates the
// layout shift when the webfont swaps in.
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

// Not preloaded: this is used only for small decorative labels (badges, the
// footer wordmark), never for above-the-fold content. Preloading it put a
// third font file in the critical path, competing for bandwidth with the two
// that actually render the LCP element and body copy. It still loads on
// demand, with `swap` so text is never invisible while it arrives.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
  preload: false,
});

const DESCRIPTION =
  'Tailor your resume to any job description. ResumOrph rewrites your existing ' +
  'experience to match the role, scores it against the posting, and exports an ' +
  'ATS-ready PDF or DOCX.';

export const metadata: Metadata = {
  // Required for Open Graph: relative image and canonical URLs are resolved
  // against this, and without it social previews render with no image at all.
  metadataBase: new URL(siteUrl()),
  // Browsers request /favicon.ico by default; point them at the SVG that exists.
  icons: { icon: '/favicon.svg' },
  title: { template: '%s | ResumOrph', default: 'ResumOrph — AI Resume Tailoring' },
  description: DESCRIPTION,
  applicationName: 'ResumOrph',
  keywords: ['resume', 'ATS', 'job application', 'CV', 'cover letter', 'resume optimization'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'ResumOrph',
    title: 'ResumOrph — AI Resume Tailoring',
    description: DESCRIPTION,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResumOrph — AI Resume Tailoring',
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

// Force light mode across the application.
//
// Dark mode is not supported yet: the app has no theme toggle, and many
// components' dark: variants are incomplete. This script clears any stale
// 'dark' class or stored preference (e.g. from an older build that had a
// toggle) so every visitor gets the light theme. The dark: classes are left
// in place for when a supported dark theme ships.
const THEME_INIT = `
(function () {
  try {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <div className="min-h-screen bg-[var(--bg-subtle)] transition-colors duration-300">
            {children}
          </div>
          {/* Toasts were hardcoded to a near-black background with an inline
              'Inter' font stack, so they rendered as a black box in light mode
              and bypassed the --font-sans variable set on <html>. */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
              },
            }}
          />
        </AuthProvider>
        {/* @vercel/speed-insights was a dependency but was never mounted, so
            it collected nothing. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
