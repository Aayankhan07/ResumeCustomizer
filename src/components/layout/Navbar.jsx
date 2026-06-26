import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Plus, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
      toast.success('Switched to Light Theme');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
      toast.success('Switched to Black Theme');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 h-16 bg-white border-b border-slate-200 transition-all select-none">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="font-serif text-xl font-bold tracking-tight text-slate-900 hover:text-slate-800 transition-colors">
          ResumOrph
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-graphite hover:text-slate-900 transition-colors py-1.5 px-3 rounded-md hover:bg-slate-50">
                Dashboard
              </Link>
              <Link to="/transform"
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 hover:shadow-sm transition-all duration-150">
                <Plus size={14} className="stroke-[2.5]" />
                Transform CV
              </Link>
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-all focus:outline-none">
                  {user.user_metadata?.full_name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? '?'}
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-11 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-600 font-semibold truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" className="block px-4 py-2.5 text-sm text-slate-900 hover:bg-slate-50 font-medium" onClick={() => setProfileOpen(false)}>Profile Settings</Link>
                    <button onClick={handleSignOut} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium cursor-pointer">Sign Out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <a href="#how-it-works" className="text-sm font-medium text-graphite hover:text-slate-900 transition-colors py-1.5 px-3 rounded-md hover:bg-slate-50">How it works</a>
              <Link to="/login" className="text-sm font-medium text-graphite hover:text-slate-900 transition-colors py-1.5 px-3 rounded-md hover:bg-slate-50">Sign in</Link>
              <Link to="/signup"
                className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 hover:shadow-sm transition-all duration-150">
                Get Started
              </Link>
            </>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors focus:outline-none flex items-center justify-center"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
          </button>
        </div>

        {/* Mobile menu triggers */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors focus:outline-none flex items-center justify-center"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
          </button>
          <button className="text-slate-900 p-1 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-200 px-4 py-4 flex flex-col gap-3 shadow-card-hover animate-fade-in z-50">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-slate-900 py-2 px-3 hover:bg-slate-50 rounded-md" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link to="/transform"  className="text-sm font-medium text-slate-900 py-2 px-3 hover:bg-slate-50 rounded-md" onClick={() => setMobileOpen(false)}>New Transform</Link>
              <Link to="/profile"    className="text-sm font-medium text-slate-900 py-2 px-3 hover:bg-slate-50 rounded-md" onClick={() => setMobileOpen(false)}>Profile Settings</Link>
              <button onClick={handleSignOut} className="text-sm font-medium text-red-650 text-left py-2 px-3 hover:bg-red-50/50 rounded-md cursor-pointer">Sign Out</button>
            </>
          ) : (
            <>
              <a href="#how-it-works" className="text-sm font-medium text-slate-900 py-2 px-3 hover:bg-slate-50 rounded-md" onClick={() => setMobileOpen(false)}>How it works</a>
              <Link to="/login"  className="text-sm font-medium text-slate-900 py-2 px-3 hover:bg-slate-50 rounded-md" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link to="/signup" className="text-sm font-medium text-white py-2.5 px-4 bg-slate-900 text-center rounded-md" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

