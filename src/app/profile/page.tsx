'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createClient } from '../../lib/supabase/client';
import { toast } from 'sonner';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

export default function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingName, setUpdatingName] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const supabase = createClient();

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setUpdatingName(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name.trim() },
      });
      if (error) throw error;
      toast.success('Profile name updated successfully.');
    } catch (err) {
      toast.error(err.message || 'Error updating name.');
    } finally {
      setUpdatingName(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error('Please enter both password fields.');
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

    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Password updated successfully.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Error updating password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-mist dark:bg-[#030712] text-slate-900 dark:text-slate-200 flex flex-col font-sans transition-colors duration-300">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 stagger-children">
        <h1 className="font-serif text-3xl text-ink dark:text-white font-bold mb-8">My Account</h1>

        <div className="flex flex-col gap-8">
          {/* Profile Card */}
          <Card className="bg-white dark:bg-slate-900 border border-boundary dark:border-slate-800">
            <h3 className="font-serif text-lg text-ink dark:text-white font-semibold mb-4">Profile Details</h3>
            <form onSubmit={handleUpdateName} className="flex flex-col md:flex-row md:items-end gap-4 max-w-2xl">
              <div className="flex-1">
                <Input
                  type="text"
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={updatingName}
                  required
                />
              </div>
              <div className="flex-1">
                <Input
                  type="email"
                  label="Email (Not Editable)"
                  value={user?.email || ''}
                  disabled
                />
              </div>
              <Button type="submit" variant="primary" disabled={updatingName} className="w-full md:w-auto">
                {updatingName ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Card>

          {/* Password Card */}
          <Card className="bg-white dark:bg-slate-900 border border-boundary dark:border-slate-800">
            <h3 className="font-serif text-lg text-ink dark:text-white font-semibold mb-4">Change Password</h3>
            <form onSubmit={handleUpdatePassword} className="flex flex-col md:flex-row md:items-end gap-4 max-w-2xl">
              <div className="flex-1">
                <Input
                  type="password"
                  label="New Password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={updatingPassword}
                  required
                />
              </div>
              <div className="flex-1">
                <Input
                  type="password"
                  label="Confirm New Password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={updatingPassword}
                  required
                />
              </div>
              <Button type="submit" variant="primary" disabled={updatingPassword} className="w-full md:w-auto">
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-900/30 bg-red-50/20 dark:bg-red-950/10">
            <h3 className="font-serif text-lg text-red-650 font-semibold mb-2">Danger Zone</h3>
            <p className="text-sm text-graphite dark:text-slate-400 mb-4 leading-relaxed font-semibold">
              Once you delete your account, there is no going back. All your saved transformations and metadata will be permanently removed.
            </p>
            <Button
              variant="danger"
              onClick={() => toast.error('Account deletion is currently disabled. Contact support to request account removal.')}
            >
              Request Account Deletion
            </Button>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
