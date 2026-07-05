import { useState, useEffect, useCallback, useRef } from 'react';
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
  // Ref so callbacks always see the latest user without stale closures
  const userRef = useRef<User | null>(null);
  userRef.current = state.user;

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

  const signIn = useCallback(async (emailOrUsername: string, password: string) => {
    setState(s => ({ ...s, error: null, loading: true }));

    let email = emailOrUsername.trim();

    // If no @ sign, treat as username — resolve to email first
    if (!email.includes('@')) {
      const { data, error: rpcError } = await supabase.rpc('get_email_for_username', { p_username: email });
      if (rpcError || !data) {
        setState(s => ({ ...s, error: 'No account found with that username', loading: false }));
        return false;
      }
      email = data as string;
    }

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

  const updateUsername = useCallback(async (newUsername: string): Promise<string | null> => {
    const user = userRef.current;
    if (!user) return 'Not signed in';
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(newUsername)) {
      return 'Username must be 3-20 characters, letters/numbers/underscores only';
    }
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', newUsername)
      .maybeSingle();
    if (existing) return 'Username already taken';

    const { error } = await supabase
      .from('profiles')
      .update({ username: newUsername })
      .eq('id', user.id);
    if (error) return error.message;

    setState(s => ({ ...s, username: newUsername }));
    return null;
  }, []);

  const resetPassword = useCallback(async (emailOrUsername: string): Promise<string | null> => {
    let email = emailOrUsername.trim();
    if (!email.includes('@')) {
      const { data, error: rpcError } = await supabase.rpc('get_email_for_username', { p_username: email });
      if (rpcError || !data) return 'No account found with that username';
      email = data as string;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`,
    });
    if (error) return error.message;
    return null;
  }, []);

  const updatePassword = useCallback(async (newPassword: string): Promise<string | null> => {
    if (newPassword.length < 6) return 'Password must be at least 6 characters';
    // Refresh session first to ensure JWT is valid before calling updateUser
    const { error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) return refreshError.message;
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return error.message;
    return null;
  }, []);

  const deleteAccount = useCallback(async (): Promise<string | null> => {
    const user = userRef.current;
    if (!user) return 'Not signed in';
    const uid = user.id;
    // Soft delete: wipe all user data then sign out
    await supabase.from('game_sessions').delete().eq('user_id', uid);
    await supabase.from('game_runs').delete().eq('user_id', uid);
    await supabase.from('profiles').delete().eq('id', uid);
    await supabase.auth.signOut();
    return null;
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
    resetPassword,
    updateUsername,
    updatePassword,
    deleteAccount,
  };
};
