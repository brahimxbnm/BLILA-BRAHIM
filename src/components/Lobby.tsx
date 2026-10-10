import React, { useState } from 'react';
import { Users, Play, Bot, Sparkles, PlusCircle, ArrowRight, Palette, HelpCircle } from 'lucide-react';
import type { GameRoomState } from '../types';

const AVATAR_OPTIONS = [
  '🦁', '🦊', '🐼', '🐱', '🐸', '🦄', '🤖', '🧙',
  '🦸', '🚀', '🍕', '🍦', '🐶', '🐯', '🐨', '🐙',
  '👾', '🤠', '🥷', '👑', '🥑', '🎯', '🎸', '⚡'
];

interface LobbyProps {
  currentRoom: GameRoomState | null;
  myId: string;
  onJoinMatchmaking: (name: string, avatar: string) => void;
  onCreateRoom: (name: string, avatar: string) => void;
  onJoinByCode: (code: string, name: string, avatar: string) => void;
  onFillWithBots: () => void;
  onStartNow: () => void;
  onLeaveRoom: () => void;
  isSearching: boolean;
}

export const Lobby: React.FC<LobbyProps> = ({
  currentRoom,
  myId,
  onJoinMatchmaking,
  onCreateRoom,
  onJoinByCode,
  onFillWithBots,
  onStartNow,
  onLeaveRoom,
  isSearching,
}) => {
  const [name, setName] = useState(() => {
    return localStorage.getItem('emoji_guesser_name') || `Player_${Math.floor(100 + Math.random() * 900)}`;
  });
  const [avatar, setAvatar] = useState(() => {
    return localStorage.getItem('emoji_guesser_avatar') || AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
  });
  const [joinCode, setJoinCode] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    localStorage.setItem('emoji_guesser_name', val);
  };

  const handleAvatarSelect = (emoji: string) => {
    setAvatar(emoji);
    localStorage.setItem('emoji_guesser_avatar', emoji);
  };

  if (currentRoom && currentRoom.status === 'waiting') {
    const slots = [0, 1, 2, 3];
    const canStart = currentRoom.players.length >= 2;
    const isRoomFull = currentRoom.players.length >= 4;

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center mb-8 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Auto-Matchmaking Room Active
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Waiting for 4 Players
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Game starts automatically once all 4 slots are filled! ({currentRoom.players.length}/4)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
            {slots.map((idx) => {
              const player = currentRoom.players[idx];
              const isMe = player?.id === myId;

              if (player) {
                return (
                  <div
                    key={player.id}
                    className={`relative rounded-2xl p-5 border transition-all duration-300 ${
                      isMe
                        ? 'bg-gradient-to-b from-indigo-900/50 to-slate-800/80 border-indigo-400/60 shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    {isMe && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500 text-white shadow">
                        YOU
                      </span>
                    )}
                    {player.isBot && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/80 text-purple-100">
                        BOT
                      </span>
                    )}

                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-slate-700/60 border border-slate-600/50 flex items-center justify-center text-3xl mb-3 shadow-inner">
                        {player.avatar}
                      </div>
                      <h4 className="font-bold text-slate-100 text-base truncate max-w-full">
                        {player.name}
                      </h4>
                      <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Ready
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={`empty_${idx}`}
                  className="rounded-2xl p-5 border border-dashed border-slate-700/80 bg-slate-800/20 flex flex-col items-center justify-center text-center min-h-[160px]"
                >
                  <div className="w-12 h-12 rounded-full border border-dashed border-slate-600 flex items-center justify-center text-slate-500 mb-2">
                    <Users className="w-5 h-5 text-slate-500 animate-pulse" />
                  </div>
                  <span className="text-xs font-semibold text-slate-400">Waiting for player...</span>
                  <span className="text-[11px] text-slate-500">Slot #{idx + 1}</span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 relative z-10 pt-4 border-t border-slate-800">
            {!isRoomFull && (
              <button
                onClick={onFillWithBots}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 font-bold text-sm transition-all hover:scale-[1.02] shadow-lg shadow-purple-900/20"
              >
                <Bot className="w-4 h-4 text-purple-300" />
                Fill with Practice Bots (Instant 4/4)
              </button>
            )}

            {canStart && (
              <button
                onClick={onStartNow}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/25 hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Now ({currentRoom.players.length}/4 Players)
              </button>
            )}

            <button
              onClick={onLeaveRoom}
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition border border-slate-700"
            >
              Cancel & Leave
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            💡 Tip: Open this game in another browser tab to simulate another real player joining!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Real-Time 4-Player Multiplayer Word Party
        </div>
        <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Describe with <span className="text-amber-400">Emojis</span>.
          <br className="hidden sm:inline" /> Guess in <span className="text-pink-400">Chat</span>.
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mt-2">
          4 players enter a room. Each round, one is the Emoji Master describing secret words using only emojis, while the other 3 race to guess in chat!
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 flex flex-col items-center sm:items-start">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-indigo-400" /> Your Player Profile
            </h3>

            <div className="flex items-center gap-4 mb-4 w-full">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-900/80 to-slate-800 border-2 border-indigo-400/50 flex items-center justify-center text-4xl shadow-xl flex-shrink-0 animate-bounceOnce">
                {avatar}
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Player Nickname
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition font-semibold"
                />
              </div>
            </div>

            <div className="w-full">
              <span className="block text-xs text-slate-400 mb-2 font-medium">Choose an avatar:</span>
              <div className="grid grid-cols-8 gap-1.5 p-2 bg-slate-800/60 rounded-xl border border-slate-700/60 max-h-36 overflow-y-auto">
                {AVATAR_OPTIONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => handleAvatarSelect(em)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-transform hover:scale-125 ${
                      avatar === em
                        ? 'bg-indigo-600 shadow-md ring-2 ring-indigo-400 text-xl scale-110'
                        : 'hover:bg-slate-700'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-between h-full pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-800 lg:pl-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Play className="w-4 h-4 text-emerald-400" /> Start Playing
              </h3>

              <button
                onClick={() => onJoinMatchmaking(name, avatar)}
                disabled={isSearching}
                className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] mb-4"
              >
                <div className="bg-slate-950/40 group-hover:bg-transparent rounded-[14px] px-6 py-5 flex items-center justify-between transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      ⚡
                    </div>
                    <div className="text-left">
                      <div className="text-xl font-black text-white flex items-center gap-2">
                        Auto-Match 4-Player Room
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/80 text-white font-bold">
                          POPULAR
                        </span>
                      </div>
                      <p className="text-xs text-indigo-200 mt-0.5">
                        Instantly joins or creates a room of 4 players
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => onCreateRoom(name, avatar)}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-bold text-sm transition hover:border-slate-600"
                >
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  Create Private Room
                </button>

                <button
                  onClick={() => setShowJoinModal(true)}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-bold text-sm transition hover:border-slate-600"
                >
                  <Users className="w-4 h-4 text-teal-400" />
                  Join via Room Code
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <button
                onClick={() => setShowHowToPlay(!showHowToPlay)}
                className="flex items-center gap-1.5 hover:text-indigo-300 font-medium transition"
              >
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                {showHowToPlay ? 'Hide Game Rules' : 'How does the game work?'}
              </button>
              <span className="text-slate-500">4 Rounds • Rotating Describers</span>
            </div>
          </div>
        </div>

        {showHowToPlay && (
          <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs animate-fadeIn">
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40">
              <span className="text-base mb-1 block">1️⃣ 4 Players Auto-Match</span>
              <p className="text-slate-400 leading-relaxed">
                Players enter the room. When 4 players are present (or bots filled), the match begins!
              </p>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40">
              <span className="text-base mb-1 block">2️⃣ Emoji-Only Clues</span>
              <p className="text-slate-400 leading-relaxed">
                One player is given a secret word (e.g. 🦁 The Lion King) and can ONLY send emoji clues. Letters/numbers are strictly locked.
              </p>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40">
              <span className="text-base mb-1 block">3️⃣ Chat Race & Rotate</span>
              <p className="text-slate-400 leading-relaxed">
                The other 3 guess in chat. Fast guesses earn 100+ points! The describer rotates every round so everyone gets a turn.
              </p>
            </div>
          </div>
        )}
      </div>

      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-white mb-2">Join Private Room</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter the room code shared with you by your friend:
            </p>

            <input
              type="text"
              placeholder="e.g. PARTY_ABC"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-base text-white font-mono tracking-widest placeholder-slate-500 focus:outline-none focus:border-indigo-400 mb-4 uppercase"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowJoinModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (joinCode.trim()) {
                    onJoinByCode(joinCode.trim(), name, avatar);
                    setShowJoinModal(false);
                  }
                }}
                disabled={!joinCode.trim()}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition disabled:opacity-50"
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
