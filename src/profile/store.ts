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

export const REVIEW_VERSION = 6

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
  /** Engine score in centipawns from White's point of view after each ply (index 0 = start). Mate scores sit near +/-10000. Absent in older saved reviews. */
  evals?: number[]
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

const RAW_LICHESS_ID = /^[A-Za-z0-9]{8}$/

/**
 * Games imported from Lichess are saved as "lichess-<id>". An earlier version saved a game analysed right after
 * a multiplayer match under the bare id, so the same game could appear twice. This gives such games their proper
 * id and merges the pair, keeping the one that has a review.
 */
function unifyIds(games: ProfileGame[], reviews: GameReview[]): { games: ProfileGame[]; reviews: GameReview[] } {
  const renamed = new Map<string, string>()
  const fixed = games.map(g => {
    if (g.source === 'lichess' && RAW_LICHESS_ID.test(g.id)) { renamed.set(g.id, `lichess-${g.id}`); return { ...g, id: `lichess-${g.id}` } }
    return g
  })
  const reviewIds = new Set(reviews.map(r => renamed.get(r.gameId) ?? r.gameId))
  const byId = new Map<string, ProfileGame>()
  for (const g of fixed) if (!byId.has(g.id) || reviewIds.has(g.id)) byId.set(g.id, byId.get(g.id) ?? g)
  const seen = new Set<string>()
  const outReviews: GameReview[] = []
  for (const r of reviews) {
    const id = renamed.get(r.gameId) ?? r.gameId
    if (seen.has(id)) continue
    seen.add(id)
    outReviews.push(id === r.gameId ? r : { ...r, gameId: id })
  }
  return { games: [...byId.values()], reviews: outReviews }
}

/** Turns raw saved or backed-up data into a clean profile. Anything unreadable is dropped, never rendered. */
export function parseProfile(v: any): PlayerProfileData {
  if (!v || !Array.isArray(v.games)) return empty()
  const games: ProfileGame[] = v.games.filter((g: ProfileGame) => g && typeof g.id === 'string' && typeof g.moves === 'string' && (g.userColor === 'w' || g.userColor === 'b'))
  const reviews: GameReview[] = Array.isArray(v.reviews) ? v.reviews.filter(isValidReview) : []
  const clean = unifyIds(games, reviews)
  return { username: typeof v.username === 'string' ? v.username : '', games: clean.games, reviews: clean.reviews, updatedAt: Number(v.updatedAt) || 0 }
}

/** Reads the stored profile. Reviews made by older, less accurate versions are dropped (they are recomputed). */
export function readProfile(): PlayerProfileData {
  try { return parseProfile(JSON.parse(localStorage.getItem(KEY) ?? 'null')) } catch { return empty() }
}

/**
 * Combines what is on this device with a backup: every game and every review from both, nothing lost. A game
 * or review that exists on both sides keeps the version already here. Newest games first, capped as usual.
 */
export function mergeProfiles(local: PlayerProfileData, incoming: PlayerProfileData): PlayerProfileData {
  const games = new Map<string, ProfileGame>()
  for (const g of [...incoming.games, ...local.games]) games.set(g.id, g)       // local wins on a clash
  const reviews = new Map<string, GameReview>()
  for (const r of [...incoming.reviews, ...local.reviews]) reviews.set(r.gameId, r)
  const kept = [...games.values()].sort((a, b) => b.playedAt - a.playedAt).slice(0, MAX_GAMES)
  const ids = new Set(kept.map(g => g.id))
  return {
    username: local.username || incoming.username,
    games: kept,
    reviews: [...reviews.values()].filter(r => ids.has(r.gameId)),
    updatedAt: Math.max(local.updatedAt, incoming.updatedAt),
  }
}

export function saveProfile(data: PlayerProfileData): void {
  const games = data.games.slice(0, MAX_GAMES)
  const keep = new Set(games.map(g => g.id))
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...data, games, reviews: data.reviews.filter(r => keep.has(r.gameId)) }))
  } catch { /* storage can be unavailable or full */ }
}

/** Id of a game against the computer; depends only on who you played as and the moves. */
export const computerGameId = (userColor: Color, moves: string[]) => `ai-${userColor}-${moves.join('')}`

/** Stores a finished game against the computer. The id depends only on the moves, so saving twice is harmless. */
export function recordComputerGame(g: {
  userColor: Color
  result: ProfileGame['result']
  moves: string[]
  playedAt?: number
}): void {
  if (g.moves.length < 2) return
  const id = computerGameId(g.userColor, g.moves)
  const data = readProfile()
  if (data.games.some(x => x.id === id)) return
  const game: ProfileGame = {
    id, source: 'ai', playedAt: g.playedAt ?? Date.now(),
    white: g.userColor === 'w' ? 'You' : 'Computer', black: g.userColor === 'b' ? 'You' : 'Computer',
    userColor: g.userColor, result: g.result, moves: g.moves.join(' '),
  }
  saveProfile({ ...data, games: [game, ...data.games], updatedAt: Date.now() })
}

/**
 * Saves a game together with its review in one step, adding the game to the profile if it is not there yet.
 * Used after a post-game analysis, so a game analysed right after it ended (against the computer or online)
 * also appears in the Analyze tab with its review, and never needs to be analysed twice.
 */
export function saveReviewedGame(rawGame: ProfileGame, rawReview: GameReview): void {
  // Normalised the same way as everything read from storage, so a bare Lichess id can never create a second entry.
  const clean = parseProfile({ games: [rawGame], reviews: [rawReview] })
  const game = clean.games[0] ?? rawGame
  const review = clean.reviews[0] ?? rawReview
  const data = readProfile()
  const games = data.games.some(g => g.id === game.id) ? data.games : [game, ...data.games]
  saveProfile({
    ...data,
    games,
    reviews: [...data.reviews.filter(r => r.gameId !== game.id), review],
    updatedAt: Date.now(),
  })
}
