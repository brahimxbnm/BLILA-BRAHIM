import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Flame, CheckCircle, ShieldAlert } from 'lucide-react';
import type { ChatMessage } from '../types';

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isDescriber: boolean;
  hasGuessed: boolean;
  closeHint?: string | null;
  myId: string;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  onSendMessage,
  isDescriber,
  hasGuessed,
  closeHint,
  myId,
}) => {
  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, closeHint]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputVal.trim();
    if (!clean || isDescriber || hasGuessed) return;
    onSendMessage(clean);
    setInputVal('');
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col h-[520px] max-h-[85vh]">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 px-1">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-white text-sm">Live Guessing Chat</h3>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Type your guess to score!</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
        {messages.map((msg) => {
          if (msg.type === 'correct') {
            return (
              <div
                key={msg.id}
                className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 px-3 py-2 rounded-xl flex items-center gap-2 shadow-md animate-scaleUp"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="font-bold text-xs">{msg.text}</span>
              </div>
            );
          }

          if (msg.type === 'system') {
            return (
              <div
                key={msg.id}
                className="bg-slate-800/60 text-slate-300 px-3 py-1.5 rounded-lg text-center font-medium border border-slate-700/50"
              >
                {msg.text}
              </div>
            );
          }

          if (msg.type === 'clue') {
            return (
              <div
                key={msg.id}
                className="bg-amber-950/40 border border-amber-500/30 text-amber-200 px-3 py-2 rounded-xl flex items-center justify-between"
              >
                <span className="text-slate-400 font-medium">🎨 {msg.senderName} gave a clue:</span>
                <span className="text-xl tracking-wider">{msg.text}</span>
              </div>
            );
          }

          const isMine = msg.senderId === myId;
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              {!isMine && (
                <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-xs flex-shrink-0">
                  {msg.senderAvatar || '👤'}
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                  isMine
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/60'
                }`}
              >
                {!isMine && (
                  <span className="block text-[10px] text-slate-400 font-bold mb-0.5">
                    {msg.senderName}
                  </span>
                )}
                <span className="break-words font-medium">{msg.text}</span>
              </div>
            </div>
          );
        })}

        {closeHint && (
          <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-2 rounded-xl flex items-center gap-2 shadow-md animate-bounceOnce">
            <Flame className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
            <span className="font-bold text-xs">{closeHint}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="pt-3 border-t border-slate-800 mt-2">
        {isDescriber ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-center text-xs text-amber-300 font-semibold flex items-center justify-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            You are the Describer this round! Use emoji buttons to guide guessers.
          </div>
        ) : hasGuessed ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 text-center text-xs text-emerald-300 font-bold flex items-center justify-center gap-1.5 animate-pulse">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            You guessed correctly! Waiting for other players to finish...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Type your guess here..."
              maxLength={80}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-md shadow-indigo-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Guess</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
