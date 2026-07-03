import React, { useState } from 'react';
import { Card } from '../types/game';
import { CardComponent } from './Card';

interface DiscardPileProps {
  discard: Card[];
}

const CARD_BACK_URL = 'https://deckofcardsapi.com/static/img/back.png';

export const DiscardPile: React.FC<DiscardPileProps> = ({ discard }) => {
  const [open, setOpen] = useState(false);

  const top = discard[discard.length - 1];
  const second = discard[discard.length - 2];
  const third = discard[discard.length - 3];

  // Group cards by type for the modal header summary
  const monsters = discard.filter(c => c.type === 'monster');
  const weapons = discard.filter(c => c.type === 'weapon');
  const potions = discard.filter(c => c.type === 'potion');

  return (
    <>
      {/* Discard pile widget */}
      <button
        onClick={() => discard.length > 0 && setOpen(true)}
        className={`relative flex flex-col items-center gap-1 group ${discard.length === 0 ? 'cursor-default' : 'cursor-pointer'}`}
        title={discard.length > 0 ? 'View discard pile' : 'Discard pile is empty'}
      >
        {/* Stacked cards visual */}
        <div className="relative" style={{ width: '52px', height: '72px' }}>
          {discard.length === 0 ? (
            <div
              className="absolute inset-0 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center"
            >
              <span className="text-gray-700 text-xs">—</span>
            </div>
          ) : (
            <>
              {third && (
                <div className="absolute rounded-lg overflow-hidden shadow" style={{ width: '52px', height: '72px', top: '-4px', left: '-4px', opacity: 0.4 }}>
                  <img src={CARD_BACK_URL} alt="" className="w-full h-full object-cover" draggable={false} />
                </div>
              )}
              {second && (
                <div className="absolute rounded-lg overflow-hidden shadow" style={{ width: '52px', height: '72px', top: '-2px', left: '-2px', opacity: 0.65 }}>
                  <img src={CARD_BACK_URL} alt="" className="w-full h-full object-cover" draggable={false} />
                </div>
              )}
              {top && (
                <div
                  className="absolute rounded-lg overflow-hidden shadow-lg ring-1 ring-white/10 transition-transform duration-150 group-hover:-translate-y-1"
                  style={{ width: '52px', height: '72px', top: 0, left: 0 }}
                >
                  <CardComponent card={{ ...top, faceUp: true }} className="w-full h-full" />
                </div>
              )}
            </>
          )}
        </div>

        {/* Label + count */}
        <div className="text-center">
          <div className="text-xs text-gray-500 leading-none">Discard</div>
          {discard.length > 0 && (
            <div className="text-xs font-bold text-gray-400 mt-0.5">{discard.length}</div>
          )}
        </div>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <div>
                <h2 className="text-white font-bold text-lg">Discard Pile</h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  {discard.length} cards — {monsters.length} monsters · {weapons.length} weapons · {potions.length} potions
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-white text-xl leading-none transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Card grid — most recent first */}
            <div className="overflow-y-auto p-4">
              {['monster', 'weapon', 'potion'].map(type => {
                const group = discard.filter(c => c.type === type);
                if (group.length === 0) return null;
                const label = type === 'monster' ? '⚔️ Monsters' : type === 'weapon' ? '🗡️ Weapons' : '🧪 Potions';
                return (
                  <div key={type} className="mb-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">{label}</h3>
                    <div className="flex flex-wrap gap-2">
                      {[...group].reverse().map(card => (
                        <div key={card.id} style={{ width: '52px' }}>
                          <CardComponent card={{ ...card, faceUp: true }} className="w-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
