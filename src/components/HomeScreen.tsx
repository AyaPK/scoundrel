import React from 'react';

interface HomeScreenProps {
  username: string | null;
  isGuest: boolean;
  hasSavedSession: boolean;
  onNewGame: () => void;
  onContinue: () => void;
  onHowToPlay: () => void;
  onViewStats: () => void;
  onViewAccount: () => void;
  onSignOut: () => void;
  onSignIn: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  username,
  isGuest,
  hasSavedSession,
  onNewGame,
  onContinue,
  onHowToPlay,
  onViewStats,
  onViewAccount,
  onSignOut,
  onSignIn,
}) => {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at top, #1a0a2e 0%, #0d0d1a 100%)' }}
    >
      <div className="w-full max-w-sm">

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-white tracking-tight mb-2">Scoundrel</h1>
          <p className="text-gray-500 text-sm">A dungeon crawl card game</p>
          {username && (
            <p className="text-gray-400 text-sm mt-3">
              Welcome back, <span className="text-white font-medium">{username}</span>
            </p>
          )}
        </div>

        {/* Primary actions */}
        <div className="space-y-3 mb-6">
          {hasSavedSession && !isGuest && (
            <button
              onClick={onContinue}
              className="w-full py-3.5 bg-white text-gray-900 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
            >
              ⚔️ Continue Run
            </button>
          )}
          <button
            onClick={onNewGame}
            className={`w-full py-3.5 font-semibold text-sm rounded-xl transition-colors ${
              hasSavedSession && !isGuest
                ? 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                : 'bg-white text-gray-900 font-bold hover:bg-gray-100 shadow-lg'
            }`}
          >
            {hasSavedSession && !isGuest ? 'New Game' : '⚔️ New Game'}
          </button>
          <button
            onClick={onHowToPlay}
            className="w-full py-3.5 bg-gray-900 border border-gray-700 text-gray-300 font-medium text-sm rounded-xl hover:bg-gray-800 hover:text-white transition-colors"
          >
            📖 How to Play
          </button>
        </div>

        {/* Secondary actions — logged-in users */}
        {!isGuest && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={onViewStats}
              className="flex-1 py-2 text-xs font-medium text-gray-400 hover:text-white bg-gray-900/60 border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors"
            >
              📊 Stats
            </button>
            <button
              onClick={onViewAccount}
              className="flex-1 py-2 text-xs font-medium text-gray-400 hover:text-white bg-gray-900/60 border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors"
            >
              ⚙️ Account
            </button>
            <button
              onClick={onSignOut}
              className="flex-1 py-2 text-xs font-medium text-gray-400 hover:text-white bg-gray-900/60 border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center space-y-2">
          {isGuest && (
            <button
              onClick={onSignIn}
              className="text-xs text-gray-500 hover:text-gray-300 underline transition-colors"
            >
              Sign in to save your progress
            </button>
          )}
          <p className="text-xs text-gray-700 leading-relaxed">
            Card images via{' '}
            <a
              href="https://deckofcardsapi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-400 underline transition-colors"
            >
              Deck of Cards API
            </a>
            {' '}· Game concept based on{' '}
            <span className="text-gray-600">Scoundrel</span>{' '}
            by Zach Gage &amp; Kurt Bieg
          </p>
        </div>

      </div>
    </div>
  );
};
