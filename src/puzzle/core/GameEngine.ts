import { ChessEngine } from '../engine/ChessEngine';
import { puzzleRepository } from './PuzzleRepository';
import { scoreService } from './ScoreService';
import { storageService } from './StorageService';
import { soundService } from './SoundService';
import { achievementService } from './AchievementService';
import type {
  Achievement,
  Cell,
  Coordinate,
  FeedbackType,
  MoveHistoryEntry,
  Puzzle,
} from '../types/chess';

export type GameMode = 'run' | 'daily';
export type ScreenName = 'intro' | 'game' | 'win';

export interface GameSnapshot {
  screen: ScreenName;
  mode: GameMode;
  puzzles: Puzzle[];
  index: number;
  puzzle: Puzzle;
  board: Cell[][];
  selected: Coordinate | null;
  legalDestinations: Coordinate[];
  hintSquare: Coordinate | null;
  hintText: string;
  moveNum: number;
  puzzleDone: boolean;
  awaitingOpponent: boolean;
  feedback: { type: FeedbackType; message: string };
  moveHistory: MoveHistoryEntry[];
  score: number;
  solved: number;
  streak: number;
  bestStreak: number;
  soundEnabled: boolean;
  newAchievements: Achievement[];
  dailyChallengeStreak: number;
  lastSolveDurationMs: number | null;
}

type Listener = () => void;

export class GameEngine {
  private listeners = new Set<Listener>();
  private mode: GameMode = 'run';
  private puzzles: Puzzle[] = [];
  private index = 0;
  private engine!: ChessEngine;
  private selected: Coordinate | null = null;
  private legalDestinations: Coordinate[] = [];
  private hintSquare: Coordinate | null = null;
  private hintText = '';
  private hintUsed = false;
  private moveNum = 0;
  private puzzleDone = false;
  private awaitingOpponent = false;
  private feedback: { type: FeedbackType; message: string } = { type: 'idle', message: '' };
  private moveHistory: MoveHistoryEntry[] = [];
  private score = 0;
  private solved = 0;
  private streak = 0;
  private bestStreak = 0;
  private screen: ScreenName = 'intro';
  private soundEnabled = true;
  private newAchievements: Achievement[] = [];
  private dailyChallengeStreak = 0;
  private solveStartedAt = 0;
  private lastSolveDurationMs: number | null = null;
  private pendingTimeout: number | null = null;

  constructor() {
    const progress = storageService.load();
    this.soundEnabled = progress.soundEnabled;
    this.bestStreak = progress.bestStreak;
    this.dailyChallengeStreak = progress.dailyChallengeStreak;
    soundService.setMuted(!this.soundEnabled);
    this.puzzles = puzzleRepository.buildShuffledRun();
    this.loadPuzzleAt(0, { resetScore: false });
  }

