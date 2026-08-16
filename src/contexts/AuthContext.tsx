'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '../lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Created lazily rather than at module scope: module-level construction runs
  // during static prerender, where public env vars are not available, and
  // would fail the build before any component renders.
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    // Without the catch, a Supabase outage left loading stuck at true and the
    // entire tree unrendered (see the `!loading && children` guard below).
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
      })
      .catch((err) => {
        console.error('Failed to restore session:', err);
      })
      .finally(() => {
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out failed:', err);
      // Clear locally regardless so the UI does not appear signed in.
      setSession(null);
      setUser(null);
    }
  };

  return (
    // Children render unconditionally.
    //
    // This provider wraps the entire app, and `loading` starts true and is only
    // cleared in an effect — which never runs on the server. Gating children on
    // it meant *every* route server-rendered as an empty shell: the homepage
    // shipped no <h1>, no body copy, nothing for a crawler to index, and the
    // content only appeared after the client-side session check resolved.
    //
    // Route protection lives in middleware, not here, so nothing is exposed by
    // rendering early. Consumers that want to avoid a flash of signed-out UI
    // read `loading` from the context themselves.
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
