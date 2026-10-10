import React from 'react';
import { Trophy, CheckCircle, Palette } from 'lucide-react';
import type { Player } from '../types';

interface ScoreboardProps {
  players: Player[];
  currentDescriberId: string;
  myId: string;
  currentRound: number;
  totalRounds: number;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  players,
  currentDescriberId,
  myId,
  currentRound,
  totalRounds,
}) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 px-1">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-white text-sm">Leaderboard</h3>
        </div>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          Round {currentRound}/{totalRounds}
        </span>
      </div>

      <div className="space-y-2">
        {sortedPlayers.map((player, rank) => {
          const isDescriber = player.id === currentDescriberId;
          const isMe = player.id === myId;

          return (
            <div
              key={player.id}
              className={`rounded-2xl p-3 border transition-all ${
                isMe
                  ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md'
                  : 'bg-slate-800/40 border-slate-700/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs font-black text-slate-500 w-4 text-center">
                    {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `#${rank + 1}`}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg flex-shrink-0 shadow-inner">
                    {player.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-200 text-xs truncate">
                        {player.name}
                      </span>
                      {isMe && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500 text-white">
                          YOU
                        </span>
                      )}
                      {player.isBot && (
                        <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50">
                          BOT
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {isDescriber ? (
                        <span className="text-[10px] text-amber-300 font-semibold flex items-center gap-1">
                          <Palette className="w-3 h-3 text-amber-400" />
                          Describer
                        </span>
                      ) : player.hasGuessedThisRound ? (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          Solved!
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          Guesser
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-black text-amber-300">
                    {player.score}
                  </span>
                  <span className="text-[10px] text-slate-500 block -mt-0.5">pts</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
