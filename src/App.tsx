import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameState } from './hooks/useGameState';
import { useAuth } from './hooks/useAuth';
import { useGamePersistence } from './hooks/useGamePersistence';
import { GameBoard } from './components/GameBoard';
import { AuthScreen } from './components/AuthScreen';
import { HomeScreen } from './components/HomeScreen';
import { StatsScreen } from './components/StatsScreen';
import { AccountScreen } from './components/AccountScreen';
import { GameState } from './types/game';

type View = 'home' | 'game' | 'stats' | 'account' | 'tutorial';

function App() {
  const { gameState, startGame, playCard, avoidRoom, restoreGame } = useGameState();
  const { user, username, loading: authLoading, error: authError, signUp, signIn, signInWithGoogle, signOut, clearError, resetPassword, updateUsername, updatePassword, deleteAccount } = useAuth();
  const { saveSession, restoreSession, clearSession, saveCompletedRun } = useGamePersistence(user?.id);

  const [view, setView] = useState<View>('home');
  const [savedSession, setSavedSession] = useState<GameState | null>(null);
  const [turnsPlayed, setTurnsPlayed] = useState(0);
  const [isGuest, setIsGuest] = useState(false);
  const prevGameOverRef = useRef(false);
  const sessionChecked = useRef(false);

  // On login, check for a saved session then land on home
  useEffect(() => {
    if (!user || sessionChecked.current) return;
    sessionChecked.current = true;
    restoreSession().then(saved => {
      if (saved && !saved.gameOver) {
        setSavedSession(saved);
      }
      setView('home');
    });
  }, [user, restoreSession]);

  // Reset session check ref on logout
  useEffect(() => {
    if (!user) {
      sessionChecked.current = false;
      setIsGuest(false);
      setSavedSession(null);
    }
  }, [user]);

  // Save session after each card action
  const handlePlayCard = useCallback((cardIndex: number, actionType: string) => {
    playCard(cardIndex, actionType);
    setTurnsPlayed(t => t + 1);
  }, [playCard]);

  const handleAvoidRoom = useCallback(() => {
    avoidRoom();
    setTurnsPlayed(t => t + 1);
  }, [avoidRoom]);

  // Save session to Supabase after state updates (skip for guests)
  useEffect(() => {
    if (!user || isGuest || gameState.room.length === 0 || gameState.gameOver) return;
    saveSession(gameState);
  }, [gameState, user, isGuest, saveSession]);

  // Save completed run on game over (skip for guests)
  useEffect(() => {
    if (gameState.gameOver && !prevGameOverRef.current && user && !isGuest) {
      saveCompletedRun(gameState, turnsPlayed);
      clearSession();
    }
    prevGameOverRef.current = gameState.gameOver;
  }, [gameState.gameOver, gameState, user, isGuest, turnsPlayed, saveCompletedRun, clearSession]);

  const handleContinueSession = useCallback(() => {
    if (savedSession) {
      restoreGame(savedSession);
      setSavedSession(null);
      setView('game');
    }
  }, [savedSession, restoreGame]);

  const handleNewGame = useCallback(() => {
    clearSession();
    setTurnsPlayed(0);
    setSavedSession(null);
    startGame();
    setView('game');
  }, [clearSession, startGame]);

  const handleGoHome = useCallback(() => {
    setView('home');
  }, []);

  const handleGuest = useCallback(() => {
    setIsGuest(true);
    setView('home');
  }, []);

  const handleSignOut = useCallback(() => {
    signOut();
    setIsGuest(false);
    setView('home');
    setSavedSession(null);
  }, [signOut]);

  // Loading spinner
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  // Auth gate (bypass if playing as guest)
  if (!user && !isGuest) {
    return (
      <AuthScreen
        onSignUp={signUp}
        onSignIn={signIn}
        onSignInWithGoogle={signInWithGoogle}
        onResetPassword={resetPassword}
        onGuest={handleGuest}
        error={authError}
        loading={authLoading}
        onClearError={clearError}
      />
    );
  }

  // Home screen
  if (view === 'home') {
    return (
      <HomeScreen
        username={isGuest ? null : (username ?? null)}
        isGuest={isGuest}
        hasSavedSession={savedSession !== null}
        onNewGame={handleNewGame}
        onContinue={handleContinueSession}
        onHowToPlay={() => setView('tutorial')}
        onViewStats={() => setView('stats')}
        onViewAccount={() => setView('account')}
        onSignOut={handleSignOut}
        onSignIn={handleSignOut}
      />
    );
  }

  // Tutorial stub
  if (view === 'tutorial') {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'radial-gradient(ellipse at top, #1a0a2e 0%, #0d0d1a 100%)' }}
      >
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="text-3xl mb-4">📖</div>
          <h2 className="text-white text-xl font-bold mb-2">How to Play</h2>
          <p className="text-gray-400 text-sm mb-6">Tutorial coming soon!</p>
          <button
            onClick={handleGoHome}
            className="w-full py-2.5 bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Stats view (only reachable when logged in)
  if (view === 'stats' && user) {
    return (
      <StatsScreen
        userId={user.id}
        username={username ?? 'Player'}
        onBack={handleGoHome}
      />
    );
  }

  // Account view (only reachable when logged in)
  if (view === 'account' && user) {
    return (
      <AccountScreen
        user={user}
        username={username}
        onBack={handleGoHome}
        onUpdateUsername={updateUsername}
        onUpdatePassword={updatePassword}
        onDeleteAccount={deleteAccount}
      />
    );
  }

  // Game view
  return (
    <GameBoard
      room={gameState.room}
      equippedWeapon={gameState.equippedWeapon}
      health={gameState.health}
      maxHealth={gameState.maxHealth}
      potionsUsedThisRoom={gameState.potionsUsedThisRoom}
      cardsPlayedThisRoom={gameState.cardsPlayedThisRoom}
      avoidedPreviousRoom={gameState.avoidedPreviousRoom}
      onPlayCard={handlePlayCard}
      onAvoidRoom={handleAvoidRoom}
      onNewGame={handleGoHome}
      gameOver={gameState.gameOver}
      victory={gameState.victory}
      score={gameState.score}
      dungeonSize={gameState.dungeon.length}
      carriedOverCard={gameState.carriedOverCard}
      discard={gameState.discard}
      username={isGuest ? 'Guest' : (username ?? 'Player')}
      onMenu={handleGoHome}
    />
  );
}

export default App;
