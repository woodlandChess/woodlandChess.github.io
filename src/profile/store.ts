import type { Color } from 'chess.js'

/** Where a stored game came from. */
export type GameSource = 'ai' | 'lichess'
export type Phase = 'Opening' | 'Middlegame' | 'Endgame'
export type Grade = 'Brilliant' | 'Great' | 'Best' | 'Good' | 'Inaccuracy' | 'Mistake' | 'Blunder'

export interface ProfileGame {
  id: string
  source: GameSource
  playedAt: number
  white: string
  black: string
  userColor: Color
  result: 'win' | 'loss' | 'draw' | 'unknown'
  /** Legal UCI moves, space separated. */
  moves: string
  timeClass?: string
  /** Opening name when the source provides one (Lichess). */
  opening?: string
}

/** One reviewed half-move (both players are reviewed; accuracy only counts yours). */
export interface PlyReview {
  ply: number
  san: string
  uci: string
  color: Color
  grade: Grade
  /** Centipawns lost versus the engine's best, from the mover's side. */
  loss: number
  /** Winning chances lost, in percentage points (what the grade is based on). */
  winLoss: number
  /** Engine's preferred move in SAN, kept only when it differs meaningfully. */
  best?: string
  phase: Phase
  tags: string[]
}

export interface Tally { sum: number; n: number }

/** Per-game measurements of the user's own play (inputs to the style read). */
export interface GameFeatures {
  moves: number
  captures: number
  checks: number
  /** Captures answered by an immediate recapture on the same square. */
  trades: number
  /** Moves that landed within two squares of the enemy king. */
  pressure: number
  /** Net material given up that the engine still rated as fine. */
  sacrifices: number
  castledPly: number
  /** Accuracy of your moves when you were clearly worse / better. */
  worse: Tally
  better: Tally
  byPhase: Record<Phase, Tally>
  /** True when you reached a clearly winning position and later let it slip. */
  squandered: boolean
  /** Your first three moves (UCI), for opening-repertoire matching. */
  firstMoves: string[]
  /** Your first pawn move (UCI), e.g. "e2e4": open games (e-pawn) versus closed or flank openings. */
  firstPawn: string
  /** Material on the board (both sides, pawns and pieces, kings excluded) at each of your moves. */
  material: Tally
  /** How far the engine's best move was ahead of its second best (winning-chance points) at your moves. Small = many good options. */
  gap: Tally
  /** Positions where only one move held up (gap of 15 points or more) and how many of them you solved. */
  critical: { n: number; found: number }
  /** Your errors where the engine's move was a capture, check or mate (tactical) versus a quiet move (positional). */
  tacticalErrors: number
  quietErrors: number
}

export const REVIEW_VERSION = 5

export interface GameReview {
  gameId: string
  version: typeof REVIEW_VERSION
  accuracy: number
  opponentAccuracy: number
  blunders: number
  mistakes: number
  inaccuracies: number
  /** Your sacrificial best moves, and your only-move finds. */
  brilliant: number
  great: number
  opening: string
  plies: PlyReview[]
  /** White's winning chances (0-100) after each ply, index 0 = start position. */
  wins: number[]
  features: GameFeatures
}

export interface PlayerProfileData {
  username: string
  games: ProfileGame[]
  reviews: GameReview[]
  updatedAt: number
}

export const PROFILE_STORAGE_KEY = 'woodland-chess:player-style-v1'
const KEY = PROFILE_STORAGE_KEY
const MAX_GAMES = 100
const empty = (): PlayerProfileData => ({ username: '', games: [], reviews: [], updatedAt: 0 })

const isNum = (x: unknown) => typeof x === 'number' && Number.isFinite(x)
const isTally = (t: unknown) => !!t && isNum((t as Tally).sum) && isNum((t as Tally).n)

/** True only for a complete review of the current format; anything else is recomputed, never rendered. */
export function isValidReview(r: unknown): r is GameReview {
  const v = r as GameReview | null
  const f = v?.features
  return !!v && v.version === REVIEW_VERSION && typeof v.gameId === 'string'
    && Array.isArray(v.plies) && Array.isArray(v.wins) && v.wins.length === v.plies.length + 1
    && isNum(v.accuracy) && isNum(v.opponentAccuracy) && isNum(v.brilliant) && isNum(v.great)
    && !!f && isNum(f.moves) && isNum(f.captures) && isNum(f.checks) && isNum(f.trades) && isNum(f.pressure)
    && isNum(f.sacrifices) && isTally(f.worse) && isTally(f.better)
    && !!f.byPhase && isTally(f.byPhase.Opening) && isTally(f.byPhase.Middlegame) && isTally(f.byPhase.Endgame)
    && Array.isArray(f.firstMoves) && typeof f.firstPawn === 'string' && isTally(f.material) && isTally(f.gap)
    && !!f.critical && isNum(f.critical.n) && isNum(f.critical.found) && isNum(f.tacticalErrors) && isNum(f.quietErrors)
}

/** Forgets everything saved by My style (used when stored data cannot be read). */
export function clearProfile(): void {
  try { localStorage.removeItem(KEY) } catch { /* unavailable */ }
}

/** Reads the stored profile. Reviews made by older, less accurate versions are dropped (they are recomputed). */
export function readProfile(): PlayerProfileData {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (!v || !Array.isArray(v.games)) return empty()
    return {
      username: typeof v.username === 'string' ? v.username : '',
      games: v.games.filter((g: ProfileGame) => g && typeof g.id === 'string' && typeof g.moves === 'string' && (g.userColor === 'w' || g.userColor === 'b')),
      reviews: Array.isArray(v.reviews) ? v.reviews.filter(isValidReview) : [],
      updatedAt: Number(v.updatedAt) || 0,
    }
  } catch { return empty() }
}

export function saveProfile(data: PlayerProfileData): void {
  const games = data.games.slice(0, MAX_GAMES)
  const keep = new Set(games.map(g => g.id))
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...data, games, reviews: data.reviews.filter(r => keep.has(r.gameId)) }))
  } catch { /* storage can be unavailable or full */ }
}

/** Stores a finished game against the computer. The id depends only on the moves, so saving twice is harmless. */
export function recordComputerGame(g: {
  userColor: Color
  result: ProfileGame['result']
  moves: string[]
  playedAt?: number
}): void {
  if (g.moves.length < 2) return
  const id = `ai-${g.userColor}-${g.moves.join('')}`
  const data = readProfile()
  if (data.games.some(x => x.id === id)) return
  const game: ProfileGame = {
    id, source: 'ai', playedAt: g.playedAt ?? Date.now(),
    white: g.userColor === 'w' ? 'You' : 'Computer', black: g.userColor === 'b' ? 'You' : 'Computer',
    userColor: g.userColor, result: g.result, moves: g.moves.join(' '),
  }
  saveProfile({ ...data, games: [game, ...data.games], updatedAt: Date.now() })
}
