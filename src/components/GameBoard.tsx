import React, { useState, useEffect } from 'react';
import { CardComponent } from './Card';
import { Card, Weapon } from '../types/game';
import { getCardDisplay } from '../utils/deck';

interface GameBoardProps {
  room: Card[];
  equippedWeapon: Weapon | null;
  health: number;
  maxHealth: number;
  potionsUsedThisRoom: number;
  cardsPlayedThisRoom: number;
  avoidedPreviousRoom: boolean;
  onPlayCard: (cardIndex: number, actionType: string) => void;
  onAvoidRoom: () => void;
  onNewGame: () => void;
  gameOver: boolean;
  victory: boolean;
  score: number;
  dungeonSize: number;
  carriedOverCard: Card | null;
  username: string;
  onViewStats: () => void;
  onSignOut: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  room,
  equippedWeapon,
  health,
  maxHealth,
  potionsUsedThisRoom,
  cardsPlayedThisRoom,
  avoidedPreviousRoom,
  onPlayCard,
  onAvoidRoom,
  onNewGame,
  gameOver,
  victory,
  score,
  dungeonSize,
  carriedOverCard,
  username,
  onViewStats,
  onSignOut,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [roomKey, setRoomKey] = useState(0);
  const [prevRoomSize, setPrevRoomSize] = useState(room.length);

  // Trigger re-animation when a new room is dealt (room grows back toward 4)
  useEffect(() => {
    if (room.length > prevRoomSize) {
      setRoomKey(k => k + 1);
      setSelectedIndex(null);
    }
    setPrevRoomSize(room.length);
  }, [room.length, prevRoomSize]);

  const canFightWithWeapon = (monsterCard: Card): boolean => {
    if (!equippedWeapon) return false;
    return monsterCard.rank <= equippedWeapon.maxMonsterValue;
  };

  const selectedCard = selectedIndex !== null ? room[selectedIndex] : null;

  const handleCardClick = (index: number) => {
    setSelectedIndex(prev => prev === index ? null : index);
  };

  const handleAction = (actionType: string) => {
    if (selectedIndex === null) return;
    onPlayCard(selectedIndex, actionType);
    setSelectedIndex(null);
  };

  const hpPercent = (health / maxHealth) * 100;
  const hpColor = health <= 5 ? 'bg-red-500' : health <= 10 ? 'bg-yellow-500' : 'bg-green-500';

