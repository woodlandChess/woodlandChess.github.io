import { Chess, type Color } from 'chess.js'
import { StockfishClient } from '../stockfish'

export type GameSource = 'ai' | 'lichess'
export interface ProfileGame {
  id: string
  source: GameSource
  playedAt: number
  white: string
  black: string
  userColor: Color
  result: 'win' | 'loss' | 'draw' | 'unknown'
  moves: string
  timeClass?: string
}
export interface MoveReview { ply: number; san: string; grade: string; loss: number; phase: string; tags: string[] }
export interface GameReview { gameId: string; accuracy: number; blunders: number; mistakes: number; inaccuracies: number; opening: string; moves: MoveReview[] }
export interface PlayerProfileData { username: string; games: ProfileGame[]; reviews: GameReview[]; updatedAt: number }

const KEY = 'woodland-chess:player-style-v1'
export const readProfile = (): PlayerProfileData => {
  try { const v = JSON.parse(localStorage.getItem(KEY) ?? 'null'); return v?.games ? v : { username: '', games: [], reviews: [], updatedAt: 0 } }
  catch { return { username: '', games: [], reviews: [], updatedAt: 0 } }
}
export const saveProfile = (data: PlayerProfileData) => { try { localStorage.setItem(KEY, JSON.stringify(data)) } catch { /* storage can be unavailable */ } }

export function parseLichessNdjson(text: string, username: string): ProfileGame[] {
  const out: ProfileGame[] = []
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue
    try {
      const g = JSON.parse(line)
      const me = g.players?.white?.user?.name?.toLowerCase() === username.toLowerCase() ? 'w'
        : g.players?.black?.user?.name?.toLowerCase() === username.toLowerCase() ? 'b' : null
      if (!me || !g.moves) continue
      const winner = g.winner === 'white' ? 'w' : g.winner === 'black' ? 'b' : null
      out.push({ id: `lichess-${g.id}`, source: 'lichess', playedAt: Number(g.createdAt) || Date.now(),
        white: g.players?.white?.user?.name ?? 'White', black: g.players?.black?.user?.name ?? 'Black', userColor: me,
        result: winner ? winner === me ? 'win' : 'loss' : g.status === 'draw' || g.status === 'stalemate' || g.status === 'outoftime' ? 'draw' : 'unknown',
        moves: Array.isArray(g.moves) ? g.moves.map((m: { uci?: string } | string) => typeof m === 'string' ? m : m.uci ?? '').filter(Boolean).join(' ') : String(g.moves), timeClass: g.speed })
    } catch { /* skip malformed game record */ }
  }
  return out
}

const evalFen = async (engine: StockfishClient, fen: string, ms: number) => engine.evaluate(fen, ms)
const lossFor = (before: number, after: number, side: Color) => Math.max(0, side === 'w' ? before - after : after - before)
const gradeFor = (loss: number) => loss >= 250 ? 'Blunder' : loss >= 100 ? 'Mistake' : loss >= 50 ? 'Inaccuracy' : 'Good'

export async function reviewGame(game: ProfileGame, engine: StockfishClient, signal?: AbortSignal): Promise<GameReview> {
  const c = new Chess()
  const uciMoves = game.moves.trim().split(/\s+/).filter(Boolean)
  const reviewed: MoveReview[] = []
  let opening = 'Unclassified opening'
  for (let i = 0; i < uciMoves.length; i++) {
    if (signal?.aborted) throw new DOMException('Analysis cancelled', 'AbortError')
    const uci = uciMoves[i]
    const mover = c.turn()
    const phase = i < 20 ? 'Opening' : i < 60 ? 'Middlegame' : 'Endgame'
    const before = await evalFen(engine, c.fen(), 45)
    let move
    try {
      move = c.move({ from: uci.slice(0, 2) as never, to: uci.slice(2, 4) as never, promotion: uci[4] })
    } catch {
      // Lichess export may contain a non-UCI token or a variant position.
      continue
    }
    if (!move) break
    if (i === 7 || i === 9) opening = `${opening === 'Unclassified opening' ? '' : opening} ${move.san}`.trim()
    if (mover !== game.userColor) continue
    const after = await evalFen(engine, c.fen(), 45)
    const bestAfter = await engine.bestScore(c.fen(), 45)
    const loss = Math.max(0, lossFor(before, after, mover) - Math.max(0, mover === 'w' ? bestAfter - before : before - bestAfter))
    const tags: string[] = []
    if (move.captured) tags.push('Capture')
    if (move.san.includes('+')) tags.push('Check')
    if (move.san.includes('#')) tags.push('Mate')
    reviewed.push({ ply: i + 1, san: move.san, grade: gradeFor(loss), loss, phase, tags })
  }
  const weightedLoss = reviewed.reduce((n, m) => n + Math.min(m.loss, 1000), 0)
  const accuracy = Math.max(0, Math.round(100 * Math.exp(-weightedLoss / Math.max(1, reviewed.length) / 330)))
  return { gameId: game.id, accuracy, blunders: reviewed.filter(m => m.grade === 'Blunder').length,
    mistakes: reviewed.filter(m => m.grade === 'Mistake').length, inaccuracies: reviewed.filter(m => m.grade === 'Inaccuracy').length,
    opening: opening || 'Unclassified opening', moves: reviewed }
}

