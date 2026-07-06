import { useState, useCallback } from 'react';

export type TutorialStepId =
  | 'welcome'            // 0  - info: room overview
  | 'fight_barehanded'   // 1  - gated: fight 3♣ barehanded
  | 'drink_potion'       // 2  - gated: drink 4♥ potion
  | 'equip_weapon'       // 3  - gated: equip 7♦ weapon
  | 'carry_over'         // 4  - info: 4♣ carries over
  | 'room2_start'        // 5  - info: new room, weapon intro
  | 'fight_weapon'       // 6  - gated: fight 4♣ with 7♦ weapon
  | 'weapon_degraded'    // 7  - info: weapon max now 3, explain override
  | 'equip_new_weapon'   // 8  - gated: equip 9♦, overriding old
  | 'fight_new_weapon'   // 9  - gated: fight 6♠ with fresh 9♦
  | 'carry_over_2'       // 10 - info: 8♠ carries, scary room incoming
  | 'room3_start'        // 11 - info: all monsters, suggest avoid
  | 'avoid_room'         // 12 - gated: press Avoid Room
  | 'complete';          // 13 - done

export interface TutorialStep {
  id: TutorialStepId;
  title: string;
  body: string;
  // Which highlight target to use (maps to a ref key in GameBoard)
  highlight: 'room' | 'weapon_panel' | 'avoid_btn' | null;
  highlightCardId?: string;
  // If set, player must perform this actionType on this cardId to advance
  requiredAction?: { cardId: string; actionType: string };
  // If set, this is informational — player clicks Next to advance
  isInfo: boolean;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Scoundrel!',
    body: 'You\'re a rogue descending into a dungeon. Each room has 4 cards. Play 3 of them and 1 carries over to the next room. Cards can be monsters, weapons, or potions.',
    highlight: 'room',
    isInfo: true,
  },
  {
    id: 'fight_barehanded',
    title: 'Fighting barehanded',
    body: 'That 3♣ Monster is weak, fight it with your bare hands. Click it, then press "Barehanded". You\'ll take 3 damage.',
    highlight: null,
    highlightCardId: 'tut-0',
    requiredAction: { cardId: 'tut-0', actionType: 'fight_monster_barehanded' },
    isInfo: false,
  },
  {
    id: 'drink_potion',
    title: 'Potions restore health',
    body: 'That 4♥ Potion heals 4 HP, enough to top you back up. Click it, then press "Drink Potion". You can only use 1 potion per room.',
    highlight: null,
    highlightCardId: 'tut-1',
    requiredAction: { cardId: 'tut-1', actionType: 'use_potion' },
    isInfo: false,
  },
  {
    id: 'equip_weapon',
    title: 'Equip a weapon',
    body: 'That 7♦ Weapon absorbs damage, its value subtracts from any monster you fight. Click it and press "Equip Weapon".',
    highlight: null,
    highlightCardId: 'tut-2',
    requiredAction: { cardId: 'tut-2', actionType: 'equip_weapon' },
    isInfo: false,
  },
  {
    id: 'carry_over',
    title: 'One card carries over',
    body: 'You\'ve played 3 cards, the 4♣ Monster carries into the next room automatically. Your 7♦ weapon will make short work of it.',
    highlight: null,
    highlightCardId: 'tut-3',
    isInfo: true,
  },
  {
    id: 'room2_start',
    title: 'New room!',
    body: 'The 4♣ carried over (shown with a glow). Use your 7♦ weapon to fight it, you\'ll absorb all the damage.',
    highlight: 'room',
    isInfo: true,
  },
  {
    id: 'fight_weapon',
    title: 'Fight with your weapon',
    body: 'Click the 4♣ and press "With Weapon". Your 7♦ absorbs all 4 damage, you take 0 HP.',
    highlight: null,
    highlightCardId: 'tut-3',
    requiredAction: { cardId: 'tut-3', actionType: 'fight_monster_with_weapon' },
    isInfo: false,
  },
  {
    id: 'weapon_degraded',
    title: 'Weapons have a memory',
    body: 'Your 7♦ weapon\'s max target just dropped to 3, it can\'t fight anything stronger than rank 3 now. That 6♠ monster is too strong for it. Time to upgrade.',
    highlight: 'weapon_panel',
    isInfo: true,
  },
  {
    id: 'equip_new_weapon',
    title: 'Override your weapon',
    body: 'Equip the 9♦ to replace your worn-out 7♦. The new weapon has no restrictions yet, it can fight any monster.',
    highlight: null,
    highlightCardId: 'tut-4',
    requiredAction: { cardId: 'tut-4', actionType: 'equip_weapon' },
    isInfo: false,
  },
  {
    id: 'fight_new_weapon',
    title: 'Fight with your new weapon',
    body: 'Now fight the 6♠ with your fresh 9♦. You\'d take 0 damage (9 − 6 = 3 absorbed). The old 7♦ couldn\'t do this after killing the 4♣.',
    highlight: null,
    highlightCardId: 'tut-5',
    requiredAction: { cardId: 'tut-5', actionType: 'fight_monster_with_weapon' },
    isInfo: false,
  },
  {
    id: 'carry_over_2',
    title: 'Danger ahead',
    body: 'The 2♠ carries into the next room. Combined with what\'s in the dungeon, you\'re about to face a room full of heavy monsters. Sometimes fleeing is the right call.',
    highlight: null,
    highlightCardId: 'tut-6',
    isInfo: true,
  },
  {
    id: 'room3_start',
    title: 'A room full of monsters',
    body: 'All of the new cards are powerful monsters, fighting them all would cost you dearly. You can flee a room once, as long as you didn\'t flee the previous one.',
    highlight: 'room',
    isInfo: true,
  },
  {
    id: 'avoid_room',
    title: 'Avoid the room',
    body: 'Press "Avoid Room" to send all cards back into the dungeon and get a fresh draw. You can\'t flee twice in a row, so use it wisely.',
    highlight: 'avoid_btn',
    requiredAction: { cardId: '', actionType: 'avoid_room' },
    isInfo: false,
  },
  {
    id: 'complete',
    title: 'You\'re ready!',
    body: 'That covers everything. Manage your HP, use weapons wisely, and flee when you must. Good luck, scoundrel.',
    highlight: null,
    isInfo: true,
  },
];

