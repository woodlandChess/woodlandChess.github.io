import { Chess, type Move } from 'chess.js';
import type { Puzzle } from '../types/chess';

const API_BASE = 'https://lichess.org/api';
const PUZZLE_CACHE_KEY = 'woodland-chess:lichess-puzzle-cache-v2';
const FALLBACK_CACHE_KEY = 'woodland-chess:lichess-puzzle-fallback-v2';
const DAILY_CACHE_KEY = 'woodland-chess:lichess-daily-puzzle-v2';

interface LichessPuzzleResponse {
  game: { id: string; pgn: string; clock?: string };
  puzzle: { id: string; rating: number; plays: number; solution: string[]; themes?: string[]; initialPly: number; fen?: string };
}
interface PuzzleCache { savedAt: number; puzzles: Puzzle[] }

function isPlayablePuzzle(puzzle: Puzzle): boolean {
  try {
    const game = new Chess(puzzle.fen);
    if (game.turn() !== puzzle.turn || puzzle.solution.length === 0) return false;
    for (const step of puzzle.solution) {
      game.move({ from: step.from, to: step.to, ...(step.promotion ? { promotion: step.promotion.toLowerCase() } : {}) });
    }
    return true;
  } catch { return false; }
}

export function createLichessPuzzle(data: LichessPuzzleResponse): Puzzle {
  let history: Move[] = [];
  let pgnFen: string | undefined;
  try {
    const game = new Chess();
    game.loadPgn(data.game.pgn);
    history = game.history({ verbose: true });
    // initialPly points at the opponent setup move; the puzzle starts after it.
    pgnFen = history[data.puzzle.initialPly]?.after;
  } catch (error) {
    // The daily endpoint includes its own complete puzzle FEN, so the source
    // game PGN is optional there. The /next endpoint needs PGN reconstruction.
    if (!data.puzzle.fen) throw error;
  }
  const candidateFens = [...new Set([data.puzzle.fen, pgnFen].filter((fen): fen is string => !!fen))];
  const setupMove = history[data.puzzle.initialPly];
  let initialFen = '';
  let solution: Puzzle['solution'] = [];
  for (const candidateFen of candidateFens) {
    try {
      const solutionGame = new Chess(candidateFen);
      const candidateSolution = data.puzzle.solution.map((uci) => {
        const move = solutionGame.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), ...(uci.length > 4 ? { promotion: uci[4] } : {}) });
        return { from: move.from, to: move.to, notation: move.san, promotion: move.promotion?.toUpperCase() as Puzzle['solution'][number]['promotion'] };
      });
      initialFen = candidateFen;
      solution = candidateSolution;
      break;
    } catch { /* try the other API position representation */ }
  }
  if (!initialFen) throw new Error(`Lichess puzzle ${data.puzzle.id} has no legal solution position`);
  const activeColor = initialFen.split(' ')[1];
  if (activeColor !== 'w' && activeColor !== 'b') throw new Error('Lichess puzzle has an invalid active color');
  const turn = activeColor;
  const setup = setupMove ? { from: setupMove.from, to: setupMove.to, notation: setupMove.san, promotion: setupMove.promotion?.toUpperCase() as Puzzle['solution'][number]['promotion'] } : undefined;
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
    if (cache && Date.now() - cache.savedAt < 12 * 60 * 60 * 1000 && cache.puzzles.length && cache.puzzles.every(isPlayablePuzzle)) return cache.puzzles;
  } catch { /* discard malformed cache */ }
  return [];
}

export async function fetchLichessPuzzle(daily = false): Promise<Puzzle> {
  if (daily) {
    const cachedDaily = localStorage.getItem(DAILY_CACHE_KEY);
    if (cachedDaily) {
      try {
        const entry = JSON.parse(cachedDaily) as { date: string; puzzle: Puzzle };
        if (entry.date === new Date().toISOString().slice(0, 10) && isPlayablePuzzle(entry.puzzle)) return entry.puzzle;
      } catch { /* refresh corrupt cache */ }
    }
  }
  const response = await fetch(`${API_BASE}/puzzle/${daily ? 'daily' : 'next'}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Lichess puzzle service returned ${response.status}`);
  const puzzle = createLichessPuzzle(await response.json() as LichessPuzzleResponse);
  if (!isPlayablePuzzle(puzzle)) throw new Error('Lichess returned a puzzle that failed position validation');
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
  try {
    const puzzle = JSON.parse(localStorage.getItem(FALLBACK_CACHE_KEY) ?? 'null') as Puzzle | null;
    return puzzle && isPlayablePuzzle(puzzle) ? puzzle : null;
  } catch { return null; }
}
