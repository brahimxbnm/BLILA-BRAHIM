import React, { useState, useMemo } from 'react';
import { Send, Delete, Sparkles, Layers, X } from 'lucide-react';

interface EmojiPickerDrawerProps {
  onSendClue: (emojis: string) => void;
  suggestedEmojis?: string[];
  disabled?: boolean;
}

interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: string[];
}

const CATEGORIES: EmojiCategory[] = [
  {
    id: 'smileys',
    name: 'Faces & Roles',
    icon: '😀',
    emojis: [
      '😀', '😂', '🤣', '😎', '🥳', '😱', '😭', '😡', '🤔', '😴',
      '🤠', '🤡', '🤖', '👽', '👾', '👻', '💀', '🧛', '🧟', '🧙',
      '🦸', '🦹', '🥷', '🤴', '👸', '🎅', '👶', '👴', '👵', '👀',
      '🧠', '💪', '🤝', '🙌', '👏', '💔', '❤️', '🔥', '💯', '💩'
    ],
  },
  {
    id: 'animals',
    name: 'Animals & Nature',
    icon: '🦁',
    emojis: [
      '🦁', '🐯', '🐻', '🐼', '🐨', '🐵', '🐒', '🐶', '🐱', '🦊',
      '🐰', '🐸', '🦎', '🐊', '🐢', '🦖', '🦕', '🦈', '🐬', '🐙',
      '🦑', '🐠', '🦀', '🦋', '🐝', '🦩', '🦅', '🦉', '🦇', '🦘',
      '🌲', '🌴', '🌵', '🌺', '🌸', '🌻', '🍁', '🌋', '🌊', '⚡'
    ],
  },
  {
    id: 'food',
    name: 'Food & Treats',
    icon: '🍕',
    emojis: [
      '🍕', '🍔', '🍟', '🌭', '🍿', '🥓', '🍳', '🥞', '🧇', '🧀',
      '🥩', '🍗', '🌮', '🌯', '🍣', '🍱', '🍙', '🥟', '🍜', '🍝',
      '🍨', '🍦', '🍰', '🎂', '🍩', '🍪', '🍫', '🍬', '🍭', '☕',
      '🧋', '🥤', '🍺', '🍷', '🍸', '🍹', '🍎', '🍌', '🥑', '🍓'
    ],
  },
  {
    id: 'activities',
    name: 'Activities & Sports',
    icon: '⚽',
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🥊', '🥋', '🤿', '🏊',
      '🏄', '🚴', '🧗', '🎮', '🕹️', '🎲', '🎳', '🎯', '🎸', '🎹',
      '🥁', '🎺', '🎻', '🎤', '🎧', '🎨', '🎬', '🎭', '🎪', '🎢',
      '🎠', '🎡', '🏆', '🥇', '🎟️', '🎫', '⛺', '🎣', '🛹', '⛸️'
    ],
  },
  {
    id: 'travel',
    name: 'Travel & Places',
    icon: '🚀',
    emojis: [
      '🚀', '🛸', '🛰️', '✈️', '🚁', '🚗', '🚕', '🏎️', '🚓', '🚑',
      '🚒', '🚌', '🚂', '🚆', '🚢', '⛵', '🛥️', '🚤', '🏍️', '🚲',
      '🏰', '🏯', '🏚️', '🏠', '🏡', '🏢', '🏨', '🏖️', '🏝️', '🏜️',
      '🏔️', '🗻', '🗽', '🗼', '🎪', '🌌', '🌃', '🌆', '🏙️', '🗺️'
    ],
  },
  {
    id: 'objects',
    name: 'Objects & Magic',
    icon: '💎',
    emojis: [
      '💎', '👑', '💍', '🔮', '🪄', '⚔️', '🛡️', '🏹', '💣', '🧨',
      '🗝️', '🔑', '🚪', '📜', '📖', '📱', '💻', '📷', '💡', '🔦',
      '🕯️', '🧲', '💊', '💉', '🧪', '🧬', '🔬', '🔭', '🎁', '🎈',
      '💰', '💵', '📦', '🛒', '👓', '🕶️', '👒', '👞', '👠', '👑'
    ],
  },
  {
    id: 'symbols',
    name: 'Symbols & Weather',
    icon: '⭐',
    emojis: [
      '⭐', '🌟', '✨', '⚡', '💥', '☀️', '🌙', '☁️', '🌧️', '⛈️',
      '❄️', '⛄', '💨', '🌪️', '🌈', '⏳', '🕰️', '⏰', '💤', '🛑',
      '🚫', '❓', '❗', '⭕', '❌', '🎵', '🎶', '🔊', '🔔', '📣'
    ],
  },
];

export const EmojiPickerDrawer: React.FC<EmojiPickerDrawerProps> = ({
  onSendClue,
  suggestedEmojis = [],
  disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState<string>('smileys');
  const [stagedEmojis, setStagedEmojis] = useState<string[]>([]);

  const addEmoji = (emoji: string) => {
    if (stagedEmojis.length >= 8) return;
    setStagedEmojis(prev => [...prev, emoji]);
  };

  const removeLastEmoji = () => {
    setStagedEmojis(prev => prev.slice(0, -1));
  };

  const clearStaged = () => {
    setStagedEmojis([]);
  };

  const handleSend = () => {
    if (stagedEmojis.length === 0 || disabled) return;
    const clueText = stagedEmojis.join(' ');
    onSendClue(clueText);
    setStagedEmojis([]);
  };

  const displayedEmojis = useMemo(() => {
    const currentCategory = CATEGORIES.find(c => c.id === activeTab);
    return currentCategory ? currentCategory.emojis : CATEGORIES[0].emojis;
  }, [activeTab]);

  return (
    <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Your Emoji Clue:
          </span>

          <div className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 min-h-[44px] flex items-center gap-1.5 overflow-x-auto shadow-inner">
            {stagedEmojis.length > 0 ? (
              stagedEmojis.map((em, idx) => (
                <span
                  key={idx}
                  className="text-2xl animate-pop hover:scale-125 transition-transform cursor-pointer select-none"
                  title="Click backspace to remove"
                >
                  {em}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">
                Click emojis below to build your clue...
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {stagedEmojis.length > 0 && (
            <>
              <button
                type="button"
                onClick={removeLastEmoji}
                title="Backspace"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <Delete className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={clearStaged}
                title="Clear All"
                className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleSend}
            disabled={stagedEmojis.length === 0 || disabled}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            <Send className="w-3.5 h-3.5 fill-slate-950" />
            Send Clue
          </button>
        </div>
      </div>

      {suggestedEmojis.length > 0 && (
        <div className="flex items-center gap-2 bg-indigo-950/40 border border-indigo-500/20 rounded-xl px-3 py-2">
          <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Ideas for this word:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {suggestedEmojis.map((em, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => addEmoji(em)}
                className="px-2 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-400/30 text-lg hover:scale-125 transition-transform"
                title="Add to clue"
              >
                {em}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === cat.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span className="hidden sm:inline">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 max-h-48 overflow-y-auto">
        <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1.5">
          {displayedEmojis.map((em, idx) => (
            <button
              key={`${em}_${idx}`}
              type="button"
              onClick={() => addEmoji(em)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-xl hover:bg-slate-800 hover:scale-125 active:scale-95 transition-transform cursor-pointer select-none"
            >
              {em}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
