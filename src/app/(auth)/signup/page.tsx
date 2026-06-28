'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import { toast } from 'sonner';
import Input from '../../../components/ui/Input';
import { Sparkles } from 'lucide-react';
import useDocumentTitle from '../../../hooks/useDocumentTitle';

export default function Signup() {
  useDocumentTitle('Create Account');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('All fields are required.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      if (error) throw error;
      toast.success('Registration successful! Please check your email.');
      router.push('/verify-email');
    } catch (err) {
      toast.error(err.message || 'Signup failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err.message || 'Google Auth failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col lg:flex-row relative overflow-hidden select-none font-sans transition-colors duration-300">
      {/* Decorative spotlights */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[color-mix(in_srgb,var(--accent)_8%,transparent)] via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[color-mix(in_srgb,var(--accent)_4%,transparent)] rounded-full blur-[120px] pointer-events-none" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293704_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-40" />

      {/* Left panel: Premium Branding (SaaS style) */}
      <div className="relative hidden lg:flex lg:w-[42%] bg-[var(--bg-elevated)] border-r border-[var(--border-default)] p-12 flex-col justify-between shrink-0 overflow-hidden z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415504_1px,transparent_1px),linear-gradient(to_bottom,#33415504_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-30 pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] rounded-full blur-[100px]" />

        <Link href="/" className="flex items-center gap-2.5 font-serif text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-center">
            <Sparkles size={16} className="text-[var(--accent)] fill-[var(--accent)]/10" />
          </div>
          <span>ResumOrph</span>
        </Link>

        <div className="my-auto max-w-sm">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--accent-border)] px-2.5 py-1 rounded-[var(--radius-sm)] mb-6 inline-block">
            Professional AI Tailoring
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl leading-snug font-bold mb-5 text-[var(--text-primary)]">
            "Get more callbacks in under 60 seconds."
          </h1>
          <div className="h-1 w-12 bg-[var(--accent)] mb-6 rounded-full" />
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
            ResumOrph analyzes your resume against industry-specific keywords and automatically formats it to fit high-density ATS standards.
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--border-default)] pt-6">
          <p className="text-xs text-[var(--text-muted)] font-mono">ResumOrph Engine v1.2</p>
          <span className="text-xs text-[var(--text-muted)] font-mono">&copy; {new Date().getFullYear()}</span>
        </div>
      </div>

      {/* Right panel: Form Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-16 z-10">
        <div className="w-full max-w-md border border-[var(--border-default)] bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] p-8 sm:p-10 shadow-lg relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />
          
          <div className="mb-8">
            <h2 className="font-serif text-3xl text-[var(--text-primary)] font-bold mb-1.5 tracking-tight">Create Account</h2>
            <p className="text-xs text-[var(--text-secondary)] font-semibold leading-relaxed">Start optimizing your resumes for free.</p>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-5">
            <Input
              type="text"
              label="Full Name"
              placeholder="Aayan Khan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />

            <Input
              type="email"
              label="Email Address"
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            
            <Input
              type="password"
              label="Password (min. 8 characters)"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />

            <button 
              type="submit" 
              className="btn-primary w-full py-3 text-sm font-semibold rounded-lg tracking-wide cursor-pointer flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="relative my-8 select-none">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[var(--border-default)]"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--bg-elevated)] px-3.5 text-[var(--text-muted)] font-bold tracking-wider">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            className="btn-ghost w-full flex items-center justify-center gap-2.5 py-3 rounded-lg font-semibold text-sm cursor-pointer transition-colors"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign up with Google
          </button>

          <p className="mt-8 text-center text-sm text-[var(--text-secondary)] font-semibold">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
