import { Chess, type Color, type Move } from 'chess.js'
import type { PositionScore } from '../stockfish'
import { classifyOpening } from './openings'
import { clampCp, gameAccuracy, gradeFor, winPercent } from './stats'
import {
  REVIEW_VERSION, type GameFeatures, type GameReview, type Phase, type PlyReview, type ProfileGame, type Tally,
} from './store'

export { readProfile, saveProfile, recordComputerGame } from './store'
export type { GameReview, PlayerProfileData, ProfileGame, PlyReview } from './store'

// ── Importing games ───────────────────────────────────────────────────────────

/** Persist every game as legal UCI moves, whatever notation the source used. Stops at the first illegal token. */
export function normalizeMoves(raw: unknown): string {
  const tokens: string[] = Array.isArray(raw)
    ? raw.map((m: unknown) => typeof m === 'string' ? m : String((m as { uci?: string; san?: string })?.uci ?? (m as { san?: string })?.san ?? '')).filter(Boolean)
    : String(raw ?? '').trim().split(/\s+/).filter(Boolean)
  const game = new Chess()
  const uci: string[] = []
  for (const token of tokens) {
    try {
      const move = /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(token)
        ? game.move({ from: token.slice(0, 2), to: token.slice(2, 4), promotion: token[4] })
        : game.move(token)
      uci.push(`${move.from}${move.to}${move.promotion ?? ''}`)
    } catch { break }
  }
  return uci.join(' ')
}

interface LichessPlayer { user?: { name?: string }; aiLevel?: number }
const playerName = (p: LichessPlayer | undefined, fallback: string) =>
  p?.user?.name ?? (p?.aiLevel ? `Stockfish level ${p.aiLevel}` : fallback)

/** Parses the NDJSON from Lichess' public game export, keeping only standard games the user played. */
export function parseLichessNdjson(text: string, username: string): ProfileGame[] {
  const out: ProfileGame[] = []
  const me = username.trim().toLowerCase()
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue
    try {
      const g = JSON.parse(line)
      if (g.variant && g.variant !== 'standard') continue        // variants have other rules
      if (g.initialFen) continue                                  // set-up positions do not start from move 1
      const white = g.players?.white as LichessPlayer | undefined
      const black = g.players?.black as LichessPlayer | undefined
      const color: Color | null = white?.user?.name?.toLowerCase() === me ? 'w' : black?.user?.name?.toLowerCase() === me ? 'b' : null
      if (!color || !g.moves) continue
      const moves = normalizeMoves(g.moves)
      if (moves.split(' ').filter(Boolean).length < 2) continue
      const winner = g.winner === 'white' ? 'w' : g.winner === 'black' ? 'b' : null
      const drawn = g.status === 'draw' || g.status === 'stalemate' || g.status === 'outoftime'
      out.push({
        id: `lichess-${g.id}`, source: 'lichess', playedAt: Number(g.createdAt) || Date.now(),
        white: playerName(white, 'White'), black: playerName(black, 'Black'), userColor: color,
        result: winner ? (winner === color ? 'win' : 'loss') : drawn ? 'draw' : 'unknown',
        moves, timeClass: g.speed, opening: typeof g.opening?.name === 'string' ? g.opening.name : undefined,
      })
    } catch { /* skip a malformed record */ }
  }
  return out
}

// ── Reviewing a game ──────────────────────────────────────────────────────────

/** What the reviewer needs from an engine (Stockfish in the app, a script in tests). */
export interface ReviewEngine {
  newGame(multiPv?: number): Promise<void>
  analyse(fen: string, ms: number): Promise<PositionScore>
}

export interface ReviewOptions {
  signal?: AbortSignal
  msPerPosition?: number
  onProgress?: (done: number, total: number) => void
}

const PIECE_VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }

/** White's material minus Black's, in pawns. */
export function materialBalance(chess: Chess): number {
  let total = 0
  for (const row of chess.board()) for (const sq of row) if (sq) total += (sq.color === 'w' ? 1 : -1) * PIECE_VALUE[sq.type]
  return total
}

/** Everything still on the board except kings, in pawns (the starting position is 78). */
export function materialTotal(chess: Chess): number {
  let total = 0
  for (const row of chess.board()) for (const sq of row) if (sq) total += PIECE_VALUE[sq.type]
  return total
}

