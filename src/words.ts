export interface WordEntry {
  word: string;
  category: string;
  hint?: string;
  suggestedEmojis?: string[];
}

export const WORD_BANK: WordEntry[] = [
  // Movies & TV
  { word: "The Lion King", category: "Movies & TV", suggestedEmojis: ["🦁", "👑", "🌅", "🐗", "🐒"] },
  { word: "Titanic", category: "Movies & TV", suggestedEmojis: ["🚢", "🧊", "🌊", "💔", "💎"] },
  { word: "Harry Potter", category: "Movies & TV", suggestedEmojis: ["⚡", "🧙", "👓", "🧹", "🦉"] },
  { word: "Spider-Man", category: "Movies & TV", suggestedEmojis: ["🕷️", "🕸️", "🦸", "🏙️", "🤟"] },
  { word: "Jurassic Park", category: "Movies & TV", suggestedEmojis: ["🦖", "🌴", "🚙", "🦕", "🏃"] },
  { word: "Frozen", category: "Movies & TV", suggestedEmojis: ["❄️", "⛄", "👸", "🏰", "👑"] },
  { word: "Star Wars", category: "Movies & TV", suggestedEmojis: ["⭐", "⚔️", "🌌", "🤖", "🚀"] },
  { word: "Finding Nemo", category: "Movies & TV", suggestedEmojis: ["🐠", "🌊", "🦈", "🤿", "🪸"] },
  { word: "Ghostbusters", category: "Movies & TV", suggestedEmojis: ["👻", "🚫", "🔫", "🏙️", "😱"] },
  { word: "The Matrix", category: "Movies & TV", suggestedEmojis: ["💊", "🕶️", "💻", "🟢", "🥋"] },
  { word: "Up", category: "Movies & TV", suggestedEmojis: ["🎈", "🏠", "👴", "👦", "🐕"] },
  { word: "Pirates of the Caribbean", category: "Movies & TV", suggestedEmojis: ["🏴‍☠️", "⚔️", "🦜", "⛵", "🪙"] },
  { word: "Toy Story", category: "Movies & TV", suggestedEmojis: ["🤠", "🚀", "🧸", "🦖", "📦"] },
  { word: "Shrek", category: "Movies & TV", suggestedEmojis: ["🟢", "🧅", "🫏", "🏰", "🐉"] },
  { word: "Batman", category: "Characters", suggestedEmojis: ["🦇", "🌃", "🚗", "🦸", "🃏"] },

  // Characters & Heroes
  { word: "Santa Claus", category: "Characters", suggestedEmojis: ["🎅", "🎄", "🎁", "🦌", "❄️"] },
  { word: "Dracula", category: "Characters", suggestedEmojis: ["🧛", "🩸", "🦇", "⚰️", "🌙"] },
  { word: "Pikachu", category: "Characters", suggestedEmojis: ["⚡", "🐭", "🟡", "🔴", "🎮"] },
  { word: "Super Mario", category: "Characters", suggestedEmojis: ["🍄", "👨‍🦰", "⭐", "🐢", "🔧"] },
  { word: "Sherlock Holmes", category: "Characters", suggestedEmojis: ["🕵️", "🔍", "🎻", "🇬🇧", "📜"] },
  { word: "Alien", category: "Characters", suggestedEmojis: ["👽", "🛸", "🌌", "👾", "✨"] },
  { word: "Zombie", category: "Characters", suggestedEmojis: ["🧟", "🧠", "💀", "⚰️", "🏃"] },
  { word: "Mermaid", category: "Characters", suggestedEmojis: ["🧜‍♀️", "🌊", "🐠", "🐚", "🧜‍♂️"] },
  { word: "Astronaut", category: "Characters", suggestedEmojis: ["👨‍🚀", "🚀", "🌕", "⭐", "🛰️"] },
  { word: "Ninja", category: "Characters", suggestedEmojis: ["🥷", "⚔️", "🌙", "💨", "🥋"] },

  // Food & Treats
  { word: "Pizza Party", category: "Food & Drinks", suggestedEmojis: ["🍕", "🎉", "🧀", "🥤", "🥳"] },
  { word: "Ice Cream Sundae", category: "Food & Drinks", suggestedEmojis: ["🍨", "🍒", "🍫", "🥄", "🍦"] },
  { word: "Bubble Tea", category: "Food & Drinks", suggestedEmojis: ["🧋", "🥤", "⚫", "🧃", "🧊"] },
  { word: "Taco Tuesday", category: "Food & Drinks", suggestedEmojis: ["🌮", "🥑", "🌶️", "📅", "🎉"] },
  { word: "Coffee Break", category: "Food & Drinks", suggestedEmojis: ["☕", "🥐", "⏰", "💼", "💤"] },
  { word: "Birthday Cake", category: "Food & Drinks", suggestedEmojis: ["🎂", "🕯️", "🎁", "🎈", "🍰"] },
  { word: "Sushi Roll", category: "Food & Drinks", suggestedEmojis: ["🍣", "🥢", "🍱", "🍙", "🐟"] },
  { word: "Popcorn", category: "Food & Drinks", suggestedEmojis: ["🍿", "🎬", "🧈", "🥤", "🎟️"] },
  { word: "Pancake Breakfast", category: "Food & Drinks", suggestedEmojis: ["🥞", "🍯", "🥓", "🍳", "☕"] },

  // Animals & Nature
  { word: "Chameleon", category: "Animals", suggestedEmojis: ["🦎", "🌈", "🌿", "👀", "🌳"] },
  { word: "Kangaroo", category: "Animals", suggestedEmojis: ["🦘", "🇦🇺", "🥊", "🦘", "🦘"] },
  { word: "Penguin", category: "Animals", suggestedEmojis: ["🐧", "❄️", "🧊", "🐟", "🌊"] },
  { word: "Shark Attack", category: "Animals", suggestedEmojis: ["🦈", "🌊", "🏊", "🩸", "😱"] },
  { word: "Flamingo", category: "Animals", suggestedEmojis: ["🦩", "🌸", "💖", "🏖️", "🩰"] },
  { word: "Honey Bee", category: "Animals", suggestedEmojis: ["🐝", "🍯", "🌻", "🌼", "🍯"] },
  { word: "Volcano Eruption", category: "Nature", suggestedEmojis: ["🌋", "🔥", "💨", "💥", "🪨"] },
  { word: "Thunderstorm", category: "Nature", suggestedEmojis: ["⛈️", "⚡", "🌧️", "💨", "☔"] },

  // Activities & Places
  { word: "Roller Coaster", category: "Fun Activities", suggestedEmojis: ["🎢", "😱", "🎪", "🎢", "🤢"] },
  { word: "Camping Trip", category: "Fun Activities", suggestedEmojis: ["⛺", "🔥", "🌲", "🌌", "🪵"] },
  { word: "Rock Concert", category: "Fun Activities", suggestedEmojis: ["🎸", "🤘", "🎤", "🥁", "🔊"] },
  { word: "Scuba Diving", category: "Fun Activities", suggestedEmojis: ["🤿", "🐠", "🌊", "🐡", "🏊"] },
  { word: "Karaoke Night", category: "Fun Activities", suggestedEmojis: ["🎤", "🎶", "🍻", "👯", "🌟"] },
  { word: "Basketball Game", category: "Sports", suggestedEmojis: ["🏀", "⛹️", "🏆", "👟", "⏱️"] },
  { word: "Haunted House", category: "Places", suggestedEmojis: ["🏚️", "👻", "🕸️", "😱", "🦇"] },
  { word: "Time Machine", category: "Fantasy", suggestedEmojis: ["⏳", "🕰️", "🚀", "⚡", "🌀"] },
  { word: "Treasure Hunt", category: "Adventure", suggestedEmojis: ["🗺️", "🏴‍☠️", "💎", "💰", "🗝️"] },
  { word: "Fireworks Show", category: "Celebration", suggestedEmojis: ["🎆", "🎇", "✨", "🌃", "🎆"] }
];

export function getRandomWord(): WordEntry {
  const index = Math.floor(Math.random() * WORD_BANK.length);
  return WORD_BANK[index];
}

export function maskWord(word: string): string {
  return word.split('').map(char => {
    if (/[a-zA-Z0-9]/.test(char)) {
      return '_';
    }
    return char;
  }).join(' ');
}
