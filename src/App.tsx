import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameState } from './hooks/useGameState';
import { useAuth } from './hooks/useAuth';
import { useGamePersistence } from './hooks/useGamePersistence';
import { GameBoard } from './components/GameBoard';
import { AuthScreen } from './components/AuthScreen';
import { StatsScreen } from './components/StatsScreen';
import { GameState } from './types/game';

type View = 'game' | 'stats';

function App() {
  const { gameState, startGame, playCard, avoidRoom, restoreGame } = useGameState();
  const { user, username, loading: authLoading, error: authError, signUp, signIn, signInWithGoogle, signOut, clearError } = useAuth();
  const { saveSession, restoreSession, clearSession, saveCompletedRun } = useGamePersistence(user?.id);

  const [view, setView] = useState<View>('game');
  const [restorePrompt, setRestorePrompt] = useState<GameState | null>(null);
  const [turnsPlayed, setTurnsPlayed] = useState(0);
  const [isGuest, setIsGuest] = useState(false);
  const prevGameOverRef = useRef(false);
  const sessionChecked = useRef(false);

  // On login, check for a saved session
  useEffect(() => {
    if (!user || sessionChecked.current) return;
    sessionChecked.current = true;
    restoreSession().then(saved => {
      if (saved && !saved.gameOver) {
        setRestorePrompt(saved);
      } else {
        startGame();
      }
    });
  }, [user, restoreSession, startGame]);

  // Reset session check ref on logout
  useEffect(() => {
    if (!user) {
      sessionChecked.current = false;
      setIsGuest(false);
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

  const handleContinueSession = () => {
    if (restorePrompt) {
      restoreGame(restorePrompt);
      setRestorePrompt(null);
    }
  };

  const handleNewGame = useCallback(() => {
    clearSession();
    setTurnsPlayed(0);
    setRestorePrompt(null);
    startGame();
  }, [clearSession, startGame]);

  const handleGuest = useCallback(() => {
    setIsGuest(true);
    startGame();
  }, [startGame]);

  const handleSignOut = useCallback(() => {
    signOut();
    setIsGuest(false);
    setView('game');
    setRestorePrompt(null);
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
        onGuest={handleGuest}
        error={authError}
        loading={authLoading}
        onClearError={clearError}
      />
    );
  }

  // Stats view (only reachable when logged in)
  if (view === 'stats' && user) {
    return (
      <StatsScreen
        userId={user.id}
        username={username ?? user.email ?? 'Player'}
        onBack={() => setView('game')}
      />
    );
  }

  // Restore session prompt modal
  if (restorePrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="text-3xl mb-4">⚔️</div>
          <h2 className="text-white text-xl font-bold mb-2">Continue your run?</h2>
          <p className="text-gray-400 text-sm mb-6">You have an unfinished dungeon. Pick up where you left off?</p>
          <div className="flex gap-3">
            <button
              onClick={handleContinueSession}
              className="flex-1 py-2.5 bg-white text-gray-900 font-semibold text-sm rounded-lg hover:bg-gray-100 transition-colors"
            >
              Continue
            </button>
            <button
              onClick={handleNewGame}
              className="flex-1 py-2.5 bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              New Game
            </button>
          </div>
        </div>
      </div>
    );
  }

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
      onNewGame={handleNewGame}
      gameOver={gameState.gameOver}
      victory={gameState.victory}
      score={gameState.score}
      dungeonSize={gameState.dungeon.length}
      carriedOverCard={gameState.carriedOverCard}
      username={isGuest ? 'Guest' : (username ?? user?.email ?? 'Player')}
      onViewStats={isGuest ? undefined : () => setView('stats')}
      onSignOut={handleSignOut}
    />
  );
}

export default App;
