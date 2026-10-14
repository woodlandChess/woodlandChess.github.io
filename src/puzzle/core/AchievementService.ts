import type { Achievement, PlayerProgress } from '../types/chess';

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-blood', title: 'First Rite', description: 'Solve your first puzzle.', icon: 'seal', tier: 'bronze' },
  { id: 'streak-5', title: 'Unbroken Line', description: 'Reach a streak of five puzzles solved in a row.', icon: 'flame', tier: 'silver' },
  { id: 'no-hints', title: 'Silent Reading', description: 'Solve a puzzle without requesting a hint.', icon: 'scroll', tier: 'bronze' },
  { id: 'speed-solver', title: 'Quick Hand', description: 'Solve a puzzle in under fifteen seconds.', icon: 'hourglass', tier: 'silver' },
  { id: 'grandmaster', title: 'Grand Master', description: 'Complete every puzzle in a single sitting.', icon: 'crown', tier: 'gold' },
  { id: 'daily-devotion', title: 'Daily Devotion', description: 'Complete the Daily Challenge three days in a row.', icon: 'droplet', tier: 'gold' },
];

export interface AchievementContext {
  streak: number;
  solvedWithoutHint: boolean;
  solveDurationMs: number;
  allPuzzlesComplete: boolean;
  dailyChallengeStreak: number;
  isFirstSolveEver: boolean;
}

export class AchievementService {
  evaluate(context: AchievementContext, progress: PlayerProgress): Achievement[] {
    const unlocked = new Set(progress.unlockedAchievements);
    const newly: Achievement[] = [];
    const unlock = (id: string) => {
      if (!unlocked.has(id)) {
        unlocked.add(id);
        const achievement = ACHIEVEMENTS.find((a) => a.id === id);
        if (achievement) newly.push(achievement);
      }
    };
    if (context.isFirstSolveEver) unlock('first-blood');
    if (context.streak >= 5) unlock('streak-5');
    if (context.solvedWithoutHint) unlock('no-hints');
    if (context.solveDurationMs > 0 && context.solveDurationMs < 15000) unlock('speed-solver');
    if (context.allPuzzlesComplete) unlock('grandmaster');
    if (context.dailyChallengeStreak >= 3) unlock('daily-devotion');
    return newly;
  }
}

export const achievementService = new AchievementService();
