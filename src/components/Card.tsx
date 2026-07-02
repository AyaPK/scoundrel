import React from 'react';
import { Card } from '../types/game';

interface CardComponentProps {
  card: Card;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  dimmed?: boolean;
  className?: string;
  dealIndex?: number;
  isCarryOver?: boolean;
}

// Build SVG card image URL from the richardschneider/cardsJS project hosted on jsDelivr
const getCardImageUrl = (card: Card): string => {
  const rankMap: Record<number, string> = {
    2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7',
    8: '8', 9: '9', 10: '0', 11: 'J', 12: 'Q', 13: 'K', 14: 'A',
  };
  const suitMap: Record<string, string> = {
    hearts: 'H', diamonds: 'D', clubs: 'C', spades: 'S',
  };
  const rank = rankMap[card.rank];
  const suit = suitMap[card.suit];
  return `https://deckofcardsapi.com/static/img/${rank}${suit}.png`;
};

const CARD_BACK_URL = 'https://deckofcardsapi.com/static/img/back.png';

const typeRingColor: Record<string, string> = {
  monster: 'ring-red-500',
  weapon: 'ring-blue-400',
  potion: 'ring-green-400',
};

export const CardComponent: React.FC<CardComponentProps> = ({
  card,
  selected = false,
  onClick,
  disabled = false,
  dimmed = false,
  className = '',
  dealIndex,
  isCarryOver = false,
}) => {
  const dealClass = dealIndex !== undefined ? `card-deal card-deal-${dealIndex + 1}` : '';
  const ringClass = card.faceUp ? `ring-2 ${typeRingColor[card.type]}` : '';
  const selectedClass = selected ? 'ring-4 ring-yellow-400 -translate-y-3 shadow-yellow-400/50' : '';
  const disabledClass = disabled ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer hover:-translate-y-1 hover:shadow-xl';
  const dimmedClass = dimmed ? 'opacity-50 grayscale' : '';

  return (
    <div
      className={`relative rounded-lg overflow-hidden shadow-lg transition-all duration-200 ${ringClass} ${selectedClass} ${disabledClass} ${dimmedClass} ${dealClass} ${isCarryOver ? 'ring-2 ring-yellow-600' : ''} ${className}`}
      style={{ aspectRatio: '2.5 / 3.5' }}
      onClick={!disabled ? onClick : undefined}
      title={card.faceUp ? `${card.type} — value ${card.rank}` : ''}
    >
      <img
        src={card.faceUp ? getCardImageUrl(card) : CARD_BACK_URL}
        alt={card.faceUp ? `${card.rank} of ${card.suit}` : 'Card back'}
        className="w-full h-full object-cover"
        draggable={false}
      />
      {isCarryOver && card.faceUp && (
        <div className="absolute bottom-0 left-0 right-0 bg-yellow-600/80 text-white text-center text-xs py-0.5 font-semibold">
          carried
        </div>
      )}
    </div>
  );
};
