import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Welcome back!');
      navigate(redirectTo);
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}${redirectTo}` },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err.message || 'Google Auth failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col lg:flex-row animate-fade-in select-none">
      {/* Left panel: Decorative */}
      <div className="relative hidden lg:flex lg:w-2/5 bg-slate-950 p-12 text-white flex-col justify-between shrink-0 overflow-hidden border-r border-slate-900">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-25 z-0" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-slate-800/20 rounded-full blur-[100px] z-0" />
        
        <Link to="/" className="font-serif text-2xl font-bold text-white hover:text-slate-100 transition-colors z-10">
          ResumOrph
        </Link>
        <div className="my-auto max-w-sm z-10">
          <p className="font-serif text-3xl leading-snug mb-5 text-white/90">
            "Tailored resumes get 3&times; more callbacks."
          </p>
          <div className="h-0.5 w-12 bg-slate-800 mb-5 rounded-full" />
          <p className="text-sm text-slate-400 font-semibold leading-relaxed">
            Aayan Khan transformed his resume for a Senior Role and got interviewed within 4 days.
          </p>
        </div>
        <p className="text-xs text-slate-500 z-10 font-mono">ResumOrph AI &copy; {new Date().getFullYear()}</p>
      </div>

      {/* Right panel: Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-16">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-sm p-6 sm:p-8 md:p-10 hover:shadow-card-hover transition-all duration-300">
          <div className="mb-8">
            <h2 className="font-serif text-3xl text-slate-900 font-bold mb-2">Sign In</h2>
            <p className="text-sm text-slate-500 font-semibold">Enter your details to access your dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <Input
              type="email"
              label="Email Address"
              placeholder="aayan@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            
            <div>
              <Input
                type="password"
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <div className="flex justify-end mt-2">
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full py-3 text-sm font-semibold rounded-md shadow-sm" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-8 select-none">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3.5 text-slate-400 font-bold tracking-wider">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-md border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 cursor-pointer transition-colors"
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
            Sign in with Google
          </Button>

          <p className="mt-8 text-center text-sm text-slate-500 font-semibold">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-slate-900 hover:text-slate-800 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
