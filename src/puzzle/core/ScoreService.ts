import type { Difficulty } from '../types/chess';

const DIFFICULTY_BONUS: Record<Difficulty, number> = {
  easy: 0,
  medium: 25,
  hard: 50,
};

export class ScoreService {
  private static readonly BASE_REWARD = 100;
  private static readonly HINT_REWARD = 50;
  private static readonly SPEED_BONUS = 25;
  private static readonly SPEED_THRESHOLD_MS = 15000;

  computePuzzleScore(difficulty: Difficulty, hintUsed: boolean, solveDurationMs: number): number {
    const base = hintUsed ? ScoreService.HINT_REWARD : ScoreService.BASE_REWARD;
    const difficultyBonus = DIFFICULTY_BONUS[difficulty];
    const speedBonus = solveDurationMs < ScoreService.SPEED_THRESHOLD_MS ? ScoreService.SPEED_BONUS : 0;
    return base + difficultyBonus + speedBonus;
  }
}

export const scoreService = new ScoreService();
