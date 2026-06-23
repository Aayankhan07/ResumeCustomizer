import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

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
    <div className="min-h-screen bg-mist flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white border border-boundary rounded-2xl shadow-card p-8">
        <div className="mb-6 text-center">
          <Link to="/" className="font-serif text-2xl text-ink inline-block mb-4">ResumOrph</Link>
          <h2 className="font-serif text-2xl text-ink font-bold mb-1">Reset Password</h2>
          <p className="text-sm text-graphite">We'll send you an email with reset instructions.</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="bg-blue-50 border border-blue-200 text-cobalt rounded-xl p-4 mb-6 text-sm">
              An email has been sent to <strong>{email}</strong>. Check your inbox and click the reset link to choose a new password.
            </div>
            <Link to="/login">
              <Button variant="ghost" className="w-full">Back to Login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-5">
            <Input
              type="email"
              label="Email Address"
              placeholder="aayan@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </Button>

            <Link to="/login" className="text-center text-sm font-semibold text-graphite hover:text-ink transition-colors">
              Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
