import { PUZZLES } from '../data/puzzles';
import type { Difficulty, Puzzle } from '../types/chess';

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard'];

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashDateString(dateKey: string): number {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i += 1) {
    hash = (hash << 5) - hash + dateKey.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export class PuzzleRepository {
  private readonly puzzles: Puzzle[];

  constructor(puzzles: Puzzle[] = PUZZLES) {
    this.puzzles = puzzles;
  }

  all(): Puzzle[] { return this.puzzles; }
  count(): number { return this.puzzles.length; }

  buildShuffledRun(random: () => number = Math.random): Puzzle[] {
    const grouped: Record<Difficulty, Puzzle[]> = { easy: [], medium: [], hard: [] };
    this.puzzles.forEach((p) => grouped[p.difficulty].push(p));
    const shuffleGroup = (group: Puzzle[]): Puzzle[] => {
      const copy = [...group];
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };
    return DIFFICULTY_ORDER.flatMap((difficulty) => shuffleGroup(grouped[difficulty]));
  }

  getDailyChallenge(date: Date = new Date()): Puzzle {
    const dateKey = date.toISOString().slice(0, 10);
    const seed = hashDateString(dateKey);
    const random = mulberry32(seed);
    const index = Math.floor(random() * this.puzzles.length);
    return this.puzzles[index];
  }

  static getDateKey(date: Date = new Date()): string {
    return date.toISOString().slice(0, 10);
  }
}

export const puzzleRepository = new PuzzleRepository();
