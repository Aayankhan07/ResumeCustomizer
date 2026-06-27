'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Plus, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
      toast.success('Switched to Light Theme');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
      toast.success('Switched to Black Theme');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 h-14 bg-[color-mix(in_srgb,var(--bg-base)_90%,transparent)] backdrop-blur-md border-b border-[var(--border-default)] transition-all select-none">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="font-serif text-xl font-bold tracking-tight text-[var(--text-primary)] hover:opacity-90 transition-opacity">
          ResumOrph
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1.5 px-3 rounded-md hover:bg-[var(--bg-subtle)]">
                Dashboard
              </Link>
              <Link href="/transform"
                className="flex items-center gap-1.5 px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-base)] text-xs font-medium rounded-[var(--radius-sm)] hover:opacity-90 transition-all duration-150 active:scale-[0.98]">
                <Plus size={14} className="stroke-[2.5]" />
                Transform CV
              </Link>
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  className="w-8.5 h-8.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-default)] text-[var(--text-secondary)] text-sm font-semibold flex items-center justify-center cursor-pointer hover:bg-[var(--bg-muted)] transition-all focus:outline-none">
                  {user.user_metadata?.full_name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? '?'}
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-11 w-48 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] py-1.5 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-[var(--border-subtle)]">
                      <p className="text-xs text-[var(--text-secondary)] font-semibold truncate">{user.email}</p>
                    </div>
                    <Link href="/profile" className="block px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] font-medium" onClick={() => setProfileOpen(false)}>Profile Settings</Link>
                    <button onClick={handleSignOut} className="w-full text-left px-4 py-2.5 text-sm text-[var(--danger)] hover:bg-[var(--danger-subtle)] hover:text-[var(--danger-fg)] font-medium cursor-pointer">Sign Out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <a href="#how-it-works" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1.5 px-3 rounded-md hover:bg-[var(--bg-subtle)]">How it works</a>
              <Link href="/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1.5 px-3 rounded-md hover:bg-[var(--bg-subtle)]">Sign in</Link>
              <Link href="/signup"
                className="px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-base)] text-xs font-medium rounded-[var(--radius-sm)] hover:opacity-90 transition-all duration-150 active:scale-[0.98]">
                Get Started
              </Link>
            </>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] rounded-lg cursor-pointer transition-colors focus:outline-none flex items-center justify-center"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
          </button>
        </div>

        {/* Mobile menu triggers */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] rounded-lg cursor-pointer transition-colors focus:outline-none flex items-center justify-center"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
          </button>
          <button className="text-[var(--text-primary)] p-1 hover:bg-[var(--bg-subtle)] rounded-lg cursor-pointer transition-colors" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-[var(--bg-base)] border-b border-[var(--border-default)] px-4 py-4 flex flex-col gap-3 shadow-[var(--shadow-lg)] animate-fade-in z-50">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-[var(--text-primary)] py-2 px-3 hover:bg-[var(--bg-subtle)] rounded-md" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link href="/transform"  className="text-sm font-medium text-[var(--text-primary)] py-2 px-3 hover:bg-[var(--bg-subtle)] rounded-md" onClick={() => setMobileOpen(false)}>New Transform</Link>
              <Link href="/profile"    className="text-sm font-medium text-[var(--text-primary)] py-2 px-3 hover:bg-[var(--bg-subtle)] rounded-md" onClick={() => setMobileOpen(false)}>Profile Settings</Link>
              <button onClick={handleSignOut} className="text-sm font-medium text-[var(--danger)] text-left py-2 px-3 hover:bg-[var(--danger-subtle)] hover:text-[var(--danger-fg)] rounded-md cursor-pointer">Sign Out</button>
            </>
          ) : (
            <>
              <a href="#how-it-works" className="text-sm font-medium text-[var(--text-primary)] py-2 px-3 hover:bg-[var(--bg-subtle)] rounded-md" onClick={() => setMobileOpen(false)}>How it works</a>
              <Link href="/login"  className="text-sm font-medium text-[var(--text-primary)] py-2 px-3 hover:bg-[var(--bg-subtle)] rounded-md" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link href="/signup" className="text-sm font-medium text-[var(--bg-base)] py-2.5 px-4 bg-[var(--text-primary)] text-center rounded-md font-semibold" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

