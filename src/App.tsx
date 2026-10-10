import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GameRoomState, EmojiClue, ChatMessage } from './types';
import { Header } from './components/Header';
import { Lobby } from './components/Lobby';
import { GameBoard } from './components/GameBoard';
import { sounds } from './utils/sound';
import { AlertCircle, X } from 'lucide-react';

export function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [myId, setMyId] = useState<string>('');
  const [roomState, setRoomState] = useState<GameRoomState | null>(null);
  const [activePlayersCount, setActivePlayersCount] = useState<number>(1);
  const [secretWord, setSecretWord] = useState<string | undefined>(undefined);
  const [suggestedEmojis, setSuggestedEmojis] = useState<string[] | undefined>(undefined);
  const [closeHint, setCloseHint] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const prevCluesCount = useRef(0);
  const prevTimeLeft = useRef(60);

  useEffect(() => {
    const s = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
    });

    s.on('connect', () => {
      setConnected(true);
      setMyId(s.id || '');
    });

    s.on('disconnect', () => {
      setConnected(false);
    });

    s.on('server_stats', (stats: { activePlayers: number }) => {
      if (stats?.activePlayers) {
        setActivePlayersCount(stats.activePlayers);
      }
    });

    s.on('match_found', (data: { roomId: string; myId: string }) => {
      setIsSearching(false);
      setMyId(data.myId);
    });

    s.on('room_state_update', (state: GameRoomState) => {
      setRoomState(state);

      if (state.clues && state.clues.length > prevCluesCount.current) {
        sounds.playCluePop();
      }
      prevCluesCount.current = state.clues ? state.clues.length : 0;
    });

    s.on('secret_word_reveal', (data: { word: string; category: string; suggestedEmojis?: string[] }) => {
      setSecretWord(data.word);
      setSuggestedEmojis(data.suggestedEmojis);
    });

    s.on('clue_added', (clue: EmojiClue) => {
      sounds.playCluePop();
      setRoomState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          clues: [...prev.clues, clue],
        };
      });
    });

    s.on('chat_message', (msg: ChatMessage) => {
      setRoomState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, msg],
        };
      });
    });

    s.on('player_solved', (data: { playerId: string; points: number; rank: number; chatMessage: ChatMessage }) => {
      sounds.playCorrectChime();
      setRoomState(prev => {
        if (!prev) return null;
        const updatedPlayers = prev.players.map(p => {
          if (p.id === data.playerId) {
            return { ...p, score: p.score + data.points, hasGuessedThisRound: true };
          }
          return p;
        });
        return {
          ...prev,
          players: updatedPlayers,
          messages: [...prev.messages, data.chatMessage],
        };
      });
    });

    s.on('you_guessed_correct', (data: { points: number; rank: number; secretWord: string }) => {
      sounds.playCorrectChime();
      setCloseHint(null);
    });

    s.on('close_guess_hint', (data: { text: string }) => {
      setCloseHint(data.text);
      setTimeout(() => setCloseHint(null), 4000);
    });

    s.on('timer_tick', (data: { roundTimeLeft: number }) => {
      setRoomState(prev => prev ? { ...prev, roundTimeLeft: data.roundTimeLeft } : null);
      if (data.roundTimeLeft <= 5 && data.roundTimeLeft > 0) {
        sounds.playTick();
      }
      prevTimeLeft.current = data.roundTimeLeft;
    });

    s.on('error_message', (msg: string) => {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 4500);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const handleJoinMatchmaking = (name: string, avatar: string) => {
    if (!socket) return;
    setIsSearching(true);
    socket.emit('join_matchmaking', { name, avatar });
  };

  const handleCreateRoom = (name: string, avatar: string) => {
    if (!socket) return;
    socket.emit('create_custom_room', { name, avatar });
  };

  const handleJoinByCode = (code: string, name: string, avatar: string) => {
    if (!socket) return;
    socket.emit('join_by_code', { roomCode: code, name, avatar });
  };

  const handleFillWithBots = () => {
    if (!socket) return;
    socket.emit('fill_with_bots');
  };

  const handleStartNow = () => {
    if (!socket) return;
    socket.emit('start_game_now');
  };

  const handleSendClue = (emojis: string) => {
    if (!socket) return;
    socket.emit('submit_clue', { emojis });
  };

  const handleSendMessage = (text: string) => {
    if (!socket) return;
    socket.emit('submit_guess', { text });
  };

  const handlePlayAgain = () => {
    if (!socket) return;
    socket.emit('play_again');
  };

  const handleLeaveRoom = () => {
    if (!socket) return;
    socket.emit('leave_room');
    setRoomState(null);
    setSecretWord(undefined);
    setSuggestedEmojis(undefined);
    setCloseHint(null);
    setIsSearching(false);
  };

  const isInGame = Boolean(roomState && roomState.status !== 'waiting');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {errorMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-rose-600/95 border border-rose-400 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounceOnce">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:bg-rose-700 rounded-lg ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <Header
        roomId={roomState?.roomId}
        myId={myId}
        activePlayersCount={activePlayersCount}
        onLeaveRoom={handleLeaveRoom}
        isInGame={Boolean(roomState)}
      />

      <main className="flex-1 pb-12">
        {roomState && isInGame ? (
          <GameBoard
            roomState={roomState}
            myId={myId}
            secretWord={secretWord}
            suggestedEmojis={suggestedEmojis}
            closeHint={closeHint}
            onSendClue={handleSendClue}
            onSendMessage={handleSendMessage}
            onPlayAgain={handlePlayAgain}
            onLeaveRoom={handleLeaveRoom}
          />
        ) : (
          <Lobby
            currentRoom={roomState}
            myId={myId}
            onJoinMatchmaking={handleJoinMatchmaking}
            onCreateRoom={handleCreateRoom}
            onJoinByCode={handleJoinByCode}
            onFillWithBots={handleFillWithBots}
            onStartNow={handleStartNow}
            onLeaveRoom={handleLeaveRoom}
            isSearching={isSearching}
          />
        )}
      </main>

      <footer className="text-center py-4 border-t border-slate-900 text-slate-500 text-xs">
        <p>Emoji Charades Live • 4-Player Real-time Express & Socket.io Room Game</p>
      </footer>
    </div>
  );
}

export default App;
