export type Color = 'w' | 'b';
export type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';

export interface Piece {
  color: Color;
  type: PieceType;
}

export type Cell = Piece | null;
export type BoardMatrix = Cell[][];

export interface Coordinate {
  row: number;
  col: number;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface SolutionStep {
  from: string;
  to: string;
  notation: string;
  promotion?: PieceType;
}

export interface Puzzle {
  id: number;
  title: string;
  subtitle: string;
  year: string;
  difficulty: Difficulty;
  turn: Color;
  desc: string;
  hint: string;
  fen: string;
  solution: SolutionStep[];
  setupMove?: SolutionStep;
}

export type FeedbackType = 'idle' | 'correct' | 'wrong' | 'legal-wrong' | 'done';

export interface MoveHistoryEntry {
  index: number;
  notation: string;
  side: 'player' | 'opponent';
  sideLabel: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold';
}

export interface PlayerProgress {
  totalSolved: number;
  bestStreak: number;
  bestScore: number;
  fastestSolveMs: number | null;
  unlockedAchievements: string[];
  soundEnabled: boolean;
  theme: 'parchment' | 'midnight';
  lastDailyChallengeDate: string | null;
  dailyChallengeStreak: number;
}
