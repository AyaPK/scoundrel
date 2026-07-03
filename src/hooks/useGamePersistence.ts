import { useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { GameState } from '../types/game';

export const useGamePersistence = (userId: string | undefined) => {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveSession = useCallback((gameState: GameState) => {
    if (!userId) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      await supabase.from('game_sessions').upsert(
        { user_id: userId, game_state: gameState, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
    }, 2000);
  }, [userId]);

  const restoreSession = useCallback(async (): Promise<GameState | null> => {
    if (!userId) return null;
    const { data } = await supabase
      .from('game_sessions')
      .select('game_state')
      .eq('user_id', userId)
      .maybeSingle();
    return (data?.game_state as GameState) ?? null;
  }, [userId]);

  const clearSession = useCallback(async () => {
    if (!userId) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    await supabase.from('game_sessions').delete().eq('user_id', userId);
  }, [userId]);

  const saveCompletedRun = useCallback(async (gameState: GameState, turnsPlayed: number) => {
    if (!userId) return;
    await supabase.from('game_runs').insert({
      user_id: userId,
      victory: gameState.victory,
      score: gameState.score,
      turns_played: turnsPlayed,
      final_health: gameState.health,
    });
  }, [userId]);

  return { saveSession, restoreSession, clearSession, saveCompletedRun };
};