const schoolIds = ['Attacking', 'Positional', 'Defensive', 'Dynamic', 'Classical German', 'British', 'Soviet', 'Hungarian', 'American'] as const
export interface StyleSummary { school: string; player: string; scores: Record<string, number>; strengths: string[]; focus: string; games: number; confidence: 'Early read' | 'Developing' | 'Established' }

export function summarizeStyle(games: ProfileGame[], reviews: GameReview[]): StyleSummary {
  const scores: Record<string, number> = Object.fromEntries(schoolIds.map(s => [s, 0]))
  const moves = reviews.flatMap(r => r.moves)
  const denominator = Math.max(1, moves.length)
  const captureRate = moves.filter(m => m.tags.includes('Capture')).length / denominator
  const checkRate = moves.filter(m => m.tags.includes('Check')).length / denominator
  const openingMoves = moves.filter(m => m.phase === 'Opening')
  const accuracy = reviews.length ? reviews.reduce((n, r) => n + r.accuracy, 0) / reviews.length : 0
  scores.Attacking = Math.round(35 + checkRate * 210 + captureRate * 75)
  scores.Positional = Math.round(35 + Math.max(0, 72 - checkRate * 180) + accuracy * 0.15)
  scores.Defensive = Math.round(35 + (1 - captureRate) * 45 + accuracy * 0.15)
  scores.Dynamic = Math.round(35 + captureRate * 95 + checkRate * 105)
  scores['Classical German'] = Math.round(35 + (openingMoves.length ? 55 : 0) + accuracy * 0.12)
  scores.British = Math.round(35 + (games.filter(g => g.timeClass === 'classical' || g.timeClass === 'rapid').length / Math.max(1, games.length)) * 40 + accuracy * 0.1)
  scores.Soviet = Math.round(35 + accuracy * 0.14 + (1 - checkRate) * 30)
  scores.Hungarian = Math.round(35 + accuracy * 0.12 + (1 - captureRate) * 35)
  scores.American = Math.round(35 + accuracy * 0.17 + captureRate * 30)
  for (const key of Object.keys(scores)) scores[key] = Math.min(98, scores[key])
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const best = sorted[0]
  const famous: Record<string, string> = { Attacking: 'Mikhail Tal', Positional: 'José Raúl Capablanca', Defensive: 'Tigran Petrosian', Dynamic: 'Garry Kasparov', 'Classical German': 'Magnus Carlsen', British: 'Nigel Short', Soviet: 'Anatoly Karpov', Hungarian: 'Judit Polgár', American: 'Bobby Fischer' }
  const strengths = [
    accuracy >= 75 ? 'Consistent move quality' : moves.length ? 'Room to sharpen move precision' : 'Build a sample with a few games',
    checkRate > 0.13 ? 'Active king-side ideas' : 'Patient position building',
    captureRate > 0.18 ? 'Tactical exchanges' : 'Selective exchanges',
  ]
  return { school: best?.[0] ?? 'Universal', player: famous[best?.[0] ?? ''] ?? 'A balanced approach', scores, strengths,
    focus: moves.length && reviews.reduce((n, r) => n + r.blunders + r.mistakes, 0) > reviews.length ? 'Review turning points and missed tactics' : 'Keep building a representative game sample',
    games: games.length, confidence: games.length < 5 ? 'Early read' : games.length < 20 ? 'Developing' : 'Established' }
}
