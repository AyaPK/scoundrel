# Scoundrel

A single-player dungeon crawl card game playable in the browser.

**Play it here:** (Not yet hosted)

---

## Rules

### Setup
- The dungeon is a 44-card deck (standard deck with red face cards and red aces removed).
- You start with **20 HP**.

### Card Types
- **♣ ♠ Monsters** - Black cards (Clubs and Spades). You must fight them.
- **♦ Weapons** - Diamonds (2–10). Equip one to reduce monster damage.
- **♥ Potions** - Hearts (2–10). Drink one per room to restore HP.

### Card Values
- Number cards are worth their face value.
- Jack = 11, Queen = 12, King = 13, Ace = 14.

### Rooms
- Each turn, 4 cards are dealt face-up as a **room**.
- You must interact with exactly **3 of the 4 cards**. The fourth carries over to the next room.

### Fighting Monsters
- **Barehanded** - Lose HP equal to the monster's full value.
- **With a weapon** - Lose HP equal to `monster value − weapon value` (minimum 0).


### Weapons
- Picking up a new weapon replaces your current one (old weapon is discarded).
- **Weapon binding rule** - After killing a monster with a weapon, the weapon can only be used against monsters with a *strictly lower* value than the last one killed. It can still be used against weaker monsters.
- A freshly equipped weapon can target any monster.

### Potions
- Heal HP equal to the potion's value, up to your maximum of 20.
- You may only use **one potion per room**. A second potion in the same room is discarded with no effect.

### Avoiding a Room
- You may choose to **avoid** a room. all 4 cards are shuffled back into the dungeon and a new room is dealt.
- You **cannot avoid two rooms in a row**.

### Winning & Losing
- **Win** - Clear all cards from the dungeon. Your remaining HP is your score.
- **Lose** - Your HP reaches 0 at any point.
