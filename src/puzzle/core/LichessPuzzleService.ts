import { Chess } from 'chess.js';
import type { Puzzle } from '../types/chess';

const API_BASE = 'https://lichess.org/api';
const PUZZLE_CACHE_KEY = 'woodland-chess:lichess-puzzle-cache';
const FALLBACK_CACHE_KEY = 'woodland-chess:lichess-puzzle-fallback';
const DAILY_CACHE_KEY = 'woodland-chess:lichess-daily-puzzle';

interface LichessPuzzleResponse {
  game: { id: string; pgn: string; clock?: string };
  puzzle: { id: string; rating: number; plays: number; solution: string[]; themes?: string[]; initialPly: number; fen?: string };
}
interface PuzzleCache { savedAt: number; puzzles: Puzzle[] }

export function createLichessPuzzle(data: LichessPuzzleResponse): Puzzle {
  const game = new Chess();
  game.loadPgn(data.game.pgn);
  const history = game.history({ verbose: true });
  const initialFen = data.puzzle.fen ?? history[data.puzzle.initialPly - 1]?.after ?? game.fen();
  const turn = data.puzzle.initialPly % 2 === 0 ? 'w' : 'b';
  const setupMove = history[data.puzzle.initialPly - 1];
  if (!setupMove) throw new Error('Lichess puzzle is missing its setup move');
  const solutionGame = new Chess(initialFen);
  const solution = data.puzzle.solution.map((uci) => {
    const move = solutionGame.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), ...(uci.length > 4 ? { promotion: uci[4] } : {}) });
    return { from: move.from, to: move.to, notation: move.san, promotion: move.promotion?.toUpperCase() as Puzzle['solution'][number]['promotion'] };
  });
  const setup = { from: setupMove.from, to: setupMove.to, notation: setupMove.san, promotion: setupMove.promotion?.toUpperCase() as Puzzle['solution'][number]['promotion'] };
  return {
    id: Number.parseInt(data.puzzle.id.slice(0, 8), 36) || Date.now(),
    title: `Lichess Puzzle ${data.puzzle.id}`,
    subtitle: `Rating ${data.puzzle.rating} · ${data.puzzle.plays.toLocaleString()} plays`,
    year: '', difficulty: data.puzzle.rating < 1400 ? 'easy' : data.puzzle.rating < 2000 ? 'medium' : 'hard',
    turn, desc: `${turn === 'w' ? 'White' : 'Black'} to move. Find the best line.`,
    hint: `Themes: ${(data.puzzle.themes ?? ['tactics']).slice(0, 3).join(', ')}.`,
    fen: initialFen, setupMove: setup, solution,
  };
}

function cachedPuzzles(): Puzzle[] {
  try {
    const cache = JSON.parse(localStorage.getItem(PUZZLE_CACHE_KEY) ?? 'null') as PuzzleCache | null;
    if (cache && Date.now() - cache.savedAt < 12 * 60 * 60 * 1000 && cache.puzzles.length) return cache.puzzles;
  } catch { /* discard malformed cache */ }
  return [];
}

export async function fetchLichessPuzzle(daily = false): Promise<Puzzle> {
  if (daily) {
    const cachedDaily = localStorage.getItem(DAILY_CACHE_KEY);
    if (cachedDaily) {
      try {
        const entry = JSON.parse(cachedDaily) as { date: string; puzzle: Puzzle };
        if (entry.date === new Date().toISOString().slice(0, 10)) return entry.puzzle;
      } catch { /* refresh corrupt cache */ }
    }
  }
  const response = await fetch(`${API_BASE}/puzzle/${daily ? 'daily' : 'random'}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Lichess puzzle service returned ${response.status}`);
  const puzzle = createLichessPuzzle(await response.json() as LichessPuzzleResponse);
  localStorage.setItem(FALLBACK_CACHE_KEY, JSON.stringify(puzzle));
  if (daily) localStorage.setItem(DAILY_CACHE_KEY, JSON.stringify({ date: new Date().toISOString().slice(0, 10), puzzle }));
  return puzzle;
}

export async function fetchLichessPuzzles(count = 1): Promise<Puzzle[]> {
  const existing = cachedPuzzles();
  if (existing.length >= count) return existing;
  const puzzles: Puzzle[] = [];
  for (let i = 0; i < count; i += 1) puzzles.push(await fetchLichessPuzzle(false));
  localStorage.setItem(PUZZLE_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), puzzles } satisfies PuzzleCache));
  return puzzles;
}

export function getCachedPuzzleFallback(): Puzzle | null {
  try { return JSON.parse(localStorage.getItem(FALLBACK_CACHE_KEY) ?? 'null') as Puzzle | null; } catch { return null; }
}
