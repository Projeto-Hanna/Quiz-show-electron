export type MultiplayerPlayer = {
  id: string;
  name: string;
  score: number;
  connected?: boolean;
  answered?: boolean;
  lastAnswerCorrect?: boolean;
  lastAnswerPoints?: number;
  playerToken?: string; // Only sent in join_room callback
};

export type LobbySummary = {
  roomId: string;
  status:
    | 'LOBBY'
    | 'COUNTDOWN'
    | 'QUESTION'
    | 'ROUND_RESULT'
    | 'SCOREBOARD'
    | 'FINISHED';
  playerCount: number;
  maxPlayers: number;
  totalQuestions: number;
  timePerQuestion: number;
  players: MultiplayerPlayer[];
};

/** Lobby summary without the player list, sent with incremental roster events. */
export type LobbyCounts = Omit<LobbySummary, 'players'>;

export type MultiplayerQuestion = {
  index: number;
  total: number;
  question: string;
  options: string[];
  answer?: number; // Only sent to host
  timeLimit: number;
  startedAt: number;
};

export type ScoreboardEntry = {
  rank: number;
  id: string;
  name: string;
  score: number;
  answered?: boolean;
  lastAnswerCorrect?: boolean;
  lastAnswerPoints?: number;
};

export type RoundResult = {
  questionIndex: number;
  correctAnswerIndex: number | null;
  playerResults: {
    id: string;
    name: string;
    answered: boolean;
    isCorrect: boolean;
    optionIndex: number | null;
    pointsEarned: number;
    totalScore: number;
  }[];
  hasMoreQuestions: boolean;
};

export type RoomSyncState = {
  status: LobbySummary['status'];
  currentQuestion?: MultiplayerQuestion | null;
  answeredCount?: number;
  remainingMs?: number;
  playerAnswered?: boolean;
  playerSelectedOption?: number | null;
  roundResult?: RoundResult | null;
  scoreboard?: ScoreboardEntry[];
  currentIndex: number;
  totalQuestions: number;
  hasMoreQuestions: boolean;
};
