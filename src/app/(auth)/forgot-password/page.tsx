'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase/client';
import { toast } from 'sonner';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import GlassPanel from '../../../components/ui/GlassPanel';
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
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 flex items-center justify-center p-4 relative overflow-hidden select-none font-sans animate-fade-in">
      {/* Decorative spotlights */}
      <div className="absolute top-0 left-0 right-0 h-[450px] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <GlassPanel className="w-full max-w-md border-slate-800/80 bg-slate-900/45 backdrop-blur-xl p-8 sm:p-10 shadow-2xl relative z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
        
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-serif text-2xl font-bold text-white tracking-tight mb-4">
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Sparkles size={14} className="text-indigo-400 fill-indigo-400/20" />
            </div>
            <span>ResumOrph</span>
          </Link>
          <h2 className="font-serif text-2xl text-white font-bold mb-1.5 tracking-tight">Reset Password</h2>
          <p className="text-xs text-slate-400 font-semibold">We'll send you an email with reset instructions.</p>
        </div>

        {sent ? (
          <div className="text-center animate-fade-in">
            <div className="mx-auto w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mb-4">
              <MailCheck className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="bg-indigo-955/40 border border-indigo-850/50 text-indigo-300 rounded-xl p-4 mb-6 text-xs leading-relaxed text-left font-medium">
              An email has been sent to <strong className="text-white font-bold">{email}</strong>. Check your inbox and click the reset link to choose a new password.
            </div>
            <Link href="/login" className="block">
              <Button className="w-full py-2.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200">
                Back to Login
              </Button>
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
              className="bg-slate-955/50 border-slate-800 text-white placeholder:text-slate-550 focus:border-indigo-500 focus:ring-indigo-500/10"
            />

            <Button 
              type="submit" 
              className="w-full py-3 text-sm font-semibold rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg shadow-indigo-500/15 border-0 tracking-wide cursor-pointer active:scale-98" 
              disabled={loading}
            >
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </Button>

            <Link href="/login" className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-450 hover:text-white transition-colors mt-2">
              <ArrowLeft size={13} />
              Back to Login
            </Link>
          </form>
        )}
      </GlassPanel>
    </div>
  );
}
