import React, { useState } from 'react';
import { Volume2, VolumeX, Copy, Check, Users, LogOut } from 'lucide-react';
import { sounds } from '../utils/sound';

interface HeaderProps {
  roomId?: string;
  myId?: string;
  activePlayersCount?: number;
  onLeaveRoom?: () => void;
  isInGame?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  roomId,
  activePlayersCount = 1,
  onLeaveRoom,
  isInGame = false,
}) => {
  const [muted, setMuted] = useState(sounds.getMuted());
  const [copied, setCopied] = useState(false);

  const toggleSound = () => {
    const isMuted = sounds.toggleMute();
    setMuted(isMuted);
  };

  const copyRoomCode = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-indigo-500/20 px-4 py-3 sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 flex items-center justify-center text-xl shadow-md shadow-indigo-500/30 animate-pulse">
            🎭
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-300 bg-clip-text text-transparent flex items-center gap-1.5">
              Emoji Charades Live <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">4P Room</span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">Guess the secret word from emoji clues!</p>
          </div>
        </div>

        {roomId && (
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs shadow-inner">
            <span className="text-slate-400 font-medium">Room:</span>
            <span className="font-mono font-bold text-amber-300 tracking-wider">{roomId}</span>
            <button
              onClick={copyRoomCode}
              title="Copy room code to share"
              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 rounded-full px-3 py-1 text-xs text-slate-300">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Online: {activePlayersCount}</span>
          </div>

          <button
            onClick={toggleSound}
            aria-label={muted ? "Unmute sounds" : "Mute sounds"}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition shadow-sm"
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {isInGame && onLeaveRoom && (
            <button
              onClick={onLeaveRoom}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
