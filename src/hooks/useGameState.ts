import { useReducer, useCallback } from 'react';
import { GameState, GameAction, Card, Weapon } from '../types/game';
import { createDeck, shuffleDeck } from '../utils/deck';

const initialGameState: GameState = {
  dungeon: [],
  discard: [],
  room: [],
  carriedOverCard: null,
  health: 20,
  maxHealth: 20,
  equippedWeapon: null,
  potionsUsedThisRoom: 0,
  avoidedPreviousRoom: false,
  gameOver: false,
  victory: false,
  score: 0,
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GAME': {
      const deck = createDeck();
      const initialRoom = deck.splice(0, 4).map(card => ({ ...card, faceUp: true }));
      
      return {
        ...initialGameState,
        dungeon: deck,
        room: initialRoom,
      };
    }

    case 'PLAY_CARD': {
      const { cardIndex, actionType } = action.payload;
      const card = state.room[cardIndex];
      
      if (!card) return state;

      let newState = { ...state };
      const newRoom = [...state.room];
      newRoom.splice(cardIndex, 1);

      switch (actionType) {
        case 'equip_weapon':
          if (card.type === 'weapon') {
            const newWeapon: Weapon = {
              card,
              defeatedMonsters: [],
              maxMonsterValue: 14, // Can defeat any monster initially
            };
            
            // Discard old weapon and its monsters
            if (state.equippedWeapon) {
              newState.discard.push(...state.equippedWeapon.defeatedMonsters);
              newState.discard.push(state.equippedWeapon.card);
            }
            
            newState.equippedWeapon = newWeapon;
          }
          break;

        case 'use_potion':
          if (card.type === 'potion' && state.potionsUsedThisRoom === 0) {
            newState.health = Math.min(state.health + card.rank, state.maxHealth);
            newState.potionsUsedThisRoom = 1;
          }
          newState.discard.push(card);
          break;

        case 'fight_monster_barehanded':
          if (card.type === 'monster') {
            newState.health = Math.max(0, state.health - card.rank);
            newState.discard.push(card);
          }
          break;

        case 'fight_monster_with_weapon':
          if (card.type === 'monster' && state.equippedWeapon) {
            const weapon = state.equippedWeapon;
            const damage = Math.max(0, card.rank - weapon.card.rank);
            newState.health = Math.max(0, state.health - damage);
            
            // Update weapon with defeated monster
            const updatedWeapon: Weapon = {
              ...weapon,
              defeatedMonsters: [...weapon.defeatedMonsters, card],
              maxMonsterValue: card.rank - 1, // Can only defeat smaller monsters now
            };
            newState.equippedWeapon = updatedWeapon;
          }
          break;
      }

      newState.room = newRoom;

      // Check if room is complete (3 cards played)
      if (newRoom.length === 1) {
        return handleRoomComplete(newState);
      }

      // Check game over
      if (newState.health <= 0) {
        return {
          ...newState,
          gameOver: true,
          victory: false,
        };
      }

      return newState;
    }

    case 'AVOID_ROOM': {
      if (state.avoidedPreviousRoom) return state; // Can't avoid two rooms in a row

      const avoidedCards = [...state.room, state.carriedOverCard].filter(Boolean) as Card[];
      const newDungeon = [...state.dungeon, ...avoidedCards];
      const shuffledDungeon = shuffleDeck(newDungeon);
      const newRoom = shuffledDungeon.splice(0, 4).map(card => ({ ...card, faceUp: true }));

      return {
        ...state,
        dungeon: shuffledDungeon,
        room: newRoom,
        carriedOverCard: null,
        avoidedPreviousRoom: true,
        potionsUsedThisRoom: 0,
      };
    }

    default:
      return state;
  }
};

const handleRoomComplete = (state: GameState): GameState => {
  const remainingCard = state.room[0];
  
  // Check victory condition
  if (state.dungeon.length === 0 && !remainingCard) {
    return {
      ...state,
      gameOver: true,
      victory: true,
      score: state.health,
    };
  }

  // Deal new room
  const cardsToDeal = remainingCard ? 3 : 4;
  const newRoomCards = state.dungeon.splice(0, cardsToDeal).map(card => ({ ...card, faceUp: true }));
  const newRoom = remainingCard ? [remainingCard, ...newRoomCards] : newRoomCards;

  return {
    ...state,
    room: newRoom,
    carriedOverCard: remainingCard || null,
    potionsUsedThisRoom: 0,
    avoidedPreviousRoom: false,
  };
};

export const useGameState = () => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME' });
  }, []);

  const playCard = useCallback((cardIndex: number, actionType: string) => {
    dispatch({ type: 'PLAY_CARD', payload: { cardIndex, actionType } });
  }, []);

  const avoidRoom = useCallback(() => {
    dispatch({ type: 'AVOID_ROOM' });
  }, []);

  return {
    gameState,
    startGame,
    playCard,
    avoidRoom,
  };
};
