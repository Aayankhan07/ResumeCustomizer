'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import { toast } from 'sonner';
import Input from '../../../components/ui/Input';
import { Sparkles } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Password updated successfully! Please sign in with your new password.');
      router.push('/login');
    } catch (err) {
      toast.error(err.message || 'Error resetting password. Link may have expired.');
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
          <h2 className="font-serif text-2xl text-[var(--text-primary)] font-bold mb-1.5 tracking-tight">Set New Password</h2>
          <p className="text-xs text-[var(--text-secondary)] font-semibold">Choose a strong, secure password.</p>
        </div>

        <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5">
          <Input
            type="password"
            label="New Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />

          <Input
            type="password"
            label="Confirm New Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
          />

          <button 
            type="submit" 
            className="btn-primary w-full py-3 text-sm font-semibold rounded-lg tracking-wide cursor-pointer flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