/** Opening until about move 10 while most pieces are still home, endgame once few pieces remain. */
export function phaseOf(chess: Chess, plyIndex: number): Phase {
  let pieces = 0
  for (const row of chess.board()) for (const sq of row) if (sq && sq.type !== 'p' && sq.type !== 'k') pieces++
  if (pieces <= 6) return 'Endgame'
  if (plyIndex < 20 && pieces >= 11) return 'Opening'
  return 'Middlegame'
}

const tally = (): Tally => ({ sum: 0, n: 0 })
const add = (t: Tally, v: number) => { t.sum += v; t.n++ }

const chebyshev = (a: string, b: string) =>
  Math.max(Math.abs(a.charCodeAt(0) - b.charCodeAt(0)), Math.abs(Number(a[1]) - Number(b[1])))

function kingSquare(chess: Chess, color: Color): string | null {
  for (const row of chess.board()) for (const sq of row) if (sq && sq.type === 'k' && sq.color === color) return sq.square
  return null
}

/** A position that is over has no search result: score it directly (the side to move has been mated or it is a draw). */
function terminalScore(chess: Chess): PositionScore | null {
  if (chess.isCheckmate()) return { cp: chess.turn() === 'w' ? -10000 : 10000, mate: 0, best: null }
  if (chess.isDraw() || chess.isStalemate()) return { cp: 0, mate: null, best: null }
  return null
}

/** The position after the first `k` moves. */
function replayAt(moves: Move[], k: number): Chess {
  const c = new Chess()
  for (let i = 0; i < k; i++) c.move(moves[i].san)
  return c
}

