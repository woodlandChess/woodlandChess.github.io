import { Chess, type Move } from 'chess.js';
import type { Puzzle } from '../types/chess';

const API_BASE = 'https://lichess.org/api';
const PUZZLE_CACHE_KEY = 'woodland-chess:lichess-puzzle-cache-v2';
const FALLBACK_CACHE_KEY = 'woodland-chess:lichess-puzzle-fallback-v2';
const DAILY_CACHE_KEY = 'woodland-chess:lichess-daily-puzzle-v2';
const QUEUE_KEY = 'woodland-chess:lichess-puzzle-queue-v1';
const POOL_KEY = 'woodland-chess:lichess-puzzle-pool-v1';
const BATCH_SIZE = 30;
const POOL_MAX = 80;
const LOW_WATER = 5;

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

function readList(key: string): Puzzle[] {
  try {
    const list = JSON.parse(localStorage.getItem(key) ?? '[]') as Puzzle[];
    return Array.isArray(list) ? list.filter(isPlayablePuzzle) : [];
  } catch { return []; }
}
function writeList(key: string, list: Puzzle[]): void {
  try { localStorage.setItem(key, JSON.stringify(list)); } catch { /* storage full or unavailable */ }
}

let queue: Puzzle[] | null = null;
let refill: Promise<void> | null = null;
let lastServedId: number | null = null;

function getQueue(): Puzzle[] {
  if (!queue) queue = readList(QUEUE_KEY);
  return queue;
}

/**
 * Lichess rate-limits anonymous /puzzle/next hard (it started failing after ~a dozen puzzles),
 * so puzzles are fetched in batches of 30 with a single request and served from a local queue.
 */
async function fetchBatch(): Promise<Puzzle[]> {
  const response = await fetch(`${API_BASE}/puzzle/batch/mix?nb=${BATCH_SIZE}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Lichess puzzle service returned ${response.status}`);
  const body = await response.json() as { puzzles?: LichessPuzzleResponse[] };
  const out: Puzzle[] = [];
  for (const item of body.puzzles ?? []) {
    try {
      const puzzle = createLichessPuzzle(item);
      if (isPlayablePuzzle(puzzle)) out.push(puzzle);
    } catch { /* skip an unusable puzzle */ }
  }
  if (!out.length) throw new Error('Lichess returned no playable puzzles');
  return out;
}

async function fetchSingle(): Promise<Puzzle> {
  const response = await fetch(`${API_BASE}/puzzle/next`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Lichess puzzle service returned ${response.status}`);
  const puzzle = createLichessPuzzle(await response.json() as LichessPuzzleResponse);
  if (!isPlayablePuzzle(puzzle)) throw new Error('Lichess returned a puzzle that failed position validation');
  return puzzle;
}

function refillQueue(): Promise<void> {
  if (!refill) {
    refill = (async () => {
      let fresh: Puzzle[];
      try { fresh = await fetchBatch(); } catch { fresh = [await fetchSingle()]; }
      const q = getQueue();
      const known = new Set([...q, ...readList(POOL_KEY)].map(p => p.id));
      for (const p of fresh) if (!known.has(p.id)) q.push(p);
      writeList(QUEUE_KEY, q);
    })().finally(() => { refill = null; });
  }
  return refill;
}

function remember(puzzle: Puzzle): void {
  const pool = readList(POOL_KEY).filter(p => p.id !== puzzle.id);
  pool.push(puzzle);
  writeList(POOL_KEY, pool.slice(-POOL_MAX));
  try { localStorage.setItem(FALLBACK_CACHE_KEY, JSON.stringify(puzzle)); } catch { /* ignore */ }
  lastServedId = puzzle.id;
}

/** Never leave the player stranded: when Lichess is unreachable, replay one already seen. */
function fromPool(): Puzzle | null {
  const pool = readList(POOL_KEY).filter(p => p.id !== lastServedId);
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}

async function nextQueued(): Promise<Puzzle> {
  const q = getQueue();
  if (!q.length) {
    try { await refillQueue(); } catch (error) {
      const fallback = fromPool();
      if (fallback) return fallback;
      throw error;
    }
  }
  const puzzle = getQueue().shift();
  writeList(QUEUE_KEY, getQueue());
  if (!puzzle) { const fallback = fromPool(); if (fallback) return fallback; throw new Error('No puzzles available'); }
  if (getQueue().length < LOW_WATER) void refillQueue().catch(() => { /* background top-up; ignore failures */ });
  return puzzle;
}

export async function fetchLichessPuzzle(daily = false): Promise<Puzzle> {
  if (!daily) {
    const puzzle = await nextQueued();
    remember(puzzle);
    return puzzle;
  }
  const cachedDaily = localStorage.getItem(DAILY_CACHE_KEY);
  if (cachedDaily) {
    try {
      const entry = JSON.parse(cachedDaily) as { date: string; puzzle: Puzzle };
      if (entry.date === new Date().toISOString().slice(0, 10) && isPlayablePuzzle(entry.puzzle)) return entry.puzzle;
    } catch { /* refresh corrupt cache */ }
  }
  const response = await fetch(`${API_BASE}/puzzle/daily`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Lichess puzzle service returned ${response.status}`);
  const puzzle = createLichessPuzzle(await response.json() as LichessPuzzleResponse);
  if (!isPlayablePuzzle(puzzle)) throw new Error('Lichess returned a puzzle that failed position validation');
  localStorage.setItem(FALLBACK_CACHE_KEY, JSON.stringify(puzzle));
  localStorage.setItem(DAILY_CACHE_KEY, JSON.stringify({ date: new Date().toISOString().slice(0, 10), puzzle }));
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
