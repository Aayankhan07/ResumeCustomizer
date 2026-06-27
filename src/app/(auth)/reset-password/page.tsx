'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import { toast } from 'sonner';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

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
    <div className="min-h-screen bg-mist dark:bg-[#030712] flex items-center justify-center p-4 animate-fade-in transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-boundary dark:border-slate-800 rounded-2xl shadow-card p-8">
        <div className="mb-6 text-center">
          <Link href="/" className="font-serif text-2xl text-ink dark:text-white inline-block mb-4">ResumOrph</Link>
          <h2 className="font-serif text-2xl text-ink dark:text-white font-bold mb-1">Set New Password</h2>
          <p className="text-sm text-graphite dark:text-slate-400">Choose a strong, secure password.</p>
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
            className="dark:bg-slate-950 dark:border-slate-800"
          />

          <Input
            type="password"
            label="Confirm New Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
            className="dark:bg-slate-955 dark:border-slate-800"
          />

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Updating Password...' : 'Update Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
