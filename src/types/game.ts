export interface Player {
  id: string;
  userId?: string;
  username: string;
  isHost: boolean;
  isReady: boolean;
  isEliminated: boolean;
  hasVoted: boolean;
  readyForVoting?: boolean;
  readyForNextRound?: boolean;
}

export interface GameState {
  phase: 'lobby' | 'word-reveal' | 'discussion' | 'voting' | 'results' | 'word-time-countdown' | 'word-time-speaking' | 'word-time-waiting';
  speakingOrder: string[] | null;
  currentSpeaker?: string;
  timeRemaining?: number;
  roundNumber?: number;
}

export interface LobbySettings {
  randomOrder: boolean;
  twoImposters: boolean;
  threeImposters: boolean;
  imposterHint: boolean;
  wordTimeMode: boolean;
  survivalMode: boolean;
  wordTimeSeconds: number; // New setting for word time duration
}

export interface LobbyData {
  players: Player[];
  gameState: GameState;
  settings?: LobbySettings;
}

export interface VoteCount {
  [playerId: string]: number;
}

export interface User {
  id: string;
  username: string;
  gamesPlayed: number;
  timesImposter: number;
  imposterWins: number;
}