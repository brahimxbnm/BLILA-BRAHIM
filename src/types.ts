export type PlayerRole = 'describer' | 'guesser' | 'spectator';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  isReady: boolean;
  hasGuessedThisRound: boolean;
  isBot?: boolean;
  connected: boolean;
}

export type RoomStatus = 'waiting' | 'starting' | 'playing' | 'round_end' | 'game_over';

export interface EmojiClue {
  id: string;
  senderId: string;
  senderName: string;
  emojis: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: number;
  type: 'chat' | 'system' | 'correct' | 'close' | 'clue';
}

export interface SecretWordData {
  word: string;
  category: string;
  hint?: string;
  maskedWord: string;
}

export interface RoundResult {
  round: number;
  secretWord: string;
  category: string;
  describerId: string;
  describerName: string;
  solvers: {
    playerId: string;
    playerName: string;
    points: number;
    timeSeconds: number;
  }[];
  describerPoints: number;
}

export interface GameRoomState {
  roomId: string;
  status: RoomStatus;
  players: Player[];
  currentRound: number;
  totalRounds: number;
  describerIndex: number;
  currentDescriberId: string;
  roundTimeLeft: number;
  category: string;
  maskedWord: string;
  clues: EmojiClue[];
  messages: ChatMessage[];
  roundResult?: RoundResult;
  countdown: number;
}

export interface ClientGameState extends GameRoomState {
  myId: string;
  secretWord?: string;
  isDescriber: boolean;
}
