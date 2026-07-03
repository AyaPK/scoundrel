import React, { useState } from 'react';

interface AuthScreenProps {
  onSignUp: (email: string, password: string, username: string) => Promise<boolean>;
  onSignIn: (email: string, password: string) => Promise<boolean>;
  onSignInWithGoogle: () => Promise<void>;
  onGuest: () => void;
  error: string | null;
  loading: boolean;
  onClearError: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSignUp,
  onSignIn,
  onSignInWithGoogle,
  onGuest,
  error,
  loading,
  onClearError,
}) => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const displayError = error || localError;

  const validateUsername = (u: string) => /^[a-zA-Z0-9_]{3,20}$/.test(u);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    onClearError();

    if (tab === 'signup') {
      if (!validateUsername(username)) {
        setLocalError('Username must be 3-20 characters, letters/numbers/underscores only');
        return;
      }
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters');
        return;
      }
      const ok = await onSignUp(email, password, username);
      if (ok) setSignupSuccess(true);
    } else {
      await onSignIn(email, password);
    }
  };

  const switchTab = (t: 'signin' | 'signup') => {
    setTab(t);
    setLocalError(null);
    onClearError();
    setSignupSuccess(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-1 tracking-tight">Scoundrel</h1>
          <p className="text-gray-500 text-sm">A dungeon crawl card game</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
          {/* Tabs */}
          <div className="flex rounded-lg bg-gray-800 p-1 mb-6">
            <button
              onClick={() => switchTab('signin')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === 'signin' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchTab('signup')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === 'signup' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          {signupSuccess ? (
            <div className="text-center py-4">
              <div className="text-green-400 text-2xl mb-2">✓</div>
              <p className="text-white font-semibold mb-1">Check your email</p>
              <p className="text-gray-400 text-sm">We sent a confirmation link to <span className="text-white">{email}</span>.</p>
              <button onClick={() => switchTab('signin')} className="mt-4 text-sm text-gray-400 hover:text-white underline">
                Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. dungeon_slayer"
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-500"
                />
              </div>

              {displayError && (
                <p className="text-red-400 text-xs bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
                  {displayError}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-white text-gray-900 font-semibold text-sm rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Please wait...' : tab === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Google OAuth + Guest */}
          {!signupSuccess && (
            <>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-800" />
                <span className="text-xs text-gray-600">or</span>
                <div className="flex-1 h-px bg-gray-800" />
              </div>
              <button
                onClick={onSignInWithGoogle}
                disabled={loading}
                className="w-full py-2.5 bg-gray-800 border border-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}
        </div>

        {/* Guest CTA — outside the card, visually distinct */}
        <div className="mt-4 text-center">
          <p className="text-gray-600 text-xs mb-2">Just want to try it out?</p>
          <button
            onClick={onGuest}
            disabled={loading}
            className="w-full py-3 bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-all disabled:opacity-50"
          >
            Play as Guest
          </button>
          <p className="text-gray-700 text-xs mt-2">No account needed - progress won't be saved</p>
        </div>
      </div>
    </div>
  );
};
