import type { Color } from 'chess.js'

/** Where a stored game came from. */
export type GameSource = 'ai' | 'lichess'
export type Phase = 'Opening' | 'Middlegame' | 'Endgame'
export type Grade = 'Best' | 'Good' | 'Inaccuracy' | 'Mistake' | 'Blunder'

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
}

export const REVIEW_VERSION = 3

export interface GameReview {
  gameId: string
  version: typeof REVIEW_VERSION
  accuracy: number
  opponentAccuracy: number
  blunders: number
  mistakes: number
  inaccuracies: number
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

const KEY = 'woodland-chess:player-style-v1'
const MAX_GAMES = 100
const empty = (): PlayerProfileData => ({ username: '', games: [], reviews: [], updatedAt: 0 })

/** Reads the stored profile. Reviews made by older, less accurate versions are dropped (they are recomputed). */
export function readProfile(): PlayerProfileData {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (!v || !Array.isArray(v.games)) return empty()
    return {
      username: typeof v.username === 'string' ? v.username : '',
      games: v.games,
      reviews: Array.isArray(v.reviews) ? v.reviews.filter((r: GameReview) => r?.version === REVIEW_VERSION) : [],
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
