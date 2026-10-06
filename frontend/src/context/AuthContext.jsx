import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { apiRegister, apiLogin } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function register(email, password, fullName) {
    // 1. Call backend to create and AUTO-APPROVE user immediately (email_confirm: true)
    let regData;
    try {
      regData = await apiRegister(email, password, fullName);
    } catch (apiErr) {
      console.warn('Backend register failed, trying direct signup', apiErr);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role: 'customer' } },
      });
      if (error) throw error;
      regData = data;
    }

    // 2. Set session in Supabase client if returned by backend, or sign in directly
    if (regData?.session?.access_token && regData?.session?.refresh_token) {
      await supabase.auth.setSession({
        access_token: regData.session.access_token,
        refresh_token: regData.session.refresh_token,
      });
    } else {
      await supabase.auth.signInWithPassword({ email, password });
    }

    // Refresh current user session
    const { data: sessionData } = await supabase.auth.getSession();
    setUser(sessionData?.session?.user ?? regData?.user ?? null);

    return regData;
  }

  async function login(email, password) {
    // 1. First try Supabase client sign-in
    const result = await supabase.auth.signInWithPassword({ email, password });

    // 2. If it fails (e.g. email not confirmed), call backend login which auto-approves & logs in
    if (result.error) {
      console.warn('Direct login failed, attempting backend auto-approved login:', result.error.message);
      try {
        const backendData = await apiLogin(email, password);
        if (backendData?.session) {
          await supabase.auth.setSession({
            access_token: backendData.session.access_token,
            refresh_token: backendData.session.refresh_token,
          });
          const { data: sessionData } = await supabase.auth.getSession();
          setUser(sessionData?.session?.user ?? backendData.user ?? null);
          return backendData;
        }
      } catch (backendErr) {
        throw new Error(backendErr.response?.data?.error || result.error.message);
      }

      throw result.error;
    }

    setUser(result.data.session?.user ?? result.data.user ?? null);
    return result.data;
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    setUser(null);
    if (error) throw error;
  }

  const isAdmin = user?.user_metadata?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