  if (gameOver) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
           style={{ background: 'radial-gradient(ellipse at center, #1a0a2e 0%, #0a0a0a 100%)' }}>
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-10 text-center max-w-sm w-full shadow-2xl">
          <div className="text-6xl mb-4">{victory ? '👑' : '💀'}</div>
          <h1 className={`text-4xl font-bold mb-3 ${victory ? 'text-yellow-400' : 'text-red-400'}`}>
            {victory ? 'Victory!' : 'Defeat!'}
          </h1>
          <p className="text-gray-400 mb-2 text-sm">
            {victory ? 'You cleared the entire dungeon!' : 'Your health reached zero...'}
          </p>
          <p className="text-3xl font-bold text-white my-6">
            Score: <span className={victory ? 'text-yellow-400' : 'text-red-400'}>{score}</span>
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={onNewGame}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors font-semibold text-lg"
            >
              Play Again
            </button>
            <button
              onClick={onViewStats}
              className="w-full px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors font-medium text-sm"
            >
              📊 View Stats
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6"
         style={{ background: 'radial-gradient(ellipse at top, #1a0a2e 0%, #0d0d1a 100%)' }}>
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Header bar */}
        <div className="flex items-center justify-between bg-gray-900/80 border border-gray-700 rounded-2xl px-5 py-3">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Scoundrel</h1>
            <p className="text-xs text-gray-500">{username}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onViewStats}
              className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
            >
              📊 Stats
            </button>
            <button
              onClick={onSignOut}
              className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
          <div className="text-right">
            <div className={`text-sm font-bold mb-1 ${health <= 5 ? 'text-red-400 hp-pulse' : 'text-gray-300'}`}>
              ❤️ {health} / {maxHealth}
            </div>
            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${hpColor}`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Status row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Weapon */}
          <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-3 overflow-hidden">
            {equippedWeapon ? (
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0" style={{ width: '44px' }}>
                  <CardComponent card={equippedWeapon.card} className="w-full" />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">Weapon</div>
                  <div className="text-white text-sm font-bold">{getCardDisplay(equippedWeapon.card)}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Max target: <span className="text-white font-semibold">
                      {equippedWeapon.maxMonsterValue < 14 ? equippedWeapon.maxMonsterValue : 'any'}
                    </span>
                  </div>
                  {equippedWeapon.defeatedMonsters.length > 0 && (
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      Killed: {equippedWeapon.defeatedMonsters.map(m => getCardDisplay(m)).join(' ')}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm italic h-full flex items-center">No weapon equipped</div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Dungeon</span>
              <span className="text-white font-semibold">{dungeonSize} cards</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Potions</span>
              <span className={potionsUsedThisRoom ? 'text-gray-500' : 'text-green-400 font-semibold'}>
                {potionsUsedThisRoom ? '1 used' : 'available'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Flee</span>
              <span className={avoidedPreviousRoom ? 'text-red-400' : 'text-yellow-400 font-semibold'}>
                {avoidedPreviousRoom ? 'blocked' : 'available'}
              </span>
            </div>
          </div>
        </div>

        {/* Room */}
        <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Current Room</h2>
            <span className="text-xs text-gray-500">play 3 - 1 carries over</span>
          </div>

          {/* Cards row */}
          <div key={roomKey} className="flex justify-center gap-4 mb-4" style={{ minHeight: '140px' }}>
            {room.map((card, index) => {
              const isCarry = carriedOverCard?.id === card.id;
              // New cards get a deal index; carried card doesn't re-animate
              const dealIdx = isCarry ? undefined : index;
              const isSpentPotion = card.type === 'potion' && potionsUsedThisRoom >= 1;
              return (
                <CardComponent
                  key={card.id}
                  card={card}
                  selected={selectedIndex === index}
                  onClick={() => handleCardClick(index)}
                  dealIndex={dealIdx}
                  isCarryOver={isCarry}
                  dimmed={isSpentPotion}
                  className="w-24"
                />
              );
            })}
          </div>

          {/* Action panel - always below cards, never overlapping */}
          <div className="min-h-[80px] bg-gray-800/60 rounded-xl p-3 border border-gray-700">
            {selectedCard === null ? (
              <p className="text-gray-500 text-sm text-center py-2">
                Click a card to see actions
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-400 mb-2">
                  Selected: <span className="text-white font-semibold">{getCardDisplay(selectedCard)}</span>
                  <span className="ml-1 text-gray-500">({selectedCard.type}, value {selectedCard.rank})</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedCard.type === 'weapon' && (
                    <button
                      onClick={() => handleAction('equip_weapon')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors font-medium"
                    >
                      ⚔️ Equip Weapon
                    </button>
                  )}
                  {selectedCard.type === 'potion' && (
                    <>
                      <button
                        onClick={() => handleAction('use_potion')}
                        disabled={potionsUsedThisRoom >= 1}
                        className={`px-3 py-1.5 text-white text-sm rounded-lg transition-colors font-medium ${
                          potionsUsedThisRoom >= 1
                            ? 'bg-gray-600 cursor-not-allowed opacity-50'
                            : 'bg-green-600 hover:bg-green-500'
                        }`}
                      >
                        🧪 Drink Potion {potionsUsedThisRoom >= 1 ? '(already used this room)' : `(+${selectedCard.rank} HP)`}
                      </button>
                      {potionsUsedThisRoom >= 1 && (
                        <button
                          onClick={() => handleAction('discard_potion')}
                          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors font-medium"
                        >
                          🗑️ Discard Potion
                        </button>
                      )}
                    </>
                  )}
                  {selectedCard.type === 'monster' && (
                    <>
                      <button
                        onClick={() => handleAction('fight_monster_barehanded')}
                        className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white text-sm rounded-lg transition-colors font-medium"
                      >
                        👊 Barehanded (−{selectedCard.rank} HP)
                      </button>
                      {equippedWeapon && (
                        <button
                          onClick={() => handleAction('fight_monster_with_weapon')}
                          disabled={!canFightWithWeapon(selectedCard)}
                          className={`px-3 py-1.5 text-white text-sm rounded-lg transition-colors font-medium ${
                            canFightWithWeapon(selectedCard)
                              ? 'bg-orange-600 hover:bg-orange-500'
                              : 'bg-gray-600 cursor-not-allowed opacity-50'
                          }`}
                        >
                          ⚔️ With Weapon (−{Math.max(0, selectedCard.rank - equippedWeapon.card.rank)} HP)
                          {!canFightWithWeapon(selectedCard) && ' - too weak'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Avoid Room button - always in its own row, no z-index conflict */}
        <div className="flex justify-center">
          <button
            onClick={() => { onAvoidRoom(); setSelectedIndex(null); }}
            disabled={avoidedPreviousRoom || cardsPlayedThisRoom > 0}
            className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all ${
              avoidedPreviousRoom || cardsPlayedThisRoom > 0
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                : 'bg-yellow-600/20 border border-yellow-600 text-yellow-400 hover:bg-yellow-600/30'
            }`}
          >
            🏃 Avoid Room
          </button>
        </div>

        {/* Quick rules footer */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
          <div><span className="text-red-400">♣♠</span> Monsters - fight or take full dmg</div>
          <div><span className="text-blue-400">♦</span> Weapons - reduce dmg, bind after use</div>
          <div><span className="text-green-400">♥</span> Potions - heal value (1 per room)</div>
          <div><span className="text-yellow-500">🏃</span> Flee - skip room, not twice in a row</div>
        </div>
      </div>
    </div>
  );
};
