import React from 'react';
import { Award, Sparkles, Clock, Palette, ArrowRight } from 'lucide-react';
import type { RoundResult, Player } from '../types';

interface RoundSummaryModalProps {
  result: RoundResult;
  players: Player[];
  nextDescriberName?: string;
  nextDescriberAvatar?: string;
}

export const RoundSummaryModal: React.FC<RoundSummaryModalProps> = ({
  result,
  players,
  nextDescriberName,
  nextDescriberAvatar,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden text-center animate-scaleUp">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Round {result.round} Ended!
          </span>

          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
            The Secret Word Was:
          </p>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-wide mt-1 mb-2 bg-gradient-to-r from-amber-300 via-rose-300 to-indigo-300 bg-clip-text text-transparent">
            {result.secretWord}
          </h2>
          <span className="text-xs px-3 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Category: {result.category}
          </span>

          <div className="mt-6 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-left space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Round Points Breakdown
            </h4>

            {result.solvers.length > 0 ? (
              <div className="space-y-2">
                {result.solvers.map((s, idx) => (
                  <div
                    key={s.playerId}
                    className="flex items-center justify-between bg-slate-900 border border-slate-800/80 rounded-xl px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-400">
                        {idx === 0 ? '🥇 1st' : idx === 1 ? '🥈 2nd' : '🥉 3rd'}
                      </span>
                      <span className="font-bold text-slate-200">{s.playerName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({s.timeSeconds}s)</span>
                    </div>
                    <span className="font-black text-emerald-400">+{s.points} pts</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-1">
                Nobody guessed the secret word this round!
              </p>
            )}

            <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs">
              <span className="text-slate-300 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                Describer Bonus ({result.describerName}):
              </span>
              <span className="font-black text-amber-300">+{result.describerPoints} pts</span>
            </div>
          </div>

          {nextDescriberName && (
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-300 bg-slate-800/60 rounded-xl py-2 px-3 border border-slate-700/60">
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                Next Describer: <strong className="text-white">{nextDescriberAvatar} {nextDescriberName}</strong>
              </span>
            </div>
          )}

          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-indigo-300 font-semibold animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            Next round starting shortly...
          </div>
        </div>
      </div>
    </div>
  );
};
