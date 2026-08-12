import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase/client';

/**
 * AuthContext
 * ------------
 * Real Supabase Auth (email/password). On mount, restores whatever session
 * Supabase already has persisted (its client keeps its own localStorage
 * key), then stays in sync via onAuthStateChange for sign-in/out and token
 * refresh. `user` is Supabase's user object (id, email, ...) or null.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setInitializing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  // Returns { needsEmailConfirmation }: Supabase projects default to
  // requiring email confirmation, in which case signUp doesn't return a
  // session yet — the caller should tell the user to check their inbox
  // instead of navigating them straight in.
  async function signup(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return { needsEmailConfirmation: !data.session };
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  // Emails a reset link pointing at /reset-password. Supabase always
  // resolves this without error, whether or not the email has an account,
  // so it can't be used to probe which emails are registered.
  async function requestPasswordReset(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }

  // Only works while the recovery session from the emailed link is active
  // (ResetPasswordPage) — otherwise Supabase rejects it.
  async function updatePassword(password) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }

  const value = {
    user,
    isAuthenticated: Boolean(user),
    initializing,
    login,
    signup,
    logout,
    requestPasswordReset,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