  private cachedSnapshot: GameSnapshot | null = null;

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.cachedSnapshot = null;
    this.listeners.forEach((listener) => listener());
  }

  getSnapshot = (): GameSnapshot => {
    if (this.cachedSnapshot) return this.cachedSnapshot;
    this.cachedSnapshot = {
      screen: this.screen,
      mode: this.mode,
      puzzles: this.puzzles,
      index: this.index,
      puzzle: this.puzzles[this.index],
      board: this.boardMatrix(),
      selected: this.selected,
      legalDestinations: this.legalDestinations,
      hintSquare: this.hintSquare,
      hintText: this.hintText,
      moveNum: this.moveNum,
      puzzleDone: this.puzzleDone,
      awaitingOpponent: this.awaitingOpponent,
      feedback: this.feedback,
      moveHistory: this.moveHistory,
      score: this.score,
      solved: this.solved,
      streak: this.streak,
      bestStreak: this.bestStreak,
      soundEnabled: this.soundEnabled,
      newAchievements: this.newAchievements,
      dailyChallengeStreak: this.dailyChallengeStreak,
      lastSolveDurationMs: this.lastSolveDurationMs,
    };
    return this.cachedSnapshot;
  };

  private boardMatrix(): Cell[][] {
    const matrix: Cell[][] = [];
    for (let r = 0; r < 8; r += 1) {
      const row: Cell[] = [];
      for (let c = 0; c < 8; c += 1) {
        row.push(this.engine.getCell(r, c));
      }
      matrix.push(row);
    }
    return matrix;
  }

  private clearPendingTimeout(): void {
    if (this.pendingTimeout !== null) {
      window.clearTimeout(this.pendingTimeout);
      this.pendingTimeout = null;
    }
  }

  private loadPuzzleAt(index: number, options: { resetScore: boolean }): void {
    const puzzle = this.puzzles[index];
    this.index = index;
    this.engine = new ChessEngine(puzzle.fen);
    this.selected = null;
    this.legalDestinations = [];
    this.hintSquare = null;
    this.hintText = '';
    this.hintUsed = false;
    this.moveNum = 0;
    this.puzzleDone = false;
    this.awaitingOpponent = false;
    this.feedback = { type: 'idle', message: '' };
    this.moveHistory = [];
    this.newAchievements = [];
    this.solveStartedAt = Date.now();
    if (options.resetScore) {
      this.score = 0;
      this.solved = 0;
      this.streak = 0;
    }
  }

  startRun(): void {
    this.mode = 'run';
    this.puzzles = puzzleRepository.buildShuffledRun();
    this.loadPuzzleAt(0, { resetScore: true });
    this.screen = 'game';
    this.notify();
  }

  startDaily(): void {
    this.mode = 'daily';
    this.puzzles = [puzzleRepository.getDailyChallenge()];
    this.loadPuzzleAt(0, { resetScore: true });
    this.screen = 'game';
    this.notify();
  }

  goHome(): void {
    this.clearPendingTimeout();
    this.screen = 'intro';
    this.notify();
  }

  resetCurrentPuzzle(): void {
    this.clearPendingTimeout();
    this.loadPuzzleAt(this.index, { resetScore: false });
    this.notify();
  }

  toggleSound(): void {
    this.soundEnabled = !this.soundEnabled;
    soundService.setMuted(!this.soundEnabled);
    storageService.update({ soundEnabled: this.soundEnabled });
    this.notify();
  }

  showHint(): void {
    if (this.puzzleDone || this.awaitingOpponent) return;
    const puzzle = this.puzzles[this.index];
    const step = puzzle.solution[this.moveNum];
    this.hintUsed = true;
    this.hintText = puzzle.hint;
    this.hintSquare = step ? ChessEngine.squareToCoordinate(step.from) : null;
    this.notify();
  }

  selectSquare(row: number, col: number): void {
    if (this.puzzleDone || this.awaitingOpponent) return;
    const puzzle = this.puzzles[this.index];
    const piece = this.engine.getCell(row, col);

    if (!this.selected) {
      if (piece && piece.color === puzzle.turn) {
        const dests = this.engine.getLegalMoves(row, col);
        if (dests.length === 0) {
          this.flashFeedback('wrong', 'That piece has no legal moves right now.');
          return;
        }
        this.selected = { row, col };
        this.legalDestinations = dests;
        this.notify();
        return;
      }
      if (piece) this.flashFeedback('wrong', "That's not your piece to move.");
      return;
    }

    const from = this.selected;
    if (from.row === row && from.col === col) {
      this.selected = null;
      this.legalDestinations = [];
      this.notify();
      return;
    }

    if (piece && piece.color === puzzle.turn) {
      this.selected = { row, col };
      this.legalDestinations = this.engine.getLegalMoves(row, col);
      this.notify();
      return;
    }

    const isLegal = this.legalDestinations.some((m) => m.row === row && m.col === col);
    this.selected = null;
    this.legalDestinations = [];

    if (!isLegal) {
      this.flashFeedback('wrong', "That move isn't legal.");
      return;
    }

    const step = puzzle.solution[this.moveNum];
    const stepFrom = ChessEngine.squareToCoordinate(step.from);
    const stepTo = ChessEngine.squareToCoordinate(step.to);

    if (stepFrom.row === from.row && stepFrom.col === from.col && stepTo.row === row && stepTo.col === col) {
      this.executePlayerMove(from, { row, col }, step.notation);
    } else {
      this.flashFeedback('legal-wrong', 'Legal move, but not the winning line. Try again.');
    }
  }

  private executePlayerMove(from: Coordinate, to: Coordinate, notation: string): void {
    const puzzle = this.puzzles[this.index];
    const { captured } = this.engine.applyMove(from, to);
    if (captured) soundService.playCapture();
    else soundService.playMove();

    this.moveHistory = [
      ...this.moveHistory,
      { index: this.moveHistory.length, notation, side: 'player', sideLabel: puzzle.turn === 'w' ? 'White' : 'Black' },
    ];
    this.moveNum += 1;

    if (this.moveNum >= puzzle.solution.length) {
      this.onPuzzleSolved();
      return;
    }

    this.feedback = { type: 'correct', message: 'Good move.' };
    this.notify();
    this.awaitingOpponent = true;
    this.pendingTimeout = window.setTimeout(() => this.playOpponentReply(), 550);
  }

  private playOpponentReply(): void {
    const puzzle = this.puzzles[this.index];
    const step = puzzle.solution[this.moveNum];
    if (!step) {
      this.awaitingOpponent = false;
      this.notify();
      return;
    }
    const from = ChessEngine.squareToCoordinate(step.from);
    const to = ChessEngine.squareToCoordinate(step.to);
    this.engine.applyMove(from, to);
    this.moveHistory = [
      ...this.moveHistory,
      { index: this.moveHistory.length, notation: step.notation, side: 'opponent', sideLabel: puzzle.turn === 'w' ? 'Black' : 'White' },
    ];
    this.moveNum += 1;
    this.awaitingOpponent = false;
    this.feedback = { type: 'idle', message: '' };
    this.notify();
  }

  private flashFeedback(type: FeedbackType, message: string): void {
    if (type === 'wrong') soundService.playWrong();
    this.feedback = { type, message };
    this.notify();
    this.clearPendingTimeout();
    this.pendingTimeout = window.setTimeout(() => {
      if (!this.puzzleDone) {
        this.feedback = { type: 'idle', message: '' };
        this.notify();
      }
    }, 1500);
  }

  private onPuzzleSolved(): void {
    const puzzle = this.puzzles[this.index];
    const progress = storageService.load();
    const isFirstSolveEver = progress.totalSolved === 0;
    const solveDurationMs = Date.now() - this.solveStartedAt;

    this.puzzleDone = true;
    this.solved += 1;
    this.streak += 1;
    this.bestStreak = Math.max(this.bestStreak, this.streak);
    this.lastSolveDurationMs = solveDurationMs;

    const gained = scoreService.computePuzzleScore(puzzle.difficulty, this.hintUsed, solveDurationMs);
    this.score += gained;
    this.feedback = { type: 'done', message: 'Checkmate. Puzzle solved.' };
    soundService.playCheckmate();

    const allPuzzlesComplete = this.mode === 'run' && this.index >= this.puzzles.length - 1;
    let dailyStreak = progress.dailyChallengeStreak;
    if (this.mode === 'daily') {
      const today = new Date().toISOString().slice(0, 10);
      const wasYesterday = this.isYesterday(progress.lastDailyChallengeDate, today);
      dailyStreak = wasYesterday ? progress.dailyChallengeStreak + 1 : 1;
      this.dailyChallengeStreak = dailyStreak;
    }

    const unlocked = achievementService.evaluate(
      { streak: this.streak, solvedWithoutHint: !this.hintUsed, solveDurationMs, allPuzzlesComplete, dailyChallengeStreak: dailyStreak, isFirstSolveEver },
      progress,
    );

    this.newAchievements = unlocked;
    if (unlocked.length > 0) soundService.playAchievement();

    storageService.update({
      totalSolved: progress.totalSolved + 1,
      bestStreak: this.bestStreak,
      bestScore: Math.max(progress.bestScore, this.score),
      fastestSolveMs: progress.fastestSolveMs === null ? solveDurationMs : Math.min(progress.fastestSolveMs, solveDurationMs),
      unlockedAchievements: [...progress.unlockedAchievements, ...unlocked.map((a) => a.id)],
      lastDailyChallengeDate: this.mode === 'daily' ? new Date().toISOString().slice(0, 10) : progress.lastDailyChallengeDate,
      dailyChallengeStreak: dailyStreak,
    });

    this.notify();
  }

  private isYesterday(lastDateKey: string | null, todayKey: string): boolean {
    if (!lastDateKey) return false;
    const last = new Date(lastDateKey);
    const today = new Date(todayKey);
    const diffMs = today.getTime() - last.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24)) === 1;
  }

  nextPuzzle(): void {
    this.clearPendingTimeout();
    if (this.mode === 'daily') { this.screen = 'win'; this.notify(); return; }
    if (this.index < this.puzzles.length - 1) {
      this.loadPuzzleAt(this.index + 1, { resetScore: false });
      this.notify();
    } else {
      this.screen = 'win';
      this.notify();
    }
  }

  exportCurrentPuzzlePgn(): { puzzle: Puzzle; history: MoveHistoryEntry[] } {
    return { puzzle: this.puzzles[this.index], history: this.moveHistory };
  }

  dispose(): void {
    this.clearPendingTimeout();
    this.listeners.clear();
  }
}