const STEP_IDS = TUTORIAL_STEPS.map(s => s.id);

export interface TutorialState {
  active: boolean;
  stepIndex: number;
  shaking: boolean;
}

export const useTutorial = () => {
  const [state, setState] = useState<TutorialState>({
    active: false,
    stepIndex: 0,
    shaking: false,
  });

  const currentStep = TUTORIAL_STEPS[state.stepIndex] ?? TUTORIAL_STEPS[TUTORIAL_STEPS.length - 1];

  const startTutorial = useCallback(() => {
    setState({ active: true, stepIndex: 0, shaking: false });
  }, []);

  const exitTutorial = useCallback(() => {
    setState({ active: false, stepIndex: 0, shaking: false });
  }, []);

  const advance = useCallback(() => {
    setState(s => {
      const next = Math.min(s.stepIndex + 1, TUTORIAL_STEPS.length - 1);
      return { ...s, stepIndex: next, shaking: false };
    });
  }, []);

  // Called by GameBoard when a card action is attempted.
  // Returns true if the action should be allowed to execute.
  const checkAction = useCallback((cardId: string, actionType: string): boolean => {
    if (!state.active) return true;
    const step = TUTORIAL_STEPS[state.stepIndex];
    if (step.isInfo) return false; // shouldn't be able to act during info steps

    if (actionType === 'avoid_room') {
      if (step.requiredAction?.actionType === 'avoid_room') {
        return true;
      }
      // Wrong action — shake
      setState(s => ({ ...s, shaking: true }));
      setTimeout(() => setState(s => ({ ...s, shaking: false })), 600);
      return false;
    }

    if (step.requiredAction?.cardId === cardId && step.requiredAction?.actionType === actionType) {
      return true; // correct — let it execute, GameBoard calls advance after
    }

    // Wrong action — shake
    setState(s => ({ ...s, shaking: true }));
    setTimeout(() => setState(s => ({ ...s, shaking: false })), 600);
    return false;
  }, [state.active, state.stepIndex]);

  // After a correct action executes, GameBoard calls this
  const onActionCompleted = useCallback((actionType: string) => {
    if (!state.active) return;
    const step = TUTORIAL_STEPS[state.stepIndex];
    if (!step.isInfo && step.requiredAction?.actionType === actionType) {
      advance();
    }
  }, [state.active, state.stepIndex, advance]);

  const stepIds = STEP_IDS;

  return {
    tutorialActive: state.active,
    tutorialStep: currentStep,
    tutorialStepIndex: state.stepIndex,
    tutorialShaking: state.shaking,
    startTutorial,
    exitTutorial,
    advanceTutorial: advance,
    checkTutorialAction: checkAction,
    onTutorialActionCompleted: onActionCompleted,
    stepIds,
  };
};
