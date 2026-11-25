'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createClient } from '../../lib/supabase/client';
import { toast } from 'sonner';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { DELETE_CONFIRMATION } from '../../lib/account';

export default function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  // `user` is usually still null on first render, so the initialiser above
  // left the field blank. Sync it once the user arrives, unless the user has
  // already started typing.
  const nameTouched = useRef(false);
  const fullName = user?.user_metadata?.full_name;
  useEffect(() => {
    if (fullName && !nameTouched.current) setName(fullName);
  }, [fullName]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingName, setUpdatingName] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const supabase = createClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteConfirm !== DELETE_CONFIRMATION) return;

    setDeleting(true);
    try {
      const res = await fetch('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: deleteConfirm }),
      });
      if (!res.ok) throw new Error(`DELETE_FAILED_${res.status}`);
      // The server cleared the session cookies; clear the client session too,
      // then leave with a full navigation so no stale state survives.
      await supabase.auth.signOut().catch(() => undefined);
      window.location.assign('/?account=deleted');
    } catch {
      toast.error("We couldn't delete your account. Please try again.");
      setDeleting(false);
    }
  };

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
    <div className="min-h-screen bg-[var(--bg-subtle)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-300">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 stagger-children">
        <h1 className="font-serif text-3xl text-[var(--text-primary)] dark:text-white font-bold mb-8">
          My Account
        </h1>

        <div className="flex flex-col gap-8">
          {/* Profile Card */}
          <Card className="bg-white dark:bg-slate-900 border border-[var(--border-default)] dark:border-slate-800">
            <h3 className="font-serif text-lg text-[var(--text-primary)] dark:text-white font-semibold mb-4">
              Profile Details
            </h3>
            <form
              onSubmit={handleUpdateName}
              className="flex flex-col md:flex-row md:items-end gap-4 max-w-2xl"
            >
              <div className="flex-1">
                <Input
                  type="text"
                  label="Full Name"
                  value={name}
                  onChange={(e) => {
                    nameTouched.current = true;
                    setName(e.target.value);
                  }}
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
              <Button
                type="submit"
                variant="primary"
                disabled={updatingName}
                className="w-full md:w-auto"
              >
                {updatingName ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Card>

          {/* Password Card */}
          <Card className="bg-white dark:bg-slate-900 border border-[var(--border-default)] dark:border-slate-800">
            <h3 className="font-serif text-lg text-[var(--text-primary)] dark:text-white font-semibold mb-4">
              Change Password
            </h3>
            <form
              onSubmit={handleUpdatePassword}
              className="flex flex-col md:flex-row md:items-end gap-4 max-w-2xl"
            >
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
              <Button
                type="submit"
                variant="primary"
                disabled={updatingPassword}
                className="w-full md:w-auto"
              >
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-900/30 bg-red-50/20 dark:bg-red-950/10">
            <h3 className="font-serif text-lg text-red-600 font-semibold mb-2">Danger Zone</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
              Deleting your account permanently removes your profile, every saved resume (including
              the resumes and job descriptions you submitted) and your application tracking. This
              cannot be undone.
            </p>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              Delete account
            </Button>
          </Card>
        </div>
      </main>

      <Modal
        isOpen={deleteOpen}
        onClose={() => {
          if (deleting) return;
          setDeleteOpen(false);
          setDeleteConfirm('');
        }}
        title="Delete your account?"
      >
        <form onSubmit={handleDeleteAccount} className="flex flex-col gap-4">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            This permanently deletes your account and all of its data right away. To confirm, type{' '}
            <strong className="font-mono text-[var(--text-primary)]">{DELETE_CONFIRMATION}</strong>{' '}
            below.
          </p>
          <Input
            label="Confirmation"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            autoComplete="off"
            disabled={deleting}
          />
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={deleting}
              onClick={() => {
                setDeleteOpen(false);
                setDeleteConfirm('');
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={deleting || deleteConfirm !== DELETE_CONFIRMATION}
            >
              {deleting ? 'Deleting…' : 'Delete account permanently'}
            </Button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
}
