import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home } from 'lucide-react';
import type { Player } from '../types';
import { sounds } from '../utils/sound';

interface GameOverModalProps {
  players: Player[];
  myId: string;
  onPlayAgain: () => void;
  onLeaveRoom: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  players,
  myId,
  onPlayAgain,
  onLeaveRoom,
}) => {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const isWinner = winner?.id === myId;

  useEffect(() => {
    sounds.playFanfare();

    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f59e0b', '#ec4899', '#6366f1', '#10b981'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f59e0b', '#ec4899', '#6366f1', '#10b981'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden text-center animate-scaleUp">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-gradient-to-b from-amber-500/25 to-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 mx-auto flex items-center justify-center text-3xl shadow-lg mb-3 animate-bounceOnce">
            🏆
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Game Finished!
          </h2>
          <p className="text-xs text-amber-300 font-semibold mt-1">
            {isWinner ? '🎉 Congratulations! You are the Emoji Champion!' : `Winner: ${winner?.name}!`}
          </p>

          <div className="mt-6 space-y-2.5">
            {sorted.map((player, idx) => {
              const isFirst = idx === 0;
              const isCurrent = player.id === myId;

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isFirst
                      ? 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border-amber-500/50 shadow-lg'
                      : isCurrent
                      ? 'bg-indigo-950/40 border-indigo-500/40'
                      : 'bg-slate-800/40 border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎖️'}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl">
                      {player.avatar}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-100 text-sm">
                          {player.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500 text-white">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Rank #{idx + 1}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-amber-300">
                      {player.score}
                    </span>
                    <span className="text-[10px] text-slate-500 block -mt-1">points</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onPlayAgain}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/25 hover:scale-[1.02]"
            >
              <RotateCcw className="w-4 h-4 fill-slate-950" />
              Play Again
            </button>

            <button
              onClick={onLeaveRoom}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition border border-slate-700"
            >
              <Home className="w-4 h-4" />
              Lobby
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
