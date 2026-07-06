import { Card } from '../types/game';

// Fixed scripted deck for the tutorial.
// Room 1 (first 4 cards dealt): potion, weapon, monster (weak), monster (strong carry-over)
// Remaining deck feeds rooms 2+ as needed.
export const createTutorialDeck = (): Card[] => [
  // ── Room 1 ────────────────────────────────────────────────
  // Play 3 cards; tut-3 (4♣) carries over automatically
  { id: 'tut-0', suit: 'clubs',    rank: 3,  type: 'monster', faceUp: true }, // beat 1: barehanded fight
  { id: 'tut-3', suit: 'clubs',    rank: 4,  type: 'monster', faceUp: true }, // carry-over (weaker than weapon)
  { id: 'tut-1', suit: 'hearts',   rank: 4,  type: 'potion',  faceUp: true }, // beat 2: drink potion
  { id: 'tut-2', suit: 'diamonds', rank: 7,  type: 'weapon',  faceUp: true }, // beat 3: equip 7♦ weapon

  // ── Room 2 (carry-over tut-3 + 3 dealt) ──────────────────
  // tut-3 (4♣) is in the room at position 0 (carry-over)
  // beat 4: fight tut-3 with 7♦ weapon → 7−4=3 absorbed, max drops to 3
  // beat 5: equip tut-4 (9♦) overriding old weapon
  // beat 6: fight tut-5 (6♠) with 9♦ — this was impossible with old weapon (max was 3 < 6)
  // tut-6 (8♠) carries over as the scary monster
  { id: 'tut-4', suit: 'diamonds', rank: 9,  type: 'weapon',  faceUp: false }, // beat 5: new weapon
  { id: 'tut-5', suit: 'spades',   rank: 6,  type: 'monster', faceUp: false }, // beat 6: fight with new weapon
  { id: 'tut-6', suit: 'spades',   rank: 2,  type: 'monster', faceUp: false }, // carry-over: Don't want to wear down weapon

  // ── Room 3 (carry-over tut-6 + 3 dealt) — all scary → avoid
  { id: 'tut-7', suit: 'clubs',    rank: 13,  type: 'monster', faceUp: false },
  { id: 'tut-8', suit: 'spades',   rank: 14, type: 'monster', faceUp: false },
  { id: 'tut-9', suit: 'spades',    rank: 12,  type: 'monster', faceUp: false },
];
