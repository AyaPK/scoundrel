import { useReducer, useCallback } from 'react';
import { GameState, GameAction, Card } from '../types/game';
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
  cardsPlayedThisRoom: 0,
  avoidedPreviousRoom: false,
  gameOver: false,
  victory: false,
  score: 0,
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GAME': {
      const deck = createDeck();
      const initialRoom = deck.slice(0, 4).map(card => ({ ...card, faceUp: true }));
      const remainingDeck = deck.slice(4);
      
      return {
        ...initialGameState,
        dungeon: remainingDeck,
        room: initialRoom,
      };
    }

    case 'PLAY_CARD': {
      const { cardIndex, actionType } = action.payload;
      const card = state.room[cardIndex];
      
      if (!card) return state;

      const newRoom = [...state.room];
      newRoom.splice(cardIndex, 1);
      let newDiscard = [...state.discard];
      let newHealth = state.health;
      let newPotionsUsed = state.potionsUsedThisRoom;
      let newWeapon = state.equippedWeapon;

      switch (actionType) {
        case 'equip_weapon':
          if (card.type === 'weapon') {
            if (state.equippedWeapon) {
              newDiscard = [...newDiscard, ...state.equippedWeapon.defeatedMonsters, state.equippedWeapon.card];
            }
            newWeapon = { card, defeatedMonsters: [], maxMonsterValue: 14 };
          }
          break;

        case 'use_potion':
          if (card.type === 'potion' && state.potionsUsedThisRoom === 0) {
            newHealth = Math.min(state.health + card.rank, state.maxHealth);
            newPotionsUsed = 1;
          }
          newDiscard = [...newDiscard, card];
          break;

        case 'discard_potion':
          if (card.type === 'potion') {
            newDiscard = [...newDiscard, card];
          }
          break;

        case 'fight_monster_barehanded':
          if (card.type === 'monster') {
            newHealth = Math.max(0, state.health - card.rank);
            newDiscard = [...newDiscard, card];
          }
          break;

        case 'fight_monster_with_weapon':
          if (card.type === 'monster' && state.equippedWeapon) {
            const weapon = state.equippedWeapon;
            const damage = Math.max(0, card.rank - weapon.card.rank);
            newHealth = Math.max(0, state.health - damage);
            newWeapon = {
              ...weapon,
              defeatedMonsters: [...weapon.defeatedMonsters, card],
              maxMonsterValue: card.rank - 1,
            };
          }
          break;
      }

      let newState = {
        ...state,
        room: newRoom,
        discard: newDiscard,
        health: newHealth,
        potionsUsedThisRoom: newPotionsUsed,
        cardsPlayedThisRoom: state.cardsPlayedThisRoom + 1,
        equippedWeapon: newWeapon,
      };

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
      if (state.avoidedPreviousRoom) return state;
      if (state.cardsPlayedThisRoom > 0) return state;

      const avoidedCards = [...state.room, state.carriedOverCard].filter(Boolean) as Card[];
      const newDungeon = [...state.dungeon, ...avoidedCards];
      const shuffledDungeon = shuffleDeck(newDungeon);
      const newRoom = shuffledDungeon.slice(0, 4).map(card => ({ ...card, faceUp: true }));
      const remainingDungeon = shuffledDungeon.slice(4);

      return {
        ...state,
        dungeon: remainingDungeon,
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
  const newRoomCards = state.dungeon.slice(0, cardsToDeal).map(card => ({ ...card, faceUp: true }));
  const newDungeon = state.dungeon.slice(cardsToDeal);
  const newRoom = remainingCard ? [remainingCard, ...newRoomCards] : newRoomCards;

  return {
    ...state,
    dungeon: newDungeon,
    room: newRoom,
    carriedOverCard: remainingCard || null,
    potionsUsedThisRoom: 0,
    cardsPlayedThisRoom: 0,
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
