'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '../../../lib/supabase/client';

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmail() {
  // Read from the URL after mount rather than via useSearchParams, which
  // would need a Suspense boundary to keep this page statically renderable.
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('email') ?? '';
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only URL read after hydration
    if (fromUrl) setEmail(fromUrl.trim());
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || resending || cooldown > 0) return;
    setResending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/transform`,
        },
      });
      if (error) throw error;
      toast.success('Verification email sent again.');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      toast.error(message || 'Could not resend the email. Please try again shortly.');
      // Supabase rate-limits resends; back off either way.
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex items-center justify-center p-4 relative overflow-hidden select-none font-sans animate-fade-in transition-colors duration-300">
      {/* Decorative spotlights */}
      <div className="absolute top-0 left-0 right-0 h-[450px] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[color-mix(in_srgb,var(--accent)_8%,transparent)] via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[color-mix(in_srgb,var(--accent)_4%,transparent)] rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293704_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-40" />

      <div className="w-full max-w-md border border-[var(--border-default)] bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] p-8 sm:p-10 shadow-lg relative z-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />

        <Link
          href="/"
          className="inline-flex items-center gap-2 font-serif text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-6"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-center">
            <Sparkles size={16} className="text-[var(--accent)] fill-[var(--accent)]/10" />
          </div>
          <span>ResumOrph</span>
        </Link>

        <div className="w-16 h-16 bg-[var(--bg-subtle)] border border-[var(--border-default)] text-[var(--accent)] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 19v-8.93a2 2 0 01.89-1.664l8-4.8a2 2 0 012.22 0l8 4.8A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5"
            />
          </svg>
        </div>

        <h2 className="font-serif text-2xl text-[var(--text-primary)] font-bold mb-2">
          Check Your Inbox
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed select-text">
          {email ? (
            <>
              We&apos;ve sent a verification link to{' '}
              <strong className="font-semibold text-[var(--text-primary)] break-all">
                {email}
              </strong>
              .
            </>
          ) : (
            <>We&apos;ve sent a verification link to your email address.</>
          )}{' '}
          Please click the link to confirm your account.
        </p>

        <Link href="/login" className="btn-primary w-full py-2.5 flex items-center justify-center">
          Proceed to Login
        </Link>

        {email && (
          <div className="mt-4 text-xs text-[var(--text-secondary)]">
            Didn&apos;t get it? Check your spam folder, or{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="font-bold text-[var(--text-primary)] hover:text-[var(--accent)] underline-offset-2 hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline transition-colors"
            >
              {resending
                ? 'sending…'
                : cooldown > 0
                  ? `resend email (${cooldown}s)`
                  : 'resend email'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
