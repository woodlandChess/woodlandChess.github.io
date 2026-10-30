/**
 * Small, well-known chess formulas used by the Learn tab. Pure functions, so
 * they are easy to test and to reuse in the analysis screens later.
 */

/** Expected score (0 to 1) of a player rated `a` against a player rated `b`, Elo model. */
export function expectedScore(a: number, b: number): number {
  return 1 / (1 + Math.pow(10, (b - a) / 400))
}

/** Rating change for one game. `score` is 1 for a win, 0.5 for a draw, 0 for a loss. */
export function ratingChange(a: number, b: number, score: number, k: number): number {
  return k * (score - expectedScore(a, b))
}

/**
 * Win chance (0 to 100) for the side the evaluation favours, from a centipawn
 * score. This is the logistic model Lichess publishes for its analysis bar.
 */
export function winChance(centipawns: number): number {
  const cp = Math.max(-1000, Math.min(1000, centipawns))
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1)
}

/** Format a centipawn score the way an analysis panel does: +1.50, -0.30, 0.00. */
export function formatEval(centipawns: number): string {
  const pawns = centipawns / 100
  if (pawns === 0) return '0.00'
  return `${pawns > 0 ? '+' : '-'}${Math.abs(pawns).toFixed(2)}`
}

/** Approximate size of the starting material per side, in pawn units (8 + 6 + 6 + 10 + 9). */
export const STARTING_MATERIAL = 39
