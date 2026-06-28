'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase/client';
import { toast } from 'sonner';
import Input from '../../../components/ui/Input';
import { Sparkles, ArrowLeft, MailCheck } from 'lucide-react';
import useDocumentTitle from '../../../hooks/useDocumentTitle';

export default function ForgotPassword() {
  useDocumentTitle('Reset Password');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success('Password reset link sent to your email.');
    } catch (err) {
      toast.error(err.message || 'Error sending link. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex items-center justify-center p-4 relative overflow-hidden select-none font-sans animate-fade-in transition-colors duration-300">
      {/* Decorative spotlights */}
      <div className="absolute top-0 left-0 right-0 h-[450px] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[color-mix(in_srgb,var(--accent)_8%,transparent)] via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[color-mix(in_srgb,var(--accent)_4%,transparent)] rounded-full blur-[100px] pointer-events-none" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293704_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-40" />

      <div className="w-full max-w-md border border-[var(--border-default)] bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] p-8 sm:p-10 shadow-lg relative z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />
        
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-serif text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-4">
            <div className="w-7 h-7 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-center">
              <Sparkles size={14} className="text-[var(--accent)] fill-[var(--accent)]/10" />
            </div>
            <span>ResumOrph</span>
          </Link>
          <h2 className="font-serif text-2xl text-[var(--text-primary)] font-bold mb-1.5 tracking-tight">Reset Password</h2>
          <p className="text-xs text-[var(--text-secondary)] font-semibold">We'll send you an email with reset instructions.</p>
        </div>

        {sent ? (
          <div className="text-center animate-fade-in">
            <div className="mx-auto w-12 h-12 bg-[var(--success-subtle)] border border-[var(--success)]/20 rounded-full flex items-center justify-center mb-4">
              <MailCheck className="w-6 h-6 text-[var(--success)]" />
            </div>
            <div className="bg-[var(--bg-subtle)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-xl p-4 mb-6 text-xs leading-relaxed text-left font-medium">
              An email has been sent to <strong className="text-[var(--text-primary)] font-bold">{email}</strong>. Check your inbox and click the reset link to choose a new password.
            </div>
            <Link href="/login" className="block">
              <button type="button" className="btn-ghost w-full py-2.5 text-xs">
                Back to Login
              </button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-5">
            <Input
              type="email"
              label="Email Address"
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />

            <button 
              type="submit" 
              className="btn-primary w-full py-3 text-sm font-semibold rounded-lg tracking-wide cursor-pointer flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>

            <Link href="/login" className="flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mt-2">
              <ArrowLeft size={13} />
              Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
