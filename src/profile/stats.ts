import type { Color } from 'chess.js'
import type { Grade } from './store'

/** Centipawns are clamped before conversion: beyond about +/-10 pawns the game is decided. */
export const clampCp = (cp: number) => Math.max(-1000, Math.min(1000, cp))

/** Winning chances for the side the score favours, 0-100 (Lichess' logistic model). */
export const winPercent = (cp: number) => 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * clampCp(cp))) - 1)

/** Accuracy of a single move from the winning chances before and after it (Lichess' curve). */
export function moveAccuracy(winBefore: number, winAfter: number): number {
  const drop = Math.max(0, winBefore - winAfter)
  return Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * drop) - 3.1668))
}

/** Lichess' judgement thresholds, expressed in winning-chance percentage points. */
export const INACCURACY_AT = 5
export const MISTAKE_AT = 10
export const BLUNDER_AT = 15

export function gradeFor(winLoss: number, isBest: boolean): Grade {
  if (winLoss >= BLUNDER_AT) return 'Blunder'
  if (winLoss >= MISTAKE_AT) return 'Mistake'
  if (winLoss >= INACCURACY_AT) return 'Inaccuracy'
  return isBest ? 'Best' : 'Good'
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)
const stdev = (xs: number[]) => { const m = mean(xs); return Math.sqrt(mean(xs.map(x => (x - m) ** 2))) }

/**
 * Game accuracy for one side, following Lichess: the average of a volatility-weighted
 * mean (critical, swingy moments count more) and the harmonic mean (one bad move
 * drags the score down). `wins[k]` is White's winning chances after k plies and
 * `colors[i]` who played ply i.
 */
export function gameAccuracy(wins: number[], colors: Color[], side: Color): number {
  const n = colors.length
  if (!n || wins.length < n + 1) return 0
  const win = (k: number) => (side === 'w' ? wins[k] : 100 - wins[k])
  const window = Math.max(2, Math.min(8, Math.floor(n / 10)))
  const acc: number[] = []
  const weights: number[] = []
  for (let i = 0; i < n; i++) {
    if (colors[i] !== side) continue
    acc.push(moveAccuracy(win(i), win(i + 1)))
    weights.push(Math.max(0.5, Math.min(12, stdev(wins.slice(i, i + window + 1)))))
  }
  if (!acc.length) return 0
  const weighted = acc.reduce((s, a, i) => s + a * weights[i], 0) / weights.reduce((a, b) => a + b, 0)
  const harmonic = acc.length / acc.reduce((s, a) => s + 1 / Math.max(a, 1), 0)
  return Math.round((weighted + harmonic) / 2)
}
