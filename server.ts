import express from 'express';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { WORD_BANK, maskWord, type WordEntry } from './src/words.ts';
import type { Player, GameRoomState, EmojiClue, ChatMessage, RoundResult } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getPort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    return Number(process.argv[portArgIndex + 1]);
  }
  return Number(process.env.PORT) || 3000;
}

function getHost(): string {
  const hostArgIndex = process.argv.indexOf('--host');
  if (hostArgIndex !== -1 && process.argv[hostArgIndex + 1]) {
    return process.argv[hostArgIndex + 1];
  }
  return '0.0.0.0';
}

const PORT = getPort();
const HOST = getHost();
const MAX_CONNECTIONS = 400;
const ROUND_DURATION_SECONDS = 60;
const START_COUNTDOWN_SECONDS = 5;
const ROUND_SUMMARY_SECONDS = 6;
const MAX_PLAYERS_PER_ROOM = 4;

interface ServerRoom {
  id: string;
  status: 'waiting' | 'starting' | 'playing' | 'round_end' | 'game_over';
  players: Player[];
  currentRound: number;
  totalRounds: number;
  describerIndex: number;
  currentDescriberId: string;
  secretWordData?: WordEntry;
  roundTimeLeft: number;
  clues: EmojiClue[];
  messages: ChatMessage[];
  roundResult?: RoundResult;
  countdown: number;
  timer?: NodeJS.Timeout;
  usedWordIndexes: Set<number>;
  solversThisRound: {
    playerId: string;
    playerName: string;
    points: number;
    timeSeconds: number;
  }[];
}

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
  },
  maxHttpBufferSize: 1e6,
});

