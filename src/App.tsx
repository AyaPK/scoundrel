import React from 'react';
import { useGameState } from './hooks/useGameState';
import { GameBoard } from './components/GameBoard';

function App() {
  const { gameState, startGame, playCard, avoidRoom } = useGameState();

  React.useEffect(() => {
    if (gameState.dungeon.length === 0 && gameState.room.length === 0 && !gameState.gameOver) {
      startGame();
    }
  }, [gameState.dungeon.length, gameState.room.length, gameState.gameOver, startGame]);

  return (
    <GameBoard
      room={gameState.room}
      equippedWeapon={gameState.equippedWeapon}
      health={gameState.health}
      maxHealth={gameState.maxHealth}
      potionsUsedThisRoom={gameState.potionsUsedThisRoom}
      cardsPlayedThisRoom={gameState.cardsPlayedThisRoom}
      avoidedPreviousRoom={gameState.avoidedPreviousRoom}
      onPlayCard={playCard}
      onAvoidRoom={avoidRoom}
      onNewGame={startGame}
      gameOver={gameState.gameOver}
      victory={gameState.victory}
      score={gameState.score}
      dungeonSize={gameState.dungeon.length}
      carriedOverCard={gameState.carriedOverCard}
    />
  );
}

export default App;
