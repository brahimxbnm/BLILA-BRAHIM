import React from 'react';
import { Sparkles, Eye, Palette } from 'lucide-react';
import type { EmojiClue } from '../types';

interface ClueCanvasProps {
  clues: EmojiClue[];
  isDescriber: boolean;
  secretWord?: string;
  category: string;
  maskedWord: string;
  describerName: string;
  describerAvatar: string;
}

export const ClueCanvas: React.FC<ClueCanvasProps> = ({
  clues,
  isDescriber,
  secretWord,
  category,
  maskedWord,
  describerName,
  describerAvatar,
}) => {
  return (
    <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
        {isDescriber ? (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl flex-shrink-0 animate-bounceOnce">
              🎨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Your Secret Word
                </span>
                <span className="text-xs text-slate-400">
                  Category: <span className="text-indigo-300 font-semibold">{category}</span>
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-wide mt-0.5">
                {secretWord || 'Loading...'}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-2xl flex-shrink-0">
              🔍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Category: {category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  Describer: <span className="text-slate-200 font-bold">{describerAvatar} {describerName}</span>
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-amber-300 tracking-[0.25em] mt-1 select-none">
                {maskedWord}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 self-end sm:self-center">
          {isDescriber ? (
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              Emoji Master
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              Guesser (Chat to Solve)
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 min-h-[220px] sm:min-h-[260px] flex flex-col justify-center items-center relative overflow-hidden">
        {clues.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-center text-3xl animate-pulse">
              💭
            </div>
            <h4 className="text-base font-bold text-slate-200">
              {isDescriber
                ? 'Craft your emoji clue below to help players guess!'
                : `Waiting for ${describerName} to send emoji clues...`}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              {isDescriber
                ? 'Use the emoji palette below to send clues step by step.'
                : 'Watch this board for clues and type your guesses in the chat!'}
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Emoji Clue Stream ({clues.length} clue{clues.length > 1 ? 's' : ''})
              </span>
              <span className="text-[11px] text-slate-500">Latest clues appear below</span>
            </div>

            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
              {clues.map((clue, index) => (
                <div
                  key={clue.id}
                  className="bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-lg animate-scaleUp"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 text-xs font-black flex items-center justify-center flex-shrink-0">
                      #{index + 1}
                    </span>
                    <div className="text-3xl sm:text-4xl tracking-widest select-none">
                      {clue.emojis}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(clue.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