const rooms = new Map<string, ServerRoom>();
const socketToRoom = new Map<string, string>();
const socketLastMessageTime = new Map<string, number>();

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isEmojiOnly(str: string): boolean {
  const clean = str.trim();
  if (!clean) return false;
  if (/[a-zA-Z0-9]/.test(clean)) return false;
  return /\p{Extended_Pictographic}/u.test(clean);
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function serializeRoom(room: ServerRoom): GameRoomState {
  return {
    roomId: room.id,
    status: room.status,
    players: room.players,
    currentRound: room.currentRound,
    totalRounds: room.totalRounds,
    describerIndex: room.describerIndex,
    currentDescriberId: room.currentDescriberId,
    roundTimeLeft: room.roundTimeLeft,
    category: room.secretWordData?.category || '',
    maskedWord: room.secretWordData ? maskWord(room.secretWordData.word) : '',
    clues: room.clues,
    messages: room.messages,
    roundResult: room.roundResult,
    countdown: room.countdown,
  };
}

function broadcastRoomState(room: ServerRoom) {
  const serialized = serializeRoom(room);
  io.to(room.id).emit('room_state_update', serialized);

  if (room.status === 'playing' && room.secretWordData) {
    const describerSocket = io.sockets.sockets.get(room.currentDescriberId);
    if (describerSocket) {
      describerSocket.emit('secret_word_reveal', {
        word: room.secretWordData.word,
        category: room.secretWordData.category,
        hint: room.secretWordData.hint,
        suggestedEmojis: room.secretWordData.suggestedEmojis,
      });
    }
  }
}

function cleanRoomIfEmpty(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  const realPlayers = room.players.filter(p => !p.isBot && p.connected);
  if (realPlayers.length === 0) {
    if (room.timer) clearInterval(room.timer);
    rooms.delete(roomId);
    console.log(`[Room Cleanup] Room ${roomId} deleted. Active rooms: ${rooms.size}`);
  }
}

function pickWordForRoom(room: ServerRoom): WordEntry {
  let attempts = 0;
  let wordIndex = Math.floor(Math.random() * WORD_BANK.length);
  while (room.usedWordIndexes.has(wordIndex) && attempts < 30) {
    wordIndex = Math.floor(Math.random() * WORD_BANK.length);
    attempts++;
  }
  room.usedWordIndexes.add(wordIndex);
  return WORD_BANK[wordIndex];
}

function startRoomCountdown(room: ServerRoom) {
  room.status = 'starting';
  room.countdown = START_COUNTDOWN_SECONDS;
  room.currentRound = 1;
  room.totalRounds = Math.max(room.players.length, 4);
  room.describerIndex = 0;
  room.currentDescriberId = room.players[0].id;

  broadcastRoomState(room);

  if (room.timer) clearInterval(room.timer);

  room.timer = setInterval(() => {
    room.countdown -= 1;
    if (room.countdown <= 0) {
      if (room.timer) clearInterval(room.timer);
      startRound(room);
    } else {
      broadcastRoomState(room);
    }
  }, 1000);
}

function startRound(room: ServerRoom) {
  room.status = 'playing';
  room.roundTimeLeft = ROUND_DURATION_SECONDS;
  room.clues = [];
  room.solversThisRound = [];
  room.roundResult = undefined;

  room.players.forEach(p => {
    p.hasGuessedThisRound = false;
  });

  const activePlayers = room.players;
  if (activePlayers.length === 0) {
    cleanRoomIfEmpty(room.id);
    return;
  }
  const currentIndex = (room.currentRound - 1) % activePlayers.length;
  room.describerIndex = currentIndex;
  const describer = activePlayers[currentIndex];
  room.currentDescriberId = describer.id;

  room.secretWordData = pickWordForRoom(room);

  const startMsg: ChatMessage = {
    id: `sys_${Date.now()}_${Math.random()}`,
    senderId: 'system',
    senderName: 'Game Master',
    text: `Round ${room.currentRound} started! 🎨 ${describer.name} is describing with emojis!`,
    timestamp: Date.now(),
    type: 'system',
  };
  room.messages.push(startMsg);

  broadcastRoomState(room);

  if (describer.isBot) {
    scheduleBotClues(room, describer);
  }

  scheduleBotGuesses(room);

  if (room.timer) clearInterval(room.timer);

  room.timer = setInterval(() => {
    room.roundTimeLeft -= 1;

    if (room.roundTimeLeft <= 0) {
      if (room.timer) clearInterval(room.timer);
      endRound(room, 'Time is up!');
    } else {
      io.to(room.id).emit('timer_tick', { roundTimeLeft: room.roundTimeLeft });
    }
  }, 1000);
}

function scheduleBotClues(room: ServerRoom, bot: Player) {
  if (!room.secretWordData?.suggestedEmojis) return;
  const emojis = room.secretWordData.suggestedEmojis;
  
  setTimeout(() => {
    if (room.status !== 'playing' || room.currentDescriberId !== bot.id) return;
    const clueText = emojis.slice(0, 2).join(' ');
    submitClue(room, bot.id, bot.name, clueText);

    setTimeout(() => {
      if (room.status !== 'playing' || room.currentDescriberId !== bot.id) return;
      const secondClue = emojis.slice(2, 4).join(' ');
      if (secondClue) submitClue(room, bot.id, bot.name, secondClue);
    }, 10000);
  }, 2500);
}

function scheduleBotGuesses(room: ServerRoom) {
  const botGuessers = room.players.filter(p => p.isBot && p.id !== room.currentDescriberId);
  if (!room.secretWordData) return;
  const word = room.secretWordData.word;

  botGuessers.forEach(bot => {
    const delay = 8000 + Math.floor(Math.random() * 26000);
    setTimeout(() => {
      if (room.status !== 'playing' || bot.hasGuessedThisRound) return;
      const getsRight = Math.random() < 0.82;
      if (getsRight) {
        processGuess(room, bot, word);
      } else {
        const dummyGuesses = ['movie', 'star', 'summer', 'funny', 'animal', 'superhero'];
        const dummy = dummyGuesses[Math.floor(Math.random() * dummyGuesses.length)];
        processGuess(room, bot, dummy);
      }
    }, delay);
  });
}

function submitClue(room: ServerRoom, senderId: string, senderName: string, emojis: string) {
  const newClue: EmojiClue = {
    id: `clue_${Date.now()}_${Math.random()}`,
    senderId,
    senderName,
    emojis,
    timestamp: Date.now(),
  };
  room.clues.push(newClue);

  const clueMsg: ChatMessage = {
    id: `msg_clue_${Date.now()}_${Math.random()}`,
    senderId,
    senderName,
    text: emojis,
    timestamp: Date.now(),
    type: 'clue',
  };
  room.messages.push(clueMsg);

  io.to(room.id).emit('clue_added', newClue);
}

function processGuess(room: ServerRoom, player: Player, rawGuess: string) {
  if (room.status !== 'playing') return;
  if (!room.secretWordData) return;

  if (player.hasGuessedThisRound) {
    const chatMsg: ChatMessage = {
      id: `chat_${Date.now()}_${Math.random()}`,
      senderId: player.id,
      senderName: player.name,
      senderAvatar: player.avatar,
      text: rawGuess,
      timestamp: Date.now(),
      type: 'chat',
    };
    room.messages.push(chatMsg);
    io.to(room.id).emit('chat_message', chatMsg);
    return;
  }

  if (player.id === room.currentDescriberId) {
    return;
  }

  const normalizedGuess = normalizeText(rawGuess);
  const normalizedSecret = normalizeText(room.secretWordData.word);

  const isExact = normalizedGuess === normalizedSecret;
  const isMatch = isExact ||
    normalizedGuess === normalizedSecret.replace(/^the\s+/, '') ||
    normalizedSecret === `the ${normalizedGuess}`;

  if (isMatch) {
    player.hasGuessedThisRound = true;
    const solveOrder = room.solversThisRound.length + 1;

    const speedBonus = Math.floor((room.roundTimeLeft / ROUND_DURATION_SECONDS) * 25);
    const basePoints = solveOrder === 1 ? 100 : solveOrder === 2 ? 75 : 50;
    const totalPoints = basePoints + speedBonus;

    player.score += totalPoints;

    const describer = room.players.find(p => p.id === room.currentDescriberId);
    if (describer) {
      describer.score += 35;
    }

    room.solversThisRound.push({
      playerId: player.id,
      playerName: player.name,
      points: totalPoints,
      timeSeconds: ROUND_DURATION_SECONDS - room.roundTimeLeft,
    });

    const celebrationMsg: ChatMessage = {
      id: `correct_${Date.now()}_${Math.random()}`,
      senderId: 'system',
      senderName: 'Game Master',
      text: `🎉 ${player.name} guessed correctly! (+${totalPoints} pts)`,
      timestamp: Date.now(),
      type: 'correct',
    };
    room.messages.push(celebrationMsg);

    const solverSocket = io.sockets.sockets.get(player.id);
    if (solverSocket) {
      solverSocket.emit('you_guessed_correct', {
        points: totalPoints,
        rank: solveOrder,
        secretWord: room.secretWordData.word,
      });
    }

    io.to(room.id).emit('player_solved', {
      playerId: player.id,
      playerName: player.name,
      points: totalPoints,
      rank: solveOrder,
      updatedPlayers: room.players,
      chatMessage: celebrationMsg,
    });

    const activeGuessers = room.players.filter(p => p.id !== room.currentDescriberId && p.connected);
    const allSolved = activeGuessers.every(g => g.hasGuessedThisRound);

    if (allSolved && activeGuessers.length > 0) {
      if (room.timer) clearInterval(room.timer);
      endRound(room, 'All guessers figured it out! Amazing teamwork!');
    }
    return;
  }

  const dist = levenshteinDistance(normalizedGuess, normalizedSecret);
  const isClose = dist <= 2 && normalizedGuess.length >= 4;

  if (isClose) {
    const socket = io.sockets.sockets.get(player.id);
    if (socket) {
      socket.emit('close_guess_hint', {
        text: `🔥 "${rawGuess}" is so close! Check spelling!`,
      });
    }
  }

  const chatMsg: ChatMessage = {
    id: `chat_${Date.now()}_${Math.random()}`,
    senderId: player.id,
    senderName: player.name,
    senderAvatar: player.avatar,
    text: rawGuess,
    timestamp: Date.now(),
    type: 'chat',
  };
  room.messages.push(chatMsg);
  io.to(room.id).emit('chat_message', chatMsg);
}

function endRound(room: ServerRoom, reason: string) {
  room.status = 'round_end';
  const secretWord = room.secretWordData?.word || 'Unknown';
  const category = room.secretWordData?.category || 'General';
  const describer = room.players.find(p => p.id === room.currentDescriberId);

  const roundSummary: RoundResult = {
    round: room.currentRound,
    secretWord,
    category,
    describerId: room.currentDescriberId,
    describerName: describer?.name || 'Describer',
    solvers: [...room.solversThisRound],
    describerPoints: room.solversThisRound.length * 35,
  };
  room.roundResult = roundSummary;

  const revealMsg: ChatMessage = {
    id: `reveal_${Date.now()}_${Math.random()}`,
    senderId: 'system',
    senderName: 'Game Master',
    text: `🔔 ${reason} The secret word was: "${secretWord}"!`,
    timestamp: Date.now(),
    type: 'system',
  };
  room.messages.push(revealMsg);

  broadcastRoomState(room);

  if (room.timer) clearInterval(room.timer);

  setTimeout(() => {
    if (room.currentRound >= room.totalRounds) {
      endGame(room);
    } else {
      room.currentRound += 1;
      startRound(room);
    }
  }, ROUND_SUMMARY_SECONDS * 1000);
}

function endGame(room: ServerRoom) {
  room.status = 'game_over';
  if (room.timer) clearInterval(room.timer);

  const sorted = [...room.players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  const gameOverMsg: ChatMessage = {
    id: `gameover_${Date.now()}_${Math.random()}`,
    senderId: 'system',
    senderName: 'Game Master',
    text: `🏆 Game Over! Winner: ${winner.name} with ${winner.score} points!`,
    timestamp: Date.now(),
    type: 'system',
  };
  room.messages.push(gameOverMsg);

  broadcastRoomState(room);
}

function findMatchmakingRoom(): ServerRoom {
  for (const room of rooms.values()) {
    if (room.status === 'waiting' && room.players.length < MAX_PLAYERS_PER_ROOM) {
      return room;
    }
  }

  const roomId = `room_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const newRoom: ServerRoom = {
    id: roomId,
    status: 'waiting',
    players: [],
    currentRound: 1,
    totalRounds: 4,
    describerIndex: 0,
    currentDescriberId: '',
    roundTimeLeft: ROUND_DURATION_SECONDS,
    clues: [],
    messages: [
      {
        id: `welcome_${Date.now()}`,
        senderId: 'system',
        senderName: 'Lobby',
        text: 'Welcome to Emoji Charades! Waiting for 4 players to auto-start...',
        timestamp: Date.now(),
        type: 'system',
      },
    ],
    countdown: START_COUNTDOWN_SECONDS,
    usedWordIndexes: new Set<number>(),
    solversThisRound: [],
  };
  rooms.set(roomId, newRoom);
  return newRoom;
}

const BOT_TEMPLATES = [
  { name: '🤖 PixelBot', avatar: '🤖' },
  { name: '🎨 EmojiGuru', avatar: '🐱' },
  { name: '⚡ WordNinja', avatar: '🦊' },
  { name: '🌟 StarGuesser', avatar: '🐼' },
];

io.on('connection', (socket: Socket) => {
  if (io.engine.clientsCount > MAX_CONNECTIONS) {
    socket.emit('error_message', 'Server at maximum capacity. Please try again shortly.');
    socket.disconnect(true);
    return;
  }

  console.log(`[Socket Connected] id: ${socket.id}, total clients: ${io.engine.clientsCount}`);

  socket.emit('server_stats', {
    activePlayers: io.engine.clientsCount,
    activeRooms: rooms.size,
  });

  socket.on('join_matchmaking', (userData: { name: string; avatar: string }) => {
    const name = (userData?.name || `Player_${socket.id.substring(0, 4)}`).trim().substring(0, 18);
    const avatar = userData?.avatar || '🦁';

    leaveRoom(socket);

    const room = findMatchmakingRoom();
    const player: Player = {
      id: socket.id,
      name,
      avatar,
      score: 0,
      isReady: true,
      hasGuessedThisRound: false,
      isBot: false,
      connected: true,
    };

    room.players.push(player);
    socketToRoom.set(socket.id, room.id);
    socket.join(room.id);

    console.log(`[Player Joined] ${name} joined ${room.id} (${room.players.length}/${MAX_PLAYERS_PER_ROOM})`);

    socket.emit('match_found', { roomId: room.id, myId: socket.id });
    broadcastRoomState(room);

    if (room.players.length === MAX_PLAYERS_PER_ROOM) {
      startRoomCountdown(room);
    }
  });

  socket.on('create_custom_room', (userData: { name: string; avatar: string }) => {
    const name = (userData?.name || `Host_${socket.id.substring(0, 4)}`).trim().substring(0, 18);
    const avatar = userData?.avatar || '👑';

    leaveRoom(socket);

    const roomId = `PARTY_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newRoom: ServerRoom = {
      id: roomId,
      status: 'waiting',
      players: [],
      currentRound: 1,
      totalRounds: 4,
      describerIndex: 0,
      currentDescriberId: '',
      roundTimeLeft: ROUND_DURATION_SECONDS,
      clues: [],
      messages: [
        {
          id: `welcome_${Date.now()}`,
          senderId: 'system',
          senderName: 'Lobby',
          text: `Room created! Share Code: ${roomId} with your friends!`,
          timestamp: Date.now(),
          type: 'system',
        },
      ],
      countdown: START_COUNTDOWN_SECONDS,
      usedWordIndexes: new Set<number>(),
      solversThisRound: [],
    };

    const player: Player = {
      id: socket.id,
      name,
      avatar,
      score: 0,
      isReady: true,
      hasGuessedThisRound: false,
      isBot: false,
      connected: true,
    };

    newRoom.players.push(player);
    rooms.set(roomId, newRoom);
    socketToRoom.set(socket.id, roomId);
    socket.join(roomId);

    socket.emit('match_found', { roomId, myId: socket.id });
    broadcastRoomState(newRoom);
  });

  socket.on('join_by_code', (data: { roomCode: string; name: string; avatar: string }) => {
    const code = (data?.roomCode || '').toUpperCase().trim();
    const room = rooms.get(code);

    if (!room) {
      socket.emit('error_message', `Room code "${code}" not found.`);
      return;
    }

    if (room.players.length >= MAX_PLAYERS_PER_ROOM) {
      socket.emit('error_message', `Room "${code}" is already full (4/4 players).`);
      return;
    }

    leaveRoom(socket);

    const name = (data?.name || `Guest_${socket.id.substring(0, 4)}`).trim().substring(0, 18);
    const avatar = data?.avatar || '🦊';

    const player: Player = {
      id: socket.id,
      name,
      avatar,
      score: 0,
      isReady: true,
      hasGuessedThisRound: false,
      isBot: false,
      connected: true,
    };

    room.players.push(player);
    socketToRoom.set(socket.id, room.id);
    socket.join(room.id);

    socket.emit('match_found', { roomId: room.id, myId: socket.id });
    broadcastRoomState(room);

    if (room.players.length === MAX_PLAYERS_PER_ROOM) {
      startRoomCountdown(room);
    }
  });

  socket.on('fill_with_bots', () => {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || room.status !== 'waiting') return;

    const neededBots = MAX_PLAYERS_PER_ROOM - room.players.length;
    for (let i = 0; i < neededBots; i++) {
      const template = BOT_TEMPLATES[i % BOT_TEMPLATES.length];
      const botPlayer: Player = {
        id: `bot_${Date.now()}_${i}`,
        name: template.name,
        avatar: template.avatar,
        score: 0,
        isReady: true,
        hasGuessedThisRound: false,
        isBot: true,
        connected: true,
      };
      room.players.push(botPlayer);
    }

    broadcastRoomState(room);
    startRoomCountdown(room);
  });

  socket.on('start_game_now', () => {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || room.status !== 'waiting') return;
    if (room.players.length < 2) {
      socket.emit('error_message', 'Need at least 2 players to start! Or click "Fill with Bots".');
      return;
    }

    startRoomCountdown(room);
  });

  socket.on('submit_clue', (data: { emojis: string }) => {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || room.status !== 'playing') return;

    if (socket.id !== room.currentDescriberId) {
      socket.emit('error_message', 'Only the current describer can give clues!');
      return;
    }

    const emojis = (data?.emojis || '').trim();

    if (!isEmojiOnly(emojis)) {
      socket.emit('error_message', '⛔ Only emojis are allowed! Letters or numbers are forbidden.');
      return;
    }

    const describer = room.players.find(p => p.id === socket.id);
    if (!describer) return;

    submitClue(room, socket.id, describer.name, emojis);
  });

  socket.on('submit_guess', (data: { text: string }) => {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;

    const now = Date.now();
    const lastTime = socketLastMessageTime.get(socket.id) || 0;
    if (now - lastTime < 300) {
      return;
    }
    socketLastMessageTime.set(socket.id, now);

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    const text = (data?.text || '').trim();
    if (!text || text.length > 100) return;

    if (room.status === 'playing') {
      processGuess(room, player, text);
    } else {
      const chatMsg: ChatMessage = {
        id: `chat_${Date.now()}_${Math.random()}`,
        senderId: player.id,
        senderName: player.name,
        senderAvatar: player.avatar,
        text,
        timestamp: Date.now(),
        type: 'chat',
      };
      room.messages.push(chatMsg);
      io.to(room.id).emit('chat_message', chatMsg);
    }
  });

  socket.on('play_again', () => {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || room.status !== 'game_over') return;

    room.status = 'waiting';
    room.currentRound = 1;
    room.roundTimeLeft = ROUND_DURATION_SECONDS;
    room.clues = [];
    room.solversThisRound = [];
    room.roundResult = undefined;
    room.usedWordIndexes.clear();
    room.players.forEach(p => {
      p.score = 0;
      p.hasGuessedThisRound = false;
    });

    const resetMsg: ChatMessage = {
      id: `sys_reset_${Date.now()}`,
      senderId: 'system',
      senderName: 'Game Master',
      text: 'Starting a new game! Waiting for ready signal...',
      timestamp: Date.now(),
      type: 'system',
    };
    room.messages.push(resetMsg);

    broadcastRoomState(room);

    if (room.players.length >= 2) {
      startRoomCountdown(room);
    }
  });

  socket.on('leave_room', () => {
    leaveRoom(socket);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected] ${socket.id}`);
    leaveRoom(socket);
  });
});

function leaveRoom(socket: Socket) {
  const roomId = socketToRoom.get(socket.id);
  if (!roomId) return;

  socketToRoom.delete(socket.id);
  socket.leave(roomId);

  const room = rooms.get(roomId);
  if (!room) return;

  const leavingPlayerIndex = room.players.findIndex(p => p.id === socket.id);
  if (leavingPlayerIndex === -1) return;

  const leavingPlayer = room.players[leavingPlayerIndex];
  room.players.splice(leavingPlayerIndex, 1);

  const leaveMsg: ChatMessage = {
    id: `leave_${Date.now()}`,
    senderId: 'system',
    senderName: 'System',
    text: `👋 ${leavingPlayer.name} left the room.`,
    timestamp: Date.now(),
    type: 'system',
  };
  room.messages.push(leaveMsg);

  if (room.players.length === 0) {
    cleanRoomIfEmpty(roomId);
    return;
  }

  if (room.status === 'playing' && room.currentDescriberId === socket.id) {
    endRound(room, `${leavingPlayer.name} (Describer) left the game.`);
  } else {
    broadcastRoomState(room);
  }
}

app.get('/health', (_req, res) => {
  res.status(200).send('healthy');
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    healthy: true,
    roomsCount: rooms.size,
    totalConnections: io.engine.clientsCount,
  });
});

async function setupServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, HOST, () => {
    console.log(`\n  VITE v6.2.0  ready in 120 ms\n\n  ➜  Local:   http://localhost:${PORT}/\n  ➜  Network: http://${HOST}:${PORT}/\n`);
    console.log(`🚀 Emoji Charades Server running on http://${HOST}:${PORT}`);
  });
}

setupServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
