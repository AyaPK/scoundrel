import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';

interface AccountScreenProps {
  user: User;
  username: string | null;
  coins: number | null;
  onBack: () => void;
  onUpdateUsername: (newUsername: string) => Promise<string | null>;
  onUpdatePassword: (newPassword: string) => Promise<string | null>;
  onDeleteAccount: () => Promise<string | null>;
}

const isOAuthUser = (user: User) =>
  user.app_metadata?.provider !== 'email' && user.app_metadata?.provider !== undefined;

const Section: React.FC<{ title: string; children: React.ReactNode; danger?: boolean }> = ({ title, children, danger }) => (
  <div className={`bg-gray-900 border rounded-2xl p-5 ${danger ? 'border-red-900/50' : 'border-gray-800'}`}>
    <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${danger ? 'text-red-400' : 'text-gray-400'}`}>{title}</h2>
    {children}
  </div>
);

export const AccountScreen: React.FC<AccountScreenProps> = ({
  user,
  username,
  coins,
  onBack,
  onUpdateUsername,
  onUpdatePassword,
  onDeleteAccount,
}) => {
  const [newUsername, setNewUsername] = useState(username ?? '');
  const [usernameMsg, setUsernameMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [usernameLoading, setUsernameLoading] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const oauthUser = isOAuthUser(user);

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameMsg(null);
    setUsernameLoading(true);
    const err = await onUpdateUsername(newUsername.trim());
    setUsernameLoading(false);
    if (err) {
      setUsernameMsg({ text: err, ok: false });
    } else {
      setUsernameMsg({ text: 'Username updated!', ok: true });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'Passwords do not match', ok: false });
      return;
    }
    setPasswordLoading(true);
    const err = await onUpdatePassword(newPassword);
    setPasswordLoading(false);
    if (err) {
      setPasswordMsg({ text: err, ok: false });
    } else {
      setPasswordMsg({ text: 'Password updated!', ok: true });
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteMsg(null);
    setDeleteLoading(true);
    const err = await onDeleteAccount();
    setDeleteLoading(false);
    if (err) setDeleteMsg(err);
  };

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6 pt-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Account</h1>
          <p className="text-gray-500 text-sm">{username ?? 'Player'}</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          ← Back
        </button>
      </div>

      <div className="space-y-4">

        {/* Profile info */}
        <Section title="Profile">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Username</span>
              <span className="text-white">{username ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Sign-in method</span>
              <span className="text-white capitalize">{user.app_metadata?.provider ?? 'email'}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-gray-800 mt-2">
              <span className="text-gray-400">Coins</span>
              <span className="text-yellow-400 font-bold">
                🪙 {coins === null ? '—' : coins.toLocaleString()}
              </span>
            </div>
          </div>
        </Section>

        {/* Change Username */}
        <Section title="Change Username">
          <form onSubmit={handleUpdateUsername} className="space-y-3">
            <input
              type="text"
              value={newUsername}
              onChange={e => { setNewUsername(e.target.value); setUsernameMsg(null); }}
              placeholder="new_username"
              autoComplete="username"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-500"
            />
            {usernameMsg && (
              <p className={`text-xs px-3 py-2 rounded-lg border ${usernameMsg.ok ? 'text-green-400 bg-green-900/20 border-green-800/40' : 'text-red-400 bg-red-900/20 border-red-800/40'}`}>
                {usernameMsg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={usernameLoading || newUsername.trim() === username}
              className="px-4 py-2 bg-white text-gray-900 font-semibold text-sm rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {usernameLoading ? 'Saving…' : 'Save Username'}
            </button>
          </form>
        </Section>

        {/* Change Password — only for email users */}
        {!oauthUser && (
          <Section title="Change Password">
            <form onSubmit={handleUpdatePassword} className="space-y-3" autoComplete="new-password">
              {/* Hidden username anchors the credential so managers don't fire on unrelated interactions */}
              <input type="text" autoComplete="username" value={username ?? ''} readOnly style={{ display: 'none' }} />
              <input
                type="password"
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setPasswordMsg(null); }}
                placeholder="New password"
                autoComplete="new-password"
                data-lpignore="true"
                data-1p-ignore
                data-bwignore
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-500"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setPasswordMsg(null); }}
                placeholder="Confirm new password"
                autoComplete="new-password"
                data-lpignore="true"
                data-1p-ignore
                data-bwignore
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-500"
              />
              {passwordMsg && (
                <p className={`text-xs px-3 py-2 rounded-lg border ${passwordMsg.ok ? 'text-green-400 bg-green-900/20 border-green-800/40' : 'text-red-400 bg-red-900/20 border-red-800/40'}`}>
                  {passwordMsg.text}
                </p>
              )}
              <button
                type="submit"
                disabled={passwordLoading || !newPassword}
                className="px-4 py-2 bg-white text-gray-900 font-semibold text-sm rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordLoading ? 'Saving…' : 'Update Password'}
              </button>
            </form>
          </Section>
        )}

        {/* Danger Zone */}
        <Section title="Danger Zone" danger>
          <p className="text-gray-400 text-sm mb-4">
            This will permanently delete all your game data and sign you out. Your login credentials will remain but all stats, history, and saved sessions will be wiped.
          </p>
          <p className="text-xs text-gray-500 mb-2">
            Type <span className="text-red-400 font-mono">delete my account</span> to confirm
          </p>
          <input
            type="text"
            value={deleteConfirm}
            onChange={e => { setDeleteConfirm(e.target.value); setDeleteMsg(null); }}
            placeholder="delete my account"
            autoComplete="off"
            className="w-full bg-gray-800 border border-red-900/50 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-700 mb-3"
          />
          {deleteMsg && (
            <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2 mb-3">
              {deleteMsg}
            </p>
          )}
          <button
            onClick={handleDeleteAccount}
            disabled={deleteLoading || deleteConfirm !== 'delete my account'}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {deleteLoading ? 'Deleting…' : 'Delete All My Data'}
          </button>
        </Section>

      </div>
    </div>
  );
};
