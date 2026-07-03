import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  username: string | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    username: null,
    loading: true,
    error: null,
  });

  const fetchUsername = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();
    return data?.username ?? null;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const username = session?.user ? await fetchUsername(session.user.id) : null;
      setState({ user: session?.user ?? null, session, username, loading: false, error: null });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const username = session?.user ? await fetchUsername(session.user.id) : null;
      setState({ user: session?.user ?? null, session, username, loading: false, error: null });
    });

    return () => subscription.unsubscribe();
  }, [fetchUsername]);

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    setState(s => ({ ...s, error: null, loading: true }));

    // Check username availability
    const { data: existing } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (existing) {
      setState(s => ({ ...s, error: 'Username already taken', loading: false }));
      return false;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

    if (error) {
      setState(s => ({ ...s, error: error.message, loading: false }));
      return false;
    }
    return true;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, error: null, loading: true }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setState(s => ({ ...s, error: error.message, loading: false }));
      return false;
    }
    return true;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setState(s => ({ ...s, error: null }));
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) setState(s => ({ ...s, error: error.message }));
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const clearError = useCallback(() => {
    setState(s => ({ ...s, error: null }));
  }, []);

  return {
    user: state.user,
    username: state.username,
    loading: state.loading,
    error: state.error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    clearError,
  };
};
