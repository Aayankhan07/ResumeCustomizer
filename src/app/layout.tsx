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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${dmSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body suppressHydrationWarning>
        <AuthProvider>
          <div className="min-h-screen bg-[var(--bg-subtle)] dark:bg-[#030712] transition-colors duration-300">
            {children}
          </div>
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#0F0F0F',
                color: '#FFFFFF',
                borderRadius: '10px',
                fontFamily: 'Inter, sans-serif',
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
