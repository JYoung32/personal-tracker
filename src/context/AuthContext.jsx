import { createContext, useContext, useEffect, useState } from 'react';

/**
 * AuthContext (MOCK)
 * -------------------
 * This is throwaway scaffolding, clearly marked so it's easy to find and
 * rip out later. It does NOT provide real security — anyone can open dev
 * tools and flip the "authed" flag in localStorage. It exists purely so
 * the app has a login screen and protected routes while the rest of the
 * app is being built.
 *
 * SWAP-OUT PLAN: when ready, replace the body of `login`/`logout`/the
 * `useEffect` below with calls to Supabase Auth (supabase.auth.signInWithPassword,
 * supabase.auth.signOut, supabase.auth.getSession). The `user` / `isAuthenticated`
 * shape consumed by the rest of the app can stay the same, so components
 * like ProtectedRoute and NavBar won't need to change.
 */

const AUTH_STORAGE_KEY = 'personal-tracker:mock-auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // On load, check if a mock session already exists.
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setInitializing(false);
  }, []);

  // MOCK LOGIN: accepts any non-empty username/password.
  // Replace with Supabase Auth call when ready.
  async function login(username, password) {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }
    const mockUser = { username };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
    return mockUser;
  }

  function logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  }

  function updateUsername(username) {
    setUser((prev) => {
      const next = { ...prev, username };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  const value = {
    user,
    isAuthenticated: Boolean(user),
    initializing,
    login,
    logout,
    updateUsername,
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
