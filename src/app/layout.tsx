import type { Metadata } from 'next';
import { Inter, DM_Serif_Display, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { AuthProvider } from '../contexts/AuthContext';
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

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-dm-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { template: '%s | ResumOrph', default: 'ResumOrph — AI Resume Tailoring' },
  description: 'ATS-optimized resumes tailored to any job description in seconds.',
};

// Applied before first paint. The theme was previously read from localStorage
// in a Navbar effect, which had two consequences: the five auth routes render
// no Navbar and so ignored the saved theme entirely (a dark-mode user got a
// white login page), and every other route painted light before the effect
// corrected it. Runs synchronously in <head>, ahead of hydration.
const THEME_INIT = `
(function () {
  try {
    var t = localStorage.getItem('theme');
    if (t !== 'dark' && t !== 'light') {
      t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.classList.toggle('dark', t === 'dark');
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${dmSerif.variable} ${jetbrainsMono.variable}`}
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
