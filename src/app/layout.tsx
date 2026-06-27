import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { AuthProvider } from '../contexts/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: { template: '%s | ResumOrph', default: 'ResumOrph — AI Resume Tailoring' },
  description: 'ATS-optimized resumes tailored to any job description in seconds.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <div className="min-h-screen bg-mist dark:bg-[#030712] transition-colors duration-300">
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
      </body>
    </html>
  );
}
