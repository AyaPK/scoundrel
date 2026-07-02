import { Card, Suit, Rank, CardType } from '../types/game';

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  let idCounter = 0;

  // Remove red face cards and red aces as per game rules
  // Only use: Clubs (monsters), Spades (monsters), Diamonds (weapons), Hearts (potions)
  // But remove red face cards (J/Q/K of hearts/diamonds) and red aces

  const suits: Suit[] = ['clubs', 'spades', 'diamonds', 'hearts'];
  const ranks: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

  for (const suit of suits) {
    for (const rank of ranks) {
      // Skip red face cards and red aces
      if ((suit === 'hearts' || suit === 'diamonds') && (rank >= 11 || rank === 14)) {
        continue;
      }

      const type: CardType = 
        suit === 'clubs' || suit === 'spades' ? 'monster' :
        suit === 'diamonds' ? 'weapon' : 'potion';

      deck.push({
        id: `card-${idCounter++}`,
        suit,
        rank,
        type,
        faceUp: false,
      });
    }
  }

  return shuffleDeck(deck);
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getCardDisplay = (card: Card): string => {
  const rankDisplay = 
    card.rank === 11 ? 'J' :
    card.rank === 12 ? 'Q' :
    card.rank === 13 ? 'K' :
    card.rank === 14 ? 'A' : card.rank.toString();

  const suitDisplay = 
    card.suit === 'hearts' ? '♥' :
    card.suit === 'diamonds' ? '♦' :
    card.suit === 'clubs' ? '♣' : '♠';

  return `${rankDisplay}${suitDisplay}`;
};

export const getCardColor = (card: Card): string => {
  return card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-gray-900';
};
