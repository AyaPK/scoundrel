export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14; // 11=Jack, 12=Queen, 13=King, 14=Ace
export type CardType = 'monster' | 'weapon' | 'potion';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  type: CardType;
  faceUp: boolean;
}

export interface Weapon {
  card: Card;
  defeatedMonsters: Card[]; // Monsters killed with this weapon, in order
  maxMonsterValue: number; // Highest value monster this weapon can defeat
}

export interface GameState {
  dungeon: Card[]; // Deck of cards
  discard: Card[]; // Discard pile
  room: Card[]; // Current 4 cards in the room
  carriedOverCard: Card | null; // Card from previous room
  health: number;
  maxHealth: number;
  equippedWeapon: Weapon | null;
  potionsUsedThisRoom: number;
  cardsPlayedThisRoom: number;
  avoidedPreviousRoom: boolean;
  gameOver: boolean;
  victory: boolean;
  score: number;
}

export interface GameAction {
  type: 'START_GAME' | 'PLAY_CARD' | 'EQUIP_WEAPON' | 'USE_POTION' | 'FIGHT_MONSTER' | 'AVOID_ROOM' | 'NEXT_ROOM';
  payload?: any;
}
