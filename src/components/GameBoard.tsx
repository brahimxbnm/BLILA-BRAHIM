import React from 'react';
import { Timer } from 'lucide-react';
import type { GameRoomState } from '../types';
import { ClueCanvas } from './ClueCanvas';
import { EmojiPickerDrawer } from './EmojiPickerDrawer';
import { ChatBox } from './ChatBox';
import { Scoreboard } from './Scoreboard';
import { RoundSummaryModal } from './RoundSummaryModal';
import { GameOverModal } from './GameOverModal';

interface GameBoardProps {
  roomState: GameRoomState;
  myId: string;
  secretWord?: string;
  suggestedEmojis?: string[];
  closeHint?: string | null;
  onSendClue: (emojis: string) => void;
  onSendMessage: (text: string) => void;
  onPlayAgain: () => void;
  onLeaveRoom: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  roomState,
  myId,
  secretWord,
  suggestedEmojis,
  closeHint,
  onSendClue,
  onSendMessage,
  onPlayAgain,
  onLeaveRoom,
}) => {
  const isDescriber = roomState.currentDescriberId === myId;
  const myPlayer = roomState.players.find(p => p.id === myId);
  const currentDescriber = roomState.players.find(p => p.id === roomState.currentDescriberId);
  const hasGuessed = myPlayer?.hasGuessedThisRound || false;

  const nextDescriberIndex = (roomState.currentRound) % roomState.players.length;
  const nextDescriber = roomState.players[nextDescriberIndex];

  const timerPercentage = Math.max(0, Math.min(100, (roomState.roundTimeLeft / 60) * 100));
  const isTimeUrgent = roomState.roundTimeLeft <= 15;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 animate-fadeIn">
      {roomState.status === 'starting' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-indigo-500/50 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-scaleUp">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Get Ready!
            </span>
            <h2 className="text-3xl font-black text-white mt-2 mb-4">
              Match Starting In
            </h2>
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 mx-auto flex items-center justify-center text-5xl font-black text-slate-950 shadow-xl shadow-amber-500/30 animate-pulse">
              {roomState.countdown}
            </div>
            <p className="text-xs text-slate-400 mt-6">
              Round 1 begins immediately with 4 players!
            </p>
          </div>
        </div>
      )}

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-4 shadow-lg backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 text-xs font-black uppercase tracking-wider">
            Round {roomState.currentRound} of {roomState.totalRounds}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Describer:</span>
            <span className="text-amber-300 font-bold flex items-center gap-1">
              {currentDescriber?.avatar} {currentDescriber?.name || 'Emoji Master'}
            </span>
            {isDescriber && (
              <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-500 text-slate-950">
                YOU
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-xs">
          <Timer className={`w-4 h-4 flex-shrink-0 ${isTimeUrgent ? 'text-rose-400 animate-bounce' : 'text-slate-400'}`} />
          <div className="flex-1 bg-slate-800 rounded-full h-3 p-0.5 overflow-hidden border border-slate-700/60">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isTimeUrgent
                  ? 'bg-rose-500 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-400 via-amber-400 to-indigo-500'
              }`}
              style={{ width: `${timerPercentage}%` }}
            />
          </div>
          <span className={`text-xs font-black font-mono w-8 text-right ${isTimeUrgent ? 'text-rose-400 font-bold text-sm' : 'text-slate-200'}`}>
            {roomState.roundTimeLeft}s
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 flex flex-col gap-4">
          <ClueCanvas
            clues={roomState.clues}
            isDescriber={isDescriber}
            secretWord={secretWord}
            category={roomState.category}
            maskedWord={roomState.maskedWord}
            describerName={currentDescriber?.name || 'Describer'}
            describerAvatar={currentDescriber?.avatar || '🎨'}
          />

          {isDescriber && (
            <EmojiPickerDrawer
              onSendClue={onSendClue}
              suggestedEmojis={suggestedEmojis}
              disabled={roomState.status !== 'playing'}
            />
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <Scoreboard
            players={roomState.players}
            currentDescriberId={roomState.currentDescriberId}
            myId={myId}
            currentRound={roomState.currentRound}
            totalRounds={roomState.totalRounds}
          />

          <ChatBox
            messages={roomState.messages}
            onSendMessage={onSendMessage}
            isDescriber={isDescriber}
            hasGuessed={hasGuessed}
            closeHint={closeHint}
            myId={myId}
          />
        </div>
      </div>

      {roomState.status === 'round_end' && roomState.roundResult && (
        <RoundSummaryModal
          result={roomState.roundResult}
          players={roomState.players}
          nextDescriberName={nextDescriber?.name}
          nextDescriberAvatar={nextDescriber?.avatar}
        />
      )}

      {roomState.status === 'game_over' && (
        <GameOverModal
          players={roomState.players}
          myId={myId}
          onPlayAgain={onPlayAgain}
          onLeaveRoom={onLeaveRoom}
        />
      )}
    </div>
  );
};
