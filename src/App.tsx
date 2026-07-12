import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameState } from './hooks/useGameState';
import { useAuth } from './hooks/useAuth';
import { useGamePersistence } from './hooks/useGamePersistence';
import { useTutorial, TUTORIAL_STEPS } from './hooks/useTutorial';
import { GameBoard } from './components/GameBoard';
import { AuthScreen } from './components/AuthScreen';
import { HomeScreen } from './components/HomeScreen';
import { StatsScreen } from './components/StatsScreen';
import { AccountScreen } from './components/AccountScreen';
import { GameState } from './types/game';
import { createTutorialDeck } from './utils/tutorialDeck';
import { supabase } from './lib/supabase';

type View = 'home' | 'game' | 'stats' | 'account';

function App() {
  const { gameState, startGame, startGameWithDeck, playCard, avoidRoom, restoreGame } = useGameState();
  const {
    tutorialActive,
    tutorialStep,
    tutorialStepIndex,
    tutorialShaking,
    startTutorial,
    exitTutorial,
    advanceTutorial,
    checkTutorialAction,
    onTutorialActionCompleted,
  } = useTutorial();
  const { user, username, loading: authLoading, error: authError, signUp, signIn, signOut, clearError, resetPassword, updateUsername, updatePassword, deleteAccount } = useAuth();
  const { saveSession, restoreSession, clearSession, saveCompletedRun } = useGamePersistence(user?.id);

  const [view, setView] = useState<View>('home');
  const [savedSession, setSavedSession] = useState<GameState | null>(null);
  const [turnsPlayed, setTurnsPlayed] = useState(0);
  const [isGuest, setIsGuest] = useState(false);
  const [coins, setCoins] = useState<number | null>(null);
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

  // Fetch coin balance whenever the user changes or a run completes
  const fetchCoins = useCallback(async () => {
    if (!user) { setCoins(null); return; }
    const { data } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', user.id)
      .single();
    if (data) setCoins(data.coins);
  }, [user]);

  useEffect(() => { fetchCoins(); }, [fetchCoins]);

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
      saveCompletedRun(gameState, turnsPlayed).then(() => fetchCoins());
      clearSession();
    }
    prevGameOverRef.current = gameState.gameOver;
  }, [gameState.gameOver, gameState, user, isGuest, turnsPlayed, saveCompletedRun, clearSession, fetchCoins]);

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

  const handleStartTutorial = useCallback(() => {
    startGameWithDeck(createTutorialDeck());
    startTutorial();
    setView('game');
  }, [startGameWithDeck, startTutorial]);

  const handleExitTutorial = useCallback(() => {
    exitTutorial();
    handleGoHome();
  }, [exitTutorial, handleGoHome]);

  // Auto-advance tutorial on room change (carry_over -> room2_start)
  const prevRoomRef = useRef(0);
  useEffect(() => {
    if (!tutorialActive) return;
    const prevRoom = prevRoomRef.current;
    const newRoom = gameState.room.length;
    if (newRoom >= 4 && prevRoom < 4) {
      // carry_over (idx 4) → room2_start, carry_over_2 (idx 10) → room3_start
      if (tutorialStepIndex === 4 || tutorialStepIndex === 10) {
        advanceTutorial();
      }
    }
    prevRoomRef.current = newRoom;
  }, [gameState.room.length, tutorialActive, tutorialStepIndex, advanceTutorial]);

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
        <div className="text-gray-500 text-sm">Loading...<br />Refresh the page if it takes too long....</div>
      </div>
    );
  }

  // Auth gate (bypass if playing as guest)
  if (!user && !isGuest) {
    return (
      <AuthScreen
        onSignUp={signUp}
        onSignIn={signIn}
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
        onHowToPlay={handleStartTutorial}
        onViewStats={() => setView('stats')}
        onViewAccount={() => setView('account')}
        onSignOut={handleSignOut}
        onSignIn={handleSignOut}
      />
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
        coins={coins}
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
      onMenu={tutorialActive ? handleExitTutorial : handleGoHome}
      tutorialStep={tutorialActive ? tutorialStep : undefined}
      tutorialStepIndex={tutorialActive ? tutorialStepIndex : undefined}
      tutorialTotalSteps={TUTORIAL_STEPS.length}
      tutorialShaking={tutorialShaking}
      onTutorialNext={tutorialActive ? advanceTutorial : undefined}
      onTutorialExit={tutorialActive ? handleExitTutorial : undefined}
      onTutorialAction={tutorialActive ? checkTutorialAction : undefined}
      onTutorialActionCompleted={tutorialActive ? onTutorialActionCompleted : undefined}
    />
  );
}

export default App;