export async function reviewGame(game: ProfileGame, engine: ReviewEngine, opts: ReviewOptions = {}): Promise<GameReview> {
  const { signal, msPerPosition = 150, onProgress } = opts
  const user = game.userColor
  const replay = new Chess()
  const fens = [replay.fen()]
  const moves: Move[] = []
  for (const uci of game.moves.trim().split(/\s+/).filter(Boolean)) {
    try { moves.push(replay.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] })) } catch { break }
    fens.push(replay.fen())
  }

  if (!moves.length) throw new Error('This game has no readable moves.')

  // 1. Score every position exactly once (White's point of view). The score after a move is the
  //    score before the next one, so a game of n moves needs n + 1 searches, not 2n.
  await engine.newGame(2)          // two lines: the best move and the runner-up (how forcing was the position?)
  const scores: PositionScore[] = []
  const walk = new Chess()
  for (let k = 0; k <= moves.length; k++) {
    if (signal?.aborted) throw new DOMException('Analysis cancelled', 'AbortError')
    if (k > 0) walk.move(moves[k - 1].san)
    scores.push(terminalScore(walk) ?? await engine.analyse(fens[k], msPerPosition))
    onProgress?.(k + 1, moves.length + 1)
  }
  // A healthy engine disagrees with itself from position to position. Identical scores all game long
  // mean no search result came back, and grading that would award a fake 100%.
  const searched = scores.filter((_, k) => !terminalScore(replayAt(moves, k)))
  if (searched.length >= 8 && searched.every(s => s.cp === searched[0].cp && s.mate === searched[0].mate)) {
    throw new Error('The engine did not return usable scores. Reload the page and try again.')
  }
  const wins = scores.map(s => Math.round(winPercent(s.cp) * 10) / 10)
  const mat: number[] = []
  const total: number[] = []
  const m2 = new Chess(); mat.push(materialBalance(m2)); total.push(materialTotal(m2))
  for (const mv of moves) { m2.move(mv.san); mat.push(materialBalance(m2)); total.push(materialTotal(m2)) }

  // 2. Grade every half-move and collect measurements of the user's own play.
  const sign = user === 'w' ? 1 : -1
  const mine = (k: number) => (user === 'w' ? wins[k] : 100 - wins[k])
  const features: GameFeatures = {
    moves: 0, captures: 0, checks: 0, trades: 0, pressure: 0, sacrifices: 0, castledPly: 0,
    worse: tally(), better: tally(), byPhase: { Opening: tally(), Middlegame: tally(), Endgame: tally() },
    squandered: false, firstMoves: [], firstPawn: '', material: tally(), gap: tally(),
    critical: { n: 0, found: 0 }, tacticalErrors: 0, quietErrors: 0,
  }
  const plies: PlyReview[] = []
  const colors: Color[] = []
  const board = new Chess()
  let hadWinning = false
  for (let i = 0; i < moves.length; i++) {
    const mv = moves[i]
    const moverWhite = mv.color === 'w'
    const before = moverWhite ? wins[i] : 100 - wins[i]
    const after = moverWhite ? wins[i + 1] : 100 - wins[i + 1]
    const winLoss = Math.max(0, before - after)
    const cpBefore = (moverWhite ? 1 : -1) * clampCp(scores[i].cp)
    const cpAfter = (moverWhite ? 1 : -1) * clampCp(scores[i + 1].cp)
    const uci = `${mv.from}${mv.to}${mv.promotion ?? ''}`
    const isBest = scores[i].best === uci
    const grade = gradeFor(winLoss, isBest)
    const phase = phaseOf(board, i)
    let bestSan: string | undefined
    if (!isBest && winLoss >= 5 && scores[i].best) {
      try { bestSan = new Chess(fens[i]).move({ from: scores[i].best!.slice(0, 2), to: scores[i].best!.slice(2, 4), promotion: scores[i].best![4] }).san } catch { /* ignore */ }
    }
    const tags: string[] = []
    if (mv.captured) tags.push('Capture')
    if (mv.san.includes('#')) tags.push('Mate')
    else if (mv.san.includes('+')) tags.push('Check')
    if (mv.isKingsideCastle() || mv.isQueensideCastle()) tags.push('Castle')
    if (mv.promotion) tags.push('Promotion')
    plies.push({ ply: i + 1, san: mv.san, uci, color: mv.color, grade, loss: Math.round(Math.max(0, cpBefore - cpAfter)), winLoss: Math.round(winLoss * 10) / 10, best: bestSan, phase, tags })
    colors.push(mv.color)
    board.move(mv.san)

    if (mv.color !== user) continue
    features.moves++
    if (features.firstMoves.length < 3) features.firstMoves.push(uci)
    if (!features.firstPawn && mv.piece === 'p') features.firstPawn = uci
    add(features.material, total[i])
    // How forcing was the position? The engine's best versus second-best line (Guid & Bratko's difficulty measure).
    const second = scores[i].second
    if (second !== undefined && second !== null && scores[i].best) {
      const bestW = moverWhite ? wins[i] : 100 - wins[i]
      const secondW = winPercent((moverWhite ? 1 : -1) * second)
      const gap = Math.max(0, Math.min(40, bestW - secondW))
      add(features.gap, gap)
      if (gap >= 15) { features.critical.n++; if (isBest) features.critical.found++ }
    }
    if (winLoss >= 5 && bestSan) { if (/[x+#]/.test(bestSan)) features.tacticalErrors++; else features.quietErrors++ }
    if (mv.captured) {
      features.captures++
      const reply = moves[i + 1]
      if (reply?.captured && reply.to === mv.to) features.trades++
    }
    if (mv.san.includes('+') || mv.san.includes('#')) features.checks++
    if ((mv.isKingsideCastle() || mv.isQueensideCastle()) && !features.castledPly) features.castledPly = i + 1
    const enemyKing = kingSquare(board, user === 'w' ? 'b' : 'w')
    if (i >= 8 && mv.piece !== 'k' && enemyKing && chebyshev(mv.to, enemyKing) <= 2) features.pressure++
    // Gave up material (as it stands after the reply) yet the engine still rates you about as well off.
    if (i + 2 < mat.length && sign * (mat[i + 2] - mat[i]) <= -2 && mine(i + 2) >= mine(i) - 10) features.sacrifices++
    const acc = Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * winLoss) - 3.1668))
    add(features.byPhase[phase], acc)
    if (mine(i) <= 35) add(features.worse, acc)
    else if (mine(i) >= 65) add(features.better, acc)
    if (mine(i) >= 75) hadWinning = true
    else if (hadWinning && mine(i + 1) <= 55) features.squandered = true
  }

  const mineList = plies.filter(p => p.color === user)
  const opening = game.opening || classifyOpening(plies.slice(0, 14).map(p => p.san))
  return {
    gameId: game.id, version: REVIEW_VERSION,
    accuracy: gameAccuracy(wins, colors, user),
    opponentAccuracy: gameAccuracy(wins, colors, user === 'w' ? 'b' : 'w'),
    blunders: mineList.filter(p => p.grade === 'Blunder').length,
    mistakes: mineList.filter(p => p.grade === 'Mistake').length,
    inaccuracies: mineList.filter(p => p.grade === 'Inaccuracy').length,
    opening, plies, wins, features,
  }
}
