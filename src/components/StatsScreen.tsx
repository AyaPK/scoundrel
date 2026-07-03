import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface GameRun {
  id: string;
  created_at: string;
  victory: boolean;
  score: number;
  turns_played: number;
  final_health: number;
}

interface StatsScreenProps {
  userId: string;
  username: string;
  onBack: () => void;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ userId, username, onBack }) => {
  const [runs, setRuns] = useState<GameRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('game_runs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setRuns((data as GameRun[]) ?? []);
        setLoading(false);
      });
  }, [userId]);

  const totalRuns = runs.length;
  const wins = runs.filter(r => r.victory).length;
  const winRate = totalRuns > 0 ? Math.round((wins / totalRuns) * 100) : 0;
  const bestScore = totalRuns > 0 ? Math.max(...runs.map(r => r.score)) : 0;
  const avgScore = totalRuns > 0 ? Math.round(runs.reduce((s, r) => s + r.score, 0) / totalRuns) : 0;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6 pt-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Run History</h1>
          <p className="text-gray-500 text-sm">{username}</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          ← Back to Game
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Runs', value: totalRuns },
          { label: 'Win Rate', value: `${winRate}%` },
          { label: 'Best Score', value: bestScore },
          { label: 'Avg Score', value: avgScore },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Run table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading...</div>
        ) : runs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No runs yet — go play!</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Result</th>
                <th className="text-right px-4 py-3">Score</th>
                <th className="text-right px-4 py-3">HP Left</th>
                <th className="text-right px-4 py-3">Turns</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run, i) => (
                <tr
                  key={run.id}
                  className={`border-b border-gray-800/50 ${i % 2 === 0 ? '' : 'bg-gray-800/20'}`}
                >
                  <td className="px-4 py-3 text-gray-400">{formatDate(run.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${run.victory ? 'text-green-400' : 'text-red-400'}`}>
                      {run.victory ? '✓ Victory' : '✗ Defeat'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-white font-medium">{run.score}</td>
                  <td className="px-4 py-3 text-right text-gray-300">{run.final_health}</td>
                  <td className="px-4 py-3 text-right text-gray-400">{run.turns_played}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
